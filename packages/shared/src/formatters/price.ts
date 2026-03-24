/**
 * Format price for display (Vendure stores prices in cents)
 * @param price - Price in cents
 * @param currencyCode - Currency code (default: DZD)
 * @returns Formatted price string
 */
export function formatPrice(price: number, currencyCode: string = 'DZD'): string {
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(price / 100);
}
