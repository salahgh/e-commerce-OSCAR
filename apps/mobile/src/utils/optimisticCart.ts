/**
 * Pure helpers that build optimistic Vendure `Order` objects for the cart.
 * No Apollo imports — all prices are RAW CENTS (the cache's native unit;
 * `formatPrice` divides by 100 only for display). Callers pass a `tempId`
 * so these functions stay deterministic and unit-testable without a clock.
 */
import {
  CurrencyCode,
  type OrderFieldsFragment,
  type OrderLineFieldsFragment,
} from '../graphql/generated/graphql';

export type OptimisticCartVariant = {
  productVariantId: string;
  /** Raw cents, tax-inclusive. On the PDP this is `selectedVariant.priceWithTax`. */
  unitPriceWithTax: number;
  name: string;
  sku: string;
  product: {
    id: string;
    name: string;
    slug: string;
    featuredAsset?: { id: string; preview: string } | null;
  };
  featuredAsset?: { id: string; preview: string } | null;
};

type Order = OrderFieldsFragment;
type Line = OrderLineFieldsFragment;

function asAsset(
  a?: { id: string; preview: string } | null,
): { __typename?: 'Asset'; id: string; preview: string } | null {
  return a ? { __typename: 'Asset', id: a.id, preview: a.preview } : null;
}

export function recomputeOrderTotals(order: Order): Order {
  const totalQuantity = order.lines.reduce((n, l) => n + l.quantity, 0);
  const subTotalWithTax = order.lines.reduce((n, l) => n + l.linePriceWithTax, 0);
  return {
    ...order,
    totalQuantity,
    subTotalWithTax,
    totalWithTax: subTotalWithTax + order.shippingWithTax,
  };
}

export function makeOptimisticOrderLine(
  v: OptimisticCartVariant,
  quantity: number,
  tempId: string,
): Line {
  return {
    __typename: 'OrderLine',
    id: tempId,
    quantity,
    unitPriceWithTax: v.unitPriceWithTax,
    // No promotion is known optimistically → discounted == unit price. Required
    // so the optimistic write satisfies the OrderLineFields fragment (which now
    // selects discountedUnitPriceWithTax).
    discountedUnitPriceWithTax: v.unitPriceWithTax,
    linePriceWithTax: v.unitPriceWithTax * quantity,
    productVariant: {
      __typename: 'ProductVariant',
      id: v.productVariantId,
      name: v.name,
      sku: v.sku,
      priceWithTax: v.unitPriceWithTax,
      product: {
        __typename: 'Product',
        id: v.product.id,
        name: v.product.name,
        slug: v.product.slug,
        featuredAsset: asAsset(v.product.featuredAsset),
      },
      options: [],
    },
    featuredAsset: asAsset(v.featuredAsset ?? v.product.featuredAsset),
  };
}

export function makeEmptyOptimisticOrder(
  tempId: string,
  currencyCode: CurrencyCode = CurrencyCode.Dzd,
): Order {
  return {
    __typename: 'Order',
    id: tempId,
    code: '',
    state: 'AddingItems',
    active: true,
    createdAt: '',
    updatedAt: '',
    totalQuantity: 0,
    subTotalWithTax: 0,
    shippingWithTax: 0,
    totalWithTax: 0,
    currencyCode,
    couponCodes: [],
    lines: [],
    shippingAddress: null,
    billingAddress: null,
    customer: null,
    shippingLines: [],
  };
}

export function applyAddItem(
  order: Order | null,
  v: OptimisticCartVariant,
  quantity: number,
  tempId: string,
): Order {
  const base = order ?? makeEmptyOptimisticOrder(`order-${tempId}`);
  const existing = base.lines.find((l) => l.productVariant.id === v.productVariantId);
  const lines: Line[] = existing
    ? base.lines.map((l) =>
        l.id === existing.id
          ? { ...l, quantity: l.quantity + quantity, linePriceWithTax: l.unitPriceWithTax * (l.quantity + quantity) }
          : l,
      )
    : [...base.lines, makeOptimisticOrderLine(v, quantity, tempId)];
  return recomputeOrderTotals({ ...base, lines });
}

export function applyAdjustLine(order: Order, orderLineId: string, quantity: number): Order {
  const lines =
    quantity <= 0
      ? order.lines.filter((l) => l.id !== orderLineId)
      : order.lines.map((l) =>
          l.id === orderLineId ? { ...l, quantity, linePriceWithTax: l.unitPriceWithTax * quantity } : l,
        );
  return recomputeOrderTotals({ ...order, lines });
}

export function applyRemoveLine(order: Order, orderLineId: string): Order {
  return recomputeOrderTotals({ ...order, lines: order.lines.filter((l) => l.id !== orderLineId) });
}

export function applyClear(order: Order): Order {
  return recomputeOrderTotals({ ...order, lines: [] });
}
