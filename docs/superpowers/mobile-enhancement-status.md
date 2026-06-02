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

**Health:** 75 unit tests pass; `npm run lint` = 0 errors (warnings are pre-existing). M0/M1a/M1b/M1c/M1d source is `tsc`-clean (baseline still 155 pre-existing errors; **zero new** introduced).

## Next up (recommended order)
1. **M2 — Engagement/retention** (reviews, push notifications, recently-viewed, wishlist sync) — mostly backend-dependent, largely deferred under mobile-only.
2. **M3 — UX polish / accessibility / real dark mode / Arabic fonts / haptics.**
3. **M4 — Native capabilities & release hardening** (deep links, EAS OTA, biometric, camera/media, typed `app.config.ts` + endpoint hardening).

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
npm test               # 53 tests should pass
npm run lint           # 0 errors expected
# read docs/superpowers/ (this file, specs/, plans/) for full context
```
Backend (only needed for GraphQL codegen, not to read/continue): see root `CLAUDE.md`.
