# Phase 1 · Batch 3 — Checkout Billing Address (implementation plan)

**Spec:** `docs/superpowers/specs/2026-05-31-phase1-batch3-checkout-billing-design.md`
**Branch:** `phase1-batch3-checkout-billing` (off `main`)
**Workflow:** subagent-driven-development — each task = implement → spec-compliance review → code-quality review → commit.

**Verify each task:** `pnpm --filter @oscar/frontend exec tsc --noEmit` + `pnpm --filter @oscar/frontend build`. No codegen / no backend needed (operation + `OrderFields.billingAddress` already generated).

---

## Task 1: `BillingAddressForm` component

**Files:**
- Create: `apps/frontend/src/components/checkout/BillingAddressForm.tsx`
- Modify: `apps/frontend/src/components/checkout/index.ts` (export it)

Build a `'use client'` component mirroring the field/validation patterns of `ShippingAddressForm.tsx` but slim:

- Props: `{ shippingValues: any; initialValues?: any; onSubmit: (values: any | null) => void; onBack?: () => void; isSubmitting?: boolean }`.
- Local state `sameAsShipping` (default `true`).
- A header ("Adresse de facturation" / subtitle) and a checkbox "Utiliser l'adresse de livraison pour la facturation" (checked = `sameAsShipping`).
- **Checked:** render a compact read-only summary of `shippingValues` (name, address, commune/wilaya, phone — resolve wilaya/commune display names via `wilayas` / `getCommunesByWilayaCode`) and action buttons: `onBack` (Retour) + a "Continuer" button that calls `onSubmit(null)`.
- **Unchecked:** render a Formik form with fields `firstName`, `lastName`, `phone`, `address`, `wilaya`, `commune`, `postalCode`, `notes?` (NO email / saved addresses / save-checkbox / shipping-price banner). Reuse the wilaya→commune→postalCode auto-fill effects and the validation rules from `ShippingAddressForm` (phone `^(0)(5|6|7)[0-9]{8}$`, postal `^[0-9]{5}$`, address min 10). Submit calls `onSubmit(values)`. `initialValues` defaults to `shippingValues`.
- Imports: `Formik, Form, Field` from formik; `Yup`; `Button, Input, Card` from `@/components/ui`; icons from `lucide-react`; `wilayas, getCommunesByWilayaCode` from `@/lib/data/algeria`; `cn` from `@/lib/utils`.

- [ ] Step 1: Create `BillingAddressForm.tsx`.
- [ ] Step 2: Export from `components/checkout/index.ts` (match the existing export style — check whether it re-exports default as named, like `ShippingAddressForm`).
- [ ] Step 3: `tsc --noEmit` PASS.
- [ ] Step 4: `build` succeeds.
- [ ] Step 5: Commit `feat(frontend): billing address form for checkout`.

---

## Task 2: Wire billing into the checkout page

**File:** Modify `apps/frontend/src/app/[locale]/(shop)/checkout/page.tsx`

- [ ] **Step 1: Imports + mutation + state**
  - Add `useSetOrderBillingAddressMutation` to the `@/graphql/generated/graphql` import and `BillingAddressForm` to the `@/components/checkout` import.
  - `const [setBillingAddressMutation] = useSetOrderBillingAddressMutation();`
  - `const [billingAddress, setBillingAddress] = useState<any>(null);` (`null` ⇒ same as shipping).

- [ ] **Step 2: `steps` array** — insert billing as #2 and renumber:
  ```ts
  const steps = [
    { number: 1, label: 'Adresse', description: 'Livraison' },
    { number: 2, label: 'Facturation', description: 'Adresse' },
    { number: 3, label: 'Méthode', description: 'Expédition' },
    { number: 4, label: 'Paiement', description: 'Mode' },
    { number: 5, label: 'Confirmation', description: 'Commande' },
  ];
  ```

- [ ] **Step 3: `buildAddressInput` helper** — extract the value→`CreateAddressInput` mapping (currently inline in `handleShippingAddressSubmit`) to a module-or-component-scope helper, and refactor the shipping handler to use it. (See spec for the exact body.)

- [ ] **Step 4: `handleBillingAddressSubmit`** (see spec). Maps `billingValues ?? shippingAddress`, calls `setBillingAddressMutation`, discriminates the union via `'errorCode' in response` (error → toast + return, no advance), then `setBillingAddress(billingValues)`, `await refetchCart()`, `setCurrentStep(3)`.

- [ ] **Step 5: Renumber step transitions & guards**
  - `handleShippingAddressSubmit` success → `setCurrentStep(2)` (now billing) — unchanged number.
  - `handleShippingMethodSubmit` success → `setCurrentStep(3)` → **`setCurrentStep(4)`**.
  - `handlePaymentMethodSubmit` → `setCurrentStep(4)` → **`setCurrentStep(5)`**.
  - Query skips: `useGetEligibleShippingMethodsQuery({ skip: currentStep < 2 })` → **`< 3`**; `useGetEligiblePaymentMethodsQuery({ skip: currentStep < 3 })` → **`< 4`**.

- [ ] **Step 6: Render branches**
  - `currentStep === 1` → `ShippingAddressForm` (unchanged; its onSubmit already advances to 2).
  - `currentStep === 2` → **`BillingAddressForm`** with `shippingValues={shippingAddress}`, `initialValues={shippingAddress}`, `onSubmit={handleBillingAddressSubmit}`, `onBack={() => handleEditStep(1)}`, `isSubmitting={isSubmitting}`.
  - `currentStep === 3` → `ShippingMethodForm`, `onBack={() => handleEditStep(2)}`.
  - `currentStep === 4` → `PaymentMethodForm`, `onBack={() => handleEditStep(3)}`.
  - `currentStep === 5` → `OrderReview` (gate stays `&& displayAddress && selectedShipping && selectedPayment`); pass the new `billingAddress` display prop (compute `displayBillingAddress` analogous to `displayAddress`, or `null` when `billingAddress` is null).

- [ ] **Step 7:** `tsc --noEmit` PASS + `build` succeeds.
- [ ] **Step 8:** Commit `feat(frontend): wire setOrderBillingAddress into checkout with a billing step`.

---

## Task 3: Order Review billing block + final verification

**Files:**
- Modify: `apps/frontend/src/components/checkout/OrderReview.tsx`
- Create: `docs/superpowers/plans/2026-05-31-phase1-batch3-runtime-checklist.md`

- [ ] **Step 1: `OrderReview` billing block**
  - Add optional prop `billingAddress?: { firstName; lastName; address; city; wilaya; postalCode; phone } | null`.
  - Insert a "Adresse de facturation" `Card` between the shipping-address card and the shipping-method card. When `billingAddress` is null/undefined → render "Identique à l'adresse de livraison"; otherwise render the address (same layout as the shipping card). Edit button → `onEdit(2)`.
  - **Renumber existing `onEdit` calls:** shipping `onEdit(1)` (unchanged), method `onEdit(2)` → **`onEdit(3)`**, payment `onEdit(3)` → **`onEdit(4)`**, footer "Retour" `onEdit(3)` → **`onEdit(4)`**.

- [ ] **Step 2: Forbidden-pattern + final gates**
  - `grep -rn "window.location.reload" apps/frontend/src/app/[locale]/(shop)/checkout apps/frontend/src/components/checkout` → no matches.
  - `pnpm --filter @oscar/frontend exec tsc --noEmit` + `pnpm --filter @oscar/frontend build` → both succeed.

- [ ] **Step 3: Runtime checklist** — document (for the user, backend up): billing step appears as #2; "same as shipping" (default) places an order whose billing = shipping and is explicitly set on the order; unchecking and entering a different billing address persists it (visible in Order Review and in the account order detail's billing block); union/error path (force a `NoActiveOrderError`) shows an error toast and does not advance; full 5-step flow reaches confirmation; RTL check in Arabic for the new step/form.

- [ ] **Step 4:** Commit `docs: order-review billing + runtime checklist for Phase 1 Batch 3` (or split the OrderReview change as a feat commit + the checklist as a docs commit).

---

## Notes
- **react-hot-toast**, not Redux toasts (this is the frontend).
- `shippingAddress` page state holds the raw step-1 `values` (wilaya/commune **codes**), which `buildAddressInput` resolves to names — billing "same as shipping" reuses exactly that.
- Keep the billing form's labels hardcoded French to match the existing checkout components.
