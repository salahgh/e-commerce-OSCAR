/**
 * The order this browser placed most recently, kept for a short window so the
 * shop can offer "Ajouter à ma commande" instead of letting the customer place
 * a second order for the next item (production showed many one-item orders
 * from the same phone a few minutes apart).
 *
 * The window matches CUSTOMER_EXTEND_WINDOW_MINUTES in the backend
 * (oscar-plugin/order/related-orders.ts), which is what actually enforces it.
 */
export const RECENT_ORDER_WINDOW_MINUTES = 30;
const KEY = 'oscar.recentOrder';

export interface RecentOrder {
  code: string;
  placedAt: number;
}

function storage(): Storage | null {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
}

export function saveRecentOrder(code: string, now = Date.now()): void {
  try {
    storage()?.setItem(KEY, JSON.stringify({ code, placedAt: now } satisfies RecentOrder));
  } catch {
    /* private mode / quota: the feature simply stays hidden */
  }
}

export function clearRecentOrder(): void {
  try {
    storage()?.removeItem(KEY);
  } catch {
    /* ignore */
  }
}

/** The recent order while it can still be extended, else null (and forgets it). */
export function getRecentOrder(now = Date.now()): RecentOrder | null {
  let parsed: Partial<RecentOrder> | null = null;
  try {
    parsed = JSON.parse(storage()?.getItem(KEY) ?? 'null');
  } catch {
    parsed = null;
  }
  if (!parsed || typeof parsed.code !== 'string' || typeof parsed.placedAt !== 'number') return null;
  if (now - parsed.placedAt > RECENT_ORDER_WINDOW_MINUTES * 60_000 || now < parsed.placedAt) {
    clearRecentOrder();
    return null;
  }
  return { code: parsed.code, placedAt: parsed.placedAt };
}

/** Whole minutes left to extend the order (at least 1 while it is valid). */
export function minutesLeft(order: RecentOrder, now = Date.now()): number {
  const left = RECENT_ORDER_WINDOW_MINUTES * 60_000 - (now - order.placedAt);
  return Math.max(1, Math.ceil(left / 60_000));
}

/**
 * Errors from `addToPlacedOrder` after which the order can no longer be
 * extended, so the offer should disappear.
 */
export function isFinalExtendError(errorCode: string | null | undefined): boolean {
  return ['NOT_FOUND', 'EXPIRED', 'NOT_EDITABLE', 'NOT_CASH_ON_DELIVERY', 'NOT_PLACED', 'ORDER_MODIFICATION_STATE_ERROR'].includes(
    errorCode ?? '',
  );
}
