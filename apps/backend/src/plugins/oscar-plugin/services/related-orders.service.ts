import { Injectable } from '@nestjs/common';
import {
  ID,
  Order,
  OrderService,
  RequestContext,
  TransactionalConnection,
  UserInputError,
  isGraphQlErrorResult,
} from '@vendure/core';
import { Between, Not } from 'typeorm';
import { OrderModificationService } from './order-modification.service';
import {
  RELATED_ORDER_WINDOW_HOURS,
  customerExtendBlocker,
  mergeBlocker,
  normalizePhone,
  placedCloseTogether,
} from '../order/related-orders';

export interface RelatedOrderSummary {
  id: ID;
  code: string;
  state: string;
  orderPlacedAt: Date;
  totalWithTax: number;
  itemCount: number;
}

export interface AddToPlacedOrderResult {
  success: boolean;
  errorCode?: string;
  message?: string;
  order?: Order;
}

/** `modify()` returns Order | an error result; its declared union narrows badly. */
function asError(result: unknown): { errorCode: string; message: string } | null {
  return isGraphQlErrorResult(result as any) ? (result as { errorCode: string; message: string }) : null;
}

const phoneOf = (order: Order) =>
  normalizePhone(order.customer?.phoneNumber || order.shippingAddress?.phoneNumber);

/**
 * Duplicate-order tooling (see order/related-orders.ts for the rules):
 * related orders by phone, merging two orders, and letting a customer add an
 * item to the order they just placed. Line changes all go through
 * OrderModificationService so stock, totals and the COD amount stay consistent.
 */
@Injectable()
export class RelatedOrdersService {
  constructor(
    private connection: TransactionalConnection,
    private orderService: OrderService,
    private orderModificationService: OrderModificationService,
  ) {}

  /**
   * Other placed orders from the same phone number within ±24h, oldest first.
   * Cancelled orders are ignored on both sides: once one of a pair is cancelled
   * (e.g. merged), there is nothing left to act on.
   */
  async findRelated(ctx: RequestContext, orderId: ID): Promise<RelatedOrderSummary[]> {
    const repo = this.connection.getRepository(ctx, Order);
    const order = await repo.findOne({ where: { id: orderId }, relations: ['customer'] });
    const phone = order ? phoneOf(order) : '';
    if (!order?.orderPlacedAt || !phone || order.state === 'Cancelled') return [];

    const windowMs = RELATED_ORDER_WINDOW_HOURS * 3_600_000;
    const placedAt = new Date(order.orderPlacedAt).getTime();
    const candidates = await repo.find({
      where: {
        id: Not(order.id),
        state: Not('Cancelled'),
        // Generous DB window (the timestamp column has no time zone, so the driver may
        // shift Dates by the server's UTC offset); the exact 24h rule is applied below.
        orderPlacedAt: Between(new Date(placedAt - 2 * windowMs), new Date(placedAt + 2 * windowMs)),
        channels: { id: ctx.channelId },
      },
      relations: ['customer', 'lines'],
      order: { orderPlacedAt: 'ASC' },
    });
    return candidates
      .filter(o => phoneOf(o) === phone && placedCloseTogether(o.orderPlacedAt, order.orderPlacedAt))
      .map(o => ({
        id: o.id,
        code: o.code,
        state: o.state,
        orderPlacedAt: o.orderPlacedAt!,
        totalWithTax: o.subTotalWithTax + o.shippingWithTax,
        itemCount: o.lines.reduce((sum, l) => sum + l.quantity, 0),
      }));
  }

  /**
   * Moves every item of `sourceOrderId` into `targetOrderId` and cancels the
   * source, in one transaction. The source is cancelled first so its stock
   * allocation is released before the target allocates the same units.
   */
  async merge(ctx: RequestContext, targetOrderId: ID, sourceOrderId: ID): Promise<Order> {
    return this.connection.withTransaction(ctx, async tx => {
      const [target, source] = await Promise.all([
        this.orderService.findOne(tx, targetOrderId),
        this.orderService.findOne(tx, sourceOrderId),
      ]);
      if (!target || !source) throw new UserInputError('Commande introuvable.');

      const [targetFulfillments, sourceFulfillments] = await Promise.all([
        this.orderService.getOrderFulfillments(tx, target),
        this.orderService.getOrderFulfillments(tx, source),
      ]);
      const addItems = source.lines
        .filter(l => l.quantity > 0)
        .map(l => ({ productVariantId: l.productVariant.id, quantity: l.quantity }));
      const blocker = mergeBlocker(
        { id: String(target.id), code: target.code, state: target.state, fulfillmentCount: targetFulfillments.length },
        {
          id: String(source.id),
          code: source.code,
          state: source.state,
          fulfillmentCount: sourceFulfillments.length,
          itemCount: addItems.length,
        },
      );
      if (blocker) throw new UserInputError(blocker);

      const cancelled = await this.orderService.cancelOrder(tx, {
        orderId: source.id,
        reason: `Fusionnée dans la commande ${target.code}`,
        cancelShipping: true,
      });
      if (isGraphQlErrorResult(cancelled)) throw new UserInputError(cancelled.message);

      const merged = await this.orderModificationService.modify(tx, {
        orderId: target.id,
        dryRun: false,
        addItems,
        note: `Fusion de la commande ${source.code}`,
      });
      const mergeError = asError(merged);
      if (mergeError) throw new UserInputError(mergeError.message);
      return merged as Order;
    });
  }

  /**
   * Shop API: add an item to an order the customer placed a few minutes ago,
   * instead of making them place a second order. Knowing the (random, 16-char)
   * order code is the guest's proof of ownership, the same as for `orderByCode`;
   * an order belonging to a registered customer also requires their session.
   */
  async addToPlacedOrder(
    ctx: RequestContext,
    orderCode: string,
    productVariantId: ID,
    quantity: number,
  ): Promise<AddToPlacedOrderResult> {
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      return { success: false, errorCode: 'INVALID_QUANTITY' };
    }
    const order = await this.orderService.findOneByCode(ctx, orderCode, ['customer', 'customer.user']);
    const ownerUserId = order?.customer?.user?.id;
    if (!order || (ownerUserId && String(ownerUserId) !== String(ctx.activeUserId))) {
      return { success: false, errorCode: 'NOT_FOUND' };
    }

    const [payments, fulfillments] = await Promise.all([
      this.orderService.getOrderPayments(ctx, order.id),
      this.orderService.getOrderFulfillments(ctx, order),
    ]);
    const blocker = customerExtendBlocker(
      {
        state: order.state,
        orderPlacedAt: order.orderPlacedAt,
        fulfillmentCount: fulfillments.length,
        payments: payments.map(p => ({ method: p.method, state: p.state })),
      },
      new Date(),
    );
    if (blocker) return { success: false, errorCode: blocker };

    const result = await this.orderModificationService.modify(ctx, {
      orderId: order.id,
      dryRun: false,
      addItems: [{ productVariantId, quantity }],
      note: 'Article ajouté par le client depuis la boutique',
    });
    const error = asError(result);
    if (error) return { success: false, errorCode: error.errorCode, message: error.message };
    return { success: true, order: result as Order };
  }
}
