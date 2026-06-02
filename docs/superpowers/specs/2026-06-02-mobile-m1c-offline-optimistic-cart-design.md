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

**Apollo version:** this app is on **Apollo Client 4** (`@apollo/client@^4.0.9`). `@react-native-async-storage/async-storage` is already a dependency. The persistence library (`apollo3-cache-persist`) drives the cache via `extract()`/`restore()`, which AC4's `InMemoryCache` still supports. **Plan step 0 verifies AC4 runtime + type compatibility**; if it fails, fall back to a small hand-rolled persistor exposing the same `restore()`/`purge()` interface. Either path adds **zero new `tsc` errors** (the baseline is already red — see root status doc — and new work must not add to it).

**Reference rule:** `apps/frontend` is the web reference, but it is Next.js (no AsyncStorage, different persistence story) and this is mobile-only infrastructure, so there is no frontend pattern to mirror here. Net-new is permitted.

---

## 2. Persistence layer

### 2.1 `src/apollo/client.ts` (modified)
- Extract the `InMemoryCache` into an exported `cache` const (today it's a local `cache`).
- Keep `apolloClient` exactly as-is otherwise (same links, same `defaultOptions`).
- Create and export a singleton **`cachePersistor`** built from that `cache` (see 2.2).
- Export `async purgeApolloCache()` → `cachePersistor.purge()`.

### 2.2 `src/apollo/persistence.ts` (new)
```
createPersistor(cache: InMemoryCache): CachePersistor<NormalizedCacheObject>
```
- Uses `CachePersistor` from `apollo3-cache-persist` with `new AsyncStorageWrapper(AsyncStorage)`.
- Config: `key: 'oscar-apollo-cache'`, `maxSize: 1024 * 1024` (1 MB; trims to in-memory-only past that), `debounce: 1000` (coalesce writes).
- `client.ts` instantiates `cachePersistor = createPersistor(cache)`.

### 2.3 `src/hooks/useApolloPersistence.ts` (new)
```
useApolloPersistence(): boolean   // true once restore settles
```
- On mount, calls `cachePersistor.restore()` once; on success **or failure** flips `restored = true` (a failed restore must never permanently block the app — log and continue with an empty cache).
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

**Wiring check — `src/contexts/__tests__/CartContext.optimistic.test.tsx` (integration):**
- With `MockedProvider` (AC4 testing): mount `CartProvider` + a tiny consumer rendering `itemCount`/`items`; mock `GetActiveOrder` (initially empty) and a **delayed** `AddItemToOrder`. Call `addToCart` with a snapshot and assert the item is visible **before** the mock resolves (optimistic), then matches server data after it resolves.
- If AC4 + `MockedProvider` optimistic timing proves flaky in RNTL, downgrade this to assert the post-resolve cache state only, and rely on the pure-fn tests as the contract. Document whichever is shipped — do not claim an optimistic-timing assertion that isn't actually running.

**Runtime-verified (not unit-tested), added to `docs/superpowers/plans/RUNTIME-VERIFICATION-runbook.md`:**
- Cold start shows the last cart/storefront before the network resolves (airplane-mode launch).
- Logout purges persisted storage (next launch starts clean; no prior cart).
AsyncStorage native behavior is not meaningfully unit-testable; this line between unit-tested and runtime-verified is stated explicitly.

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
