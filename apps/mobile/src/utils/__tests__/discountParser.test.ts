import { parseProductDiscount } from '../discountParser';

describe('parseProductDiscount', () => {
  it('returns no discount when there are no collections', () => {
    const result = parseProductDiscount([], 200000);
    expect(result.hasDiscount).toBe(false);
    expect(result.salePrice).toBe(200000);
    expect(result.savings).toBe(0);
  });

  it('parses a discount-NN collection slug and computes the sale price', () => {
    const result = parseProductDiscount([{ slug: 'discount-30' }], 200000);
    expect(result.hasDiscount).toBe(true);
    expect(result.percentage).toBe(30);
    expect(result.originalPrice).toBe(200000);
    expect(result.salePrice).toBe(140000);
    expect(result.savings).toBe(60000);
  });

  it('picks the highest discount when several match', () => {
    const result = parseProductDiscount(
      [{ slug: 'discount-10' }, { slug: 'discount-50' }, { slug: 'summer' }],
      100000
    );
    expect(result.percentage).toBe(50);
    expect(result.salePrice).toBe(50000);
  });

  it('ignores non-discount slugs and percentages over 100', () => {
    const result = parseProductDiscount([{ slug: 'discount-150' }, { slug: 'new' }], 100000);
    expect(result.hasDiscount).toBe(false);
  });

  it('returns no discount when price is zero', () => {
    const result = parseProductDiscount([{ slug: 'discount-30' }], 0);
    expect(result.hasDiscount).toBe(false);
  });
});
