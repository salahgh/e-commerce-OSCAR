import {
  applyAddItem,
  applyAdjustLine,
  applyRemoveLine,
  applyClear,
  recomputeOrderTotals,
  makeOptimisticOrderLine,
  makeEmptyOptimisticOrder,
  type OptimisticCartVariant,
} from '../optimisticCart';
import { CurrencyCode, type OrderFieldsFragment } from '../../graphql/generated/graphql';

const VARIANT: OptimisticCartVariant = {
  productVariantId: 'pv1',
  unitPriceWithTax: 250000, // 2500 DZD in cents
  name: 'Red / M',
  sku: 'SKU-1',
  product: { id: 'p1', name: 'T-Shirt', slug: 't-shirt', featuredAsset: { id: 'a1', preview: 'http://img/1' } },
  featuredAsset: { id: 'a1', preview: 'http://img/1' },
};

const VARIANT2: OptimisticCartVariant = {
  productVariantId: 'pv2',
  unitPriceWithTax: 100000,
  name: 'Blue / L',
  sku: 'SKU-2',
  product: { id: 'p2', name: 'Jeans', slug: 'jeans', featuredAsset: null },
  featuredAsset: null,
};

// Build a normalized order with a shipping cost of 500 DZD (50000 cents).
function orderWith(lines: OrderFieldsFragment['lines']): OrderFieldsFragment {
  return recomputeOrderTotals({
    __typename: 'Order',
    id: 'o1',
    code: 'OSC1',
    state: 'AddingItems',
    active: true,
    createdAt: '',
    updatedAt: '',
    totalQuantity: 0,
    subTotalWithTax: 0,
    shippingWithTax: 50000,
    totalWithTax: 0,
    currencyCode: CurrencyCode.Dzd,
    couponCodes: [],
    lines,
    shippingAddress: null,
    billingAddress: null,
    customer: null,
    shippingLines: [],
  });
}

describe('makeOptimisticOrderLine', () => {
  it('builds a line with temp id, computed line price, empty options, and asset fallback', () => {
    const line = makeOptimisticOrderLine(VARIANT2, 1, 'temp-x');
    expect(line.id).toBe('temp-x');
    expect(line.__typename).toBe('OrderLine');
    expect(line.linePriceWithTax).toBe(100000);
    expect(line.productVariant.options).toEqual([]);
    expect(line.featuredAsset).toBeNull(); // both line- and product-level assets null
  });
});

describe('makeEmptyOptimisticOrder', () => {
  it('defaults to DZD and an active AddingItems order with no lines', () => {
    const o = makeEmptyOptimisticOrder('order-temp');
    expect(o.id).toBe('order-temp');
    expect(o.currencyCode).toBe(CurrencyCode.Dzd);
    expect(o.state).toBe('AddingItems');
    expect(o.active).toBe(true);
    expect(o.lines).toEqual([]);
    expect(o.totalWithTax).toBe(0);
  });
});

describe('applyAddItem', () => {
  it('creates a new order from null with one line and correct totals', () => {
    const o = applyAddItem(null, VARIANT, 2, 'temp-1');
    expect(o.lines).toHaveLength(1);
    expect(o.lines[0].quantity).toBe(2);
    expect(o.lines[0].linePriceWithTax).toBe(500000);
    expect(o.subTotalWithTax).toBe(500000);
    expect(o.shippingWithTax).toBe(0);
    expect(o.totalWithTax).toBe(500000);
    expect(o.totalQuantity).toBe(2);
    expect(o.id).not.toBe(o.lines[0].id); // order id distinct from line id
  });

  it('appends a new variant to an existing order and sums totals over shipping', () => {
    const start = orderWith([makeOptimisticOrderLine(VARIANT, 1, 'l1')]);
    const o = applyAddItem(start, VARIANT2, 3, 'temp-2');
    expect(o.lines).toHaveLength(2);
    expect(o.subTotalWithTax).toBe(250000 + 300000);
    expect(o.totalWithTax).toBe(550000 + 50000);
    expect(o.totalQuantity).toBe(4);
  });

  it('increments the existing line when re-adding the same variant', () => {
    const start = orderWith([makeOptimisticOrderLine(VARIANT, 1, 'l1')]);
    const o = applyAddItem(start, VARIANT, 2, 'temp-3');
    expect(o.lines).toHaveLength(1);
    expect(o.lines[0].quantity).toBe(3);
    expect(o.lines[0].linePriceWithTax).toBe(750000);
    expect(o.totalWithTax).toBe(750000 + 50000);
  });
});

describe('applyAdjustLine', () => {
  it('updates quantity, line price, and totals', () => {
    const start = orderWith([makeOptimisticOrderLine(VARIANT, 1, 'l1')]);
    const o = applyAdjustLine(start, 'l1', 5);
    expect(o.lines[0].quantity).toBe(5);
    expect(o.lines[0].linePriceWithTax).toBe(1250000);
    expect(o.totalWithTax).toBe(1250000 + 50000);
  });

  it('drops the line when quantity goes to 0', () => {
    const start = orderWith([makeOptimisticOrderLine(VARIANT, 1, 'l1')]);
    const o = applyAdjustLine(start, 'l1', 0);
    expect(o.lines).toHaveLength(0);
    expect(o.subTotalWithTax).toBe(0);
    expect(o.totalWithTax).toBe(50000); // shipping preserved
  });
});

describe('applyRemoveLine', () => {
  it('removes the matching line and recomputes totals', () => {
    const start = orderWith([
      makeOptimisticOrderLine(VARIANT, 1, 'l1'),
      makeOptimisticOrderLine(VARIANT2, 1, 'l2'),
    ]);
    const o = applyRemoveLine(start, 'l1');
    expect(o.lines.map((l) => l.id)).toEqual(['l2']);
    expect(o.subTotalWithTax).toBe(100000);
  });
});

describe('applyClear', () => {
  it('empties lines, zeroes subtotal, preserves shipping', () => {
    const start = orderWith([makeOptimisticOrderLine(VARIANT, 2, 'l1')]);
    const o = applyClear(start);
    expect(o.lines).toEqual([]);
    expect(o.subTotalWithTax).toBe(0);
    expect(o.totalQuantity).toBe(0);
    expect(o.totalWithTax).toBe(50000);
  });
});

describe('recomputeOrderTotals', () => {
  it('sets totalWithTax = subTotalWithTax + shippingWithTax', () => {
    const o = orderWith([
      makeOptimisticOrderLine(VARIANT, 1, 'l1'),
      makeOptimisticOrderLine(VARIANT2, 2, 'l2'),
    ]);
    expect(o.subTotalWithTax).toBe(250000 + 200000);
    expect(o.totalWithTax).toBe(450000 + 50000);
    expect(o.totalQuantity).toBe(3);
  });
});
