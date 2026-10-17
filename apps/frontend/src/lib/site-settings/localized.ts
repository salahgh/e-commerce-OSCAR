/**
 * Helpers for the site content edited in the back-office (Settings → contenu),
 * stored as channel custom fields with one column per language
 * (`footerAddressFr`, `footerAddressAr`, ...).
 */

export type SiteLocale = 'ar' | 'fr' | 'en';

const SUFFIX: Record<SiteLocale, 'Ar' | 'Fr' | 'En'> = { ar: 'Ar', fr: 'Fr', en: 'En' };
// French is the shop's main language: the one most likely to be filled in.
const FALLBACK_ORDER: SiteLocale[] = ['fr', 'ar', 'en'];

const clean = (value: unknown) => (typeof value === 'string' && value.trim() ? value.trim() : null);

/**
 * The value for `locale`, else the first filled-in language. An address or a
 * promo typed only in French must not leave the Arabic site on a built-in default.
 */
export function localizedText(
  fields: Record<string, unknown> | null | undefined,
  base: string,
  locale: string,
): string | null {
  if (!fields) return null;
  const order = [locale as SiteLocale, ...FALLBACK_ORDER.filter((l) => l !== locale)].filter((l) => l in SUFFIX);
  for (const l of order) {
    const value = clean(fields[`${base}${SUFFIX[l]}`]);
    if (value) return value;
  }
  return null;
}

/** "0558500160/0552182635" → one dialable link per number. */
export function phoneNumbers(raw: string | null | undefined): { label: string; href: string }[] {
  if (!raw) return [];
  return raw
    .split(/[\/,;|]/)
    .map((n) => n.trim())
    .filter((n) => /\d/.test(n))
    .map((label) => ({ label, href: `tel:${label.replace(/[^\d+]/g, '')}` }));
}
