# Home / office delivery, priced per wilaya — design

**Date:** 2026-09-06 · **Status:** approved (user chose "unify both" + "push and deploy")

## Problem

Two shipping implementations exist and conflict:

- `origin/main` (deployed 2026-09-01): one delivery method (`standard-shipping`) priced from the
  `wilaya_shipping` table (69 rows, one `price`), editable in the back-office (Settings → Livraison).
- Local commit `c0d3f3e` (2026-09-03, unpushed): two delivery methods (home / courier office) priced
  from a static TypeScript table, plus storefront checkout work and a client questions document
  (`docs/business/2026-09-03-questions-client-livraison-domicile-bureau.md`) whose "default
  proposals" are still unanswered by the client.

## Decision

Unify: **two delivery methods, both priced per wilaya from the database, editable in the back-office.**
The client questions document's defaults apply until the courier grid arrives:

1. Customer picks only the mode (home or nearest courier office), never a specific office.
2. Prices are managed in the back-office as a 69 × 2 table (DZD, per parcel, tax included).
3. Both prices are shown as soon as the wilaya is chosen; home delivery is preselected.
4. A mode whose price is empty for a wilaya is not offered there.
5. The flat "Livraison standard" method is retired once the two new methods exist. Existing orders
   keep their shipping line (soft delete).
6. Web first; the mobile app is out of scope.
7. Office prices are seeded as placeholders: home price minus 100 DA (never below 0).
8. Free shipping above the channel `freeShippingThreshold` applies to both modes.

## Components

| Layer | Change |
|---|---|
| DB | `wilaya_shipping.price` becomes nullable (home price); new nullable `officePrice`. Migration seeds office placeholders. |
| Backend calculator | `wilaya-shipping-calculator` gains a `mode` argument (`home` \| `office`); returns no quote when the mode is not offered; tags quotes with `metadata.mode`. Unknown wilaya: home falls back to 500 DA, office is not offered. |
| Backend bootstrap | `ShippingSetupService` creates `home-delivery` and `office-delivery` on server start (FR/AR/EN names), then soft-deletes `standard-shipping`. Idempotent. |
| Backend bookkeeping | `OrderWilayaService` (from the local commit) copies the shipping wilaya onto the order/customer `wilaya` custom fields on `OrderPlacedEvent`. |
| Admin API | `WilayaShippingPrice { homePrice, officePrice }` (nullable Ints), `UpdateWilayaShippingPriceInput { code, homePrice, officePrice }`. |
| Shop API | Obsolete `wilayas` / `shippingCost` queries removed (nothing calls them). |
| Back-office | Settings → Livraison table gets two editable price columns; empty = not offered. Method list labels wilaya-priced methods instead of showing a 0 DA rate. |
| Storefront | Checkout keeps the merged behaviour: quotes refetched on wilaya change, sorted home-first, first quote auto-selected and re-selected when the wilaya changes; description line under each option; delivery-delay estimate. Order detail shows the delivery method name. |
| Docs | CLAUDE.md shipping section; questions document gets an "implemented with defaults" note. |

## Non-goals

Courier API integration, per-commune pricing, specific office selection, price-change history, mobile app.
