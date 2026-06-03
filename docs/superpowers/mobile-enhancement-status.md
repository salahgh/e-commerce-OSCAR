# Mobile Enhancement Program — Status & Handoff

_Last updated: 2026-06-02. This file is the portable roadmap so work can resume on any machine. Per-milestone detail lives in `docs/superpowers/specs/` and `docs/superpowers/plans/`._

## Ground rules
- **Scope: mobile-only** (`apps/mobile`). No Vendure/`oscar-plugin` backend changes — backend-dependent features are flagged and deferred.
- **`apps/mobile` is a standalone npm project** — it has its own `package-lock.json` and is **NOT** in the pnpm/Turborepo workspace. Use **`npm`** inside `apps/mobile` (never `pnpm --filter`).
- **`apps/frontend` is the reference implementation** — mirror its patterns where they exist (e.g. slug-based product routing, checkout address model = wilaya→province + real email). Net-new mobile features (address book, etc.) are allowed where the frontend has no equivalent.
- **Process per milestone:** brainstorm → spec (`specs/`) → plan (`plans/`) → implement (TDD, commit per task) → review → merge to `main`.

## Done (all merged & pushed to `main`)
- **M0 — Stabilize + guardrails:** PDP temporal-dead-zone crash fix, slug-canonical product routing (`products/[slug].tsx`), broken route-string fixes, dead notifications-bell removal, root error boundary (`src/components/AppErrorBoundary.tsx`), real one-tap reorder, **Jest + RNTL test harness**, and the repo's **first GitHub Actions CI** (`.github/workflows/mobile-ci.yml`).
- **M1a — Checkout correctness:** guest-only email + wilaya picker added to the address step; `province` now = wilaya **name** (was `''`); real guest email (killed the fabricated `guest_<ts>@` address); prefill for logged-in users; `AlreadyLoggedInError` stale-session handling; tested helpers in `src/utils/checkout.ts` (`submitCheckoutAddress`, `buildShippingAddressInput`, `buildGuestCustomerInput`); `makeShippingAddressSchema(includeEmail)`; deleted the orphaned `app/checkout/delivery.tsx`.
- **M1b — Saved address book + checkout picker:** `profile/addresses` CRUD (list↔inline form, set-default) on the codegen'd `Create/Update/DeleteCustomerAddress` mutations; `AddressForm`/`AddressCard`; pure helpers in `src/utils/address.ts` (province↔wilaya-code round-trip + prefill mappers) with `addressFormSchema`; checkout `SavedAddressPicker` prefilling the M1a form; profile-tab entry; en/fr/ar i18n.
- **M1c — Offline-first cache + optimistic cart** (branch `m1c-offline-optimistic-cart`): in-house Apollo cache persistor (`src/apollo/persistence.ts`) over AsyncStorage — whole-cache `extract()`/`restore()`, AppState-triggered, 1 MB cap — restored via a splash gate (`src/hooks/useApolloPersistence.ts`) so the storefront/cart survive cold starts; logout purges it (`purgeApolloCache`). Optimistic `add`/`adjust`/`remove`/`clear` via pure raw-cents builders in `src/utils/optimisticCart.ts` feeding Apollo `optimisticResponse` — **every `refetchQueries` dropped**; an `update` writer links the first-ever order. PDP + reorder pass a variant snapshot. `apollo3-cache-persist` was rejected (peer-deps Apollo Client 3; will not install on this app's AC4). No offline write-queue (deferred). See `specs/2026-06-02-mobile-m1c-*` + `plans/2026-06-02-mobile-m1c-*`.
- **M1d — Payment availability gating** (branch `m1d-payment-gating`): COD stays the working checkout path; **CIB & BaridiMob render as a non-selectable "Coming soon" section** in the payment step (always shown, greyed, badged) so the backend-blocked gateway is never invoked. Pure tested helper `src/utils/payment.ts` (`getPaymentAvailability` / `isSelectableMethod` / `partitionPaymentMethods` + a local coming-soon catalog — mobile can't import `@oscar/shared`); en/fr/ar strings. The orphaned gateway screens (`app/payment/*`, `PaymentWebView`, `PaymentMethodSelector`) are left **deferred/untouched** for the future real-gateway slice (known issues: wrong `myapp://`→`oscar-fashion://` scheme, mock dead-domain URLs, `securePa yment` i18n typo). See `specs/2026-06-02-mobile-m1d-*` + `plans/2026-06-02-mobile-m1d-*`.
- **M3a — Recently-viewed products** (branch `m3a-recently-viewed`): track opened products locally (`RecentlyViewedContext` over AsyncStorage, mirrors `WishlistContext`) via a tested pure `addRecent` helper (`src/utils/recentlyViewed.ts` — dedupe-move-to-front + cap 12). A **"Recently viewed" row on Home + PDP** (PDP excludes the current product), rendered through a shared `HorizontalProductRow` **extracted from `RelatedProducts`**. The PDP records one view per open. en/fr/ar strings. See `specs/2026-06-02-mobile-m3a-*` + `plans/2026-06-02-mobile-m3a-*`.
- **M3b — Haptic feedback** (branch `m3b-haptics`): tested `src/utils/haptics.ts` over `expo-haptics` (fire-and-forget — never throws, no-ops on web). The shared `Button` fires a light impact on tap (skipped when disabled/loading); the centralized `Toast` `show()` fires success/error/warning notification haptics by type. `expo-haptics` was installed but unused. See `specs/2026-06-02-mobile-m3b-*` + `plans/2026-06-02-mobile-m3b-*`.
- **M3c — Accessibility pass** (branch `m3c-accessibility`): screen-reader semantics on the most-reused shared components — `Button` (`role="button"` + `disabled`/`busy` state + `title` label), `Input` (label/placeholder), the three `BackButton.tsx` icon controls (back/close, localized), and product cards (`ProductCardFigma` + `HorizontalProductRow`) via a tested pure `productAccessibilityLabel` (`src/utils/a11y.ts`). en/fr/ar `a11y.goBack`/`close`. Per-screen icon sweep deferred. See `specs/2026-06-02-mobile-m3c-*` + `plans/2026-06-02-mobile-m3c-*`.
- **M3d-1 — Dark-mode foundation + Settings proof** (branch `m3d1-dark-mode-foundation`): a **conventional dark palette** — `darkColors` is a twin of `colors` (same key structure) with near-black `#121212` page, `#1E1E1E` cards (elevated *lighter* than the page), off-white `#ECECEC` text, a **neutral `#ECECEC` primary** accent, and brand yellow `#FFD500` kept as the secondary "pop"; vivid status hues unchanged, pale status tints darkened. Key-parity is enforced at compile time via a widened `ColorPalette` type. Pure `getPalette(resolved)` (`src/theme/palettes.ts`) backs a `useThemeColors()` hook and a memoizing `makeThemedStyles((colors) => StyleSheet.create({…}))` factory (`src/theme/useThemedStyles.ts`) — the conversion recipe leaves the StyleSheet body unchanged because the factory param is also named `colors`. `app/profile/settings.tsx` converted end-to-end as the proof; global chrome already flips via the existing `NavigationThemeBridge`. **Twin-structural** shape was chosen over semantic role tokens so the remaining sweep stays mechanical (the user opted to diverge from the frontend's `.dark` tokens toward conventional dark). See `specs/2026-06-03-mobile-m3d1-*` + `plans/2026-06-03-mobile-m3d1-*`.

**Health:** 104 unit tests pass (21 suites); `npm run lint` = 0 errors (warnings are pre-existing). M0/M1a/M1b/M1c/M1d/M3a/M3b/M3c/M3d-1 source is `tsc`-clean (baseline still 155 pre-existing errors; **zero new** introduced).

## Next up (recommended order)
**M3 (UX polish) is being built slice-by-slice — M3a (recently-viewed), M3b (haptics), M3c (accessibility), and M3d-1 (dark-mode foundation + Settings proof) are done.** Remaining: the M3d screen-by-screen dark sweep.

### M3d — Real dark mode (in progress; **M3d-2 = RESUME HERE on the second laptop**)
This is a *program*, not a single slice. Blast radius (measured 2026-06-02): **62 files import the static `colors`**, across **~93 `StyleSheet.create` blocks** and **~860 `colors.*` usages**. The theme toggle exists (`app/profile/settings.tsx` → `setMode`) and `ThemeContext` resolves `light`/`dark`; the global chrome flips via `NavigationThemeBridge` in `app/_layout.tsx`.

**Sub-slices:**
- **M3d-1 — Foundation + Settings proof — ✅ DONE** (branch `m3d1-dark-mode-foundation`): conventional dark palette (`darkColors` twin of `colors`), pure `getPalette()` + `useThemeColors()` + memoizing `makeThemedStyles()`, theme-barrel re-exports, and `app/profile/settings.tsx` converted end-to-end as the proof. The conversion recipe is established. See `specs/2026-06-03-mobile-m3d1-*` + `plans/2026-06-03-mobile-m3d1-*`.
- **M3d-2…N — Screen-by-screen conversion (RESUME HERE):** migrate the remaining ~92 StyleSheets to `makeThemedStyles((colors) => …)` + `useThemeColors()` in batches (**tabs/home first**, then PDP/cart/checkout/profile/auth), each its own small slice. The recipe: wrap the module-level `StyleSheet.create({...})` in `makeThemedStyles((colors) => …)` (body unchanged — the factory param is named `colors`), add `const styles = useStyles()` inside the component, and feed inline JSX `color={…}` props from `useThemeColors()`. **Arabic-font application** (IBM Plex Sans Arabic is loaded in `app/_layout.tsx` but not wired into `typography` for the `ar` locale) folds in as a small follow-up here. Note: a few `darkColors` tints (`secondaryLight`/`secondaryScale`, status `*Scale`) were kept provisional in M3d-1 and should be refined per-usage as screens that use them are converted.

**Recommended next action:** brainstorm → spec → plan **M3d-2 (tabs/home dark conversion)** as the first screen-sweep slice, following the M3d-1 recipe.

Then (largely backend-dependent, deferred under mobile-only):
4. **M2 — Engagement/retention** (reviews, push notifications, wishlist sync) — recently-viewed already shipped in M3a.
5. **M4 — Native capabilities & release hardening** (deep links, EAS OTA, biometric, camera/media, typed `app.config.ts` + endpoint hardening).
6. **Real CIB/BaridiMob gateway** — resumes once backend `oscar-plugin` payment work lands (M1d gated it as "coming soon").

> **Real CIB/BaridiMob online payment is backend-blocked** (gateway *initiate* + settlement metadata). M1d gated it as "coming soon"; the real WebView/deep-link gateway slice resumes once the backend `oscar-plugin` payment work lands.

## Deferred minors (small follow-ups)
- M1a: localize the reorder toasts (`orders.reorder*`) in fr/ar; stale-session recovery (logout) action; show wilaya in the checkout review step.
- M1b: editing a non-app-created address whose `province` isn't an exact wilaya `name` drops the wilaya selection; no explicit "enter a new address" chip at checkout for signed-in users.
- M1c: **offline write-queue deferred** (NetInfo + queue/replay cart mutations while offline) — reads survive offline and the UI is optimistic, but cart *writes* still need connectivity. Optimistic totals are a raw-cents estimate reconciled by the `cache-and-network` server response. Persistence's AppState auto-trigger is runtime-verified, not unit-tested (see runbook §6).

## Known tech debt (not introduced by this program)
- **`tsc` baseline is red** (~150 pre-existing errors): the generated `src/graphql/generated/graphql.ts` references `QueryResult`, removed in Apollo Client 4 (the `typescript-react-apollo` codegen vs Apollo v4 mismatch), cascading into `src/apollo/client.ts` + components; plus `i18n compatibilityJSON: 'v3'`, and `app/(tabs)/profile.tsx` reads `customer.customFields` not in the `CustomerFields` fragment. **CI type-check is intentionally non-blocking** (`continue-on-error: true`) until this is fixed (its own effort; needs the backend running for codegen). New work must add **zero new** tsc errors.
- `expo lint` = 0 errors but ~420 pre-existing warnings (mostly `@typescript-eslint/array-type`).
- When counting tsc errors by file, use `grep -oE "^\S+\.tsx?"` — the pattern `^[^(]+` silently drops paren-paths (`app/(tabs)/...`, `app/(auth)/...`).

## Resume on another machine
```bash
git clone https://github.com/salahgh/e-commerce-OSCAR.git   # or: git pull origin main
cd e-commerce-OSCAR/apps/mobile
npm install            # standalone npm project — NOT pnpm
npm test               # 104 tests should pass (21 suites)
npm run lint           # 0 errors expected
# read docs/superpowers/ (this file, specs/, plans/) for full context
```
Backend (only needed for GraphQL codegen, not to read/continue): see root `CLAUDE.md`.
