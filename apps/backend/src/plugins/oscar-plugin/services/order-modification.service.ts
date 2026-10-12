import { Injectable } from '@nestjs/common';
import {
  ID,
  Order,
  OrderModificationStateError,
  OrderService,
  Payment,
  RequestContext,
  TransactionalConnection,
  UserInputError,
  isGraphQlErrorResult,
} from '@vendure/core';
import { ModifyOrderInput } from '@vendure/common/lib/generated-types';
import { OrderModification } from '@vendure/core/dist/entity/order-modification/order-modification.entity';
import { isModifiableState, planModification } from '../order/modification-plan';

/** Vendure's OrderStateTransitionError carries the real reason in `transitionError`. */
function describeTransitionError(e: { message: string; transitionError?: string; fromState?: string; toState?: string }): string {
  const reason = e.transitionError || e.message;
  return e.fromState && e.toState ? `${reason} (${e.fromState} → ${e.toState})` : reason;
}

/** Thrown inside the transaction to roll it back while carrying a value out. */
class Rollback<T> {
  constructor(public readonly value: T) {}
}

/**
 * One-call order modification for the back-office.
 *
 * Vendure's raw `modifyOrder` expects the caller to move the order into
 * `Modifying` first, then out again, and to settle the price difference. This
 * wraps all of it in a single transaction:
 *   preview  →  transition to Modifying, dry-run modify, roll back
 *   apply    →  transition to Modifying, modify, adjust the money side
 *               (see order/modification-plan.ts), transition back, commit
 * A preview therefore leaves no history entries and no state change behind,
 * and a failed apply leaves the order exactly as it was.
 */
@Injectable()
export class OrderModificationService {
  constructor(
    private connection: TransactionalConnection,
    private orderService: OrderService,
  ) {}

  async modify(ctx: RequestContext, input: ModifyOrderInput) {
    const order = await this.orderService.findOne(ctx, input.orderId);
    if (!order) {
      throw new UserInputError(`Order ${input.orderId} not found`);
    }
    const fromState = order.state;
    if (!isModifiableState(fromState)) {
      return new OrderModificationStateError();
    }

    // 1. Preview in its own transaction, always rolled back. Vendure's dry run
    //    still persists adjusted order lines, so it must never share a
    //    transaction with the real apply (the apply would then start from a
    //    half-updated order and mis-compute the price change).
    const preview = await this.rolledBack(ctx, async txCtx => {
      await this.enterModifying(txCtx, order.id);
      return this.orderService.modifyOrder(txCtx, {
        ...input,
        dryRun: true,
        refund: undefined,
        refunds: undefined,
      });
    });
    if (input.dryRun || isGraphQlErrorResult(preview)) {
      return preview;
    }

    // 2. Decide the money side from the previewed total, then apply for real.
    const payments = await this.orderService.getOrderPayments(ctx, order.id);
    const newTotal = preview.totalWithTax;
    const plan = planModification({
      fromState,
      delta: newTotal - order.totalWithTax,
      newTotal,
      payments: payments.map(p => ({
        id: String(p.id),
        method: p.method,
        state: p.state,
        amount: p.amount,
      })),
    });

    try {
      return await this.connection.withTransaction(ctx, async txCtx => {
        await this.enterModifying(txCtx, order.id);

        const applied = await this.orderService.modifyOrder(txCtx, {
          ...input,
          dryRun: false,
          refund: undefined,
          refunds: plan.refundPaymentId
            ? [
                {
                  paymentId: plan.refundPaymentId as ID,
                  reason: input.note || 'Modification de la commande',
                },
              ]
            : undefined,
        });
        if (isGraphQlErrorResult(applied)) {
          throw new Rollback(applied);
        }

        if (plan.codPaymentId && plan.codAmountToSet != null) {
          const paymentRepo = this.connection.getRepository(txCtx, Payment);
          await paymentRepo.update(plan.codPaymentId, { amount: plan.codAmountToSet });
          // Vendure only lets an order leave Modifying once every price-increasing
          // modification is "settled", i.e. linked to a payment. For COD the raised
          // authorization IS the settlement, so link it the way addManualPaymentToOrder
          // would link a new payment.
          const codPayment = await paymentRepo.findOneOrFail({ where: { id: plan.codPaymentId } });
          const modifications = await this.connection
            .getRepository(txCtx, OrderModification)
            .find({ where: { order: { id: order.id } }, relations: ['payment', 'refund'] });
          for (const modification of modifications.filter(m => !m.isSettled)) {
            modification.payment = codPayment;
            await this.connection.getRepository(txCtx, OrderModification).save(modification);
          }
          await this.orderService.addNoteToOrder(txCtx, {
            id: order.id,
            isPublic: false,
            note: `Montant à encaisser à la livraison mis à jour : ${(plan.codAmountToSet / 100).toFixed(2)} DA (commande modifiée)`,
          });
        }

        const left = await this.orderService.transitionToState(txCtx, order.id, plan.returnState);
        if (isGraphQlErrorResult(left)) {
          const mods = await this.connection
            .getRepository(txCtx, OrderModification)
            .find({ where: { order: { id: order.id } }, relations: ['payment', 'refund'] });
          const detail = mods
            .map(m => `#${m.id} Δ${m.priceChange} payment=${m.payment?.id ?? '-'} refund=${m.refund?.id ?? '-'} settled=${m.isSettled}`)
            .join('; ');
          throw new UserInputError(`${describeTransitionError(left)} [modifications: ${detail}]`);
        }
        return (await this.orderService.findOne(txCtx, order.id)) as Order;
      });
    } catch (e) {
      if (e instanceof Rollback) {
        return e.value;
      }
      throw e;
    }
  }

  private async enterModifying(ctx: RequestContext, orderId: ID): Promise<void> {
    const entered = await this.orderService.transitionToState(ctx, orderId, 'Modifying');
    if (isGraphQlErrorResult(entered)) {
      throw new UserInputError(describeTransitionError(entered));
    }
  }

  /** Run `work` in a transaction that is always rolled back; return what it produced. */
  private async rolledBack<T>(ctx: RequestContext, work: (ctx: RequestContext) => Promise<T>): Promise<T> {
    try {
      await this.connection.withTransaction(ctx, async txCtx => {
        throw new Rollback(await work(txCtx));
      });
    } catch (e) {
      if (e instanceof Rollback) {
        return e.value as T;
      }
      throw e;
    }
    throw new Error('unreachable');
  }
}
