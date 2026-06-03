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

## 6. M1c — Offline-first cache + optimistic cart (mobile `apps/mobile`)

These cannot be unit-tested (native AppState/launch + Apollo write timing). Run on a device/emulator:

1. **Cold-start read survival:** Browse a few products, add to cart, send the app to the
   background (so AppState persists), then fully close it. Enable airplane mode and relaunch —
   the storefront and cart render from cache before any spinner/network.
2. **Optimistic add/adjust/remove:** With normal connectivity, add to cart / change a quantity /
   remove a line — the cart UI updates instantly (before the server responds), then totals
   reconcile to the server amount.
3. **Stock rollback:** Adjust a line above available stock → the optimistic bump appears, then
   rolls back when `InsufficientStockError` returns, and an error is surfaced.
4. **First-ever add:** From an empty session (no active order), add one item — the line appears
   and survives a refetch (proves the `writeQuery` link replaced `refetchQueries`).
5. **Logout hygiene:** Log out, then relaunch — the cart/storefront start clean (purged).

## 7. M3d + M3e — Mobile dark mode & brand-font sweep (mobile `apps/mobile`)

Both sweeps are statically verified (tsc 155 / lint 0 / 104 tests) but their **appearance** can only be confirmed on a device. One pass checks both: toggle dark, switch to Arabic, and sweep the screens. No backend needed for the UI itself (though product/cart data needs the shop-API from §1).

### Setup
```bash
cd apps/mobile && npx expo start    # then open in Expo Go / a simulator
```
- **Dark mode:** Profile → Settings → Theme → toggle **Dark** (also try **System** with the OS in dark). The global chrome (status bar, nav) flips via `NavigationThemeBridge`.
- **Arabic + RTL:** Profile → Settings → Language → **العربية**. The app applies `dir=rtl` and reloads.
- Verify in **all three** language states: `fr` (default) and `en` should render in **Gabarito**; `ar` in **IBM Plex Sans Arabic**.

### What to confirm per screen (sweep each area)
For **dark**: page = near-black `#121212`, cards/sheets are *lighter* than the page (`#1E1E1E`), text is off-white, nothing stays light-on-light or dark-on-dark. For **fonts**: every label uses the brand font for the locale (no system-font fallback — Arabic should look like IBM Plex, not the OS default); weights look right (headings heavier than body).

| Area (slice) | Dark check | Font check (esp. `ar`) |
|---|---|---|
| Tabs + tab bar, Home (M3d-2/M3e-2) | tab bar, cart badge, home rows flip | tab labels, section headers, product cards |
| Products: PDP, listing, sheets (M3d-3/M3e-3) | PDP, filter/sort/size sheets, search bar | name/price/desc, size-guide table cells |
| Checkout: steps, summary, address (M3d-4/M3e-4) | step indicator, order summary, wilaya picker | step labels, totals, address forms |
| Auth (M3d-5/M3e-5) | login/register/verify/forgot screens | titles, inputs, helper text |
| Orders: tab + detail (M3d-2,6/M3e-2,8) | order rows, status pills, detail timeline | order #, dates, status, section titles |
| Profile + Info (M3d-8/M3e-6,7) | settings, edit, wishlist; contact/faq/size-guide | settings rows, FAQ Q/A, info paragraphs |
| Cart: rows, mini-cart, swipe (M3d-11/M3e-8) | item rows, mini-cart sheet, swipe-delete | item names, prices, quantity, subtotal |
| Shared UI: buttons/inputs/badges/modals/toasts (M3d-10/M3e-1) | exercise each primitive | button/chip/empty/error labels |
| Onboarding / splash / error boundary (M3d-9) | slides, splash, trigger an error | error-boundary title/message/buttons |

### Edge cases to specifically confirm (the sweep's judgment calls)
- **Always-dark surfaces stay dark** in *light* mode too: the PDP image lightbox and "Out of Stock" overlay use `colors.white` (not `text.inverse`), so they must NOT flip to dark text.
- **verify-phone error banner** (Auth → phone verify, trigger an error): in dark, the banner border is now a **muted brick-red `#7A3333`** (was a bright pink) on the dark red `errorLight` bg — confirm it reads as a subtle border, not a glaring hairline.
- **Selected states** (Select dropdown option, size/variant chip in VariantPicker): the selected background is `secondaryLight` (`#3D3517` dark) — confirm the selected item is distinguishable from unselected.
- **Kept-fixed decoratives**: onboarding's `#2C3E50` slide background, checkout confetti, the gold review star (`#F2C94C`) — these intentionally do NOT theme; confirm they look right in both modes.
- **Emoji stay emoji** (NOT brand-font-wrapped): Settings language/theme flags (🇫🇷🇬🇧🇩🇿), ErrorState ⚠️/❌ — confirm they render as emoji glyphs.
- **RTL** (`ar`): rows, back-arrows, and alignment mirror correctly; the brand Arabic font renders throughout.

### Known NOT-themed / NOT-wired (excluded — not bugs)
The 8 dead components (`components/orders` ×3, `components/navigation` ×2, `components/home` ×3 — unreachable, no screen imports them) and the 5 deferred payment surfaces (`app/payment/*`, `PaymentWebView`, `PaymentMethodSelector` — gated "coming soon", COD-only) are intentionally excluded from both sweeps. If reached, they may show light surfaces / system-font text — that's expected, pending the dead-code decision + the real CIB/BaridiMob gateway work.
