import { Injector, LanguageCode, ShippingCalculator } from '@vendure/core';
import { WilayaShippingService } from '../services/wilaya-shipping.service';

let wilayaShippingService: WilayaShippingService;

/**
 * Prices delivery from the WilayaShipping table (managed in the back-office
 * "Livraison par wilaya" section) based on the order's shipping address.
 * Free above the channel's free-shipping threshold.
 */
export const wilayaShippingCalculator = new ShippingCalculator({
  code: 'wilaya-shipping-calculator',
  description: [
    { languageCode: LanguageCode.en, value: 'Wilaya-based delivery price (Algeria)' },
    { languageCode: LanguageCode.fr, value: 'Tarif de livraison par wilaya (Algérie)' },
    { languageCode: LanguageCode.ar, value: 'سعر التوصيل حسب الولاية (الجزائر)' },
  ],
  args: {},
  init: (injector: Injector) => {
    wilayaShippingService = injector.get(WilayaShippingService);
  },
  calculate: async (ctx, order) => {
    const price = await wilayaShippingService.priceForAddress(
      ctx,
      order.shippingAddress,
      order.subTotalWithTax,
    );
    return { price, priceIncludesTax: true, taxRate: 0 };
  },
});
