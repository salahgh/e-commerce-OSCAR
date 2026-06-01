# Phase 1 · Batch 1 — Back-Office Settings CRUD (design)

**Date:** 2026-05-31
**Status:** Design — awaiting review
**Source:** `vendure_coverage_audit.md` → "Phase 1 — wire what already exists"
**Scope decision:** Phase 1 is implemented in incremental batches. This spec covers **Batch 1 only** (Settings CRUD). Batch 2 (order ops) and Batch 3 (frontend billing) get their own specs.

## Goal

Bring the custom back-office Settings page to Admin-API parity for tax, zones, channels, and complete the create paths for shipping/payment methods plus the global-settings save — by **wiring operations that already exist** in the generated GraphQL layer into UI.

All 31 required `*Document` nodes already exist in `apps/backoffice/src/graphql/generated/graphql.ts` (verified 2026-05-31). **No codegen and no running backend are needed to build or type-check Batch 1.** Runtime verification is deferred to the user (backend not currently running; only `.env.example` present).

## In scope (6 features)

1. **Tax CRUD** — Tax Rates (`taxRates` / `createTaxRate` / `updateTaxRate` / `deleteTaxRate`) and Tax Categories (`taxCategories` / `createTaxCategory` / `updateTaxCategory` / `deleteTaxCategory`).
2. **Zone CRUD** — `zones` / `createZone` / `updateZone` / `deleteZone`, plus member management (`addMembersToZone` / `removeMembersFromZone`) using `countries` as the member picker.
3. **Channel CRUD** — `channels` / `createChannel` / `updateChannel` / `deleteChannel`.
4. **Shipping method — create** — add a create flow (`createShippingMethod`) to the existing shipping tab, which currently only edits/deletes. Uses `shippingEligibilityCheckers` + `shippingCalculators` for the config args.
5. **Payment method — create** — add a create flow (`createPaymentMethod`) to the existing payment tab. Uses `paymentMethodHandlers` + `paymentMethodEligibilityCheckers`.
6. **Global settings — save** — wire the existing store-info form (`updateGlobalSettings`); it is currently a toast-only stub.

## Out of scope

- Batch 2: fulfillments, `transitionPaymentToState`, bulk deletes.
- Batch 3: frontend `setOrderBillingAddress`.
- Phase 2 build-from-scratch domains (Customer Groups, Draft Orders, Sellers, Stock Locations, Countries/Provinces CRUD, Tags, Settings Store, Scheduled Tasks).
- Per-method Algerian payment-credential panels (CIB/Baridimob) beyond what `updatePaymentMethod` already exposes.

## Architecture (Approach A — per-section components + tabs)

The current `Settings.tsx` is a single 1,336-line file with inline tabs (`store`, `shipping`, `payment`, `email`, `users`, `system`). To avoid growing it further, **new domains become self-contained section components**:

```
apps/backoffice/src/pages/settings/
  Settings.tsx                 (registers tabs; existing inline tabs stay)
  sections/
    TaxSettings.tsx            (Tax Rates + Tax Categories sub-areas)
    ZoneSettings.tsx           (Zones + member management)
    ChannelSettings.tsx        (Channels)
    ShippingMethodCreateModal.tsx   (create dialog imported by the shipping tab)
    PaymentMethodCreateModal.tsx    (create dialog imported by the payment tab)
```

- Each section owns its own `useQuery`/`useMutation(SomeDocument)` calls, list rendering, a create/edit `Modal` form, and a delete `ConfirmDialog` — mirroring the established pattern in `Settings.tsx` (e.g. lines 96–184) and existing CRUD pages like `FacetDetail.tsx`.
- New tabs registered in `Settings.tsx` `tabs` array in order: `…shipping, payment, taxes, zones, channels, email, users, system`.
- `updateGlobalSettings` is wired **in place** in the existing `store` tab (the form already exists; only `onSubmit` changes).
- The shipping/payment **create** modals are new files imported into the existing inline tabs; edit/delete already work and are untouched except to add a "New" button.

### Component contract (each section)

- **Does:** lists entities of one domain and lets an operator create/edit/delete them (and manage zone members).
- **Used via:** rendered as a tab `content` node; no props beyond what it queries itself.
- **Depends on:** generated `*Document` nodes, Apollo `useQuery/useMutation`, UI primitives (`Modal`, `Input`, `Select`, `TextArea`, `Button`, `Table`, `ConfirmDialog`, `Badge`, `Toast`/`useToast`), `PermissionGate`/`usePermissions`.

## Data flow

1. Section loads list via `useQuery(XListDocument)`.
2. Create/edit submits via `useMutation(CreateX/UpdateXDocument)`.
3. On success: **explicitly** refetch the list query (`refetchQueries: [{ query: XListDocument }]`) or update the cache — never `window.location.reload()` (per quality-audit finding BO-12). Close modal, show success toast.
4. Delete: `ConfirmDialog` → `useMutation(DeleteXDocument)` → refetch list → toast.
5. Zone members: edit modal shows current members; add/remove call `addMembersToZone`/`removeMembersFromZone`, then refetch the zone.

## Error handling

- Where a mutation returns a Vendure result **union** (e.g. tax-rate/zone results may be plain types; channel create returns `CreateChannelResult = Channel | LanguageNotAvailableError`), check for `__typename`/`errorCode` and surface `result.message` via an error toast; otherwise treat GraphQL/network errors via Apollo `onError`.
- Submit buttons disabled while `loading`.
- Delete dialogs warn that deletion may fail if the entity is in use (consistent with existing shipping/payment delete copy).

## Permissions

Gate new tabs and actions with the existing `PermissionGate`/`usePermissions` using the relevant Vendure `Permission` enum values (`CreateSettings`/`UpdateSettings`/`DeleteSettings` cover tax/zone/channel/method/global-settings in Vendure's default permission model; confirm against `permissions.config.ts` during planning and use the same keys the existing Settings actions use).

## Testing & verification

**Offline (must pass before handoff):**
- `pnpm --filter @oscar/backoffice type-check` — clean.
- `pnpm --filter @oscar/backoffice build` — succeeds.
- No new `any` casts beyond what the surrounding code already uses; no `window.location.reload()`.

**Runtime checklist (user runs once backend is up):** for each domain — create an entity, see it in the list; edit it, see the change; delete it, see it removed; for zones, add and remove a country member; save store/global settings and confirm persistence after reload. Confirm permission-gated controls hide for a role lacking the permission.

> No automated component tests exist in the back-office today; Batch 1 follows the codebase norm (manual runtime verification + type-check/build). Introducing a test harness is out of scope for this batch.

## Risks / notes

- **Union shapes vary per mutation** — must confirm each create/update return type in `schema.graphql` during planning to handle (or skip) error variants correctly.
- **`createChannel` requires** `defaultLanguageCode`, `defaultCurrencyCode`, `pricesIncludeTax`, `defaultShippingZoneId`, `defaultTaxZoneId` — the form must fetch zones to populate the zone selects (cross-dependency on the Zones data).
- **Shipping/payment create** needs the checker/calculator/handler config-arg metadata; the dynamic-arg form may be non-trivial. If it balloons, the create modal can ship with the minimal required args and defer advanced arg editing — flagged as a planning decision, not a silent cut.
- File-size discipline: keep each new section focused; if `TaxSettings` (two sub-areas) grows past ~300 lines, split rates/categories into two files.
