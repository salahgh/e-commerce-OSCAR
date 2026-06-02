# M1a — Checkout Correctness (Design Spec)

**Date:** 2026-06-02
**App:** `apps/mobile` (standalone npm Expo project)
**Milestone:** M1a — first slice of M1 ("close the buy-loop"), mobile-only scope
**Reference:** `apps/frontend/src/app/[locale]/(shop)/checkout/page.tsx` (canonical storefront checkout)
**Status:** Approved design — ready for implementation planning

---

## 1. Goal & background

The mobile app cannot submit a **correct** order today. Verified in `app/checkout/index.tsx`:
- `handleShippingSubmit` sets `province: values.wilaya || ''` but `ShippingAddressForm` has **no wilaya field** → `province` is always `''`.
- For guests it sends `emailAddress: values.email || guest_${Date.now()}@oscar-fashion.com` but the form has **no email field** → every guest order gets a **fabricated, undeliverable email**, breaking order confirmation and COD callbacks.
- (`values.wilaya` and `values.email` are also 2 of the ~154 pre-existing `tsc` errors, since they aren't on `ShippingAddressFormValues`.)

The rich Algerian `app/checkout/delivery.tsx` (wilaya + commune + bureau/domicile + hardcoded 400/900 fees) is **orphaned** (zero inbound nav) and **diverges from the canonical frontend**, which uses **wilaya only** (→ province) plus **API-driven shipping methods**.

**This slice mirrors the frontend checkout** to fix the two correctness bugs. Address-book CRUD, commune/bureau-domicile, billing address, and the real CIB/Baridimob gateway call are explicitly out of scope.

## 2. Reference model (frontend `checkout/page.tsx`)

- Address state: `{ email, fullName, streetLine1, streetLine2, city, wilayaCode, postalCode, phoneNumber }`.
- `email` field rendered **only when `!isAuthenticated`**, required; used in `setCustomerForOrder({ emailAddress: addr.email, firstName, lastName, phoneNumber })`. Name split on the **first space**.
- Logged-in: prefill `email/fullName/phoneNumber` from `customer`; skip `setCustomerForOrder`.
- Shipping input: `province: selectedWilaya?.name ?? addr.wilayaCode`, `countryCode: 'DZ'`.
- Handles `setCustomerForOrder` returning `AlreadyLoggedInError` (stale session) with a recoverable message.

## 3. Changes

### 3.1 `ShippingAddressForm` + `ShippingAddressFormValues` + schema
`src/components/checkout/ShippingAddressForm.tsx`, `src/utils/validation.ts`
- Add to `ShippingAddressFormValues`: `email: string` and `wilayaCode: string`.
- Render an **email `Input`** at the top of the form **only when the user is a guest** (pass an `isGuest` / `showEmail` prop from `checkout/index.tsx`, which knows `isAuthenticated`).
- Render a **wilaya picker** field (a tappable `selectInput` opening a `FilterSheet` list of `wilayas`, salvaged from `delivery.tsx`), extracted into a reusable `WilayaPicker` (`src/components/checkout/WilayaPicker.tsx`).
- Replace the static `shippingAddressSchema` export with a factory `makeShippingAddressSchema(includeEmail: boolean)` that adds `wilayaCode` (required) always, and a required valid `email` only when `includeEmail` is true. `checkout/index.tsx` builds the schema with `includeEmail = !isAuthenticated` and passes it to the form (the form takes the schema as a prop). Keep a `shippingAddressSchema = makeShippingAddressSchema(false)` export for any existing importers.

### 3.2 `checkout/index.tsx` — fix `handleShippingSubmit` + prefill
- Replace `province: values.wilaya || ''` with `province` = `wilayas.find(w => w.code === values.wilayaCode)?.name ?? values.wilayaCode`.
- Replace the fabricated guest email with `emailAddress: values.email` (real). Keep the first-space name split.
- Pass `showEmail={!isAuthenticated}` to the form.
- For logged-in users, build `initialValues` prefilled with the auth customer's `email / fullName (firstName+lastName) / phoneNumber`.
- After `setCustomerForOrder`, detect `AlreadyLoggedInError` (`__typename` / `errorCode`) and surface a recoverable alert (mirroring the frontend stale-session handling) instead of proceeding.

### 3.3 Retire `app/checkout/delivery.tsx`
Delete the orphaned route (zero inbound nav). Salvage its `FilterSheet`-based wilaya picker into `WilayaPicker`. Confirm no references remain (`grep` for `checkout/delivery`).

### 3.4 Pure, testable helpers
Extract the order-input logic into pure functions (no React/Apollo) so the fix is unit-tested:
- `src/utils/checkout.ts`:
  - `buildShippingAddressInput(values, wilayas)` → `{ fullName, streetLine1, streetLine2, city, province, postalCode, countryCode: 'DZ', phoneNumber }` with `province` = resolved wilaya name.
  - `buildGuestCustomerInput(values)` → `{ firstName, lastName, emailAddress, phoneNumber }` via first-space name split + the real email (NEVER fabricated).
- `checkout/index.tsx` calls these helpers in place of the inline object literals.

## 4. Testing
- `src/utils/__tests__/checkout.test.ts`:
  - `buildShippingAddressInput` resolves `province` to the wilaya **name** (not code, not empty); sets `countryCode:'DZ'`; passes street/city/postal/phone through.
  - `buildGuestCustomerInput` splits "Sara Ben Ali" → first `"Sara"`, last `"Ben Ali"`; single name → first=last=name; uses the supplied email verbatim and **never** emits a `guest_*@` address.
- Extend `src/utils/__tests__/validation.test.ts`: `wilayaCode` required; guest schema requires a valid email.
- (Full screen render of checkout is heavy; the pure helpers + schema tests cover the correctness logic. A render test is out of scope for this slice.)

## 5. Out of scope (deferred)
Saved-address book (next M1 slice; canonical app keeps CRUD in the profile), commune & bureau/domicile delivery modes, billing address, real CIB/Baridimob gateway initiate (M1b — backend), Apollo cache persistence / optimistic cart (separate M1 slice).

## 6. Success criteria
1. Guest checkout submits a **real email** (no `guest_*@`) and a **real `province`** (wilaya name).
2. Logged-in checkout prefills name/email/phone and submits a correct `province`.
3. `delivery.tsx` deleted; no dangling references.
4. New `checkout.ts` helper tests + schema tests pass; full `npm test` green; `npm run lint` 0 errors.
5. The 2 pre-existing `tsc` errors in `checkout/index.tsx` (the `values.wilaya`/`values.email` reads) are resolved; M1a introduces no new tsc errors.
