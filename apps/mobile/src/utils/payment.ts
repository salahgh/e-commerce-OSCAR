/**
 * Payment-method availability gating (mobile-only).
 *
 * The CIB/BaridiMob online gateway is backend-blocked, so those methods are
 * surfaced as "coming soon" (non-selectable) while COD stays the working path.
 * Pure + UI-free: `icon` is a plain Ionicons glyph name (cast at the UI boundary).
 * Mobile is standalone and cannot import `@oscar/shared`, so the labels are
 * mirrored here (same pattern as `src/data/wilayas.ts`).
 */
export type PaymentAvailability = 'available' | 'coming-soon';

export interface ComingSoonPayment {
  code: string;
  labelKey: string;
  labelFallback: string;
  icon: string; // Ionicons glyph name
}

export const COMING_SOON_PAYMENTS: ComingSoonPayment[] = [
  { code: 'cib', labelKey: 'checkout.cibCard', labelFallback: 'CIB (Carte bancaire)', icon: 'card-outline' },
  { code: 'baridimob', labelKey: 'checkout.baridimob', labelFallback: 'BaridiMob', icon: 'phone-portrait-outline' },
];

const COMING_SOON_CODES = new Set(COMING_SOON_PAYMENTS.map((p) => p.code));

export function getPaymentAvailability(code: string): PaymentAvailability {
  return COMING_SOON_CODES.has(code.toLowerCase()) ? 'coming-soon' : 'available';
}

export function isSelectableMethod(method: { code: string; isEligible: boolean }): boolean {
  return method.isEligible && getPaymentAvailability(method.code) === 'available';
}

/**
 * Cash-on-Delivery detection from an order's payments.
 *
 * The backend COD handler (apps/backend/.../payment/cash-on-delivery-handler.ts)
 * uses method code `cash-on-delivery` and auto-authorizes/settles the payment,
 * so a COD order can reach `PaymentSettled` without money ever changing hands.
 * We match case-insensitively and tolerate substring variants ("cash", "delivery",
 * "cod") so display logic never wrongly reads COD as "Paid".
 */
export function isCashOnDeliveryMethod(method?: string | null): boolean {
  if (!method) return false;
  const m = method.toLowerCase();
  return (
    m.includes('cash-on-delivery') ||
    m.includes('cash') ||
    m.includes('delivery') ||
    m === 'cod'
  );
}

export function isCashOnDelivery(order?: {
  payments?: Array<{ method?: string | null }> | null;
} | null): boolean {
  const payments = order?.payments;
  if (!payments?.length) return false;
  return payments.some((p) => isCashOnDeliveryMethod(p?.method));
}

export function partitionPaymentMethods<T extends { code: string }>(
  eligible: T[],
): { available: T[]; comingSoon: ComingSoonPayment[] } {
  return {
    available: eligible.filter((m) => getPaymentAvailability(m.code) === 'available'),
    comingSoon: COMING_SOON_PAYMENTS,
  };
}
