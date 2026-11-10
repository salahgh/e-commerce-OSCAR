/**
 * Phone search for the back-office. Stored numbers come in many shapes
 * ("0661234567", "+213 661 23 45 67", "0661-23-45-67", ...), so matching is done
 * on digits only, without the national/international prefix: the search term is
 * reduced to its "core" digits and looked for inside each stored number's digits.
 *
 * Kept free of Vendure imports so it can be unit-tested without a database.
 */

/** Minimum digits before a search is treated as a phone number. */
export const MIN_PHONE_SEARCH_DIGITS = 4;

/**
 * Digits to look for, or null when the text is not a phone search (letters, or
 * too few digits). "0661 23" → "66123", "+213 661" → "661".
 */
export function phoneSearchCore(raw: string | null | undefined): string | null {
  const text = (raw ?? '').trim();
  if (!/^[\d\s+().\-/]+$/.test(text)) return null;
  let digits = text.replace(/\D/g, '');
  if (digits.length < MIN_PHONE_SEARCH_DIGITS) return null;
  // "+213…" / "00213…" is always the country code; a bare "213…" only when too
  // long to be a local number (a partial search like "2134" is just digits).
  if (digits.startsWith('00213')) digits = digits.slice(5);
  else if (digits.startsWith('213') && (text.startsWith('+') || digits.length > 9)) digits = digits.slice(3);
  digits = digits.replace(/^0+/, '');
  return digits || null;
}
