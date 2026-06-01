# Runtime Verification Runbook

Consolidated steps to runtime-verify the recent work (Phase 1 Batch 1, Batch 3, and the BE-1
shop-API fix). The codebase is verified statically (type-checks pass); this runbook covers the
**live** verification that needs a running backend + database.

## Status / blocker

Runtime verification is **blocked on a PostgreSQL instance.** As of this writing there is no
Postgres on `localhost:5432`, no Docker available, and the backend is not running on `:8085`.
A dev `apps/backend/.env` has been generated (gitignored) so the **only** missing piece is a
running Postgres whose credentials match that file (`DB_USERNAME=postgres`, `DB_PASSWORD=postgres`,
`DB_NAME=oscar_vendure`). Adjust `.env` if your local Postgres differs.

## 1. Bring up the stack

```bash
# a) Start a PostgreSQL 16 (any one of these)
#    - Local install, OR
#    - Managed (Neon / Supabase / Railway) — then update apps/backend/.env DB_* accordingly, OR
#    - Docker (if installed):
#        docker run --name oscar-pg -e POSTGRES_PASSWORD=postgres -e POSTGRES_DB=oscar_vendure -p 5432:5432 -d postgres:16

# b) Create schema + seed data
pnpm --filter @oscar/backend migration:run
pnpm --filter @oscar/backend populate

# c) Run the apps
pnpm dev:backend     # Vendure  -> http://localhost:8085 (admin-api + shop-api)
pnpm dev:frontend    # Next.js  -> http://localhost:3000
pnpm dev:backoffice  # Vite     -> http://localhost:5173
```

## 2. BE-1 — shop-API no longer 500s (new; not in the per-batch checklists)

Before the fix these four operations threw `column ... does not exist`. Verify each returns 200
with data (no 500). Against `http://localhost:8085/shop-api`:

```graphql
query  { featuredProducts(take: 4) { id name featuredAsset { preview } } }
query  { popularProducts(take: 4) { id name } }
query  { searchProductsMultilingual(keyword: "shirt", take: 5) { totalItems items { id name } } }
mutation { trackProductView(productId: "1") }   # returns true, no error
```

Expected: `featuredProducts` returns enabled products that have a featured image; `popularProducts`
returns recent enabled products; `searchProductsMultilingual` matches the term across fr/ar/en
native translations; `trackProductView` returns `true` (no-op — view tracking is deferred).

Also confirm the home page (`/`) and search (`/search`) render products — they use the standard
`products`/`search` queries, which were never broken.

## 3. Batch 1 — back-office Settings CRUD

Run the checklist in `2026-05-31-phase1-batch1-runtime-checklist.md` against the back-office
(`:5173` → Settings): tax categories/rates, zones + members, channels, and shipping/payment
method create flows (create / edit / delete each, confirm toasts + list refresh, no reload).

## 4. Batch 3 — checkout billing

Run the checklist in `2026-05-31-phase1-batch3-checkout-billing.md` /
`2026-05-31-phase1-batch3-runtime-checklist.md` on the storefront (`:3000` → checkout): the billing
step, "billing same as shipping" toggle, validation, `setOrderBillingAddress` wiring, and billing
display in the order review.

## 4b. Batch 2 — order fulfillment (back-office)

On an order in `PaymentSettled` (back-office `:5173` → Orders → open one):
1. "Créer une expédition" opens the dialog; lines show remaining qty (= ordered − fulfilled).
2. Fulfill a SUBSET (lower one line's qty) + method + tracking → order becomes `PartiallyShipped`,
   a fulfillment appears with state `Pending/Created`, tracking + method shown.
3. Create a second fulfillment for the rest → order becomes `Shipped`.
4. On a fulfillment, "Marquer expédié" → `Shipped`, then "Marquer livré" → `Delivered`;
   order reaches `Delivered`. Toasts show on success; union errors show as error toasts.
5. The legacy tracking-number field still displays for older orders (unchanged).

## 5. Smoke the integrated frontend refactor (from the main merge)

The recent `origin/main` merge brought a design-system refactor (new fonts, component-based home,
forced light theme). Smoke-check: home renders the new `HomePageContent`, the cart and PDP pages
render, locale switch (fr/ar/en) works, and Arabic RTL is applied.
