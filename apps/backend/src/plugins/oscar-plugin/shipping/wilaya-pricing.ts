/**
 * Pure helpers behind the per-wilaya delivery pricing. No database, no
 * Vendure: WilayaShippingService loads the rows and the shipping calculator
 * asks these functions for a quote, so the matching and pricing rules are
 * unit-tested in isolation (wilaya-pricing.test.ts).
 */

export type DeliveryMode = 'home' | 'office';

/** Charged for home delivery when the address matches no wilaya row (500 DZD). */
export const FALLBACK_HOME_PRICE = 50000;

/** Lower-case, accent-free, punctuation collapsed to single spaces: "Béjaïa" and "BEJAIA" match. */
export function normalizePlace(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Resolve an order's shipping `province` to its wilaya row. The storefronts
 * store the canonical French name; older orders may carry the Arabic name or
 * the bare wilaya code, so all three forms are accepted.
 */
export function findWilayaRow<T extends { code: string; name: string; nameAr: string }>(
  rows: readonly T[],
  province: string | null | undefined,
): T | undefined {
  const value = province?.trim();
  if (!value) return undefined;
  if (/^\d{1,2}$/.test(value)) {
    const code = value.padStart(2, '0');
    return rows.find((row) => row.code === code);
  }
  const key = normalizePlace(value);
  return rows.find((row) => row.nameAr.trim() === value || normalizePlace(row.name) === key);
}

/**
 * Price (minor units) of one delivery mode for a wilaya row, or `undefined`
 * when that mode is not offered there — Vendure then leaves the method out of
 * `eligibleShippingMethods`. An unknown wilaya still gets home delivery at the
 * fallback price so a customer is never left without a delivery option.
 */
export function quoteDelivery(
  row: { homePrice: number | null; officePrice: number | null } | undefined,
  mode: DeliveryMode,
  orderSubTotalWithTax: number,
  freeShippingThresholdMinor: number | null,
): number | undefined {
  const price = row
    ? mode === 'home' ? row.homePrice : row.officePrice
    : mode === 'home' ? FALLBACK_HOME_PRICE : null;
  if (price == null) return undefined;
  if (freeShippingThresholdMinor != null && orderSubTotalWithTax >= freeShippingThresholdMinor) return 0;
  return price;
}
