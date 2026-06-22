/**
 * Whole-DZD price formatting matching the OSCAR desktop Figma designs.
 *
 * The shared `formatPrice` renders via `Intl … fr-DZ` which produces the "DA"
 * symbol with no thousands separator (e.g. "DA 3290"). The designs instead use
 * a Latin number with a comma separator plus a context-dependent symbol:
 *   - product / line-item prices  → "2,500 DZD"   (every locale)
 *   - order-summary totals & fees → "7,900 دج"    in Arabic, "DZD" otherwise
 *
 * We keep the shared formatter untouched (the back-office relies on it) and use
 * these frontend-local helpers in the storefront's display code.
 */
const nf = new Intl.NumberFormat('en-US');

const whole = (cents: number) => nf.format(Math.round(cents / 100));

/** Product / line-item price — "2,500 DZD" in every locale. */
export function formatDzd(cents: number): string {
  return `${whole(cents)} DZD`;
}

/** Order-summary total / fee — "دج" in Arabic, "DZD" otherwise. */
export function formatDzdTotal(cents: number, locale: string): string {
  return `${whole(cents)} ${locale === 'ar' ? 'دج' : 'DZD'}`;
}
