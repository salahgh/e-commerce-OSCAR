# Phase 1 · Batch 1 — Runtime Verification Checklist

Manual verification for the back-office **Settings** CRUD work (Tasks 1–7). Static
gates (type-check, build, forbidden-pattern grep) already pass in CI/local; this
checklist covers the **runtime** behaviour that needs a live backend and cannot be
asserted offline.

## Preconditions

1. Start the backend (Shop + Admin API): `pnpm --filter @oscar/backend dev` → `http://localhost:8085`.
   - If the DB is empty: `pnpm --filter @oscar/backend populate`.
2. Start the back-office: `pnpm --filter @oscar/backoffice dev` → `http://localhost:5173`.
3. Log in with an admin account, open **Settings**.

Legend: ⬜ = to verify · note the result (✅ / ❌ + detail) as you go.

---

## T1 — Global settings · inventory defaults (Store / general tab)

- ⬜ Change **Track inventory** and **Out-of-stock threshold**, click Save → success toast.
- ⬜ Reload the page → the saved values persist (no `window.location.reload`; the form reflects the server state on refetch).

## T2 — Tax categories (Taxes tab)

- ⬜ **Create**: add a category (e.g. "Standard", default on) → appears in the list.
- ⬜ **Edit**: rename it / toggle default → change persists after the list refetch.
- ⬜ **Delete**: remove an unused category → row disappears. Deleting one referenced by a tax rate should surface the server message in an error toast (not a silent failure).

## T3 — Tax rates (Taxes tab)

- ⬜ **Create**: add a rate (name, value e.g. 19, a category, a zone, enabled) → appears in the list with the right zone/category names.
- ⬜ **Edit**: change the value or zone → persists.
- ⬜ **Delete**: remove it → gone. (Delete checks `result === 'DELETED'`.)

## T4 — Zones + member management (Zones tab)

- ⬜ **Create**: new zone with a name and a few checked countries → appears with the correct member **count badge**.
- ⬜ **Edit · rename**: change the name → persists.
- ⬜ **Edit · add member**: open the zone, pick a country in "Ajouter un pays", Ajouter → it appears in the member chips immediately (live refetch), "Pays ajouté" toast, and is removed from the add dropdown.
- ⬜ **Edit · remove member**: click the ✕ on a member chip → it disappears, "Pays retiré" toast, returns to the add dropdown.
- ⬜ **Delete**: remove an unused zone → gone. A zone used by a tax rate / shipping method should error with the server message.

## T5 — Channels (Canaux tab)

- ⬜ **Create**: new channel (code, token, language, currency DZD, tax zone, shipping zone, prices-include-tax) → appears in the list.
- ⬜ **Edit**: change a default zone or the prices-include-tax flag → persists.
- ⬜ **Union/error path**: attempt a create/update with a **language not available** on the server (a `LanguageCode` the channel doesn't allow) → the `LanguageNotAvailableError` message shows in an **error toast**, and the record is **not** reported as created/updated (no false success toast, list unchanged).
- ⬜ **Delete**: remove a non-default channel → gone. The **default channel** cannot be deleted → expect the server's refusal message in an error toast.

## T6 — Shipping method · create (Livraison tab)

- ⬜ Click **Nouvelle méthode** → modal opens; checker, calculator and fulfillment-handler selects are populated; each shows its config args as text fields prefilled with JSON defaults.
- ⬜ **Accept defaults**: set code + name, accept the default checker/calculator args, Créer → success toast, modal closes, and the method **appears in the list** (parent refetch).
- ⬜ The created method is **selectable at checkout** for an address in its eligible zone (end-to-end smoke).
- ⬜ **Required-arg guard**: clear a required arg field and submit → client-side "paramètres requis" warning (no server round-trip).
- ⬜ *Deferred (not a bug):* advanced **typed/list arg editing** is intentionally out of scope here — args are edited as JSON-formatted text. Confirm the in-modal note communicates this.

## T7 — Payment method · create (Paiement tab)

- ⬜ Click **Nouvelle méthode** → modal opens; handler select populated; checker select defaults to **"Aucun (toujours éligible)"**.
- ⬜ **Create without a checker**: code + name + enabled + a handler, Créer → success toast, method appears in the list (input omits the `checker` key entirely).
- ⬜ **Create with a checker**: pick a checker, fill its args → still creates successfully (checker sent).
- ⬜ **Enabled toggle**: a method created with "Activé" off appears disabled in the list.
- ⬜ *Deferred (not a bug):* same JSON-text arg simplification as shipping.

---

## Cross-cutting

- ⬜ All mutations refresh via Apollo `refetch()` — **no full-page reload** anywhere in Settings.
- ⬜ Every destructive action goes through the `ConfirmDialog` before firing.
- ⬜ Error toasts surface the **server message** (e.g. "cannot delete, in use") rather than a generic string, where the server provides one.

## Known deferrals (logged, by design)

- Shipping/payment **config-arg editing** is generic string/JSON text; typed, list, and UI-component-driven arg editors are deferred to a later batch (see Tasks 6–7 code comments).
- RBAC `PermissionGate` is intentionally not applied to these Settings sections yet (consistency with the existing tab; tracked as **BO-7** in `feature_audit.md`).
