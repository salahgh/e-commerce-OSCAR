# Phase 1 · Batch 3 — Runtime Verification Checklist

Manual verification for the checkout **billing address** work (Tasks 1–3). Static
gates pass: the new/edited checkout files add **zero** new type errors against the
frontend's pre-existing `tsc` baseline (~94 unrelated errors; `next.config` sets
`typescript.ignoreBuildErrors: true`), the production build succeeds, and there is
no `window.location.reload` in the checkout flow. This checklist covers the
**runtime** behaviour that needs a live backend.

## Preconditions

1. Backend (Shop API) up: `pnpm --filter @oscar/backend dev` → `http://localhost:8085/shop-api` (populate the DB if empty).
2. Frontend up: `pnpm --filter @oscar/frontend dev` → `http://localhost:3000`.
3. A catalogue with at least one in-stock product, at least one eligible shipping method, and at least one payment method.

Legend: ⬜ = to verify · record ✅ / ❌ + detail.

## Flow & step model

- ⬜ Add an item to the cart and open checkout. The progress bar shows **5 steps**: Adresse · **Facturation** · Méthode · Paiement · Confirmation.
- ⬜ Step 1 (shipping address) submit advances to step 2 (**Facturation**), not straight to the shipping method.

## Billing — same as shipping (default path)

- ⬜ On step 2, "Utiliser l'adresse de livraison pour la facturation" is **checked by default** and a read-only summary of the shipping address is shown (names, not wilaya/commune codes).
- ⬜ Click "Continuer" → advances to step 3 (Méthode). Network: a **`setOrderBillingAddress`** mutation fires with the shipping address values (billing is now **explicitly** set, not silently defaulted).
- ⬜ Complete the order. In **Order Review (step 5)** the "Adresse de facturation" card reads **"Identique à l'adresse de livraison"**.
- ⬜ After placing the order, the account order detail (`/user/orders/[id]`) billing block shows the (shipping-equal) billing address.

## Billing — different address

- ⬜ On step 2, **uncheck** the box → a billing address form appears, pre-filled from the shipping address.
- ⬜ Change the name / address / wilaya / commune and submit. The wilaya→commune→postal auto-fill behaves like the shipping form; validation rejects a bad phone (not `0[567]########`) and a non-5-digit postal code.
- ⬜ Advances to step 3. Network: `setOrderBillingAddress` fires with the **billing** values (distinct from shipping).
- ⬜ Order Review shows the **distinct billing address** (resolved wilaya/commune names), and its "Modifier" button returns to **step 2** (billing). Place the order; the account order detail shows the distinct billing address.

## Navigation (the renumbered flow)

- ⬜ From Order Review, "Modifier" on **Adresse de livraison** → step 1; **Facturation** → step 2; **Méthode** → step 3; **Mode de paiement** → step 4; the footer "Retour" → step 4 (Paiement).
- ⬜ Each step's own "Retour" goes to the immediately previous step (billing→1, method→2, payment→3).

## Error / union path

- ⬜ Force a `NoActiveOrderError` (e.g. let the active order expire / clear the order token) and submit the billing step → an **error toast** appears and the flow **does not advance** (mirrors the shipping handler's union handling).

## i18n / RTL

- ⬜ Switch to Arabic (`/ar/...`): the billing step and form render **right-to-left**; labels, the checkbox, the wilaya/commune selects, and error messages align correctly. (Labels are hardcoded French by current checkout convention — billing matches the rest of the flow.)

## Known deferrals (logged, by design)

- No saved/account billing-address picker on the billing step (shipping's saved-address UI is not reused for billing in this batch).
- Checkout labels remain hardcoded French (no i18n message keys); full checkout i18n is a separate effort.
- `unsetOrderBillingAddress` and post-placement billing edits are out of scope.
