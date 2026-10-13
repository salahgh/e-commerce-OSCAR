/**
 * Pure helpers behind the per-wilaya delivery pricing. No database, no
 * Vendure: WilayaShippingService loads the rows and the shipping calculator
 * asks these functions for a quote, so the matching and pricing rules are
 * unit-tested in isolation (wilaya-pricing.test.ts).
 */

export type DeliveryMode = 'home' | 'office';

/** Charged for home delivery when the address matches no wilaya row (500 DZD). */
export const FALLBACK_HOME_PRICE = 50000;

/** The parts of a shipping address the matching looks at. */
export interface AddressLike {
  province?: string | null;
  customFields?: { wilayaCode?: string | null } | null;
}

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
 * Resolve an order's shipping address to its wilaya row.
 *
 * The shipped-to text (`province`: canonical French name, or the Arabic name
 * or bare code on older orders) decides whenever it still matches a wilaya,
 * so the price always belongs to the destination the courier reads. The
 * `wilayaCode` custom field the storefronts send is only the fallback for a
 * wilaya renamed in the back-office after the address was saved; both values
 * are client-supplied, so the code never overrides a recognised name.
 */
export function findWilayaRow<T extends { code: string; name: string; nameAr: string }>(
  rows: readonly T[],
  address: AddressLike | undefined,
): T | undefined {
  const byCode = (raw: string | null | undefined): T | undefined => {
    const value = raw?.trim();
    if (!value || !/^\d{1,2}$/.test(value)) return undefined;
    const code = value.padStart(2, '0');
    return rows.find((row) => row.code === code);
  };
  const province = address?.province?.trim();
  if (province) {
    const fromProvinceCode = byCode(province);
    if (fromProvinceCode) return fromProvinceCode;
    const key = normalizePlace(province);
    const byName = rows.find((row) => row.nameAr.trim() === province || normalizePlace(row.name) === key);
    if (byName) return byName;
  }
  return byCode(address?.customFields?.wilayaCode);
}

/**
 * Price (minor units) of one delivery mode for a wilaya row, or `undefined`
 * when that mode is not offered there — Vendure then leaves the method out of
 * `eligibleShippingMethods`. A wilaya switched off in the back-office offers
 * nothing. An unknown wilaya (an old address whose name no longer matches any
 * row) still gets home delivery at the fallback price so that customer is not
 * left without a delivery option.
 */
export function quoteDelivery(
  row: { active: boolean; homePrice: number | null; officePrice: number | null } | undefined,
  mode: DeliveryMode,
  orderSubTotalWithTax: number,
  freeShippingThresholdMinor: number | null,
): number | undefined {
  if (row && !row.active) return undefined;
  const price = row
    ? mode === 'home' ? row.homePrice : row.officePrice
    : mode === 'home' ? FALLBACK_HOME_PRICE : null;
  if (price == null) return undefined;
  if (freeShippingThresholdMinor != null && orderSubTotalWithTax >= freeShippingThresholdMinor) return 0;
  return price;
}

/**
 * Commune codes are the wilaya code followed by a two-digit sequence
 * (`1601` = first commune of Alger), like the official nomenclature the seed
 * data came from. New communes get the first free suffix in their wilaya.
 */
export function nextCommuneCode(wilayaCode: string, existingCodes: readonly string[]): string {
  const taken = new Set(existingCodes.filter((c) => c.startsWith(wilayaCode)));
  for (let n = 1; n <= 99; n++) {
    const candidate = `${wilayaCode}${String(n).padStart(2, '0')}`;
    if (!taken.has(candidate)) return candidate;
  }
  throw new Error(`No free commune code left in wilaya ${wilayaCode}`);
}
