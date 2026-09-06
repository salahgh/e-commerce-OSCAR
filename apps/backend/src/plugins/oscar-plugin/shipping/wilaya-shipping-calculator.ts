import { Injector, LanguageCode, ShippingCalculator } from '@vendure/core';
import { WilayaShippingService } from '../services/wilaya-shipping.service';
import { DeliveryMode } from './wilaya-pricing';

let wilayaShippingService: WilayaShippingService;

/**
 * Prices a delivery method from the WilayaShipping table (managed in the
 * back-office "Livraison par wilaya" section) based on the order's shipping
 * address. One shipping method is configured with `mode = home`, the other
 * with `mode = office`; when the mode has no price in the customer's wilaya
 * the calculator returns nothing and Vendure leaves that method out of
 * `eligibleShippingMethods`. Free above the channel's free-shipping threshold.
 */
export const wilayaShippingCalculator = new ShippingCalculator({
  code: 'wilaya-shipping-calculator',
  description: [
    { languageCode: LanguageCode.en, value: 'Per-wilaya delivery price (home or courier office)' },
    { languageCode: LanguageCode.fr, value: 'Tarif de livraison par wilaya (domicile ou bureau)' },
    { languageCode: LanguageCode.ar, value: 'سعر التوصيل حسب الولاية (إلى المنزل أو إلى المكتب)' },
  ],
  args: {
    mode: {
      type: 'string',
      defaultValue: 'home',
      label: [
        { languageCode: LanguageCode.en, value: 'Delivery mode' },
        { languageCode: LanguageCode.fr, value: 'Mode de livraison' },
        { languageCode: LanguageCode.ar, value: 'طريقة التوصيل' },
      ],
      description: [
        { languageCode: LanguageCode.en, value: '"home" delivers to the address; "office" to the courier office nearest the customer.' },
        { languageCode: LanguageCode.fr, value: '« home » = à domicile ; « office » = au bureau du transporteur le plus proche.' },
      ],
      ui: {
        component: 'select-form-input',
        options: [
          {
            value: 'home',
            label: [
              { languageCode: LanguageCode.en, value: 'Home delivery' },
              { languageCode: LanguageCode.fr, value: 'Livraison à domicile' },
              { languageCode: LanguageCode.ar, value: 'التوصيل إلى المنزل' },
            ],
          },
          {
            value: 'office',
            label: [
              { languageCode: LanguageCode.en, value: 'Pickup at courier office' },
              { languageCode: LanguageCode.fr, value: 'Livraison au bureau (stop desk)' },
              { languageCode: LanguageCode.ar, value: 'التوصيل إلى المكتب' },
            ],
          },
        ],
      },
    },
  },
  init: (injector: Injector) => {
    wilayaShippingService = injector.get(WilayaShippingService);
  },
  calculate: async (ctx, order, args) => {
    const mode: DeliveryMode = args.mode === 'office' ? 'office' : 'home';
    const price = await wilayaShippingService.quoteForAddress(
      ctx,
      order.shippingAddress,
      order.subTotalWithTax,
      mode,
    );
    if (price === undefined) return undefined;
    return { price, priceIncludesTax: true, taxRate: 0, metadata: { mode } };
  },
});
