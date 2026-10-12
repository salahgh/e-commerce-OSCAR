/**
 * Bookkeeping for pages that paginate with `search` (cheap, product ids only)
 * and hydrate each page with the full product data (the search result lacks the
 * discount custom fields and option groups the cards need).
 *
 * Hydration must be incremental: refetching every loaded product on each page
 * grows the request with the page count, and on the production box that query
 * already takes 1.5–4 s for a single page. Fetching only the ids that are not
 * hydrated yet keeps every request the size of one page.
 */

export interface SearchHit {
  productId: string;
}

/** Ids from the search pages that still need full product data, unique, in search order. */
export function idsToHydrate(hits: readonly SearchHit[], hydrated: ReadonlyMap<string, unknown>): string[] {
  const out: string[] = [];
  const seen = new Set<string>();
  for (const { productId } of hits) {
    if (seen.has(productId) || hydrated.has(productId)) continue;
    seen.add(productId);
    out.push(productId);
  }
  return out;
}

/** Hydrated products in search order; products not hydrated yet are left out. */
export function orderedProducts<T>(hits: readonly SearchHit[], hydrated: ReadonlyMap<string, T>): T[] {
  const out: T[] = [];
  const seen = new Set<string>();
  for (const { productId } of hits) {
    if (seen.has(productId)) continue;
    seen.add(productId);
    const p = hydrated.get(productId);
    if (p) out.push(p);
  }
  return out;
}
