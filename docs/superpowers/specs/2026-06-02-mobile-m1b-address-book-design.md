# M1b — Saved Address Book + Checkout Picker (Design Spec)

**Date:** 2026-06-02
**App:** `apps/mobile` (standalone npm Expo project)
**Milestone:** M1b — second slice of M1 ("close the buy-loop"), mobile-only scope
**Status:** Approved design — ready for implementation planning

---

## 1. Goal & background

Signed-in customers cannot save or reuse addresses; checkout (M1a) re-types the address every order. This slice adds a **profile address book** (list/add/edit/delete/set-default) and a **checkout saved-address picker** that prefills the address step — so returning COD buyers stop re-typing.

This is **net-new in both apps** — the frontend has no address book and no checkout picker, so there is no pattern to mirror (the "frontend as reference" rule explicitly permits net-new mobile features). All the backend plumbing already exists and is codegen'd:
- `CreateCustomerAddress(input: CreateAddressInput!)` → `useCreateCustomerAddressMutation`
- `UpdateCustomerAddress(input: UpdateAddressInput!)` → `useUpdateCustomerAddressMutation`
- `DeleteCustomerAddress(id: ID!)` → `useDeleteCustomerAddressMutation` (returns `{ success }`)
- `ActiveCustomer` query → `activeCustomer.addresses { id, fullName, company, streetLine1, streetLine2, city, province, postalCode, country { code name }, phoneNumber, defaultShippingAddress, defaultBillingAddress }` → `useActiveCustomerQuery` (already used in `app/(tabs)/profile.tsx`).

Note: M1a stores `province` as the **wilaya name** (not code), so editing/prefill must reverse-map name → code.

## 2. Pure helpers — `src/utils/address.ts` (the testable core)

```
AddressFormValues = {
  fullName, phoneNumber, streetLine1, streetLine2?, city, wilayaCode, postalCode?, defaultShippingAddress: boolean
}
```
- `resolveWilayaCode(provinceName, wilayas)` → wilaya code whose `name` === provinceName, else `''`.
- `buildCreateAddressInput(values, wilayas)` → `CreateAddressInput`: `{ fullName, streetLine1, streetLine2: streetLine2 || undefined, city, province: <wilaya name>, postalCode: postalCode || undefined, countryCode: 'DZ', phoneNumber, defaultShippingAddress }`.
- `buildUpdateAddressInput(id, values, wilayas)` → same shape **plus `id`** (`UpdateAddressInput`).
- `addressToFormValues(address, wilayas)` → `AddressFormValues` for the edit form (`wilayaCode = resolveWilayaCode(address.province, wilayas)`, `defaultShippingAddress` from the saved flag).
- `addressToCheckoutValues(address, wilayas)` → `Partial<ShippingAddressFormValues>` for the checkout picker, mapping to the checkout form's field names (`address: streetLine1`, `notes: streetLine2`, `wilayaCode`, `fullName`, `phoneNumber`, `city`, `postalCode`).

## 3. Validation — `src/utils/validation.ts`

Add `addressFormSchema` (Yup): `fullName` (min 3, required), `phoneNumber` (`validationRules.phone`), `streetLine1` (min 5, required), `city` (min 2, required), `wilayaCode` (required), `postalCode` (5-digit, required), `streetLine2` (optional), `defaultShippingAddress` (boolean).

## 4. Address book screen — `app/profile/addresses.tsx`

Single screen, **list ↔ form toggled by state** (`mode: 'list' | 'create' | 'edit'` + the editing address). No extra routes, no modal.
- **List:** `useActiveCustomerQuery({ fetchPolicy: 'cache-and-network', skip: !isAuthenticated })` → render an `AddressCard` per `activeCustomer.addresses`; loading/empty/error states; "Add address" button.
- **Create/Edit:** render `AddressForm` (mode-aware); on submit call `createCustomerAddress` / `updateCustomerAddress` with the built input, `refetchQueries: ['ActiveCustomer']`, toast, return to list.
- **Delete:** confirm `Alert` → `deleteCustomerAddress({ variables: { id }, refetchQueries: ['ActiveCustomer'] })` → toast.
- **Set default:** `updateCustomerAddress({ input: { id, defaultShippingAddress: true }, refetchQueries: ['ActiveCustomer'] })`.
- Handle each mutation's union/`errorCode` result (throw → toast), matching the app's existing pattern.

### Components
- `src/components/profile/AddressCard.tsx` — props `{ address, onEdit, onDelete, onSetDefault }`; shows name, street(+streetLine2), `city · province`, phone, a **Default** badge when `defaultShippingAddress`, and edit/delete/set-default actions.
- `src/components/profile/AddressForm.tsx` — Formik + `addressFormSchema`; fields fullName, phone, streetLine1, streetLine2 (optional), city, **`WilayaPicker`** (reused from M1a), postalCode, and a **"Set as default" `Switch`** (reuse `src/components/ui/Switch`). Props `{ initialValues?, onSubmit, submitting, submitLabel }`.

### Entry point
Add an **"Addresses"** item to the `menuItems` array in `app/(tabs)/profile.tsx` (`icon: 'location-outline'`, `onPress: () => router.push('/profile/addresses')`), placed after "Personal info".

## 5. Checkout saved-address picker

- `src/components/checkout/SavedAddressPicker.tsx` — props `{ addresses, selectedId, onSelect }`; a horizontal/list of compact saved-address chips/cards. Rendered in `app/checkout/index.tsx` step 1 **only when `isAuthenticated` and `addresses.length > 0`**, above `ShippingAddressForm`.
- `checkout/index.tsx`: query `useActiveCustomerQuery({ skip: !isAuthenticated })` for `addresses`; default the selection to the `defaultShippingAddress` (or first). When a card is tapped, set the checkout form `initialValues` to `addressToCheckoutValues(selected, wilayas)` (reusing M1a's `prefill`/`initialValues` mechanism — i.e., drive the `ShippingAddressForm` key/initialValues off the selected address). Guests: unchanged.
- This is prefill only — the user still reviews and taps **Continue** (which runs the M1a `submitCheckoutAddress`). No auto-submit.

## 6. Testing

- `src/utils/__tests__/address.test.ts`:
  - `resolveWilayaCode` round-trips a known province name → code and returns `''` for unknown.
  - `buildCreateAddressInput` → province = wilaya name, `countryCode:'DZ'`, optional fields → `undefined`, `defaultShippingAddress` passed through.
  - `buildUpdateAddressInput` includes `id` and the same mapping.
  - `addressToFormValues` round-trips a saved address (province name → wilayaCode) including the default flag.
  - `addressToCheckoutValues` maps streetLine1→address, streetLine2→notes, province→wilayaCode for the checkout form.
- Screens/forms are not render-tested (heavy, consistent with M1a); the logic lives in the tested helpers.
- i18n: add `profile.addresses*` / address-form keys to `en/fr/ar.json`.

## 7. Out of scope (deferred)
Optimistic cache for addresses (refetch is fine for now), billing-address management, address validation against wilaya↔commune, the real CIB/Baridimob gateway (M1 later slice), Apollo cache persistence + optimistic cart (separate M1 slice).

## 8. Success criteria
1. A signed-in user can add, edit, delete, and set-default addresses from `profile/addresses`, persisted via the Vendure mutations (verified by refetch showing the change).
2. Editing an address correctly preselects its wilaya (province name → code round-trip).
3. At checkout, a signed-in user with saved addresses sees a picker; selecting one prefills the address form (default pre-selected); guests are unaffected.
4. New `address.ts` helper tests + schema additions pass; full `npm test` green; `npm run lint` 0 errors; no new `tsc` errors introduced.
