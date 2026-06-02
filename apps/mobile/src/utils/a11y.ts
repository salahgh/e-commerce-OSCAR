/**
 * Accessibility label builders (pure). A product touch target should announce a
 * single consistent label to a screen reader instead of its raw child text nodes.
 */
export function productAccessibilityLabel(p: {
  name: string;
  price?: number | null;
  currencyCode?: string;
}): string {
  if (typeof p.price === 'number' && p.price > 0) {
    return `${p.name}, ${p.price} ${p.currencyCode ?? 'DZD'}`;
  }
  return p.name;
}
