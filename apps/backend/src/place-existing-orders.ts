import 'dotenv/config';
import {
  bootstrapWorker,
  RequestContext,
  ChannelService,
  OrderService,
  PaymentMethodService,
  ShippingMethodService,
  TransactionalConnection,
  Order,
} from '@vendure/core';
import { config } from './vendure-config';

/**
 * OSCAR Fashion — backfill placed orders.
 *
 * The original seed-orders.ts left ~86 orders stuck in `AddingItems` because:
 *  1. the standard-shipping eligibility checker had no `orderMinimum` arg, so it
 *     was always ineligible (no shipping method could ever be set), and
 *  2. transitionToState's *error result* (a union, not a throw) was ignored.
 *
 * This one-off places the existing carts into a realistic distribution and
 * backdates orderPlacedAt/createdAt across the last ~88 days so the dashboard's
 * 7/30/90-day windows have a spread. Idempotent enough to re-run.
 *
 * Run from apps/backend with: npx ts-node src/place-existing-orders.ts
 */

const TARGETS = [
  { state: 'PaymentSettled', weight: 28 },
  { state: 'Shipped', weight: 20 },
  { state: 'Delivered', weight: 27 },
  { state: 'PartiallyShipped', weight: 6 },
  { state: 'Cancelled', weight: 10 },
];

function weightedState(): string {
  const total = TARGETS.reduce((s, x) => s + x.weight, 0);
  let r = Math.random() * total;
  for (const t of TARGETS) {
    r -= t.weight;
    if (r <= 0) return t.state;
  }
  return 'PaymentSettled';
}

function randomRecentDate(): Date {
  const now = Date.now();
  const daysAgo = Math.floor(Math.random() * 88);
  const msIntoDay = Math.floor(Math.random() * 86400000);
  return new Date(now - daysAgo * 86400000 - msIntoDay);
}

const isErr = (x: any): x is { errorCode: string; message: string } =>
  !!x && typeof x === 'object' && 'errorCode' in x;

async function run() {
  const { app } = await bootstrapWorker(config);

  const channelService = app.get(ChannelService);
  const orderService = app.get(OrderService);
  const paymentMethodService = app.get(PaymentMethodService);
  const shippingMethodService = app.get(ShippingMethodService);
  const connection = app.get(TransactionalConnection);

  const channel = await channelService.getDefaultChannel();
  const ctx = new RequestContext({
    channel,
    apiType: 'admin',
    isAuthorized: true,
    authorizedAsOwnerOnly: false,
  });

  const payment = (await paymentMethodService.findAll(ctx, {})).items[0];
  const fallbackShipping = (await shippingMethodService.findAll(ctx, {})).items[0];
  if (!payment) {
    console.error('No payment method configured — aborting.');
    await app.close();
    process.exit(1);
  }

  const repo = connection.getRepository(ctx, Order);
  const all = await repo.find();

  // Leave 12 carts untouched so the active-cart state stays represented.
  const carts = all.filter(o => o.state === 'AddingItems');
  const leaveAsCart = new Set(carts.slice(0, 12).map(o => o.id));

  const dist: Record<string, number> = {};
  const failures: Record<string, number> = {};
  let processed = 0;

  const ensurePlaced = async (id: any): Promise<string | null> => {
    const eligible = await orderService.getEligibleShippingMethods(ctx, id);
    if (eligible.length > 0) await orderService.setShippingMethod(ctx, id, [eligible[0].id]);
    else if (fallbackShipping) await orderService.setShippingMethod(ctx, id, [fallbackShipping.id]);

    const toArranging = await orderService.transitionToState(ctx, id, 'ArrangingPayment' as any);
    if (isErr(toArranging)) return `ArrangingPayment: ${toArranging.message}`;

    const paid = await orderService.addPaymentToOrder(ctx, id, {
      method: payment.code,
      metadata: { notes: 'backfill placement' },
    });
    if (isErr(paid)) return `payment: ${paid.message}`;

    let current = await orderService.findOne(ctx, id, ['payments']);
    if (current && current.state === 'PaymentAuthorized' && current.payments?.length) {
      await orderService.settlePayment(ctx, current.payments[0].id);
    }
    return null;
  };

  for (const o of all) {
    if (o.state === 'Cancelled') continue; // keep existing cancellations
    if (leaveAsCart.has(o.id)) continue; // keep some carts
    if (!['AddingItems', 'PaymentSettled'].includes(o.state)) continue; // already shipped/delivered

    const target = weightedState();
    try {
      if (o.state === 'AddingItems') {
        const err = await ensurePlaced(o.id);
        if (err) {
          failures[err] = (failures[err] || 0) + 1;
          continue;
        }
      }

      const current = await orderService.findOne(ctx, o.id, ['lines']);
      if (!current || current.state !== 'PaymentSettled') {
        failures[`not settled (${current?.state})`] = (failures[`not settled (${current?.state})`] || 0) + 1;
        continue;
      }

      if (['Shipped', 'PartiallyShipped', 'Delivered'].includes(target)) {
        const lines = current.lines.map(l => ({
          orderLineId: l.id,
          quantity:
            target === 'PartiallyShipped' ? Math.max(1, Math.floor(l.quantity / 2)) : l.quantity,
        }));
        const fulfillment = await orderService.createFulfillment(ctx, {
          handler: {
            code: 'manual-fulfillment',
            arguments: [
              { name: 'method', value: 'Standard Shipping' },
              { name: 'trackingCode', value: 'DZ' + String(o.id).padStart(6, '0') },
            ],
          },
          lines,
        });
        if (fulfillment && 'id' in fulfillment) {
          await orderService.transitionFulfillmentToState(ctx, fulfillment.id, 'Shipped' as any);
          if (target === 'Delivered') {
            await orderService.transitionFulfillmentToState(ctx, fulfillment.id, 'Delivered' as any);
          }
        } else if (isErr(fulfillment)) {
          failures[`fulfillment: ${fulfillment.message}`] =
            (failures[`fulfillment: ${fulfillment.message}`] || 0) + 1;
        }
      } else if (target === 'Cancelled') {
        await orderService.cancelOrder(ctx, {
          orderId: o.id,
          reason: 'Backfill — simulated cancellation',
          cancelShipping: true,
        });
      }

      const d = randomRecentDate();
      await repo.query('UPDATE "order" SET "orderPlacedAt" = $1, "createdAt" = $2 WHERE id = $3', [
        d,
        d,
        o.id,
      ]);

      const final = await orderService.findOne(ctx, o.id);
      const fs = final?.state || 'Unknown';
      dist[fs] = (dist[fs] || 0) + 1;
      processed++;
    } catch (e: any) {
      failures[`exception: ${e.message}`] = (failures[`exception: ${e.message}`] || 0) + 1;
    }
  }

  console.log(`\nProcessed ${processed} orders.`);
  console.log('Final state distribution:', dist);
  if (Object.keys(failures).length) console.log('Failures:', failures);

  await app.close();
  process.exit(0);
}

run();
