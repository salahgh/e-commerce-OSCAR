import {
  Injector,
  Logger,
  OrderProcess,
  Payment,
  PaymentService,
  TransactionalConnection,
} from '@vendure/core';
import { COD_METHOD } from './modification-plan';

const loggerCtx = 'CodOrderProcess';

let paymentService: PaymentService;
let connection: TransactionalConnection;

/**
 * Cash-on-delivery order flow.
 *
 * Vendure's default process only lets an order ship once it is PaymentSettled,
 * which for COD is backwards: the cash is collected by the courier at delivery.
 * This process
 *  - lets a PaymentAuthorized order be shipped (fulfilment transitions drive the
 *    order to Shipped / PartiallyShipped exactly as they do from PaymentSettled);
 *  - settles the Authorized COD payment automatically when the order reaches
 *    Delivered, so "paid" becomes true at the moment the money changes hands.
 *
 * Settlement runs inside the Delivered transition; a settlement failure is
 * logged and does not block the delivery (staff can still settle by hand).
 */
export const codOrderProcess: OrderProcess<never> = {
  transitions: {
    PaymentAuthorized: {
      to: ['Shipped', 'PartiallyShipped'],
      mergeStrategy: 'merge',
    },
  },

  init(injector: Injector) {
    paymentService = injector.get(PaymentService);
    connection = injector.get(TransactionalConnection);
  },

  async onTransitionEnd(_fromState, toState, data) {
    if (toState !== 'Delivered') return;
    const { ctx, order } = data;
    const payments = await connection
      .getRepository(ctx, Payment)
      .find({ where: { order: { id: order.id } } });
    for (const payment of payments) {
      if (payment.method !== COD_METHOD || payment.state !== 'Authorized') continue;
      try {
        // PaymentService (not OrderService) so the order state is left alone:
        // the default payment process will try PaymentSettled and give up,
        // which is fine because the order is Delivered.
        const result = await paymentService.settlePayment(ctx, payment.id);
        if ('errorCode' in result) {
          Logger.warn(
            `Order ${order.code}: COD payment ${payment.id} not settled on delivery: ${result.message}`,
            loggerCtx,
          );
        } else {
          Logger.info(`Order ${order.code}: COD payment ${payment.id} settled on delivery`, loggerCtx);
        }
      } catch (e: any) {
        Logger.error(
          `Order ${order.code}: settling COD payment ${payment.id} failed: ${e?.message ?? e}`,
          loggerCtx,
        );
      }
    }
  },
};
