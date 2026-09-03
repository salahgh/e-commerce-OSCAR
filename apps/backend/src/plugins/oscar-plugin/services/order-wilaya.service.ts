import { Injectable, OnApplicationBootstrap } from '@nestjs/common';
import {
  CustomerService,
  EventBus,
  ID,
  Logger,
  OrderPlacedEvent,
  OrderService,
  RequestContext,
  RequestContextService,
  TransactionalConnection,
} from '@vendure/core';

const loggerCtx = 'OrderWilayaService';

/**
 * Keeps the `wilaya` custom fields in sync with the shipping address.
 *
 * The back-office order list, customer list and reports group on
 * `Order.customFields.wilaya` / `Customer.customFields.wilaya`, but the shop API
 * only lets a storefront set the shipping address — nothing wrote those fields
 * for real orders. Both storefronts store the canonical French wilaya name in
 * `shippingAddress.province`, so once an order is placed that value is copied
 * onto the order (always) and onto the customer (only if still empty, so an
 * admin-entered value is never clobbered).
 */
@Injectable()
export class OrderWilayaService implements OnApplicationBootstrap {
  constructor(
    private eventBus: EventBus,
    private connection: TransactionalConnection,
    private requestContextService: RequestContextService,
    private orderService: OrderService,
    private customerService: CustomerService,
  ) {}

  onApplicationBootstrap() {
    this.eventBus.ofType(OrderPlacedEvent).subscribe((event) => {
      this.syncWilaya(event).catch((err: unknown) => {
        Logger.error(`Could not sync wilaya for order ${event.order.code}: ${String(err)}`, loggerCtx);
      });
    });
  }

  private async syncWilaya(event: OrderPlacedEvent): Promise<void> {
    // The event's own context belongs to the (already committed) checkout
    // transaction; do the bookkeeping in a fresh admin context + transaction.
    const ctx = await this.requestContextService.create({
      apiType: 'admin',
      channelOrToken: event.ctx.channel,
      languageCode: event.ctx.languageCode,
    });
    await this.connection.withTransaction(ctx, (txCtx) => this.applyWilaya(txCtx, event.order.id));
  }

  private async applyWilaya(ctx: RequestContext, orderId: ID): Promise<void> {
    const order = await this.orderService.findOne(ctx, orderId, ['customer']);
    const wilaya = order?.shippingAddress?.province?.trim();
    if (!order || !wilaya) return;
    const city = order.shippingAddress.city?.trim() || undefined;

    const orderFields = (order.customFields ?? {}) as { wilaya?: string | null };
    if (orderFields.wilaya !== wilaya) {
      await this.orderService.updateCustomFields(ctx, order.id, { ...orderFields, wilaya });
    }

    const customer = order.customer;
    const customerFields = (customer?.customFields ?? {}) as { wilaya?: string | null; city?: string | null };
    if (customer && !customerFields.wilaya) {
      await this.customerService.update(ctx, {
        id: customer.id,
        customFields: { wilaya, city: customerFields.city || city },
      });
    }
  }
}
