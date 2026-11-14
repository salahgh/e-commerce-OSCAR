# Cancel shipped orders — design

**Date:** 2026-11-14 · **Size:** small change (back-office only)

## Why

The shop owner clicks "Expédier" as soon as a customer confirms an order by phone, so the order leaves the
"À expédier" tab and is not forgotten. Once an order is Expédiée, the back-office no longer offers
"Annuler", so when the customer backs out afterwards he has no clean way to cancel it. His only workaround is
"Retour", which records it as a product return and skews the returns report. He accepts responsibility for
cancelling an order that may really be with the courier.

## Goals

- "Annuler" is available on **Expédiée** (`Shipped`) and **Part. expédiée** (`PartiallyShipped`) orders, with the
  same dialog and reason list as today.
- Cancelling puts every unit back in stock and counts as a **cancellation** (with its reason), not a return.

## Non-goals

- **Livrée** (`Delivered` / `PartiallyDelivered`) orders: unchanged, "Retour" only. (The COD payment is already
  marked collected at delivery, which raises a refund question this change does not address.)
- A separate "Confirmée" status or marker so he no longer needs to misuse "Expédiée". Possible follow-up.

## Anti-goals

- Stock counted twice (e.g. cancelling the shipment *and* the order — both create stock movements in Vendure).
- Shipped-then-cancelled orders showing up in the returns report.

## Constraints (verified in code)

- Vendure's default order process allows `Shipped`/`PartiallyShipped → Cancelled`
  (`node_modules/@vendure/core/dist/config/order/default-order-process.js`).
- `cancelOrder` without `lines` cancels every line. Vendure creates `Cancellation` stock movements for shipped
  units (back to stock on hand) and `Release` movements for unshipped ones, then moves the order to `Cancelled`.
  The returns feature (`order-returns.service.ts`) already relies on line cancellation on shipped orders.
- The returns report only counts cancellations whose reason starts with `"Retour — "`
  (`order/returns.ts → parseReturnReason`); ordinary cancellation reasons are not counted as returns.
- The order page's buttons come from the hard-coded `ORDER_STATUS[state].next` map in
  `apps/backoffice/src/pages/orders/OrderDetail.tsx`; "Annuler" shows when `next` includes `Cancelled`.
- The shipment card's "Marquer livré" button (`FULFILLMENT_NEXT_STATES`) is not gated on the order state.

## Approaches

1. **Unlock "Annuler" on shipped states in the back-office, using Vendure's existing `cancelOrder`.** No backend
   change, correct stock and reporting. **Chosen.**
2. Cancel through "Retour" with a special reason. Rejected: it is recorded and reported as a return.
3. Add a "Confirmée" step so "Expédiée" keeps its real meaning. Fixes the root cause (customers currently see
   "Expédiée" right after the phone call) but is a bigger change; kept as a possible follow-up.

## Design

- `OrderDetail.tsx`, `ORDER_STATUS`: add `'Cancelled'` to `next` for `Shipped` and `PartiallyShipped`.
- Cancel dialog: when the order is `Shipped`/`PartiallyShipped`, show one warning line —
  « Cette commande est marquée expédiée. Si le colis est déjà chez le livreur, utilisez plutôt « Retour ». »
  *(Claude's call: wording.)*
- Shipment card: hide the shipment transition buttons ("Marquer expédié" / "Marquer livré") when the order is
  `Cancelled`. The shipment record itself stays visible. *(Claude's call: otherwise a cancelled order still
  offers "Marquer livré".)*
- Backend: no change.
- Payment: left as it is today when a "Nouvelle" order is cancelled (the COD payment stays authorised, never
  collected). For an order paid up front, any refund is handled by hand, as today.

## Left to the builder

- Whether to move the "can be cancelled" rule into a small pure function so it can be unit-tested like
  `order-list-params.ts`.
- Verification on local dev data: cancel shipped order `#Q6VBE9ZUZHVF71FY` (`/orders/10`) → order shows
  Annulée in the Annulées tab, its variants' stock on hand goes back up, the reason appears in the cancelled
  banner, and the returns report is unchanged.
