# M1d — Payment Availability Gating (COD live, CIB/BaridiMob "coming soon") — Design Spec

**Date:** 2026-06-02
**App:** `apps/mobile` (standalone npm Expo project)
**Milestone:** M1d — fourth slice of M1 ("close the buy-loop"), mobile-only scope
**Status:** Approved design — ready for implementation planning

---

## 1. Goal & background

The roadmap item was "reachable CIB/Baridimob payment screens," but the real gateway **initiate** (producing a payment URL) and the settlement metadata are **backend-blocked** (no `oscar-plugin` changes allowed in this mobile-only program). Rather than build throwaway gateway fakery, this slice does the honest minimal thing: **keep Cash-on-Delivery (COD) working end-to-end, and present CIB & BaridiMob as clearly-marked "coming soon" (visible but non-selectable)** so the app never attempts the broken gateway.

**Current state (verified):**
- Checkout's `handlePlaceOrder` (`app/checkout/index.tsx`) calls `addPaymentToOrder({ method: code, metadata: {} })` directly for **every** method — so the dedicated `/payment/cib` and `/payment/baridimob` WebView screens are **orphaned** (never reached). COD works today.
- Backend payment method **codes**: `cash-on-delivery`, `cib`, `baridimob`.
- The orphaned gateway screens build **mock URLs to dead domains** and use the wrong deep-link scheme (`myapp://`; the app's real scheme is `oscar-fashion://`); `PaymentWebView` has an i18n-key typo (`'payment.securePa yment'`). These are **deferred** (see §5), not touched here.
- `src/components/checkout/PaymentMethodSelector.tsx` is a polished but **backend-disconnected** component (hardcodes its own `'CIB'|'BARIDIMOB'|'COD'` ids, no link to `eligiblePaymentMethods`). It is unused; left untouched (deferred).

**Standalone-mobile note:** the app cannot import `@oscar/shared` (it is not in the pnpm workspace), so the coming-soon labels are defined **locally**, mirroring `@oscar/shared`'s `PAYMENT_METHOD_LABELS` — the same pattern as `src/data/wilayas.ts`.

## 2. Pure helper — `src/utils/payment.ts` (the testable core)

A local coming-soon catalog + classification, mirroring the M1a/M1b "logic lives in tested `utils` helpers" pattern.

```
PaymentAvailability = 'available' | 'coming-soon'

ComingSoonPayment = { code: string; labelKey: string; labelFallback: string; icon: string /* Ionicons glyph name */ }

COMING_SOON_PAYMENTS: ComingSoonPayment[] = [
  { code: 'cib',       labelKey: 'checkout.cibCard',  labelFallback: 'CIB (Carte bancaire)', icon: 'card-outline' },
  { code: 'baridimob', labelKey: 'checkout.baridimob', labelFallback: 'BaridiMob',            icon: 'phone-portrait-outline' },
]
```

- `getPaymentAvailability(code: string): PaymentAvailability` — returns `'coming-soon'` for `'cib'`/`'baridimob'` (case-insensitive), else `'available'`. Unknown codes default to `'available'` so a future backend method is never accidentally blocked.
- `isSelectableMethod(method: { code: string; isEligible: boolean }): boolean` — `method.isEligible && getPaymentAvailability(method.code) === 'available'`.
- `partitionPaymentMethods<T extends { code: string }>(eligible: T[]): { available: T[]; comingSoon: ComingSoonPayment[] }`
  - `available` = `eligible.filter(m => getPaymentAvailability(m.code) === 'available')` (keeps the raw backend objects so the existing selectable rendering — id/name/isEligible/eligibilityMessage — is unchanged).
  - `comingSoon` = `COMING_SOON_PAYMENTS` (always CIB + BaridiMob, regardless of what the backend returns). Any `cib`/`baridimob` the backend happens to return is represented by the catalog (same `code`), so there is no duplication — they are simply excluded from `available`.

## 3. Checkout payment step — `app/checkout/index.tsx`

Localized to the payment step; the rest of the flow (shipping, method, review, `handlePlaceOrder`) is unchanged.

- Compute `const { available, comingSoon } = partitionPaymentMethods(paymentMethods)` from the existing `useGetEligiblePaymentMethodsQuery` result.
- **Available methods:** render exactly as today (the existing card markup), driven by `available` instead of the full `paymentMethods`. Selectable state uses `isSelectableMethod(method)` (i.e. backend `isEligible` AND available); a backend-ineligible available method still shows disabled with its `eligibilityMessage` (unchanged behavior).
- **Auto-select effect:** change the "auto-select first if only one" effect (and the COD default) to operate on `available` (not all methods), so a coming-soon method can never be auto-selected.
- **Coming-soon subsection:** below the available methods, render a **"Coming soon"** section listing each `comingSoon` entry as a **disabled** card (greyed, no `onPress`) with a "Coming soon" badge and its localized label/icon. Reuse the existing `methodCard`/`methodCardDisabled` styles. The catalog's `icon` is a plain string; cast at the UI boundary (`<Ionicons name={entry.icon as keyof typeof Ionicons.glyphMap}>`) so `payment.ts` stays free of any UI import.
- **Empty-available guard:** if `available.length === 0`, show the existing "no payment methods available" message in place of the available list (the coming-soon section still renders). This prevents a dead-end if the backend ever returns only gateway methods.
- `handlePlaceOrder` is unchanged: it reads the selected (always-available) method's `code` and calls `addPaymentToOrder` — so the broken gateway is never invoked.

No new component is extracted in this slice (keeps blast radius minimal); the gating logic lives in the tested `src/utils/payment.ts`, and only the payment-step JSX + one effect in `checkout/index.tsx` change.

## 4. i18n — `src/i18n/locales/{en,fr,ar}.json`

Add: `checkout.comingSoon` (badge, e.g. EN "Coming soon" / FR "Bientôt disponible" / AR "قريبًا"), `checkout.comingSoonPayments` (section title, e.g. "Online payment — coming soon"), and `checkout.onlinePaymentSoonNote` (one-line note). Reuse the existing `checkout.cibCard` / `checkout.baridimob` keys if present (the orphaned `PaymentMethodSelector` references them); otherwise the `labelFallback` covers it.

## 5. Out of scope (deferred — untouched)
- The real CIB/BaridiMob **gateway flow**: WebView, gateway `initiate`, settlement metadata, OS deep-link return (`oscar-fashion://payment/...`). Backend-blocked.
- The orphaned `/payment/{cib,baridimob,status}` screens, `PaymentWebView`, and `PaymentMethodSelector` — **left as-is** for the future real-gateway slice. Known deferred bugs to fix when that slice happens: wrong `myapp://` scheme (should be `oscar-fashion://`), mock dead-domain URLs, and the `'payment.securePa yment'` i18n-key typo in `PaymentWebView`.
- Any backend / `oscar-plugin` change.

## 6. Testing

`src/utils/__tests__/payment.test.ts`:
- `getPaymentAvailability`: `'cash-on-delivery'` → available; `'cib'`/`'CIB'`/`'baridimob'` → coming-soon; an unknown code (e.g. `'stripe'`) → available.
- `isSelectableMethod`: `{code:'cash-on-delivery', isEligible:true}` → true; `{...isEligible:false}` → false; `{code:'cib', isEligible:true}` → false.
- `partitionPaymentMethods`:
  - given `[cod(eligible), cib(eligible), baridimob]` → `available` = `[cod]`; `comingSoon` = the 2-entry catalog (CIB, BaridiMob).
  - given `[cod]` only → `available` = `[cod]`; `comingSoon` still the 2-entry catalog (always shown).
  - given `[]` → `available` = `[]`; `comingSoon` = the 2-entry catalog.

The checkout screen is not render-tested (heavy; consistent with M1a/M1b/M1c) — the logic lives in the tested helper.

## 7. Success criteria
1. At checkout, COD is selectable and the order can be placed end-to-end (unchanged); the selected method is always an available one.
2. CIB and BaridiMob always appear in the payment step as a **non-selectable "Coming soon"** section (greyed, badged) — even if the backend omits them — and can never be selected or auto-selected, so `addPaymentToOrder` is never called with a gateway method.
3. New `payment.ts` helper tests pass; full `npm test` green; `npm run lint` 0 errors; **zero new `tsc` errors** (baseline 155).
4. The deferred gateway screens/components are unchanged.
