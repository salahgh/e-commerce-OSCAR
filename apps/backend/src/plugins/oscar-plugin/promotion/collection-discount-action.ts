import { CollectionService, LanguageCode, PromotionItemAction } from '@vendure/core';

const DISCOUNT_SLUG_REGEX = /^discount-(\d+)$/;

let collectionService: CollectionService;

/**
 * Extracts the highest discount percentage from collection slugs matching "discount-XX".
 */
function getHighestDiscount(slugs: string[]): number {
  let highest = 0;
  for (const slug of slugs) {
    const match = slug.match(DISCOUNT_SLUG_REGEX);
    if (match) {
      const pct = parseInt(match[1], 10);
      if (pct > highest && pct <= 100) {
        highest = pct;
      }
    }
  }
  return highest;
}

/**
 * A PromotionItemAction that automatically applies percentage discounts
 * based on collection membership. Products in a collection with slug
 * "discount-30" get 30% off, "discount-50" get 50% off, etc.
 *
 * Create ONE promotion in Vendure admin with this action (no conditions needed).
 * It handles all discount-XX collections automatically.
 */
export const collectionPercentageDiscount = new PromotionItemAction({
  code: 'collection-percentage-discount',
  description: [
    {
      languageCode: LanguageCode.en,
      value: 'Apply percentage discount based on collection slug (discount-XX)',
    },
    {
      languageCode: LanguageCode.fr,
      value: 'Appliquer une remise basée sur le slug de collection (discount-XX)',
    },
  ],
  args: {},
  init(injector) {
    collectionService = injector.get(CollectionService);
  },
  async execute(ctx, orderLine) {
    const productId = orderLine.productVariant.productId;
    const collections = await collectionService.getCollectionsByProductId(ctx, productId, false);

    const slugs = collections.map((c) => c.slug);
    const discountPercent = getHighestDiscount(slugs);

    if (discountPercent === 0) {
      return 0;
    }

    // Return negative number = discount per unit
    return -orderLine.unitPrice * (discountPercent / 100);
  },
});
