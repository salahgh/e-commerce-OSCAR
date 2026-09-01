/**
 * A product is out of stock when it has no purchasable variant.
 * Vendure's default stockLevel strings: IN_STOCK | LOW_STOCK | OUT_OF_STOCK.
 */
export function productOutOfStock(variants: Array<{ stockLevel: string }>): boolean {
  return variants.length === 0 || variants.every((v) => v.stockLevel === 'OUT_OF_STOCK');
}
