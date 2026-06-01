# Phase 1 · Batch 1 — Back-Office Settings CRUD Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire already-generated Admin-API operations into the back-office Settings page so an operator can manage tax rates/categories, zones (+members), channels, create shipping/payment methods, and save global settings.

**Architecture:** New self-contained section components under `apps/backoffice/src/pages/settings/sections/`, registered as tabs in `Settings.tsx`. Each section uses the existing `useQuery/useMutation(SomeDocument)` client-preset pattern. Shipping/payment "create" ship as modal components imported into the existing inline tabs. Global-settings save is wired in place.

**Tech Stack:** React 19, Apollo Client (`@apollo/client`), generated typed `*Document` nodes (client-preset), Tailwind, existing UI primitives (`Modal`, `Input`, `Select`, `TextArea`, `Button`, `Table`, `ConfirmDialog`, `Badge`, `useToast`), `PermissionGate`/`usePermissions`.

**Verification model:** The back-office has **no automated test harness**; per the approved spec, verification is `type-check` + `build` + a manual runtime checklist (deferred to the user — backend not running). Every task's "verify" steps are `tsc`/build, not unit tests.

**Commands (run from repo root):**
- Type-check: `pnpm --filter @oscar/backoffice type-check` (if that script is absent, use `pnpm --filter @oscar/backoffice exec tsc --noEmit`)
- Build: `pnpm --filter @oscar/backoffice build`

**All 31 required `*Document` nodes already exist in `apps/backoffice/src/graphql/generated/graphql.ts` (verified 2026-05-31). No codegen is required.**

---

## Conventions — the canonical CRUD-section pattern

Every new section follows this shape (Task 2 implements it fully as the reference; later tasks state only their domain-specific deltas: list/create/update/delete Document names, form fields, input mapping, and any result-union handling).

- `const { data, loading, refetch } = useQuery(XListDocument)`
- `const [createX] = useMutation(CreateXDocument)` etc.
- Local state: `modalOpen`, `editing` (the row being edited or `null`), `deletingId`, and a `form` object.
- On submit: call create/update with `variables: { input }`; on success `await refetch()`, close modal, `toast({ title: 'Enregistré' })`. Wrap in try/catch → `toast({ title: 'Erreur', description: err.message, variant: 'destructive' })`.
- Delete: `ConfirmDialog` → `deleteX({ variables: { id } })` → `await refetch()`.
- **Never** call `window.location.reload()`.
- Submit button: `disabled={submitting}`.
- Wrap create/edit/delete controls in `<PermissionGate permission={Permission.UpdateSettings}>` (confirm key in Step 0 below).

---

## Task 0: Branch + permission-key confirmation

**Files:** none (investigation only)

- [ ] **Step 1: Confirm we are on the feature branch**

Run: `git rev-parse --abbrev-ref HEAD`
Expected: `phase1-batch1-settings-crud`

- [ ] **Step 2: Find the Permission enum keys to gate Settings actions**

Run: `grep -nE "Permission\\.(Create|Update|Delete)Settings|usePermissions|PermissionGate" apps/backoffice/src/pages/settings/Settings.tsx apps/backoffice/src/config/permissions.config.ts`
Confirm which permission key the existing Settings actions use (expected `Permission.UpdateSettings` for mutating settings; Vendure's default model maps tax/zone/channel/method/global-settings under the `Settings` permission group). Record the exact import path for `Permission` and `PermissionGate`. Use that key throughout this plan wherever it says `Permission.UpdateSettings`.

- [ ] **Step 3: Confirm the toast hook**

Run: `grep -rnE "useToast|toast\\(" apps/backoffice/src/pages/settings/Settings.tsx apps/backoffice/src/hooks | head`
Record the exact import and call signature (e.g. `const { toast } = useToast()` or a direct `toast(...)`). Use it consistently.

---

## Task 1: Wire Global Settings save (store tab)

The `store` tab form currently only fires a toast. Wire it to `updateGlobalSettings`. `UpdateGlobalSettingsInput` fields: `availableLanguages: [LanguageCode!]`, `trackInventory: Boolean`, `outOfStockThreshold: Int`, `customFields: JSON`. (Store name/logo are NOT global-settings fields — they live on the Channel; leave those inputs visually present but out of this mutation, and note that in a comment. Persisting store name/logo is a Channel concern handled in Task 5/UpdateChannel.)

**Files:**
- Modify: `apps/backoffice/src/pages/settings/Settings.tsx` (the `store` tab `onSubmit` and imports)

- [ ] **Step 1: Add the mutation hook**

In `Settings.tsx`, ensure `UpdateGlobalSettingsDocument` is imported from `../../graphql/generated`, then add near the other mutations (~line 180):

```tsx
const [updateGlobalSettings, { loading: savingGlobal }] = useMutation(UpdateGlobalSettingsDocument, {
  refetchQueries: [{ query: GlobalSettingsDocument }],
});
```

- [ ] **Step 2: Replace the toast-only store `onSubmit`**

Find the store-tab form submit handler (currently toasts only) and replace its body with:

```tsx
try {
  await updateGlobalSettings({
    variables: {
      input: {
        trackInventory: form.trackInventory,
        outOfStockThreshold: Number(form.outOfStockThreshold ?? 0),
      },
    },
  });
  toast({ title: 'Paramètres enregistrés' });
} catch (err: any) {
  toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
}
```

(Map `form.*` to whatever the existing store form state names are; only `trackInventory` and `outOfStockThreshold` are valid here. If the store form has no such fields yet, add two inputs bound to them — a checkbox and a number — inside the existing form.)

- [ ] **Step 3: Disable the save button while saving**

Set the store-tab save `<Button disabled={savingGlobal} loading={savingGlobal}>`.

- [ ] **Step 4: Type-check**

Run: `pnpm --filter @oscar/backoffice type-check`
Expected: PASS (no new errors).

- [ ] **Step 5: Build**

Run: `pnpm --filter @oscar/backoffice build`
Expected: succeeds.

- [ ] **Step 6: Commit**

```bash
git add apps/backoffice/src/pages/settings/Settings.tsx
git commit -m "feat(backoffice): wire global settings save in store tab"
```

---

## Task 2: Tax Categories CRUD — canonical reference section

**Files:**
- Create: `apps/backoffice/src/pages/settings/sections/TaxSettings.tsx`
- Modify: `apps/backoffice/src/pages/settings/Settings.tsx` (register `taxes` tab)

Documents: `TaxCategoriesDocument` (list), `CreateTaxCategoryDocument`, `UpdateTaxCategoryDocument`, `DeleteTaxCategoryDocument`.
Inputs: create `{ name: String!, isDefault: Boolean }`; update `{ id: ID!, name, isDefault }`. Returns plain `TaxCategory` (no union). `deleteTaxCategory(id: ID!)` returns `DeletionResponse { result, message }`.

- [ ] **Step 1: Create `TaxSettings.tsx` with the Tax Categories CRUD**

```tsx
import React, { useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import {
  TaxCategoriesDocument,
  CreateTaxCategoryDocument,
  UpdateTaxCategoryDocument,
  DeleteTaxCategoryDocument,
} from '../../../graphql/generated';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Modal } from '../../../components/ui/Modal';
import { Table } from '../../../components/ui/Table';
import { Badge } from '../../../components/ui/Badge';
import { ConfirmDialog } from '../../../components/ui/ConfirmDialog';
import { useToast } from '../../../hooks/useToast'; // adjust to Task 0 finding

type CatForm = { id?: string; name: string; isDefault: boolean };
const emptyCat: CatForm = { name: '', isDefault: false };

export const TaxCategoriesPanel: React.FC = () => {
  const { toast } = useToast();
  const { data, loading, refetch } = useQuery(TaxCategoriesDocument);
  const [createCat, { loading: creating }] = useMutation(CreateTaxCategoryDocument);
  const [updateCat, { loading: updating }] = useMutation(UpdateTaxCategoryDocument);
  const [deleteCat, { loading: deleting }] = useMutation(DeleteTaxCategoryDocument);

  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<CatForm>(emptyCat);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const categories = data?.taxCategories?.items ?? [];
  const submitting = creating || updating;

  const openCreate = () => { setForm(emptyCat); setModalOpen(true); };
  const openEdit = (c: any) => { setForm({ id: c.id, name: c.name, isDefault: c.isDefault }); setModalOpen(true); };

  const handleSubmit = async () => {
    try {
      if (form.id) {
        await updateCat({ variables: { input: { id: form.id, name: form.name, isDefault: form.isDefault } } });
      } else {
        await createCat({ variables: { input: { name: form.name, isDefault: form.isDefault } } });
      }
      await refetch();
      setModalOpen(false);
      toast({ title: 'Catégorie de taxe enregistrée' });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    try {
      await deleteCat({ variables: { id: deletingId } });
      await refetch();
      toast({ title: 'Catégorie supprimée' });
    } catch (err: any) {
      toast({ title: 'Erreur', description: err.message, variant: 'destructive' });
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Catégories de taxe</h3>
        <Button onClick={openCreate}>Nouvelle catégorie</Button>
      </div>
      {loading ? (
        <p className="text-muted-foreground">Chargement…</p>
      ) : (
        <Table>
          <thead><tr><th className="text-left p-2">Nom</th><th className="p-2">Par défaut</th><th className="p-2">Actions</th></tr></thead>
          <tbody>
            {categories.map((c: any) => (
              <tr key={c.id} className="border-t border-border">
                <td className="p-2">{c.name}</td>
                <td className="p-2 text-center">{c.isDefault ? <Badge>Oui</Badge> : '—'}</td>
                <td className="p-2 text-center space-x-2">
                  <Button variant="ghost" onClick={() => openEdit(c)}>Modifier</Button>
                  <Button variant="ghost" onClick={() => setDeletingId(c.id)}>Supprimer</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      )}

      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={form.id ? 'Modifier la catégorie' : 'Nouvelle catégorie'}>
        <div className="space-y-4">
          <Input label="Nom" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={form.isDefault} onChange={(e) => setForm({ ...form, isDefault: e.target.checked })} />
            Catégorie par défaut
          </label>
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setModalOpen(false)}>Annuler</Button>
            <Button onClick={handleSubmit} disabled={submitting || !form.name}>Enregistrer</Button>
          </div>
        </div>
      </Modal>

      <ConfirmDialog
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Supprimer cette catégorie de taxe"
        message="Cette action peut échouer si la catégorie est utilisée."
        confirmText="Supprimer"
        variant="danger"
        loading={deleting}
      />
    </div>
  );
};

// Tax Rates panel added in Task 3.
export const TaxSettings: React.FC = () => (
  <div className="space-y-8">
    <TaxCategoriesPanel />
  </div>
);
```

> Verify prop names against the real components in Step 2 (e.g. `Modal` may use `open`/`onClose` and `Input` may not accept a `label` prop). Adjust to the actual signatures — do NOT invent props.

- [ ] **Step 2: Verify UI primitive signatures and fix usages**

Run: `sed -n '1,40p' apps/backoffice/src/components/ui/Modal.tsx; sed -n '1,40p' apps/backoffice/src/components/ui/Input.tsx; sed -n '1,40p' apps/backoffice/src/components/ui/Table.tsx; sed -n '1,30p' apps/backoffice/src/components/ui/Button.tsx`
Adjust `TaxSettings.tsx` so every prop used matches the real component API (modal open prop name, whether `Input` has `label`, whether `Button` has `variant`/`loading`).

- [ ] **Step 3: Register the `taxes` tab in `Settings.tsx`**

Import at top: `import { TaxSettings } from './sections/TaxSettings';`
In the `tabs` array, after the `payment` entry, add:

```tsx
{ id: 'taxes', label: 'Taxes', content: <TaxSettings /> },
```

- [ ] **Step 4: Type-check**

Run: `pnpm --filter @oscar/backoffice type-check`
Expected: PASS.

- [ ] **Step 5: Build**

Run: `pnpm --filter @oscar/backoffice build`
Expected: succeeds.

- [ ] **Step 6: Commit**

```bash
git add apps/backoffice/src/pages/settings/sections/TaxSettings.tsx apps/backoffice/src/pages/settings/Settings.tsx
git commit -m "feat(backoffice): tax categories CRUD in settings"
```

---

## Task 3: Tax Rates CRUD (extend TaxSettings)

Add a `TaxRatesPanel` to `TaxSettings.tsx` and render it under the categories panel.

Documents: `TaxRatesDocument` (list), `CreateTaxRateDocument`, `UpdateTaxRateDocument`, `DeleteTaxRateDocument`. Also needs `TaxCategoriesDocument` and `ZonesDocument` for the category/zone selects.
Create input: `{ name: String!, enabled: Boolean!, value: Float!, categoryId: ID!, zoneId: ID! }`. Update input adds `id` and makes others optional. Returns plain `TaxRate`. Delete → `DeletionResponse`.

**Files:** Modify `apps/backoffice/src/pages/settings/sections/TaxSettings.tsx`

- [ ] **Step 1: Add the `TaxRatesPanel`**

Form state: `{ id?, name, value (number, percent), enabled, categoryId, zoneId }`. Populate two `<Select>`s from `useQuery(TaxCategoriesDocument)` and `useQuery(ZonesDocument)` (`data.taxCategories.items`, `data.zones`). Map to `variables.input` exactly as the input types above (note `value` is the percentage number, `enabled` defaults `true`). Mirror the create/update/delete/refetch/toast structure from `TaxCategoriesPanel`. Table columns: Nom, Zone, Catégorie, Valeur (%), Activé, Actions.

- [ ] **Step 2: Render it in `TaxSettings`**

```tsx
export const TaxSettings: React.FC = () => (
  <div className="space-y-8">
    <TaxRatesPanel />
    <TaxCategoriesPanel />
  </div>
);
```

- [ ] **Step 3: Type-check** — `pnpm --filter @oscar/backoffice type-check` → PASS
- [ ] **Step 4: Build** — `pnpm --filter @oscar/backoffice build` → succeeds
- [ ] **Step 5: Commit**

```bash
git add apps/backoffice/src/pages/settings/sections/TaxSettings.tsx
git commit -m "feat(backoffice): tax rates CRUD in settings"
```

---

## Task 4: Zones CRUD + member management

**Files:**
- Create: `apps/backoffice/src/pages/settings/sections/ZoneSettings.tsx`
- Modify: `apps/backoffice/src/pages/settings/Settings.tsx` (register `zones` tab)

Documents: `ZonesDocument` (list), `CreateZoneDocument`, `UpdateZoneDocument`, `DeleteZoneDocument`, `AddMembersToZoneDocument`, `RemoveMembersFromZoneDocument`, `AdminCountriesDocument` (member picker).
Create input: `{ name: String!, memberIds: [ID!] }`. Update input: `{ id: ID!, name }` (members are NOT updated via updateZone — use the add/remove member mutations). `addMembersToZone(zoneId: ID!, memberIds: [ID!]!)`, `removeMembersFromZone(zoneId: ID!, memberIds: [ID!]!)` both return the `Zone`. Delete → `DeletionResponse`.

- [ ] **Step 1: Create `ZoneSettings.tsx`**

Build a `ZoneSettings` component following the canonical pattern (Task 2):
- List zones (`data.zones`), each row: name, member count, Modifier/Supprimer.
- Create modal: name input + a multi-select/checkbox list of countries from `AdminCountriesDocument` (`data.countries.items`), submit `createZone({ input: { name, memberIds } })`.
- Edit modal: rename via `updateZone`; show current members (`zone.members`) with remove buttons (`removeMembersFromZone({ zoneId, memberIds: [countryId] })`) and an add-country control (`addMembersToZone({ zoneId, memberIds })`). `await refetch()` after each.
- Delete via `ConfirmDialog` → `deleteZone({ id })`.

Verify `Zone` exposes `members { id name }` in the generated `ZonesDocument` selection set; if the existing `Zones`/`ShippingZones` operation does not select members, add member fields to the operation in `apps/backoffice/src/graphql/vendure/settings.graphql` and run offline codegen: `pnpm --filter @oscar/backoffice codegen` (uses the local `schema.graphql`, no backend needed).

- [ ] **Step 2: Verify UI primitive signatures** (Modal/Select/Input) and fix usages.

- [ ] **Step 3: Register the `zones` tab** in `Settings.tsx` after `taxes`:

```tsx
{ id: 'zones', label: 'Zones', content: <ZoneSettings /> },
```

- [ ] **Step 4: Type-check** — PASS
- [ ] **Step 5: Build** — succeeds
- [ ] **Step 6: Commit**

```bash
git add apps/backoffice/src/pages/settings/sections/ZoneSettings.tsx apps/backoffice/src/pages/settings/Settings.tsx apps/backoffice/src/graphql/vendure/settings.graphql apps/backoffice/src/graphql/generated
git commit -m "feat(backoffice): zone CRUD and member management in settings"
```

---

## Task 5: Channels CRUD

**Files:**
- Create: `apps/backoffice/src/pages/settings/sections/ChannelSettings.tsx`
- Modify: `apps/backoffice/src/pages/settings/Settings.tsx` (register `channels` tab)

Documents: `ChannelsDocument` (list), `CreateChannelDocument`, `UpdateChannelDocument`, `DeleteChannelDocument`, plus `ZonesDocument` (for the required zone selects).
Create input (required fields): `code: String!`, `token: String!`, `defaultLanguageCode: LanguageCode!`, `pricesIncludeTax: Boolean!`, `defaultCurrencyCode: CurrencyCode`, `defaultTaxZoneId: ID!`, `defaultShippingZoneId: ID!`. Update input mirrors with `id` and optional fields.
**Result is a UNION:** `CreateChannelResult = Channel | LanguageNotAvailableError` (same for update). Must handle it.

- [ ] **Step 1: Create `ChannelSettings.tsx`**

Follow the canonical pattern, with this submit handler shape (union handling is the key delta):

```tsx
const res = await createChannel({ variables: { input } });
const result = res.data?.createChannel;
if (result?.__typename === 'LanguageNotAvailableError') {
  toast({ title: 'Erreur', description: result.message, variant: 'destructive' });
  return;
}
await refetch();
setModalOpen(false);
toast({ title: 'Canal enregistré' });
```

Form fields: `code` (text), `token` (text), `defaultLanguageCode` (Select of `LanguageCode` — at minimum `fr`, `ar`, `en`), `defaultCurrencyCode` (Select — `DZD`), `pricesIncludeTax` (checkbox), `defaultTaxZoneId` + `defaultShippingZoneId` (Selects populated from `ZonesDocument`). Delete → `DeletionResponse` via `ConfirmDialog`.

- [ ] **Step 2: Verify UI primitive signatures** and fix usages.

- [ ] **Step 3: Register the `channels` tab** in `Settings.tsx` after `zones`:

```tsx
{ id: 'channels', label: 'Canaux', content: <ChannelSettings /> },
```

- [ ] **Step 4: Type-check** — PASS
- [ ] **Step 5: Build** — succeeds
- [ ] **Step 6: Commit**

```bash
git add apps/backoffice/src/pages/settings/sections/ChannelSettings.tsx apps/backoffice/src/pages/settings/Settings.tsx
git commit -m "feat(backoffice): channel CRUD in settings"
```

---

## Task 6: Shipping method — create flow

**Files:**
- Create: `apps/backoffice/src/pages/settings/sections/ShippingMethodCreateModal.tsx`
- Modify: `apps/backoffice/src/pages/settings/Settings.tsx` (shipping tab — add "New" button + render modal)

Documents: `CreateShippingMethodDocument`, plus `ShippingEligibilityCheckersDocument` and `ShippingCalculatorsDocument` for the config-arg metadata, and `ShippingMethodsDocument` to refetch.

`CreateShippingMethodInput` requires `code`, `translations` (`[{ languageCode, name, description }]`), a `fulfillmentHandler` code, a `checker { code, arguments: [{ name, value }] }`, and a `calculator { code, arguments }`. **The argument values depend on the selected checker/calculator.**

**Scope decision (per spec):** ship the **minimal** create form first — let the operator pick a checker and a calculator from the fetched lists and fill their string args generically (render each `arg.name` as a text input, send `value` as a string). Advanced typed-arg editing is deferred (note it in a code comment and in the runtime checklist). This is an explicit, logged simplification — not a silent cut.

- [ ] **Step 1: Create `ShippingMethodCreateModal.tsx`**

Props: `{ isOpen, onClose, onCreated }`. Query `ShippingEligibilityCheckersDocument` and `ShippingCalculatorsDocument`. Form: `code`, `name` (→ one `fr` translation), checker Select (its `args` rendered as text inputs), calculator Select (same), `fulfillmentHandler` text (default to the first available handler code or `'manual-fulfillment'`). On submit call `createShippingMethod` with the assembled input, `onCreated()` (which refetches the list in the parent), close, toast. Handle errors via toast.

- [ ] **Step 2: Wire into the shipping tab**

In `Settings.tsx` shipping tab: add a `Nouvelle méthode` button that opens the modal; render `<ShippingMethodCreateModal isOpen={...} onClose={...} onCreated={() => refetchShipping()} />` where `refetchShipping` refetches `ShippingMethodsDocument` (add a `refetch` from its `useQuery` if not already captured).

- [ ] **Step 3: Verify UI primitive signatures** and fix usages.
- [ ] **Step 4: Type-check** — PASS
- [ ] **Step 5: Build** — succeeds
- [ ] **Step 6: Commit**

```bash
git add apps/backoffice/src/pages/settings/sections/ShippingMethodCreateModal.tsx apps/backoffice/src/pages/settings/Settings.tsx
git commit -m "feat(backoffice): create shipping method flow in settings"
```

---

## Task 7: Payment method — create flow

**Files:**
- Create: `apps/backoffice/src/pages/settings/sections/PaymentMethodCreateModal.tsx`
- Modify: `apps/backoffice/src/pages/settings/Settings.tsx` (payment tab — add "New" button + render modal)

Documents: `CreatePaymentMethodDocument`, plus `PaymentMethodHandlersDocument` and `PaymentMethodCheckersDocument` for config-arg metadata, and `PaymentMethodsDocument` to refetch.

`CreatePaymentMethodInput` requires `code`, `enabled`, `translations` (`[{ languageCode, name, description }]`), a `handler { code, arguments }`, and an optional `checker { code, arguments }`. Same minimal-args simplification as Task 6.

- [ ] **Step 1: Create `PaymentMethodCreateModal.tsx`** — same structure as Task 6, but with handler (required) + optional checker, and an `enabled` checkbox. Assemble `input` and call `createPaymentMethod`.
- [ ] **Step 2: Wire into the payment tab** — `Nouvelle méthode` button + modal, `onCreated` refetches `PaymentMethodsDocument`.
- [ ] **Step 3: Verify UI primitive signatures** and fix usages.
- [ ] **Step 4: Type-check** — PASS
- [ ] **Step 5: Build** — succeeds
- [ ] **Step 6: Commit**

```bash
git add apps/backoffice/src/pages/settings/sections/PaymentMethodCreateModal.tsx apps/backoffice/src/pages/settings/Settings.tsx
git commit -m "feat(backoffice): create payment method flow in settings"
```

---

## Task 8: Final verification + runtime checklist

**Files:** Create `docs/superpowers/plans/2026-05-31-phase1-batch1-runtime-checklist.md`

- [ ] **Step 1: Full type-check + build**

Run: `pnpm --filter @oscar/backoffice type-check && pnpm --filter @oscar/backoffice build`
Expected: both succeed.

- [ ] **Step 2: Grep for forbidden patterns**

Run: `grep -rn "window.location.reload" apps/backoffice/src/pages/settings/`
Expected: no matches in the new section files.

- [ ] **Step 3: Write the runtime checklist** (for the user to run with the backend up)

Document, per domain: create → appears in list; edit → change persists; delete → removed; zones → add/remove a country member; channel create with an invalid language → see the `LanguageNotAvailableError` toast; global settings save → persists after reload; shipping/payment create with the minimal args → method appears and is selectable at checkout. Note the deferred advanced-arg editing for shipping/payment.

- [ ] **Step 4: Commit**

```bash
git add docs/superpowers/plans/2026-05-31-phase1-batch1-runtime-checklist.md
git commit -m "docs: runtime verification checklist for Phase 1 Batch 1"
```

---

## Self-review notes (author)

- **Spec coverage:** all 6 in-scope features map to tasks — global settings (T1), tax categories (T2), tax rates (T3), zones+members (T4), channels (T5), shipping create (T6), payment create (T7). ✅
- **Placeholders:** UI-primitive prop names are intentionally verified per task (Step "Verify UI primitive signatures") rather than guessed, because the exact `Modal`/`Input`/`Button` APIs weren't read during planning — this is a real verification step, not a TODO.
- **Type consistency:** Document names verified against generated output (2026-05-31). Channel create/update handled as unions; tax/zone/global-settings as plain returns; deletes as `DeletionResponse`.
- **Known simplification (logged):** shipping/payment create ships with generic string-valued config args first; advanced typed-arg editing deferred (Tasks 6–7, and the runtime checklist).
