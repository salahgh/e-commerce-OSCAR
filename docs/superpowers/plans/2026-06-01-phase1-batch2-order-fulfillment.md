# Order Fulfillment UI (Phase 1 Batch 2) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a back-office order fulfillment UI (create partial/per-line Vendure fulfillments with method + tracking, list them, and transition their state) wiring already-generated GraphQL operations.

**Architecture:** A new `FulfillmentDialog` modal (follows the existing `OrderActionDialogs` convention) creates fulfillments via `CreateFulfillmentDocument`; a new "Fulfillments" section in `OrderDetail.tsx` lists `order.fulfillments` and transitions each via `TransitionFulfillmentToStateDocument`. All state/UI lives in the back-office; no GraphQL, schema, or codegen changes.

**Tech Stack:** React 19 + Vite, Apollo Client, Redux Toolkit (toasts), TypeScript. **No test framework exists in this project** — each task is verified with `pnpm --filter @oscar/backoffice exec tsc --noEmit` + `pnpm --filter @oscar/backoffice build`; runtime verification is deferred to `RUNTIME-VERIFICATION-runbook.md`.

**Spec:** `docs/superpowers/specs/2026-06-01-phase1-batch2-order-fulfillment-design.md`

---

## File Structure

- **Create** `apps/backoffice/src/pages/orders/FulfillmentDialog.tsx` — the create-fulfillment modal + the `remainingQuantity` helper. One responsibility: turn a line/qty selection into a `CreateFulfillment` call with union handling.
- **Modify** `apps/backoffice/src/pages/orders/OrderDetail.tsx` — render the dialog, add the Fulfillments list section + per-fulfillment transition actions, and the "Create fulfillment" trigger.
- **Modify** `docs/superpowers/plans/RUNTIME-VERIFICATION-runbook.md` — append a Batch 2 fulfillment checklist.

**Deviations from spec (deliberate, documented):**
1. Fulfillment transition targets use a small hard-coded map (`Created|Pending → Shipped → Delivered`, Vendure's default fulfillment process) instead of querying `Fulfillment.nextStates`, so no fragment/codegen change is needed.
2. No `PermissionGate` wrapper — `OrderDetail`'s existing order actions (settle, refund, modify, transition) are not gated in this file; the Admin API still enforces `UpdateOrder`/fulfillment permissions server-side. Component-level gating is a separate cross-cutting RBAC concern (audit BO-7).

---

### Task 1: FulfillmentDialog component + remaining-quantity helper

**Files:**
- Create: `apps/backoffice/src/pages/orders/FulfillmentDialog.tsx`

- [ ] **Step 1: Create the file with the full component**

```tsx
import React, { useMemo, useState } from 'react';
import { useMutation } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { Modal, ModalContent, ModalFooter } from '../../components/ui/Modal';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { addToast } from '../../store/slices/uiSlice';
import { CreateFulfillmentDocument } from '../../graphql/generated/graphql';

// Minimal structural shapes taken from the AdminOrder query. Kept local so the dialog
// is not coupled to the full generated query type.
export interface FulfillmentDialogOrderLine {
  id: string;
  quantity: number;
  productVariant: { name: string; sku: string; product?: { name?: string | null } | null };
}
export interface FulfillmentDialogOrder {
  id: string;
  lines: FulfillmentDialogOrderLine[];
  fulfillments?: ReadonlyArray<{ lines: ReadonlyArray<{ orderLineId: string; quantity: number }> }> | null;
}

interface FulfillmentDialogProps {
  isOpen: boolean;
  onClose: () => void;
  order: FulfillmentDialogOrder;
  onFulfilled: () => void;
}

// Remaining fulfillable quantity for an order line = ordered minus already-fulfilled.
export function remainingQuantity(
  line: FulfillmentDialogOrderLine,
  fulfillments: FulfillmentDialogOrder['fulfillments'],
): number {
  const fulfilled = (fulfillments ?? [])
    .flatMap((f) => Array.from(f.lines))
    .filter((fl) => fl.orderLineId === line.id)
    .reduce((sum, fl) => sum + fl.quantity, 0);
  return Math.max(0, line.quantity - fulfilled);
}

export const FulfillmentDialog: React.FC<FulfillmentDialogProps> = ({
  isOpen,
  onClose,
  order,
  onFulfilled,
}) => {
  const dispatch = useDispatch();
  const [createFulfillment, { loading }] = useMutation(CreateFulfillmentDocument);
  const [method, setMethod] = useState('');
  const [trackingCode, setTrackingCode] = useState('');
  const [quantities, setQuantities] = useState<Record<string, number>>({});

  const fulfillableLines = useMemo(
    () =>
      order.lines
        .map((line) => ({ line, remaining: remainingQuantity(line, order.fulfillments) }))
        .filter((x) => x.remaining > 0),
    [order.lines, order.fulfillments],
  );

  // Effective qty for a line: explicit edit, otherwise default to the full remaining qty.
  const qtyFor = (lineId: string, remaining: number) =>
    quantities[lineId] === undefined ? remaining : quantities[lineId];

  const totalSelected = fulfillableLines.reduce(
    (sum, x) => sum + qtyFor(x.line.id, x.remaining),
    0,
  );

  const handleSubmit = async () => {
    const lines = fulfillableLines
      .map((x) => ({ orderLineId: x.line.id, quantity: qtyFor(x.line.id, x.remaining) }))
      .filter((l) => l.quantity > 0);
    if (lines.length === 0) {
      dispatch(addToast({ message: 'Sélectionnez au moins un article', type: 'warning' }));
      return;
    }
    try {
      const res = await createFulfillment({
        variables: {
          input: {
            lines,
            handler: {
              code: 'manual-fulfillment',
              arguments: [
                { name: 'method', value: method },
                { name: 'trackingCode', value: trackingCode },
              ],
            },
          },
        },
      });
      const result = res.data?.addFulfillmentToOrder;
      if (result && result.__typename === 'Fulfillment') {
        dispatch(addToast({ message: 'Expédition créée', type: 'success' }));
        onFulfilled();
        onClose();
      } else {
        dispatch(
          addToast({
            message: (result as { message?: string } | undefined)?.message ||
              'Échec de la création de l’expédition',
            type: 'error',
          }),
        );
      }
    } catch (err: any) {
      dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Créer une expédition" size="lg">
      <ModalContent className="space-y-4">
        {fulfillableLines.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            Tous les articles ont déjà été expédiés.
          </p>
        ) : (
          <div className="space-y-3">
            {fulfillableLines.map(({ line, remaining }) => (
              <div key={line.id} className="flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">
                    {line.productVariant.product?.name || line.productVariant.name}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {line.productVariant.sku} · {remaining} restant(s) sur {line.quantity}
                  </p>
                </div>
                <Input
                  type="number"
                  min={0}
                  max={remaining}
                  value={qtyFor(line.id, remaining)}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value || '0', 10);
                    const v = Number.isNaN(parsed) ? 0 : Math.max(0, Math.min(remaining, parsed));
                    setQuantities((q) => ({ ...q, [line.id]: v }));
                  }}
                  className="w-24"
                />
              </div>
            ))}
            <Input
              label="Méthode / Transporteur"
              value={method}
              onChange={(e) => setMethod(e.target.value)}
              placeholder="Yalidine, ZR Express…"
            />
            <Input
              label="Numéro de suivi"
              value={trackingCode}
              onChange={(e) => setTrackingCode(e.target.value)}
            />
          </div>
        )}
      </ModalContent>
      <ModalFooter>
        <Button variant="secondary" onClick={onClose}>
          Annuler
        </Button>
        <Button variant="primary" onClick={handleSubmit} loading={loading} disabled={totalSelected === 0}>
          Créer l’expédition
        </Button>
      </ModalFooter>
    </Modal>
  );
};
```

- [ ] **Step 2: Type-check**

Run: `pnpm --filter @oscar/backoffice exec tsc --noEmit`
Expected: exit 0. If `Input` rejects `type`/`min`/`max`/`placeholder`, check its prop type at `apps/backoffice/src/components/ui/Input.tsx` and pass supported equivalents (it forwards native input props in this codebase). If the `result.__typename` comparison errors, confirm `CreateFulfillmentMutation`'s `addFulfillmentToOrder` union includes `'Fulfillment'` (it does — see `graphql/generated/graphql.ts`).

- [ ] **Step 3: Commit**

```bash
git add apps/backoffice/src/pages/orders/FulfillmentDialog.tsx
git commit -m "feat(backoffice): fulfillment create dialog (Batch 2 T1)"
```

---

### Task 2: Fulfillments section + wiring in OrderDetail

**Files:**
- Modify: `apps/backoffice/src/pages/orders/OrderDetail.tsx`

- [ ] **Step 1: Add imports**

Near the other dialog import (`import { RefundDialog, ManualPaymentDialog, ModifyOrderDialog } from './OrderActionDialogs';`, ~line 46) add:

```tsx
import { FulfillmentDialog } from './FulfillmentDialog';
import { TransitionFulfillmentToStateDocument } from '../../graphql/generated/graphql';
```

- [ ] **Step 2: Add the next-state map (module scope, near the top-level consts like `ORDER_FLOW`)**

```tsx
// Vendure's default fulfillment process. Used to render transition buttons without
// selecting Fulfillment.nextStates in the order fragment.
const FULFILLMENT_NEXT_STATES: Record<string, string[]> = {
  Created: ['Shipped'],
  Pending: ['Shipped'],
  Shipped: ['Delivered'],
};
```

- [ ] **Step 3: Add component state + the transition mutation/handler**

Inside the `OrderDetail` component, near the other `useState`/`useMutation` declarations (~line 171-197):

```tsx
const [showFulfillmentDialog, setShowFulfillmentDialog] = useState(false);
const [transitionFulfillment] = useMutation(TransitionFulfillmentToStateDocument);

const handleTransitionFulfillment = async (id: string, state: string) => {
  try {
    const res = await transitionFulfillment({ variables: { id, state } });
    const result = res.data?.transitionFulfillmentToState;
    if (result && result.__typename === 'Fulfillment') {
      dispatch(addToast({ message: `Expédition: ${state}`, type: 'success' }));
      refetch();
    } else {
      dispatch(
        addToast({
          message: (result as { message?: string } | undefined)?.message ||
            'Échec de la transition',
          type: 'error',
        }),
      );
    }
  } catch (err: any) {
    dispatch(addToast({ message: err.message || 'Erreur', type: 'error' }));
  }
};
```

- [ ] **Step 4: Add the Fulfillments section in the JSX**

Immediately after the existing "Shipping / Tracking" card (`{/* Shipping / Tracking */}`, ~line 1171) insert:

```tsx
{/* Fulfillments */}
<div className="bg-card rounded-lg border border-border p-6">
  <div className="flex items-center justify-between mb-4">
    <h3 className="text-lg font-semibold text-foreground">Expéditions</h3>
    {['PaymentSettled', 'PartiallyShipped'].includes(order.state) && (
      <Button variant="primary" size="sm" onClick={() => setShowFulfillmentDialog(true)}>
        Créer une expédition
      </Button>
    )}
  </div>

  {(!order.fulfillments || order.fulfillments.length === 0) ? (
    <p className="text-sm text-muted-foreground">Aucune expédition pour cette commande.</p>
  ) : (
    <div className="space-y-3">
      {order.fulfillments.map((f) => (
        <div key={f.id} className="flex items-center justify-between gap-3 rounded-md border border-border p-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <Badge variant="info">{f.state}</Badge>
              {f.method && <span className="text-sm text-foreground">{f.method}</span>}
            </div>
            {f.trackingCode && (
              <p className="text-xs text-muted-foreground mt-1">Suivi: {f.trackingCode}</p>
            )}
            <p className="text-xs text-muted-foreground mt-1">
              {f.lines.reduce((n, l) => n + l.quantity, 0)} article(s)
            </p>
          </div>
          <div className="flex gap-2">
            {(FULFILLMENT_NEXT_STATES[f.state] ?? []).map((next) => (
              <Button
                key={next}
                variant="secondary"
                size="sm"
                onClick={() => handleTransitionFulfillment(f.id, next)}
              >
                {next === 'Shipped' ? 'Marquer expédié' : next === 'Delivered' ? 'Marquer livré' : next}
              </Button>
            ))}
          </div>
        </div>
      ))}
    </div>
  )}
</div>
```

> Note: confirm `Badge` is already imported in `OrderDetail.tsx` (it is used elsewhere); if not, add `import { Badge } from '../../components/ui/Badge';`. Use the same card class names as the neighbouring sections if they differ from `bg-card rounded-lg border border-border p-6`.

- [ ] **Step 5: Render the dialog alongside the other dialogs**

Near where `RefundDialog`/`ModifyOrderDialog` are rendered (bottom of the component's JSX), add:

```tsx
<FulfillmentDialog
  isOpen={showFulfillmentDialog}
  onClose={() => setShowFulfillmentDialog(false)}
  order={order}
  onFulfilled={() => refetch()}
/>
```

- [ ] **Step 6: Type-check + build**

Run: `pnpm --filter @oscar/backoffice exec tsc --noEmit`
Expected: exit 0. If passing `order` to `FulfillmentDialog` errors on structural mismatch, the order from `AdminOrderDocument` already provides `id`, `lines[].{id,quantity,productVariant.{name,sku,product.name}}`, and `fulfillments[].lines[].{orderLineId,quantity}` — matching `FulfillmentDialogOrder`. If a nullability mismatch remains, widen the prop field (e.g. make `product` optional) rather than casting.

Run: `pnpm --filter @oscar/backoffice build`
Expected: build succeeds.

- [ ] **Step 7: Commit**

```bash
git add apps/backoffice/src/pages/orders/OrderDetail.tsx
git commit -m "feat(backoffice): fulfillments section + transitions in order detail (Batch 2 T2)"
```

---

### Task 3: Final verification + runtime checklist

**Files:**
- Modify: `docs/superpowers/plans/RUNTIME-VERIFICATION-runbook.md`

- [ ] **Step 1: Full type-check + build**

Run: `pnpm --filter @oscar/backoffice exec tsc --noEmit && pnpm --filter @oscar/backoffice build`
Expected: both succeed (exit 0).

- [ ] **Step 2: Append a Batch 2 checklist section to the runbook**

Add this section to `RUNTIME-VERIFICATION-runbook.md` (after the Batch 3 section):

```markdown
## Batch 2 — order fulfillment (back-office)

On an order in `PaymentSettled` (back-office `:5173` → Orders → open one):
1. "Créer une expédition" opens the dialog; lines show remaining qty (= ordered − fulfilled).
2. Fulfill a SUBSET (lower one line's qty) + method + tracking → order becomes `PartiallyShipped`,
   a fulfillment appears with state `Pending/Created`, tracking + method shown.
3. Create a second fulfillment for the rest → order becomes `Shipped`.
4. On a fulfillment, "Marquer expédié" → `Shipped`, then "Marquer livré" → `Delivered`;
   order reaches `Delivered`. Toasts show on success; union errors show as error toasts.
5. The legacy tracking-number field still displays for older orders (unchanged).
```

- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/plans/RUNTIME-VERIFICATION-runbook.md
git commit -m "docs: Batch 2 fulfillment runtime checklist (Batch 2 T3)"
```

---

## Self-Review

- **Spec coverage:** create fulfillment (T1) ✓; partial/per-line via per-line qty inputs (T1) ✓; method + tracking (T1) ✓; list fulfillments (T2) ✓; transition state (T2) ✓; union error handling (T1+T2) ✓; "create" trigger gated on order state + remaining qty (T2) ✓; legacy tracking kept (untouched) ✓; verification via tsc/build + runbook checklist (T3) ✓. Permission gating and `nextStates` are intentional documented deviations.
- **Placeholder scan:** none — full code in every code step.
- **Type consistency:** `remainingQuantity`, `FulfillmentDialogOrder`, `CreateFulfillmentDocument` (vars `{ input }`, result `addFulfillmentToOrder` union with `__typename`), `TransitionFulfillmentToStateDocument` (vars `{ id, state }`, result `transitionFulfillmentToState` union) all match the generated documents verified in `graphql/generated/graphql.ts`. `FULFILLMENT_NEXT_STATES` keys match Vendure fulfillment states used in the transition handler.
