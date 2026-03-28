const DISCOUNT_SLUG_REGEX = /^discount-(\d+)$/;

export interface DiscountInfo {
  hasDiscount: boolean;
  percentage: number;
  originalPrice: number; // price before discount (= DB price, since DB stores full price)
  salePrice: number; // calculated discounted price
  savings: number; // originalPrice - salePrice
}

/**
 * Parses discount info from a product's collections.
 * Looks for collections with slug pattern "discount-XX" (e.g., discount-30).
 * If multiple matches, picks the highest percentage.
 *
 * @param collections - product's collections array (needs at least { slug })
 * @param priceInCents - the product's price in Vendure cents (DB stores the full/original price)
 */
export function parseProductDiscount(
  collections: Array<{ slug: string }> | undefined | null,
  priceInCents: number
): DiscountInfo {
  const noDiscount: DiscountInfo = {
    hasDiscount: false,
    percentage: 0,
    originalPrice: priceInCents,
    salePrice: priceInCents,
    savings: 0,
  };

  if (!collections || collections.length === 0 || !priceInCents) {
    return noDiscount;
  }

  let highest = 0;
  for (const col of collections) {
    const match = col.slug.match(DISCOUNT_SLUG_REGEX);
    if (match) {
      const pct = parseInt(match[1], 10);
      if (pct > highest && pct <= 100) {
        highest = pct;
      }
    }
  }

  if (highest === 0) {
    return noDiscount;
  }

  const salePrice = Math.round(priceInCents * (1 - highest / 100));
  return {
    hasDiscount: true,
    percentage: highest,
    originalPrice: priceInCents,
    salePrice,
    savings: priceInCents - salePrice,
  };
}
