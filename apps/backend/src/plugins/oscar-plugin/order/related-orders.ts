import { COD_METHOD } from './modification-plan';

/**
 * Rules behind the duplicate-order tools, free of Vendure imports so they can
 * be unit-tested without a database.
 *
 * Production data showed customers placing one order per product a few minutes
 * apart (then staff cancel one and merge by hand). Two remedies use these rules:
 *  - the storefront lets a customer add items to the order they just placed
 *    (`addToPlacedOrder`), for a short window;
 *  - the back-office flags orders from the same phone number placed close
 *    together and can merge one into the other (`mergeOrders`).
 */

/** How long after checkout a customer may still add items to their order. */
export const CUSTOMER_EXTEND_WINDOW_MINUTES = 30;
/** Orders from the same phone within this many hours are shown as related. */
export const RELATED_ORDER_WINDOW_HOURS = 24;

/**
 * Canonical Algerian phone number so "+213 555 12 34 56", "00213555123456" and
 * "0555123456" match. Returns '' when there are too few digits to be a number.
 */
export function normalizePhone(raw: string | null | undefined): string {
  let digits = (raw ?? '').replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  if (digits.startsWith('213')) digits = digits.slice(3);
  if (digits.length === 9) digits = `0${digits}`;
  return digits.length >= 9 ? digits : '';
}

export interface PlacedOrderLike {
  state: string;
  orderPlacedAt?: Date | string | null;
  fulfillmentCount: number;
  payments: ReadonlyArray<{ method: string; state: string }>;
}

export type ExtendBlocker = 'NOT_PLACED' | 'EXPIRED' | 'NOT_EDITABLE' | 'NOT_CASH_ON_DELIVERY';

/**
 * Why a customer may NOT add items to an order they placed, or null when they
 * may. Only cash-on-delivery orders still waiting for confirmation qualify:
 * nothing has been collected, so the courier simply collects the new total.
 */
export function customerExtendBlocker(order: PlacedOrderLike, now: Date): ExtendBlocker | null {
  if (!order.orderPlacedAt) return 'NOT_PLACED';
  const ageMs = now.getTime() - new Date(order.orderPlacedAt).getTime();
  if (ageMs > CUSTOMER_EXTEND_WINDOW_MINUTES * 60_000) return 'EXPIRED';
  if (order.state !== 'PaymentAuthorized' || order.fulfillmentCount > 0) return 'NOT_EDITABLE';
  if (!order.payments.some(p => p.method === COD_METHOD && p.state === 'Authorized')) {
    return 'NOT_CASH_ON_DELIVERY';
  }
  return null;
}

/** Placed within the related window of each other (either order may be first). */
export function placedCloseTogether(
  a: Date | string | null | undefined,
  b: Date | string | null | undefined,
): boolean {
  if (!a || !b) return false;
  const gap = Math.abs(new Date(a).getTime() - new Date(b).getTime());
  return gap <= RELATED_ORDER_WINDOW_HOURS * 3_600_000;
}

/**
 * Only unshipped orders still awaiting payment on delivery are merged: nothing has
 * been collected, so moving lines across needs no refund, just a new COD amount.
 */
const MERGEABLE_STATES = ['PaymentAuthorized'];

/** French message explaining why `source` cannot be merged into `target`, or null. */
export function mergeBlocker(
  target: { id: string; code: string; state: string; fulfillmentCount: number },
  source: { id: string; code: string; state: string; fulfillmentCount: number; itemCount: number },
): string | null {
  if (target.id === source.id) return 'Impossible de fusionner une commande avec elle-même.';
  for (const o of [target, source]) {
    if (!MERGEABLE_STATES.includes(o.state) || o.fulfillmentCount > 0) {
      return `La commande ${o.code} n'est plus en attente de confirmation (${o.state}) : fusion impossible.`;
    }
  }
  if (source.itemCount === 0) return `La commande ${source.code} ne contient aucun article.`;
  return null;
}
