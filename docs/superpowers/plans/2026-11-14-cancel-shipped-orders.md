# Cancel Shipped Orders Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let staff cancel orders in the Expédiée / Part. expédiée states from the back-office order page.

**Architecture:** Back-office only. Two small pure rules (warning text, shipment-action gating) live in a new
module with unit tests; `OrderDetail.tsx` adds `Cancelled` to the shipped states' `next` lists and uses the
rules. Cancelling still goes through Vendure's existing `cancelOrder` mutation (no `lines` → whole order), which
already restocks shipped units and moves the order to `Cancelled`.

**Tech Stack:** React 19 + TypeScript (Vite), Apollo Client, Vendure 3.5 admin-api, `node:test` unit tests.

**Spec:** `docs/superpowers/specs/2026-11-14-cancel-shipped-orders-design.md`

## Global Constraints

- No backend change. No new GraphQL operation: reuse `CancelOrderDocument` exactly as `handleCancelOrder` calls it today.
- Shipped states that become cancellable: `Shipped`, `PartiallyShipped` only. `PartiallyDelivered` / `Delivered` stay unchanged.
- Warning copy (exact): `Cette commande est marquée expédiée. Si le colis est déjà chez le livreur, utilisez plutôt « Retour ».`
- Never cancel the shipment (fulfillment) as well: Vendure would create a second set of stock movements.
- Work on a branch `feat/cancel-shipped-orders` (the checkout is on `main`); commit only with the user's OK.

## Review Focus

1. **Shipped order whose parcel really is with the courier** — cancel still succeeds and restocks; the dialog shows the warning first (Task 2, step 4).
2. **Cancelled order's shipment card** — no "Marquer livré" / "Marquer expédié" button remains (Task 1 test `shipment actions hidden once the order is cancelled`; Task 2, step 4).
3. **Returns report** — a shipped-then-cancelled order must not appear in Rapports → returns (Task 2, step 5).
4. **Stock** — each unit of the cancelled order comes back exactly once (Task 2, step 3 vs step 5).
5. **Delivered orders** — still no "Annuler" button (Task 1 test `no warning for other states`; Task 2, step 6).

---

### Task 1: Cancel rules module

**Files:**
- Create: `apps/backoffice/src/pages/orders/order-cancel-rules.ts`
- Test: `apps/backoffice/src/pages/orders/order-cancel-rules.test.ts`

**Interfaces:**
- Produces:
  - `export const SHIPPED_CANCEL_WARNING: string` — the exact warning copy from Global Constraints.
  - `export function shippedCancelWarning(orderState: string): string | null` — `SHIPPED_CANCEL_WARNING` for `Shipped` / `PartiallyShipped`, else `null`.
  - `export function shipmentActionsAllowed(orderState: string): boolean` — `false` only for `Cancelled`.

- [ ] **Step 1: Write the failing tests** (same style as `order-list-params.test.ts`: `node:test` + `node:assert/strict`)

```ts
test('warning for orders marked shipped', () => {
  assert.equal(shippedCancelWarning('Shipped'), SHIPPED_CANCEL_WARNING);
  assert.equal(shippedCancelWarning('PartiallyShipped'), SHIPPED_CANCEL_WARNING);
  assert.equal(
    SHIPPED_CANCEL_WARNING,
    'Cette commande est marquée expédiée. Si le colis est déjà chez le livreur, utilisez plutôt « Retour ».',
  );
});

test('no warning for other states', () => {
  for (const s of ['PaymentAuthorized', 'PaymentSettled', 'ArrangingPayment', 'Delivered', 'PartiallyDelivered', 'Cancelled']) {
    assert.equal(shippedCancelWarning(s), null, s);
  }
});

test('shipment actions hidden once the order is cancelled', () => {
  assert.equal(shipmentActionsAllowed('Cancelled'), false);
  for (const s of ['PaymentAuthorized', 'PaymentSettled', 'PartiallyShipped', 'Shipped', 'PartiallyDelivered']) {
    assert.equal(shipmentActionsAllowed(s), true, s);
  }
});
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `pnpm --filter @oscar/backoffice test:unit`
Expected: FAIL — cannot find module `./order-cancel-rules`.

- [ ] **Step 3: Implement the three exports in `order-cancel-rules.ts`**

Pure TypeScript, no React or Apollo imports (the test runner loads it directly). Top comment: one line on why
shipped orders are cancellable (staff mark orders shipped once confirmed by phone).

- [ ] **Step 4: Run tests to verify they pass**

Run: `pnpm --filter @oscar/backoffice test:unit`
Expected: all tests PASS, including the existing suites.

- [ ] **Step 5: Commit**

```bash
git add apps/backoffice/src/pages/orders/order-cancel-rules.ts apps/backoffice/src/pages/orders/order-cancel-rules.test.ts
git commit -m "feat(orders): rules for cancelling orders marked shipped"
```

---

### Task 2: Wire the order page

**Files:**
- Modify: `apps/backoffice/src/pages/orders/OrderDetail.tsx` — `ORDER_STATUS` (≈ lines 127-142), shipment card buttons (≈ lines 1427-1442), cancel `ConfirmDialog` message (≈ lines 1547-1551), imports.

**Interfaces:**
- Consumes: `shippedCancelWarning(orderState: string): string | null`, `shipmentActionsAllowed(orderState: string): boolean` from `./order-cancel-rules`.

- [ ] **Step 1: Edit `OrderDetail.tsx`**

  - `ORDER_STATUS.PartiallyShipped.next` → `['Shipped', 'PartiallyDelivered', 'Cancelled']`;
    `ORDER_STATUS.Shipped.next` → `['PartiallyDelivered', 'Delivered', 'Cancelled']`. Nothing else in the header
    changes: `nextStates.includes('Cancelled')` already renders "Annuler" and the existing dialog.
  - Cancel dialog `message`: right after the « Êtes-vous sûr… » paragraph, render `shippedCancelWarning(order.state)`
    in a `<p>` when non-null, styled as a warning with the classes already used for warning states in this file
    (`text-yellow-400`).
  - Shipment card: render the `FULFILLMENT_NEXT_STATES[f.state]` buttons only when `shipmentActionsAllowed(order.state)`.

- [ ] **Step 2: Type-check and unit tests**

Run: `pnpm --filter @oscar/backoffice exec tsc -b` then `pnpm --filter @oscar/backoffice test:unit`
Expected: no TypeScript errors; all tests PASS.

- [ ] **Step 3: Record stock before cancelling (local dev data)**

With backend (`:8085`) and back-office (`:5173`) running and logged in, note the stock on hand of the variants in
local order `#Q6VBE9ZUZHVF71FY` (`/orders/10`, state Expédiée) — via the admin-api, e.g. from the logged-in
browser session:

```graphql
query { order(id: "10") { state lines { quantity productVariant { sku stockLevels { stockOnHand stockAllocated } } } } }
```

Also note the current figures on Rapports → returns.

- [ ] **Step 4: Cancel in the browser**

Open `/orders/10`. Expected: header shows **Partiellement livré**, **Livré**, **Annuler**, **Retour**. Click
**Annuler** → the dialog shows the warning line. Pick « Annulée à la demande du client » and confirm. Expected:
toast « Commande annulée », Annulé badge, cancelled banner with the reason, shipment card without
"Marquer livré".

- [ ] **Step 5: Check stock and reports**

Re-run the step-3 query. Expected: `state: "Cancelled"`; each variant's `stockOnHand` is up by exactly the line
quantity versus step 3. The order is listed in the **Annulées** tab, not in **Expédiées**. Rapports → returns
figures are unchanged.

- [ ] **Step 6: Check unchanged states**

Open `/orders/9` (Livrée). Expected: no "Annuler" button (only **Retour**). Open `/orders/11` (Nouvelle).
Expected: **Annuler** and **Modifier** as before, and the cancel dialog has no warning line (close it without
confirming).

- [ ] **Step 7: Commit**

```bash
git add apps/backoffice/src/pages/orders/OrderDetail.tsx
git commit -m "feat(orders): allow cancelling orders marked shipped"
```
