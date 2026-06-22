/**
 * Variant → product-card discount fields.
 *
 * The Vendure ProductVariant carries optional `originalPrice` (pre-discount, in
 * cents) and `discountPercent` custom fields. The catalog shows a strike-through
 * + a "-N%" badge whenever a genuine discount is present. ProductCard decides the
 * final display (it only strikes through when originalPrice > price), so we just
 * surface the raw values here.
 *
 * The parameter type is intentionally loose: every storefront query selects these
 * fields via the shared `ProductVariantFields` fragment, but the hand-written
 * local `Item` types in some pages don't declare them — structural typing lets us
 * pass those through unchanged.
 */
export interface VariantLike {
  priceWithTax?: number | null;
  customFields?: { originalPrice?: number | null; discountPercent?: number | null } | null;
}

export function variantDiscount(v?: VariantLike | null): {
  price: number;
  originalPrice: number | null;
  discountPercent: number | null;
} {
  return {
    price: v?.priceWithTax ?? 0,
    originalPrice: v?.customFields?.originalPrice ?? null,
    discountPercent: v?.customFields?.discountPercent ?? null,
  };
}
