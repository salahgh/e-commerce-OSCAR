# Phase 1 · Batch 3 — Checkout Billing Address (design)

**Date:** 2026-05-31
**Branch:** `phase1-batch3-checkout-billing` (off `main`)
**Source:** `vendure_coverage_audit.md` → Shop API biggest gaps → *"`setOrderBillingAddress` — wire it into checkout (currently billing = shipping silently)."* Flagged as the **single most material Shop-API gap**.
**Scope decision:** Phase 1 is delivered in batches. This spec covers **Batch 3 only** (frontend checkout billing). Batch 1 (back-office Settings CRUD) is complete on its own branch; Batch 2 (order ops) gets its own spec.

## Problem

The frontend checkout collects a shipping address and calls `setOrderShippingAddress`, but **never calls `setOrderBillingAddress`**. Vendure then defaults the billing address to the shipping address silently. Customers cannot enter a separate billing address, and the order's billing address is never explicitly set by the app.

## Readiness (verified 2026-05-31)

- `useSetOrderBillingAddressMutation` / `SetOrderBillingAddressDocument` are **already generated** in `apps/frontend/src/graphql/generated/graphql.ts` (operation source: `apps/frontend/src/graphql/vendure/shop-cart.graphql`). **No codegen and no running backend are needed** to build or type-check Batch 3.
- The `OrderFields` fragment **already selects** `billingAddress { fullName streetLine1 streetLine2 city province postalCode country phoneNumber }`. No fragment/operation edits needed.
- Result type is the `ActiveOrderResult` union (`Order | NoActiveOrderError`); the existing shipping handler already discriminates it via `'errorCode' in response`. Billing mirrors that exactly.
- `CreateAddressInput` required fields: `countryCode`, `streetLine1` (billing uses the same mapping as shipping; `countryCode` is hardcoded `'DZ'`).

## In scope

1. A dedicated **"Facturation" (billing) step** in checkout, inserted as **step 2** (after shipping address, before shipping method).
2. A **"same as shipping" default** (checked): the common path requires only a "Continuer" click and sets billing = shipping **explicitly** (via the mutation), removing the silent default.
3. An **optional different billing address** form (Algerian wilaya/commune selectors, reusing the existing Algeria data + validation) shown when the box is unchecked.
4. `setOrderBillingAddress` always called on the billing step, with `ActiveOrderResult` union handling identical to shipping.
5. **Order Review** shows the billing address (or "Identique à l'adresse de livraison").

## Out of scope (logged deferrals)

- Saved/默认 billing addresses from the customer account (the shipping form's saved-address picker is not reused for billing in this batch).
- i18n message-key extraction: the checkout forms use **hardcoded French strings today**; billing follows that existing convention (no `useTranslations` keys added). Full i18n of checkout is a separate concern.
- `unsetOrderBillingAddress` / editing billing after order placement.

## Design

### Step model (after change)

| # | Label | Component |
|---|-------|-----------|
| 1 | Adresse (livraison) | `ShippingAddressForm` (unchanged) |
| 2 | **Facturation** | **`BillingAddressForm` (new)** |
| 3 | Méthode (expédition) | `ShippingMethodForm` |
| 4 | Paiement | `PaymentMethodForm` |
| 5 | Confirmation | `OrderReview` (+ billing block) |

Renumbering touches: the `steps` array, the two query `skip` guards (`eligibleShippingMethods` `< 2` → `< 3`; `eligiblePaymentMethods` `< 3` → `< 4`), every `currentStep === n` render branch, the per-step `onBack`/`onEdit` indices, and `OrderReview`'s hardcoded `onEdit(n)` calls.

### Address-input mapping (shared)

The value→`CreateAddressInput` mapping currently inlined in `handleShippingAddressSubmit` (page lines ~151–168) is extracted into a `buildAddressInput(values)` helper and reused by both the shipping and billing handlers:

```ts
const buildAddressInput = (values: any) => {
  const wilaya = wilayas.find((w) => w.code === values.wilaya);
  const commune = getCommunesByWilayaCode(values.wilaya).find((c) => c.code === values.commune);
  return {
    fullName: `${values.firstName} ${values.lastName}`,
    streetLine1: values.address,
    streetLine2: values.notes || '',
    city: commune?.name || values.commune,
    province: wilaya?.name || values.wilaya,
    postalCode: values.postalCode || '',
    countryCode: 'DZ',
    phoneNumber: values.phone,
  };
};
```

### Billing handler

```ts
const handleBillingAddressSubmit = async (billingValues: any | null) => {
  setIsSubmitting(true);
  try {
    const source = billingValues ?? shippingAddress;        // null = same as shipping
    const result = await setBillingAddressMutation({ variables: { input: buildAddressInput(source) } });
    const response = result.data?.setOrderBillingAddress;
    if (response && 'errorCode' in response) {
      toast.error((response as any).message || 'Erreur lors de la définition de l\'adresse de facturation');
      setIsSubmitting(false);
      return;
    }
    setBillingAddress(billingValues);                        // null ⇒ "same as shipping" in review
    await refetchCart();
    setCurrentStep(3);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  } catch (error: any) {
    toast.error(error.message || 'Erreur lors de la définition de l\'adresse de facturation');
  } finally {
    setIsSubmitting(false);
  }
};
```

### `BillingAddressForm` (new component)

- Props: `{ shippingValues, initialValues?, onSubmit, onBack, isSubmitting }`.
- State: `sameAsShipping` (default `true`).
- Checked (default): render a compact read-only summary of the shipping address + a "Continuer" button; submitting calls `onSubmit(null)`.
- Unchecked: render a slim Formik address form — `firstName`, `lastName`, `phone`, `address`, `wilaya`, `commune`, `postalCode`, `notes?` — using `wilayas` / `getCommunesByWilayaCode` and the same field/validation patterns as `ShippingAddressForm` (minus email, saved addresses, save-checkbox, shipping-price banner). Submitting calls `onSubmit(values)`.
- `initialValues` defaults to `shippingValues` so an operator editing a "different" billing address starts from a sensible base.

### `OrderReview` billing block

- New optional prop `billingAddress` (shaped like the existing `shippingAddress` display object, or `null`).
- New card between "Adresse de livraison" and "Méthode de livraison": shows the billing address, or "Identique à l'adresse de livraison" when `null`. Edit button → `onEdit(2)`.
- Update the existing hardcoded `onEdit` numbers: shipping `1`, **billing `2`**, method `3`, payment `4`, and the footer "Retour" `4`.

## Conventions to follow (verified)

- Union results: `if ('errorCode' in response)` then error toast + early return — **never** advance on the error branch.
- Toasts via `react-hot-toast` (`toast.error` / `toast.success`) — checkout uses `react-hot-toast`, not the back-office Redux toasts.
- After a successful mutation: `await refetchCart()` then advance the step (matches shipping). No `window.location.reload`.
- Hardcoded French labels (checkout norm); do not introduce i18n keys in this batch.
- Phone validation `^(0)(5|6|7)[0-9]{8}$`, postal `^[0-9]{5}$` (reuse the shipping schema's rules for the billing form).
- Verify each task with `pnpm --filter @oscar/frontend exec tsc --noEmit` + `pnpm --filter @oscar/frontend build`. Runtime verification deferred to the checklist (backend not running).

## Tasks

- **B3-T1** — `BillingAddressForm.tsx` + export from `components/checkout/index.ts`.
- **B3-T2** — Wire into `checkout/page.tsx`: hook + mutation, billing state, `buildAddressInput` helper (refactor shipping handler), `handleBillingAddressSubmit`, insert billing step + full renumber.
- **B3-T3** — `OrderReview` billing block + `onEdit` renumber; final type-check/build; runtime checklist doc.

## Self-review notes

- **Single material gap closed:** billing is now always explicitly set; customers can supply a different billing address.
- **Risk = step renumbering**: the dedicated-step choice (vs an inline toggle) trades one extra click for architectural consistency, but spreads `currentStep` index edits across the page + `OrderReview`. The per-task review workflow must check every index (`steps`, query `skip`, render branches, `onBack`/`onEdit`).
- **No backend needed**: operation + fragment already generated; this is pure wire-up.
