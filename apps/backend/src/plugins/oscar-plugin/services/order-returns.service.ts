import { Injectable } from '@nestjs/common';
import {
  Cancellation,
  FulfillmentLine,
  ID,
  Order,
  OrderLine,
  OrderService,
  Payment,
  RequestContext,
  StockLevelService,
  StockLocationService,
  StockMovementService,
  TransactionalConnection,
  UserInputError,
  isGraphQlErrorResult,
} from '@vendure/core';
import { HistoryEntryType } from '@vendure/common/lib/generated-types';
import { OrderHistoryEntry } from '@vendure/core/dist/entity/history-entry/order-history-entry.entity';
import { In } from 'typeorm';
import { COD_METHOD } from '../order/modification-plan';
import {
  RETURN_REASONS,
  ReturnLineInput,
  buildReturnReason,
  parseReturnReason,
  returnBlocker,
  returnableQuantity,
} from '../order/returns';

export interface RegisterReturnInput {
  orderId: ID;
  lines: ReturnLineInput[];
  reasonCode: string;
  details?: string | null;
  /** Put the units back on sale (false for defective items: they are written off). */
  restock: boolean;
}

export interface ReturnableLine {
  orderLineId: ID;
  quantity: number;
}

export interface ReturnStats {
  returns: number;
  units: number;
  value: number;
  byReason: Array<{ reason: string; returns: number; units: number; value: number }>;
}

const formatDa = (cents: number) => `${(cents / 100).toLocaleString('fr-FR', { maximumFractionDigits: 2 })} DA`;

/**
 * Product returns on shipped / delivered orders (see order/returns.ts).
 *
 * Built on Vendure's line cancellation so stock is restored exactly once
 * (Cancellation movement) and the reason lands in the order history. Defective
 * units are then written off with a stock adjustment. While cash on delivery
 * has not been collected, the amount the courier collects follows the new total;
 * once it has been, the amount to give back is noted on the order.
 */
@Injectable()
export class OrderReturnsService {
  constructor(
    private connection: TransactionalConnection,
    private orderService: OrderService,
    private stockMovementService: StockMovementService,
    private stockLevelService: StockLevelService,
    private stockLocationService: StockLocationService,
  ) {}

  reasons() {
    return RETURN_REASONS.map(r => ({ code: r.code, label: r.label }));
  }

  /** Units of each line that can still be returned (shipped − already returned). */
  async returnableLines(ctx: RequestContext, orderId: ID): Promise<ReturnableLine[]> {
    const order = await this.orderService.findOne(ctx, orderId);
    if (!order) return [];
    const lineIds = order.lines.map(l => l.id);
    if (lineIds.length === 0) return [];
    const [fulfilled, cancelled] = await Promise.all([
      this.connection
        .getRepository(ctx, FulfillmentLine)
        .find({ where: { orderLineId: In(lineIds) } }),
      this.connection
        .getRepository(ctx, Cancellation)
        .find({ where: { orderLine: { id: In(lineIds) } }, relations: ['orderLine'] }),
    ]);
    return order.lines.map(line => ({
      orderLineId: line.id,
      quantity: returnableQuantity({
        quantity: line.quantity,
        fulfilled: fulfilled.filter(f => String(f.orderLineId) === String(line.id)).reduce((s, f) => s + f.quantity, 0),
        returned: cancelled.filter(c => String(c.orderLine.id) === String(line.id)).reduce((s, c) => s + c.quantity, 0),
      }),
    }));
  }

  async registerReturn(ctx: RequestContext, input: RegisterReturnInput): Promise<Order> {
    const reason = buildReturnReason(input.reasonCode, input.details);
    if (!reason) throw new UserInputError('Choisissez une raison de retour (précisez-la pour « Autre »).');

    return this.connection.withTransaction(ctx, async tx => {
      const order = await this.orderService.findOne(tx, input.orderId);
      if (!order) throw new UserInputError('Commande introuvable.');
      const returnable = new Map(
        (await this.returnableLines(tx, order.id)).map(l => [String(l.orderLineId), l.quantity]),
      );
      const lines = input.lines.filter(l => l.quantity > 0);
      const blocker = returnBlocker(order.state, lines, returnable);
      if (blocker) throw new UserInputError(blocker);

      const totalBefore = order.totalWithTax;
      const wholeOrder = order.lines.every(
        l => (lines.find(r => String(r.orderLineId) === String(l.id))?.quantity ?? 0) >= l.quantity,
      );
      const cancelled = await this.orderService.cancelOrder(tx, {
        orderId: order.id,
        lines: lines.map(l => ({ orderLineId: l.orderLineId, quantity: l.quantity })),
        reason,
        // A parcel refused at the door was never delivered: no delivery fee either.
        cancelShipping: wholeOrder && input.reasonCode === 'REFUSED',
      });
      if (isGraphQlErrorResult(cancelled)) throw new UserInputError(cancelled.message);

      // Vendure has just put the units back in stock; write defective ones off again.
      if (!input.restock) {
        const location = await this.stockLocationService.defaultStockLocation(tx);
        for (const l of lines) {
          const line = order.lines.find(ol => String(ol.id) === String(l.orderLineId));
          if (!line) continue;
          const level = await this.stockLevelService.getStockLevel(tx, line.productVariant.id, location.id);
          await this.stockMovementService.adjustProductVariantStock(
            tx,
            line.productVariant.id,
            Math.max(0, level.stockOnHand - l.quantity),
          );
        }
      }

      const after = (await this.orderService.findOne(tx, order.id))!;
      const notes: string[] = [];
      const payments = await this.orderService.getOrderPayments(tx, order.id);
      const cod = payments.find(p => p.method === COD_METHOD && p.state === 'Authorized');
      const collected = payments.filter(p => p.state === 'Settled').reduce((s, p) => s + p.amount, 0);
      if (cod && after.state !== 'Cancelled') {
        // Not collected yet: the courier collects the new total.
        await this.connection.getRepository(tx, Payment).update(cod.id, { amount: after.totalWithTax });
        notes.push(`Montant à encaisser à la livraison : ${formatDa(after.totalWithTax)}`);
      } else if (collected > after.totalWithTax && after.state !== 'Cancelled') {
        notes.push(`À rembourser au client : ${formatDa(collected - after.totalWithTax)}`);
      } else if (collected > 0 && after.state === 'Cancelled') {
        notes.push(`À rembourser au client : ${formatDa(collected)}`);
      }
      notes.push(input.restock ? 'Articles remis en stock' : 'Articles non remis en stock (défectueux)');
      await this.orderService.addNoteToOrder(tx, {
        id: order.id,
        isPublic: false,
        note: `${reason} (${formatDa(totalBefore - after.totalWithTax)}). ${notes.join('. ')}.`,
      });
      return (await this.orderService.findOne(tx, order.id))!;
    });
  }

  /** Returns registered in a period, counted per reason (value at the price paid). */
  async stats(ctx: RequestContext, from: Date, to: Date): Promise<ReturnStats> {
    const entries = await this.connection
      .getRepository(ctx, OrderHistoryEntry)
      .createQueryBuilder('entry')
      .innerJoin('entry.order', 'o')
      .innerJoin('o.channels', 'channel', 'channel.id = :channelId', { channelId: ctx.channelId })
      .where('entry.type = :type', { type: HistoryEntryType.ORDER_CANCELLATION })
      // createdAt is a timestamp without time zone holding UTC; the pg driver would
      // send a Date in the server's local time, so pass plain UTC timestamps.
      .andWhere('entry.createdAt BETWEEN :from AND :to', { from: utcTimestamp(from), to: utcTimestamp(to) })
      .getMany();

    const returns = entries
      .map(e => ({ reason: parseReturnReason(e.data?.reason), lines: (e.data?.lines ?? []) as ReturnLineInput[] }))
      .filter((e): e is { reason: string; lines: ReturnLineInput[] } => !!e.reason);
    const lineIds = [...new Set(returns.flatMap(r => r.lines.map(l => String(l.orderLineId))))];
    const unitPrice = new Map<string, number>();
    if (lineIds.length) {
      const lines = await this.connection.getRepository(ctx, OrderLine).find({ where: { id: In(lineIds) } });
      // Price actually paid per unit, order discounts included.
      for (const line of lines) unitPrice.set(String(line.id), line.proratedUnitPriceWithTax);
    }

    const byReason = new Map<string, { reason: string; returns: number; units: number; value: number }>();
    let units = 0;
    let value = 0;
    for (const r of returns) {
      const u = r.lines.reduce((s, l) => s + l.quantity, 0);
      const v = r.lines.reduce((s, l) => s + l.quantity * (unitPrice.get(String(l.orderLineId)) ?? 0), 0);
      const row = byReason.get(r.reason) ?? { reason: r.reason, returns: 0, units: 0, value: 0 };
      row.returns += 1;
      row.units += u;
      row.value += v;
      byReason.set(r.reason, row);
      units += u;
      value += v;
    }
    return {
      returns: returns.length,
      units,
      value: Math.round(value),
      byReason: [...byReason.values()]
        .map(r => ({ ...r, value: Math.round(r.value) }))
        .sort((a, b) => b.returns - a.returns),
    };
  }
}

/** "2026-11-10 21:02:47.606" — a Date as a UTC timestamp literal. */
function utcTimestamp(date: Date): string {
  return date.toISOString().replace('T', ' ').replace('Z', '');
}
