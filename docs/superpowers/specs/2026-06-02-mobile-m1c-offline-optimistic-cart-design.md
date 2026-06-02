# M1c — Offline-First Cache + Optimistic Cart (Design Spec)

**Date:** 2026-06-02
**App:** `apps/mobile` (standalone npm Expo project)
**Milestone:** M1c — third slice of M1 ("close the buy-loop"), mobile-only scope
**Status:** Approved design — ready for implementation planning

---

## 1. Goal & background

Two cart pain points, both fully mobile-only:

1. **Cold-start blank cart.** The Apollo cache is in-memory only, so every app launch starts empty — the storefront and cart re-fetch from scratch, and on poor connectivity the user stares at spinners. Persisting the cache to `AsyncStorage` lets the last-known storefront/cart render instantly on launch, then reconcile over the network.
2. **Laggy cart edits.** Every cart mutation in `CartContext` uses `refetchQueries: ['GetActiveOrder']`, so each add / quantity-change / remove blocks on a full server round-trip before the UI updates. Replacing that with Apollo `optimisticResponse` makes cart edits feel instant; the server response stays authoritative and corrects any estimate.

**Scope decisions (locked during brainstorming):**
- **In:** cache persistence (read survival) **and** optimistic UI for all three cart ops (add, adjust quantity, remove).
- **Out:** any offline *mutation* queue — no NetInfo, no write-while-offline, no replay-on-reconnect. Cart writes still require connectivity; only the *reads* survive offline and the *UI* is optimistic.

**Apollo version & persistence library (verified 2026-06-02):** this app is on **Apollo Client 4** (`@apollo/client@4.2.1`). The roadmap-named `apollo3-cache-persist@0.15.0` peer-depends on `@apollo/client@^3.7.17` and **fails to install against AC4** (`npm ERESOLVE`). Forcing an unsupported peer dep is rejected. **M1c therefore uses a small in-house persistor** (`src/apollo/persistence.ts`, ~50 lines) over the already-installed `@react-native-async-storage/async-storage`, using only public AC4 APIs (`cache.extract()` / `cache.restore()`) plus React Native `AppState` as the persist trigger. **No new runtime dependency**, no peer conflict, and `restore`/`persist`/`purge` become unit-testable (real `InMemoryCache` + the AsyncStorage mock already in `jest.setup.js`). New work adds **zero new `tsc` errors** (the baseline is already red — see root status doc — and new work must not add to it).

**Reference rule:** `apps/frontend` is the web reference, but it is Next.js (no AsyncStorage, different persistence story) and this is mobile-only infrastructure, so there is no frontend pattern to mirror here. Net-new is permitted.

---

## 2. Persistence layer

### 2.1 `src/apollo/client.ts` (modified)
- Extract the `InMemoryCache` into an exported `cache` const (today it's a local `cache`).
- Keep `apolloClient` exactly as-is otherwise (same links, same `defaultOptions`).
- Create and export a singleton **`cachePersistor`** built from that `cache` (see 2.2).
- Export `async purgeApolloCache()` → `cachePersistor.purge()`.

### 2.2 `src/apollo/persistence.ts` (new — in-house persistor)
```
createPersistor(cache: InMemoryCache): ApolloPersistor
ApolloPersistor = {
  restore(): Promise<void>   // hydrate cache from AsyncStorage (no-op if empty/corrupt)
  persist(): Promise<void>   // JSON.stringify(cache.extract()) → AsyncStorage (skip if > 1 MB)
  purge():   Promise<void>   // remove the persisted key
  start(): () => void        // auto-persist on AppState 'background'/'inactive'; returns unsubscribe
}
```
- Single key `oscar-apollo-cache`; 1 MB cap (`MAX_BYTES = 1024 * 1024`) — if `extract()` serializes larger, drop the persisted copy rather than store a huge/stale blob.
- `restore`/`persist`/`purge` are wrapped in try/catch and only `console.warn` on failure — persistence must never crash or block the app.
- `start()` subscribes to RN `AppState`; backgrounding the app flushes the whole cache to disk. (Force-kill without a background event loses only the *cached* copy of the most recent edit; the server session in SecureStore still re-fetches it on next launch — so no data loss, just not offline-instant for that one edit.)
- `client.ts` instantiates `cachePersistor = createPersistor(cache)`.

### 2.3 `src/hooks/useApolloPersistence.ts` (new)
```
useApolloPersistence(): boolean   // true once restore settles
```
- On mount, calls `cachePersistor.restore()` once; on success **or failure** flips `restored = true` (a failed restore must never permanently block the app — log and continue with an empty cache). Also calls `cachePersistor.start()` to begin AppState auto-persist, and calls its returned unsubscribe on cleanup.
- Does **not** depend on Apollo React context, so it is safe to call in `RootLayout` above `<ApolloProvider>`.

### 2.4 `app/_layout.tsx` (modified)
Extend the existing splash gate so the persisted cache is in place **before any query fires**:
```
const cacheRestored = useApolloPersistence();
...
if (!languageLoaded || !fontsLoaded || !cacheRestored) return <LoadingSpinner />;
```
This guarantees `useGetActiveOrderQuery` (in `CartProvider`, mounted under `ApolloProvider`) first reads from the restored cache — avoiding a network-vs-restore race. No change to how `apolloClient` is imported or passed to `<ApolloProvider>`.

### 2.5 Logout purge — `src/contexts/AuthContext.tsx` (modified)
`logout()` currently does `clearAuth()` + `apolloClient.clearStore()`. Add `await purgeApolloCache()` after `clearStore()` (in both the success and catch paths) so one user's persisted cart/storefront never bleeds into the next session on the device.

---

## 3. Optimistic engine — `src/utils/optimisticCart.ts` (the testable core)

Pure functions, **no Apollo imports**, operating on `OrderFields`-shaped plain objects. **All prices are raw cents** (the cache's native unit — `OrderLine.unitPriceWithTax` etc.; `formatPrice` divides by 100 only for display). This mirrors the M1a/M1b "logic lives in tested `utils` helpers" pattern.

### 3.1 Input snapshot type
```
OptimisticCartVariant = {
  productVariantId: string
  unitPriceWithTax: number                 // raw cents
  name: string                             // variant name
  sku: string
  product: { id: string; name: string; slug: string; featuredAsset?: { id: string; preview: string } | null }
  featuredAsset?: { id: string; preview: string } | null   // line-level image (optional)
}
```
On the PDP, `selectedVariant` comes straight from `useGetProductBySlugQuery` (un-adapted), so `selectedVariant.priceWithTax` **is already raw cents** — directly usable as `unitPriceWithTax`.

### 3.2 Functions
- `recomputeOrderTotals(order)` → returns the order with `totalQuantity = Σ line.quantity`, `subTotalWithTax = Σ line.linePriceWithTax`, `totalWithTax = subTotalWithTax + shippingWithTax`. `shippingWithTax` and all other fields are preserved.
- `makeOptimisticOrderLine(snapshot, quantity, tempId)` → an `OrderLine` (`__typename: 'OrderLine'`, `id: tempId`, `quantity`, `unitPriceWithTax`, `linePriceWithTax = unitPriceWithTax * quantity`, `productVariant { ... }`, `featuredAsset`).
- `makeEmptyOptimisticOrder(tempId, currencyCode = 'DZD')` → a minimal `Order` skeleton for the "no active order yet" case (CartContext passes `currentOrder?.currencyCode ?? 'DZD'`; the cart formats via `formatPrice`, which is DZD regardless, so this is non-critical): `id: tempId`, `__typename:'Order'`, `code:''`, `state:'AddingItems'`, `active:true`, `createdAt:''`, `updatedAt:''`, `currencyCode`, `couponCodes:[]`, `lines:[]`, `shippingWithTax:0`, `subTotalWithTax:0`, `totalWithTax:0`, `totalQuantity:0`, `shippingAddress:null`, `billingAddress:null`, `customer:null`, `shippingLines:[]`. (`createdAt`/`updatedAt` are empty strings so the function stays deterministic and time-free — they are not rendered in the cart.)
- `applyAddItem(order | null, snapshot, quantity, tempId)` → `Order`:
  - `order == null` → start from `makeEmptyOptimisticOrder` then add the line.
  - variant already in `lines` (match `productVariant.id`) → increment that line's `quantity` (Vendure merges by variant) and recompute its `linePriceWithTax`.
  - else → append `makeOptimisticOrderLine`.
  - finally `recomputeOrderTotals`.
- `applyAdjustLine(order, orderLineId, quantity)` → `Order`: set the matching line's `quantity` (recompute its `linePriceWithTax`); if `quantity <= 0`, drop the line (mirrors Vendure removing a line adjusted to 0); then recompute.
- `applyRemoveLine(order, orderLineId)` → `Order`: filter out the line; recompute.
- `applyClear(order)` → `Order`: `lines: []`; recompute (totals → 0, `shippingWithTax` preserved).

**Temp ids are passed in by the caller** (e.g. ``temp-${variantId}-${Date.now()}``) so the pure functions stay deterministic and unit-testable without a clock. When the real mutation response arrives, Apollo replaces the temp line with the server line keyed by its real id.

---

## 4. CartContext wiring — `src/contexts/CartContext.tsx` (modified)

Drop **all four** `refetchQueries: ['GetActiveOrder']`. For each mutation, build the optimistic `Order` from the **current** `orderData?.activeOrder` (in closure) via the §3 helpers and pass `optimisticResponse`. Keep the existing union/`errorCode` handling unchanged — on an error variant the optimistic layer rolls back automatically and the thrown error still surfaces to the caller.

- **`addToCart(productVariantId, quantity, optimistic?)`** — signature gains an optional 3rd arg `optimistic?: OptimisticCartVariant`.
  - When `optimistic` is provided: pass `optimisticResponse: { __typename:'Mutation', addItemToOrder: applyAddItem(currentOrder, optimistic, quantity, tempId) }` **and** an `update(cache, { data })` writer (below). When omitted (e.g. the existing test mock, or a future caller without data): no `optimisticResponse`, but still pass the `update` writer so the server result links correctly.
  - `update` writer (addItemToOrder only): if `data.addItemToOrder` is an `Order` (`'id' in result && !('errorCode' in result)`), `cache.writeQuery({ query: GetActiveOrderDocument, data: { activeOrder: result } })`. This repoints `activeOrder` from `null` → the new order — the link `refetchQueries` currently provides for the first-ever add — and runs for both the optimistic and the real response.
- **`updateQuantity(orderLineId, quantity)`** — `optimisticResponse: { adjustOrderLine: applyAdjustLine(currentOrder, orderLineId, quantity) }`. No `update` needed (order already linked; normalization by `Order:id` updates it).
- **`removeFromCart(orderLineId)`** — `optimisticResponse: { removeOrderLine: applyRemoveLine(currentOrder, orderLineId) }`.
- **`clearCart()`** — `optimisticResponse: { removeAllOrderLines: applyClear(currentOrder) }`.

Why `update` only on add: `adjust`/`remove`/`clear` mutate an order already referenced by `ROOT_QUERY.activeOrder`, so returning the same `Order` id updates it in place via normalization. Only the `null → first order` transition needs an explicit `writeQuery`.

`GetActiveOrderDocument` is imported from the generated module. `loading` keeps OR-ing the mutation loading flags (optimism updates the cache; the flags still reflect in-flight requests for spinners/disabled states).

---

## 5. Call-site snapshots

- **`app/products/[slug].tsx`** — in `handleAddToCart`, build the snapshot from `selectedVariant` + `product` and pass it third:
  ```
  addToCart(selectedVariant.id, quantity, {
    productVariantId: selectedVariant.id,
    unitPriceWithTax: selectedVariant.priceWithTax,      // raw cents
    name: selectedVariant.name,
    sku: selectedVariant.sku,
    product: { id: product.id, name: product.name, slug: product.slug, featuredAsset: product.featuredAsset ?? null },
    featuredAsset: product.featuredAsset ?? null,
  })
  ```
- **`app/orders/[id].tsx`** (reorder) — pass a best-effort snapshot from the past order line if its variant/price fields are present; if the needed price/variant data isn't available on that line, call `addToCart(variantId, qty)` without the snapshot (non-optimistic add — still correct, just not instant). Reorder is a low-frequency path; do not over-fit.

A snapshot is never required for correctness — it only enables the instant *add*. `adjust`/`remove` are always optimistic because the line already lives in the cache.

---

## 6. Testing (TDD)

**Pure-fn contract — `src/utils/__tests__/optimisticCart.test.ts` (solid, the core):**
- `applyAddItem` to `null` order → new order, one line, correct `linePriceWithTax`, totals, `totalQuantity`.
- `applyAddItem` to an existing order, **new** variant → line appended, totals summed.
- `applyAddItem` re-adding an **existing** variant → that line's quantity incremented (not duplicated), `linePriceWithTax` updated.
- `applyAdjustLine` up and down → quantity + `linePriceWithTax` + totals update.
- `applyAdjustLine` to `0` → line dropped, totals updated.
- `applyRemoveLine` → line gone, totals updated; removing the last line → empty order, totals 0.
- `applyClear` → `lines: []`, totals 0, `shippingWithTax` preserved.
- `recomputeOrderTotals` → `totalWithTax = subTotalWithTax + shippingWithTax`.

**Persistence round-trip — `src/apollo/__tests__/persistence.test.ts` (solid):**
- `persist()` then `restore()` into a fresh `InMemoryCache` round-trips a written query (real `InMemoryCache` + the AsyncStorage mock from `jest.setup.js`).
- `restore()` with nothing stored is a no-op (no throw, empty cache).
- `restore()` with corrupt JSON is swallowed (no throw).
- `purge()` removes the key (a subsequent `restore()` is a no-op).
The AppState auto-persist **trigger** (`start()`) is not asserted here — it's covered under runtime verification.

**CartContext wiring — `src/contexts/__tests__/CartContext.optimistic.test.tsx` (deterministic):**
- Mock the generated hooks (`jest.mock('../../graphql/generated/graphql', () => ({ ...jest.requireActual(...), useGetActiveOrderQuery, useAddItemToOrderMutation, ... }))`), capturing the options passed to the add mutation. Render `CartProvider` + a consumer that calls `addToCart('pv1', 2, snapshot)`. Assert: (a) **no** `refetchQueries` in the options (proving the round-trip was removed), (b) `optimisticResponse.addItemToOrder.lines` has the new line with `linePriceWithTax === unitPriceWithTax * 2`, (c) `update` is a function.
- This is a deterministic *wiring* assertion (the mutation hook is mocked, so no Apollo timing). The **visual** optimism (line appears before the server resolves) is runtime-verified — not claimed as a unit test.

**Runtime-verified (not unit-tested), added to `docs/superpowers/plans/RUNTIME-VERIFICATION-runbook.md`:**
- Airplane-mode cold start renders the last cart/storefront before any network response (AppState-persisted cache).
- Add/adjust/remove update the cart UI instantly before the server responds; an `InsufficientStockError` rolls the change back.
- Logout purges persisted storage (next launch starts clean; no prior cart).
These depend on native AppState/launch behavior; the line between unit-tested and runtime-verified is stated explicitly.

---

## 7. Out of scope (deferred)
- Offline **write** queue: NetInfo connectivity detection, queuing cart mutations while offline, replay/conflict-resolution on reconnect. (This is the larger "full offline" milestone; explicitly not in M1c.)
- Optimistic UI for non-cart mutations (addresses, coupons, shipping method) — `refetch` is fine there for now.
- Selective/partial cache persistence or custom eviction policies beyond `maxSize`.
- The real CIB/Baridimob gateway initiate call (backend-blocked; separate slice).

## 8. Success criteria
1. **Cold-start read survival:** after using the app then killing it, relaunching (even offline) renders the last storefront/cart from the persisted cache before any network response.
2. **Optimistic cart:** add-to-cart, quantity change, and remove update the cart UI instantly (before the server responds); the server response reconciles totals; error variants (e.g. `InsufficientStockError`) roll the optimistic change back and surface the error.
3. **First-ever add** (no prior active order) correctly shows the new line and persists — proving the `update`/`writeQuery` link replaces `refetchQueries`.
4. **Logout hygiene:** logging out purges the persisted cache; a fresh launch starts with no prior-session cart.
5. **Health:** new `optimisticCart` tests + the CartContext wiring test pass; full `npm test` green; `npm run lint` 0 errors; **zero new `tsc` errors** introduced.
