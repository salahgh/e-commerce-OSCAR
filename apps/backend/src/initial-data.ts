import { InitialData, LanguageCode } from '@vendure/core';

// Minimum initial dataset required before src/populate.ts can run.
// Adds a tax category, an Algeria-centric zone, and a default payment method.
// Re-running populate is safe; existing rows are reused.
export const initialData: InitialData = {
  defaultLanguage: LanguageCode.fr,
  defaultZone: 'Algeria',
  roles: [],
  taxRates: [
    { name: 'Standard Tax', percentage: 0 },
  ],
  shippingMethods: [
    { name: 'Standard Shipping', price: 500 },
  ],
  paymentMethods: [
    {
      name: 'Cash on delivery',
      handler: {
        code: 'cash-on-delivery',
        arguments: [{ name: 'codFee', value: '0' }],
      },
    },
  ],
  countries: [
    { name: 'Algeria', code: 'DZ', zone: 'Algeria' },
  ],
  collections: [],
};
