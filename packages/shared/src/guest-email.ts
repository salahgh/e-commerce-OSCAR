/**
 * Placeholder email for guest checkouts.
 *
 * The checkout form does not require an email, but Vendure's
 * `setCustomerForOrder` does. When the shopper leaves it blank the apps send a
 * deterministic address derived from the phone number instead, so a repeat
 * buyer with the same phone maps onto the same guest customer record.
 *
 * The domain is a subdomain nobody receives mail on, and `isPlaceholderEmail`
 * lets displays and email handlers tell these apart from real addresses.
 */
export const PLACEHOLDER_EMAIL_DOMAIN = 'sans-email.oscarfashion.dz';

export function placeholderEmailForPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return `${digits || 'inconnu'}@${PLACEHOLDER_EMAIL_DOMAIN}`;
}

export function isPlaceholderEmail(email: string | null | undefined): boolean {
  return !!email && email.toLowerCase().endsWith(`@${PLACEHOLDER_EMAIL_DOMAIN}`);
}
