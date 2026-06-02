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

const COMING_SOON_CODES = new Set(['cib', 'baridimob']);

export function getPaymentAvailability(code: string): PaymentAvailability {
  return COMING_SOON_CODES.has(code.toLowerCase()) ? 'coming-soon' : 'available';
}

export function isSelectableMethod(method: { code: string; isEligible: boolean }): boolean {
  return method.isEligible && getPaymentAvailability(method.code) === 'available';
}

export function partitionPaymentMethods<T extends { code: string }>(
  eligible: T[],
): { available: T[]; comingSoon: ComingSoonPayment[] } {
  return {
    available: eligible.filter((m) => getPaymentAvailability(m.code) === 'available'),
    comingSoon: COMING_SOON_PAYMENTS,
  };
}
