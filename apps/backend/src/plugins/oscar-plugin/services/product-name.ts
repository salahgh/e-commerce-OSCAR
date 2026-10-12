/**
 * Pure helper: pick a product's display name from its translations.
 * Order: request language → channel default language → first non-empty name.
 * Kept free of Vendure imports so it can be unit-tested without a database.
 */
export interface NameTranslation {
  languageCode: string;
  name: string;
}

export function pickProductName(
  translations: ReadonlyArray<NameTranslation> | undefined,
  languageCode: string,
  defaultLanguageCode: string,
): string {
  if (!translations || translations.length === 0) return '';
  const byLang = (code: string) => translations.find(t => t.languageCode === code && t.name)?.name;
  return (
    byLang(languageCode) ??
    byLang(defaultLanguageCode) ??
    translations.find(t => t.name)?.name ??
    ''
  );
}
