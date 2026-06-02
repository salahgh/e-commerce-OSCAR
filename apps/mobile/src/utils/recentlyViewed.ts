/**
 * Pure helper for the local "recently viewed" product list.
 * Re-viewing a product moves it to the front (no duplicates); the list is capped.
 * Caller stamps `viewedAt`, keeping this function deterministic + testable.
 */
export interface RecentlyViewedEntry {
  productId: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  price: number; // display units (DZD whole), already formatPrice'd
  currencyCode: string;
  viewedAt: number; // epoch ms
}

export const RECENTLY_VIEWED_CAP = 12;

export function addRecent(
  list: RecentlyViewedEntry[],
  entry: RecentlyViewedEntry,
  cap: number = RECENTLY_VIEWED_CAP,
): RecentlyViewedEntry[] {
  return [entry, ...list.filter((e) => e.productId !== entry.productId)].slice(0, cap);
}
