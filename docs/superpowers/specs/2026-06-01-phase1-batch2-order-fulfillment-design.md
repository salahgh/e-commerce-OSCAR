# Phase 1 · Batch 2 — Order Fulfillment UI (design)

**Date:** 2026-06-01
**Branch:** `phase1-batch2-order-ops` (off `main`)
**Source:** `feature_audit.md` → Back-Office Admin → *"Order fulfillment (Vendure entity): Stub — `CreateFulfillment`/`TransitionFulfillmentToState` defined, no UI. No partial/per-line shipment."* Today shipping is a single order-state flip with the tracking number stored as a custom field, not a real Vendure fulfillment.
**Scope decision:** Phase 1 is delivered in batches. This spec covers **Batch 2 only** (back-office order fulfillment UI). Batch 1 (Settings CRUD) and Batch 3 (checkout billing) are complete on `main`.

## Problem

The back-office can move an order's *state* (`PaymentSettled → Shipped → Delivered`) and store a single `trackingNumber` custom field, but it never creates Vendure **Fulfillment** entities. As a result there is no per-line/partial shipment, no fulfillment-level tracking/method, and no fulfillment state machine (`Pending → Shipped → Delivered`). Operators can't ship part of an order or record more than one parcel.

## Goal

Add a real fulfillment workflow to the back-office Order Detail page using Vendure's native fulfillment entity: create fulfillments over selected order lines/quantities (partial or full), record method + tracking code, list existing fulfillments, and transition each fulfillment's state.

## Readiness (verified 2026-06-01)

- **GraphQL is already in place — no codegen, no running backend needed to build or type-check.**
  - `CreateFulfillment($input: FulfillOrderInput!)` (operation calling `addFulfillmentToOrder`) already exists at `apps/backoffice/src/graphql/vendure/orders.graphql:247`, with union handling for `Fulfillment` + `EmptyOrderLineSelectionError`, `ItemsAlreadyFulfilledError`, `InsufficientStockOnHandError`, `CreateFulfillmentError`, `FulfillmentStateTransitionError`. (`InvalidFulfillmentHandlerError` is not selected individually; it falls through to the generic error path.)
  - `TransitionFulfillmentToState($id: ID!, $state: String!)` already exists at `orders.graphql:446`.
  - The order fragment already selects `fulfillments { id state method trackingCode createdAt lines { orderLineId quantity } }`.
  - Generated documents `CreateFulfillmentDocument` and `TransitionFulfillmentToStateDocument` therefore already exist in `graphql/generated/graphql.ts`.
- Input shapes: `FulfillOrderInput { lines: [OrderLineInput!]!, handler: ConfigurableOperationInput! }`; `OrderLineInput { orderLineId: ID!, quantity: Int! }`; `ConfigurableOperationInput { code: String!, arguments: [ConfigArgInput!]! }`.
- Default handler is Vendure's `manual-fulfillment` with string args `method` and `trackingCode`.
- `Fulfillment` exposes `nextStates: [String!]!`, so the transition action is data-driven (no hard-coded state list).

## Design

Follow the existing `OrderActionDialogs.tsx` modal convention (`<Modal>` + `useMutation` + union-result discrimination via `'errorCode' in result` / `__typename`).

### Components

1. **`FulfillmentDialog`** — new modal (own file `pages/orders/FulfillmentDialog.tsx`, exported alongside the other order dialogs).
   - Props: `{ isOpen, onClose, order, onFulfilled }`.
   - Renders one row per order line with **remaining fulfillable quantity > 0**: product name/variant, ordered qty, already-fulfilled qty, and a numeric **qty-to-fulfill** input (default = remaining, min 0, max = remaining).
   - Inputs: **method** (text, e.g. "Yalidine", "ZR Express") and **tracking code** (text).
   - Submit builds `FulfillOrderInput`:
     - `lines` = rows with qty > 0 → `{ orderLineId, quantity }`.
     - `handler` = `{ code: 'manual-fulfillment', arguments: [{ name: 'method', value }, { name: 'trackingCode', value }] }`.
   - Calls `CreateFulfillmentDocument`. On `__typename === 'Fulfillment'` → success toast + `onFulfilled()` (refetch) + close; otherwise → error toast with the error `message`.
   - Disable submit when no line has qty > 0.

2. **Fulfillments section** in `OrderDetail.tsx** — inline card listing `order.fulfillments`:
   - Per fulfillment: state badge, method, tracking code, created date, and its lines (product × qty).
   - **Transition action**: for each non-terminal fulfillment, render a button per entry in `fulfillment.nextStates` (typically `Shipped`, then `Delivered`) → `TransitionFulfillmentToStateDocument({ id, state })`. Handle union (`Fulfillment` vs `FulfillmentStateTransitionError`) → toast + refetch.
   - **"Create fulfillment"** button at the section header, shown when the order state ∈ {`PaymentSettled`, `PartiallyShipped`} **and** at least one line has remaining qty > 0.

### Remaining-quantity computation

`remaining(line) = line.quantity − Σ(fl.quantity for fl in allFulfillmentLines where fl.orderLineId === line.id)`, summed across `order.fulfillments[].lines`. A small pure helper, unit-reasoned, colocated with `FulfillmentDialog`.

### Order state behaviour

Vendure transitions the **order** automatically when fulfillments are created/transitioned (partial → `PartiallyShipped`, full → `Shipped`; all delivered → `Delivered`). The UI does **not** manually flip order state for fulfillment; it just `refetch()`es after each mutation.

### Error handling

Every mutation result is a union. Discriminate with `__typename`/`'errorCode' in result`; on error show `dispatch(addToast({ message, type: 'error' }))`. Success shows a success toast. No `window.location.reload()` — use the existing `refetch()` from the order query.

### Permissions

Gate "Create fulfillment" and the transition buttons with `PermissionGate` using the order update/fulfillment permissions, consistent with the back-office RBAC convention used by other lists.

### Legacy tracking custom field

Keep the existing `customFields.trackingNumber` editor/display **read-only-compatible** for older orders (do not remove it). New shipping flows through fulfillments. (Decision confirmed during design: don't rip out the legacy field — existing orders depend on it.)

## Out of scope (logged deferrals)

- Returns / RMA, cancelling or editing a fulfillment after creation.
- Custom fulfillment handlers beyond `manual-fulfillment` (method + tracking code).
- Carrier API/label integration; tracking-URL deep links.
- Removing the legacy `trackingNumber` custom field and its order-state-flip path.

## Conventions (apply to all tasks)

- **No codegen / no running backend** — all operations and the fulfillments fragment already exist; codegen (if ever run) reads the checked-in `apps/backoffice/src/graphql/schema.graphql` offline.
- **Modal** uses `isOpen`/`onClose`/`title`/`size`; **Button** variants primary|secondary|danger|ghost|outline with `loading`; **Input** has `label`; **Badge** variants default|success|warning|danger|info.
- **Toasts:** `import { addToast } from '../../store/slices/uiSlice'` + `useDispatch()` → `dispatch(addToast({ message, type }))`.
- **Union results:** discriminate before treating as success (`__typename`/`errorCode`).
- **Verify each task:** `pnpm --filter @oscar/backoffice exec tsc --noEmit` + `pnpm --filter @oscar/backoffice build`, then commit. Runtime verification is deferred to `RUNTIME-VERIFICATION-runbook.md` (backend not running).

## Tasks (outline; the implementation plan expands these)

- **T1** — `FulfillmentDialog.tsx`: line-selection + qty inputs, method/tracking, `CreateFulfillment` wiring with union handling; remaining-qty helper.
- **T2** — `OrderDetail.tsx`: Fulfillments section (list + per-fulfillment transition actions via `TransitionFulfillmentToState`), "Create fulfillment" button + dialog wiring, permission gating.
- **T3** — Final `tsc --noEmit` + `build`; append a Batch 2 runtime checklist to the runbook.
