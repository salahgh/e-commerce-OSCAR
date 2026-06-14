# Infinite Scroll for Product Lists (Design)

**Date:** 2026-06-14
**Area:** `apps/frontend` storefront
**Status:** Approved
**Builds on:** branch `feat/content-settings-per-section-save`

## Problem

The category detail page and the search results page use a classic page-number `<Pagination>` control. We want infinite scroll instead: more items load automatically as the user nears the bottom, with an accessible fallback.

## Scope

- **In:** category detail page (`(shop)/categories/[slug]/page.tsx`) and search page (`(shop)/search/page.tsx`).
- **Out:** the `Pagination` component itself stays (still used by the design-system showcase). The `/products` listing isn't paginated today and is out of scope.

## Behaviour (approved)

Auto-load via `IntersectionObserver` as the list end nears the viewport, **plus** an accessible "Load more" button that is the observer target and the keyboard/no-JS fallback.

## Leverage: existing cache merges

`apps/frontend/src/lib/apollo/apollo-wrapper.tsx` already defines skip-based merges:
- `Query.fields.products` — keyArgs `['options', ['filter','sort']]`, appends when `args.options.skip !== 0`, resets when `0`.
- `Query.fields.search` — keyArgs `['input', ['term','facetValueFilters','sort']]`, appends when `args.input.skip !== 0`, resets when `0`.

The search page sends `facetValueFilters` (verified), so the search keyArgs already separates distinct filter selections — changing filters (skip resets to 0) starts a fresh list. **Only the category page's `Collection.productVariants` lacks a merge** and must be added.

## Components & changes

### 1. New `<LoadMore>` (`components/patterns/LoadMore.tsx`)
Client component. Props `{ hasMore: boolean; loading: boolean; onLoadMore: () => void; label?: string; loadingLabel?: string }`.
- Renders `null` when `!hasMore`.
- Renders a centered "Load more" `<button>` (disabled while loading, shows a spinner) inside a wrapper `div` that an `IntersectionObserver` (`rootMargin: '600px'`) observes; when it intersects and `!loading`, calls `onLoadMore`.
- The button is both the observer target and the manual/keyboard fallback.

### 2. Cache — add `Collection.productVariants` merge
In `apollo-wrapper.tsx`, add under `Collection`:
```ts
fields: {
  productVariants: {
    keyArgs: false,
    merge(existing, incoming, { args }) {
      if (!existing || (args?.options?.skip ?? 0) === 0) return incoming;
      return { ...incoming, items: [...(existing.items || []), ...(incoming.items || [])] };
    },
  },
},
```
(Different collections are separate cache entries — `Collection` is keyed by `id`, fetched via `collection(slug)` — so accumulation is per-collection.)

### 3. Search page
- Remove `<Pagination>`, `onPageChange`, and the `?page`-driven `skip`. Base query uses `skip: 0`.
- Track `loaded = data.search.items.length`; `hasMore = loaded < totalItems`.
- `onLoadMore = () => fetchMore({ variables: { input: { term, take: PER_PAGE, skip: loaded, groupByProduct: true, facetValueFilters } } })` (a `loadingMore` flag toggled around the promise).
- Render `<LoadMore hasMore loading={loadingMore} onLoadMore />` after the results grid.
- Facet/term changes still reset to a fresh list (skip 0 → merge resets; distinct keyArgs).
- **Behaviour change:** search loses shareable per-page URLs (inherent to infinite scroll). The `?page` URL param is no longer used.

### 4. Category detail page
- Remove `<Pagination>` and the `page` state. Base query `skip: 0`.
- Accumulate raw `collection.productVariants.items` (variants); `total = productVariants.totalItems`; `hasMore = rawItems.length < total`. Display still dedupes variants → products.
- `onLoadMore = () => fetchMore({ variables: { slug, take: PER_PAGE, skip: rawItems.length } })` with a `loadingMore` flag.
- Render `<LoadMore />` after the products grid.

### 5. i18n
Add `loadMore` / `loading` strings (ar/fr/en) used by the two pages; pass them to `<LoadMore>` as `label`/`loadingLabel`.

## Error / edge handling
- `fetchMore` rejection → keep the button visible (acts as retry); surface nothing destructive.
- `hasMore === false` → `<LoadMore>` renders nothing.
- Initial load + empty/skeleton states unchanged.
- The auto-trigger is guarded by `!loading`; the button is `disabled` while loading to prevent double fetches.

## Verification
- `pnpm --filter @oscar/frontend exec tsc --noEmit` clean.
- Live: category + search lists load page 1, then clicking "Load more" (and scrolling) increases the rendered item count; no `Pagination` control present; changing a search facet resets the list.
- e2e (`infinite-scroll.spec.ts`): on `/ar/categories/{slug}` and a search results page, assert the initial product count, click "Load more", assert the count increased and no pagination control exists.

## Files
- New: `components/patterns/LoadMore.tsx` (+ export in `patterns/index.ts`).
- Modify: `lib/apollo/apollo-wrapper.tsx` (Collection.productVariants merge).
- Modify: `(shop)/search/page.tsx`, `(shop)/categories/[slug]/page.tsx`.
- Modify: `messages/{ar,fr,en}.json` (loadMore/loading).
- New: `e2e/infinite-scroll.spec.ts`.
- Unchanged: `components/ui/Pagination.tsx` (kept for the design-system showcase).
