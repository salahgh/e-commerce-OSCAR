import { LanguageCode, ShippingCalculator } from '@vendure/core';
import { WILAYA_SHIPPING_RATES, WilayaShippingRate } from './wilaya-shipping-rates';

export type DeliveryMode = 'home' | 'office';

/** Lower-case, accent-free, single-spaced — so "Béjaïa", "Bejaia" and "BEJAIA" all match. */
function normalize(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim();
}

/**
 * Resolve the order's shipping wilaya to its rate row. The storefronts store the
 * canonical French wilaya name in `province`; a bare two-digit code is accepted too
 * (the web checkout falls back to it when the wilaya is unknown).
 */
export function findWilayaRate(address: { province?: string | null } | null | undefined): WilayaShippingRate | undefined {
  const province = address?.province?.trim();
  if (!province) return undefined;
  if (/^\d{1,2}$/.test(province)) {
    const code = province.padStart(2, '0');
    return WILAYA_SHIPPING_RATES.find((r) => r.code === code);
  }
  const key = normalize(province);
  return WILAYA_SHIPPING_RATES.find((r) => normalize(r.name) === key);
}

/**
 * Prices a shipping method from the per-wilaya table: one method is configured
 * with `mode = home`, the other with `mode = office`. When the wilaya is unknown
 * or the mode has no price there, the calculator returns nothing and Vendure
 * simply leaves that method out of `eligibleShippingMethods`.
 */
export const wilayaRateCalculator = new ShippingCalculator({
  code: 'wilaya-rate-calculator',
  description: [
    { languageCode: LanguageCode.en, value: 'Per-wilaya rate (home or office delivery)' },
    { languageCode: LanguageCode.fr, value: 'Tarif par wilaya (livraison à domicile ou au bureau)' },
    { languageCode: LanguageCode.ar, value: 'تسعيرة حسب الولاية (توصيل إلى المنزل أو إلى المكتب)' },
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
  calculate: (ctx, order, args) => {
    const mode: DeliveryMode = args.mode === 'office' ? 'office' : 'home';
    const rate = findWilayaRate(order.shippingAddress);
    if (!rate) return undefined;
    const dzd = rate[mode];
    if (dzd == null) return undefined;
    return {
      // Vendure prices are in minor units (centimes); the table is in whole dinars.
      price: Math.round(dzd * 100),
      priceIncludesTax: ctx.channel.pricesIncludeTax,
      taxRate: 0,
      metadata: { mode, wilayaCode: rate.code },
    };
  },
});
