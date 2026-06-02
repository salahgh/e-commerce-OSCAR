# M3a — Recently-Viewed Products (Design Spec)

**Date:** 2026-06-02
**App:** `apps/mobile` (standalone npm Expo project)
**Milestone:** M3a — first slice of M3 ("UX polish"), mobile-only scope
**Status:** Approved design — ready for implementation planning

---

## 1. Goal & background

Track the products a shopper opens and surface a **"Recently viewed"** horizontal row on the Home screen and the PDP. Fully local (AsyncStorage) — no backend, no `oscar-plugin` change. (This is the one M2 "recently-viewed" item that needs no backend; built now under M3.)

**Reference patterns (verified):**
- `src/contexts/WishlistContext.tsx` — the proven local-list pattern: hydrate from AsyncStorage, persist-after-hydration, a product-entry shape. Recently-viewed mirrors it, with two differences: re-viewing a product **moves it to the front** (wishlist ignores duplicates) and the list is **capped**.
- `src/components/products/RelatedProducts.tsx` — a horizontal `FlatList` of simple cards (140-wide: image + name + price) over a `SimpleProduct` shape `{ id, slug, name, imageUrl, price, currencyCode }`, each linking to `/products/[slug]`. Recently-viewed entries map directly onto this.
- The Home screen (`app/(tabs)/index.tsx`) is a `ScrollView` of sections that renders its product rows with the richer `ProductCardFigma` (rating/discount/stock). Recently-viewed entries do **not** store rating/discount/stock, so the row uses the **simple card** (honest for cached data) — not `ProductCardFigma`. The Home's New Arrivals row is left unchanged.

## 2. Pure helper — `src/utils/recentlyViewed.ts` (the testable core)

```
RecentlyViewedEntry = {
  productId: string
  slug: string
  name: string
  imageUrl: string | null
  price: number          // display units (DZD whole), already formatPrice'd
  currencyCode: string
  viewedAt: number       // epoch ms; stamped by the caller (keeps the fn pure)
}

RECENTLY_VIEWED_CAP = 12
```
- `addRecent(list: RecentlyViewedEntry[], entry: RecentlyViewedEntry, cap = RECENTLY_VIEWED_CAP): RecentlyViewedEntry[]`
  - Returns `[entry, ...list.filter((e) => e.productId !== entry.productId)].slice(0, cap)` — i.e. drop any existing same-product entry, prepend the new one, truncate to `cap`. Pure and deterministic (the caller stamps `viewedAt`).

## 3. Context — `src/contexts/RecentlyViewedContext.tsx`

Mirrors `WishlistContext` structurally:
- State `items: RecentlyViewedEntry[]`; hydrate from `oscar.recentlyViewed.v1` on mount; persist `items` to AsyncStorage on every change **after** hydration (the same guard `WishlistContext` uses to avoid wiping the saved list with the empty initial state).
- `track(entry: Omit<RecentlyViewedEntry, 'viewedAt'>)` → `setItems((prev) => addRecent(prev, { ...entry, viewedAt: Date.now() }))`.
- `clear()` → `setItems([])`.
- Exposes `{ items, track, clear, hydrating }` via `useRecentlyViewed()`; throws if used outside the provider.
- **Provider mounting:** add `<RecentlyViewedProvider>` to `app/_layout.tsx` next to `<WishlistProvider>`.

## 4. Shared row — `src/components/products/HorizontalProductRow.tsx` (extracted)

Extract the presentational row from `RelatedProducts` into a reusable component so both rows share one card style:
- Export `SimpleProduct` (`{ id, slug, name, imageUrl, price, currencyCode }`) and `HorizontalProductRow({ title, products }: { title: string; products: SimpleProduct[] })`.
- Renders the horizontal `FlatList` of simple cards (the existing markup/styles from `RelatedProducts` lines 73–145), each `Pressable` → `router.push('/products/${slug}')`. Returns `null` when `products` is empty.
- **`RelatedProducts` refactor:** keep its queries + `SimpleProduct` mapping; replace its inline `View`/`FlatList`/styles with `<HorizontalProductRow title={t('products.related', 'You may also like')} products={products} />`. Behavior unchanged.

## 5. Recently-viewed row — `src/components/products/RecentlyViewedRow.tsx`

- Props `{ excludeProductId?: string }`.
- Reads `items` from `useRecentlyViewed()`, maps each entry → `SimpleProduct` (`id: entry.productId`, the rest 1:1), filters out `excludeProductId`, and renders `<HorizontalProductRow title={t('products.recentlyViewed', 'Recently viewed')} products={mapped} />`. The row component already returns `null` when empty.

## 6. View tracking — `app/products/[slug].tsx`

Add a `useEffect` that fires once the product + selected variant are available:
```
useEffect(() => {
  if (!product || !selectedVariant) return;
  track({
    productId: product.id,
    slug: product.slug,
    name: product.name,
    imageUrl: product.featuredAsset?.preview ?? null,
    price: formatPrice(selectedVariant.priceWithTax),
    currencyCode: selectedVariant.currencyCode ?? 'DZD',
  });
}, [product?.id]);  // track once per product open (not on every variant change)
```
`track` is stable (`useCallback`), so depending on `product?.id` records one view per product open.

## 7. Placement

- **PDP** (`app/products/[slug].tsx`): render `<RecentlyViewedRow excludeProductId={product.id} />` near the existing `RelatedProducts` (e.g. directly below it).
- **Home** (`app/(tabs)/index.tsx`): render a `<RecentlyViewedRow />` section just before the `bottomSpacer` `View` at the end of the `ScrollView`.

## 8. Testing

`src/utils/__tests__/recentlyViewed.test.ts`:
- `addRecent` into an empty list → single entry.
- prepend a **new** product → new entry first, previous entries follow in order.
- re-view an **existing** product (same `productId`, newer `viewedAt`) → moves to front, no duplicate, length unchanged.
- exceeding the cap → oldest (tail) entries dropped, length === cap, newest first.
- a custom `cap` argument is respected.

Components/screens/context are not render-tested (heavy; consistent with M1a–M1d) — the logic lives in the tested `addRecent` helper.

## 9. Out of scope (deferred)
- Backend sync / server-side history.
- A dedicated "browsing history" screen and a clear-history button (the `clear()` API exists but is unused this slice).
- Touching the Home's `ProductCardFigma` rows or the `ProductCardFigma` component.
- De-duplicating the Home's `ProductCardFigma` row against `HorizontalProductRow` (different card systems; not in scope).

## 10. Success criteria
1. Opening a product records it; reopening moves it to the front; the list never exceeds 12 and is newest-first (verified by `addRecent` tests).
2. A "Recently viewed" row appears on Home and on the PDP (PDP excludes the current product); it is hidden when empty; tapping a card opens that product.
3. The list survives app restarts (AsyncStorage), hydrating without wiping on first render.
4. `RelatedProducts` still renders identically (now via the shared `HorizontalProductRow`).
5. New `recentlyViewed` tests pass; full `npm test` green; `npm run lint` 0 errors; **zero new `tsc` errors** (baseline 155).
