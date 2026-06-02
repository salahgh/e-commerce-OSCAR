# M0 — Stabilize + Guardrails (Design Spec)

**Date:** 2026-06-02
**App:** `apps/mobile` (OSCAR Fashion — Expo SDK 55, RN 0.83, React 19, expo-router, Apollo 4)
**Milestone:** M0 of the mobile enhancement roadmap (milestone-by-milestone, mobile-only scope)
**Status:** Approved design — ready for implementation planning

---

## 1. Overview & Goal

The mobile app crashes or dead-ends on several common paths, and there is no automated safety net (zero tests, zero CI) — which is exactly why these bugs reached `main`. M0 fixes the user-visible correctness defects and stands up the test + CI guardrails so every later milestone (M1–M4) is protected against regressions.

**Goal:** The app stops crashing/dead-ending on common journeys, and a Jest + GitHub Actions safety net catches this class of bug before merge.

**Non-goal:** New features, checkout/payment work, design/polish — all deferred to later milestones.

## 2. Ground rules

- **Mobile is a standalone npm project** — it has its own `package-lock.json` and is **not** part of the pnpm/Turborepo workspace. All tooling/install/CI uses `npm` inside `apps/mobile`, never `pnpm --filter`.
- **Frontend is the reference** — `apps/frontend` (canonical storefront) defines the patterns we mirror (notably slug-based product identity and the error-boundary shape).

## 3. Scope (work items)

### W1 — Fix the PDP temporal-dead-zone crash
- **File:** `app/products/[id].tsx` (→ renamed in W2).
- **Current:** Line 38 computes `const isFavorite = !!data?.product && wishlist.has(data.product.id);` — but `data` is not declared until the `useGetProductQuery(...)` call on line 40. This is a temporal-dead-zone `ReferenceError: Cannot access 'data' before initialization` on every render of the most-visited screen.
- **Change:** Move the `isFavorite` derivation to **after** the query call: `const isFavorite = !!product && wishlist.has(product.id);`. Mobile's `WishlistContext` keys by `productId` (`wishlist.toggle({ productId })`, `has(productId)`); re-keying the wishlist to slug is an M2 (wishlist-sync) concern, **not** M0 — so M0 keeps `product.id` here.
- **Rationale:** Removes a guaranteed crash. The new PDP smoke test (W7) locks it in.

### W2 — Make product routing slug-canonical (frontend parity)
The frontend identifies products by **slug** everywhere (`products/[slug]`, wishlist keyed by slug, order lines link to `/products/{slug}`). Mobile currently mixes id and slug, which is the root cause of the "product not found" bug on wishlist/related taps. Mobile's `GetProductBySlug` query uses the **identical `ProductFields` fragment** as `GetProduct`, so the PDP's downstream code is unaffected and **no codegen is required**.

- **Route:** Rename `app/products/[id].tsx` → `app/products/[slug].tsx`. Read `const { slug } = useLocalSearchParams<{ slug: string }>()`. Replace `useGetProductQuery({ variables: { id } })` with `useGetProductBySlugQuery({ variables: { slug } })`. `const product = data?.product;` and everything below is unchanged.
- **Callers to switch from `.id` → `.slug`:**
  | File | Line | Current | New |
  |------|------|---------|-----|
  | `app/search.tsx` | 181 | `/products/${product.id}` | `/products/${product.slug}` |
  | `src/components/products/ProductCard.tsx` | 30 | `/products/${product.id}` | `/products/${product.slug}` |
  | `src/components/home/ProductCardFigma.tsx` | 47 | `/products/${product.id}` | `/products/${product.slug}` |
  | `src/components/home/ProductSection.tsx` | 100 | `/products/${product.id}` | `/products/${product.slug}` |
  | `src/components/products/ProductListItem.tsx` | 33 | `/products/${product.id}` | `/products/${product.slug}` |
  | `src/components/cart/CartItemContent.tsx` | 21 | `/products/${item.productId}` | `/products/${item.slug}` *(dead/duplicated component — see note)* |
- **Already correct (become valid with the slug route):** `app/profile/wishlist.tsx:19` and `src/components/products/RelatedProducts.tsx:86` already push `.slug`.
- **Risk / sub-task:** Each card/list component must have `slug` available on the product object it receives. Where a component consumes a mapped shape (e.g. the `toFigmaProduct` adapter feeding `ProductCardFigma`, or the `ProductGrid` mapping), thread `slug` through that mapping. This is the one place slug migration may touch a type/adapter; verify each push-site's data source actually carries `slug` (search results and `ProductFields` both include it).
- **Dead-code note:** `CartItemContent.tsx` is part of the unused `CartItem/CartItemContent/SwipeableCartItem` family (the live cart screen re-implements the row inline). Update its push to slug for consistency, or leave it untouched if it is confirmed unreferenced; do not expand M0 into deleting the dead family (that is an M3 cleanup item).

### W3 — Fix broken route strings
| File | Line(s) | Current (broken) | Fixed |
|------|---------|------------------|-------|
| `app/(tabs)/orders.tsx` | 180 | `/auth/login` | `/(auth)/login` |
| `app/payment/status.tsx` | 71, 101, 131, 148 | `/(tabs)/home` | `/(tabs)` |
| `app/payment/status.tsx` | 96 | `/support` | `/profile/support` |

`(tabs)/profile.tsx:120` already uses the correct `/profile/support`, confirming the target route exists.

### W4 — Hide the notifications bell until M2
- **File:** `src/components/home/SearchHeader.tsx:29` navigates to `/profile/notifications`, which does not exist (notifications is backend-dependent → deferred to M2).
- **Change:** Hide/remove this specific bell entry-point (`SearchHeader.tsx:29`) so it is not a dead-end. Re-introduced in M2 when the notifications screen lands. Scope is strictly this one icon — do not touch other header icons that route elsewhere.

### W5 — Root error boundary (mirrors frontend `error.tsx`)
- **File:** `app/_layout.tsx` (currently exports no `ErrorBoundary`).
- **Change:** Export an expo-router `ErrorBoundary` (`export function ErrorBoundary({ error, retry }) { ... }`) rendering a themed, localized fallback: eyebrow + title + `error.message` + a **"Try again"** button (calls `retry()`) + a **"Go home"** button (`router.replace('/(tabs)')`). `console.error(error)` for now (Sentry hook noted for a later milestone).
- **i18n:** Add keys under the existing `common` namespace in `src/i18n/locales/{en,fr,ar}.json`: `errorEyebrow`, `errorBoundaryMessage`, `goHome` (reuse existing `common.error` and `common.retry`). Mirror the frontend's `Common.errorEyebrow / error / retry` semantics.

### W6 — Real one-tap reorder
- **File:** `app/orders/[id].tsx:284` — currently a `// TODO: Implement reorder functionality` that fires a fake "Items added to cart" success alert without touching the cart.
- **Change:** On confirm, iterate `order.lines`; for each, call `addToCart(line.productVariant.id, line.quantity)` (signature confirmed: `addToCart(productVariantId: string, quantity: number) => Promise<void>`). Catch per-line failures (e.g. `InsufficientStockError`), accumulate successes/failures, then:
  - Toast a summary (e.g. "3 added, 1 unavailable").
  - Navigate to the cart on any success.
  - Disable the reorder button while in-flight.
- **Note:** Net-new — the frontend has no reorder, so there is no pattern to mirror; build it on mobile's existing `CartContext`.

### W7 — Test harness (Jest + React Native Testing Library)
- **Install (devDeps, into `apps/mobile`):** `jest-expo` (SDK 55 aligned), `jest`, `@testing-library/react-native` (^13), `react-test-renderer@19.2`, `@types/jest`.
- **Config:** `jest.config.js` with `preset: 'jest-expo'` and a `transformIgnorePatterns` covering RN/Expo/`@react-navigation`/`react-native-reanimated`/etc. Add `"test": "jest"` and `"test:watch": "jest --watch"` and `"type-check": "tsc --noEmit"` scripts to `package.json`.
- **Test utility:** `src/test/renderWithProviders.tsx` wrapping `MockedProvider` (Apollo), i18n provider, `SafeAreaProvider`, and `ThemeProvider`.
- **Seed tests (high leverage, low setup):**
  - `src/utils/__tests__/discountParser.test.ts` — discount parsing edge cases.
  - `src/utils/__tests__/vendureAdapters.test.ts` — `formatPrice` (DZD cents → display), order-state mapping.
  - `src/utils/__tests__/validation.test.ts` — validation rules.
  - `app/products/__tests__/product-detail.test.tsx` — **PDP smoke render** via `renderWithProviders` with a mocked `GetProductBySlug` response; asserts it renders the product name without throwing. *This is the test that would have caught W1.*

### W8 — GitHub Actions CI (first CI in the repo)
- **File:** `.github/workflows/mobile-ci.yml`.
- **Trigger:** `pull_request` (and `push`) with `paths: ['apps/mobile/**', '.github/workflows/mobile-ci.yml']`.
- **Job (ubuntu-latest):** checkout → `actions/setup-node` (Node 20, npm cache keyed on `apps/mobile/package-lock.json`) → `npm ci` (working-directory `apps/mobile`) → `npx tsc --noEmit` → `npm run lint` → `npm test`.
- **Note:** This is the first CI anywhere in the repo; it only takes effect once pushed to GitHub. The workflow file must be valid YAML and the commands must pass locally first.

## 4. Risks & mitigations
- **Slug migration misses a push-site or a missing `slug` field** → "product not found" persists. *Mitigation:* the caller table above is exhaustive (grep-verified); verify `slug` presence on each data source; `tsc` + the PDP smoke test guard it.
- **`jest-expo` / RN 0.83 / React 19 version mismatch** → harness won't run. *Mitigation:* pin to the SDK-55-aligned `jest-expo`; resolve exact versions at install; gate the milestone on `npm test` passing locally.
- **Renaming the route file breaks typed-routes** (`typedRoutes: true`) → type errors on `/products/...` pushes. *Mitigation:* run `npx tsc --noEmit` after the rename; most push-sites already cast `as any`.
- **CI flakiness on first run** → *Mitigation:* validate all three commands locally before relying on CI; keep the job minimal (no native build).

## 5. Success criteria (verification)
1. `app/products/[slug].tsx` renders without crashing — proven by the new PDP smoke test.
2. All four route-string targets resolve (no unmatched-route); wishlist + related taps open the correct PDP.
3. Tapping a thrown render shows the error-boundary fallback with working "Try again" / "Go home".
4. Reorder adds the order's available lines to the cart and reports skipped lines; no fake success.
5. `npm test`, `npx tsc --noEmit`, and `npm run lint` all pass locally in `apps/mobile`.
6. `.github/workflows/mobile-ci.yml` is valid and runs the three checks on PRs touching `apps/mobile`.

## 6. Out of scope (deferred)
Checkout/payment unification, saved addresses, reviews, push notifications + notifications screen, recently-viewed, dark mode, accessibility sweep, haptics, deleting the dead cart-component family, expo-image standardization — all assigned to M1–M4.
