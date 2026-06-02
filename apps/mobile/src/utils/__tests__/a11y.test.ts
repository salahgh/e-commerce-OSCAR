import { productAccessibilityLabel } from '../a11y';

describe('productAccessibilityLabel', () => {
  it('includes name and price when priced', () => {
    expect(productAccessibilityLabel({ name: 'T-Shirt', price: 2500, currencyCode: 'DZD' })).toBe('T-Shirt, 2500 DZD');
  });

  it('defaults currency to DZD', () => {
    expect(productAccessibilityLabel({ name: 'T-Shirt', price: 2500 })).toBe('T-Shirt, 2500 DZD');
  });

  it('uses a custom currency', () => {
    expect(productAccessibilityLabel({ name: 'Jeans', price: 100, currencyCode: 'EUR' })).toBe('Jeans, 100 EUR');
  });

  it('returns name only when price is 0, null, or missing', () => {
    expect(productAccessibilityLabel({ name: 'T-Shirt', price: 0 })).toBe('T-Shirt');
    expect(productAccessibilityLabel({ name: 'T-Shirt', price: null })).toBe('T-Shirt');
    expect(productAccessibilityLabel({ name: 'T-Shirt' })).toBe('T-Shirt');
  });
});
