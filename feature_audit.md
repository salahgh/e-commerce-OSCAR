# OSCAR Fashion — Project Audit

> Status: **documentation only — to be implemented later.**
> Date: 2026-05-31. Scope: whole-codebase, **mobile (`apps/mobile`) excluded**.
> Method: static review by parallel reviewers. Findings have **not** been verified against a running build/test suite — confirm root cause before changing code.

This document contains two complementary audits:

1. [Feature Audit](#part-1--feature-audit) — what features exist and how complete they are (by user journey).
2. [Code Quality / Bug Audit](#part-2--code-quality--bug-audit) — correctness, architecture, and performance issues (by app).

---

# Part 1 — Feature Audit

Mapped across four journeys: Browse & PDP, Cart/Checkout/Payments, Accounts/Orders/Content, and Back-Office Admin.

## Feature-readiness scorecard

| Journey | Readiness | One-line verdict |
|---|---|---|
| **Back-office admin** | 🟢 ~85% | Most complete area — real data, real CRUD across products/orders/customers/RBAC/promotions. Config tabs are the soft spots. |
| **Accounts & orders** | 🟡 ~70% | Auth + profile + address book + order history genuinely complete. Engagement features (wishlist, newsletter, contact) are stubs. |
| **Cart & checkout** | 🟠 ~55% | UI layer fully built and polished, but the money core is mocked — no real payment capture, no shipping methods seeded. |
| **Browse & PDP** | 🟠 ~60% | Search/facets/catalog are production-grade, but the home page shows no products and the PDP has no working merchandising. |

## 🚨 Launch-blocking gaps (cross-cutting)

1. **No real payment processing — the single biggest blocker.** All three handlers auto-authorize. CIB (`apps/backend/.../payment/cib-payment-handler.ts:54-88`) and Baridimob (`baridimob-payment-handler.ts:54-98`) return a fabricated `Authorized` + fake transaction ID in *both* test and "production" branches — no SATIM/BaridiMob API call, no redirect, no webhook, **no money captured**. COD auto-auth is acceptable by design. Plus a **payment-code mismatch**: frontend default uses `code:'cib-card'` (`PaymentMethodForm.tsx:35`) while the backend handler is `'cib'` — CIB selection breaks whenever the eligible-methods query is empty.

2. **No shipping methods seeded.** Neither `populate.ts` nor `seed-initial.ts` creates any Vendure ShippingMethod, so `eligibleShippingMethods` is empty out of the box — checkout step 2 has nothing to select. The wilaya-zone pricing (`shippingZonePrices`) is **frontend display-only** and never reaches the backend order total. No calculator ties wilaya → zone → price server-side.

3. **The home page shows zero real products.** Backend resolvers (`featuredProducts`, `newArrivals`, `popularProducts` in `oscar-shop.resolver.ts:9-31`) exist but the frontend never calls them. The home page (`(shop)/page.tsx`) is a static gradient hero + 4 hardcoded category tiles that all link to `/products`.

4. **Header search is broken.** `Header.tsx:27-34` routes to `/products?q=…`, but the products page never reads `q` — the term is silently dropped. The real search lives at `/search` (which is complete, with autocomplete and facets).

5. **Email/SMS confirmations are dev-only.** `EmailPlugin devMode:true` (`vendure-config.ts:168`) means no emails are sent, yet the order-confirmation UI promises "email + SMS." No SMS integration exists. Combined with the synthetic `+213…@phone.dz` identity used for registration, "check your email" messaging is inaccurate and there's no email-based recovery.

## "Built but not wired" — dead code already paid for

Cheap wins — the work exists, it just needs connecting:

- **PDP merchandising (frontend)** — `RelatedProducts.tsx`, `RecentlyViewed.tsx` (+ `useRecentlyViewed`), `ImageZoom.tsx`, `SocialShare.tsx` are all built but only referenced from an unused `dynamic-imports.tsx`. The PDP shows none of them. The backend `trackProductView` mutation is never called.
- **Order fulfillment (back-office)** — `CreateFulfillment` / `TransitionFulfillmentToState` operations defined (`orders.graphql:247,446`) but no UI uses them. Shipping is a single order-state flip with a tracking number stored as a custom field — no partial/per-line shipments.
- **Saved addresses at checkout** — `ShippingAddressForm.tsx:125` renders a saved-address picker, but `savedAddresses` is never passed in (always `[]`), and "save this address" has no mutation.
- **Price filter** — full UI in `FacetPriceRange.tsx`, adds filter pills, but `useFacetedSearch.ts:129` explicitly never applies it to the query. Purely cosmetic.

## Entirely missing features (expected for a fashion store)

- **Wishlist / favorites** — no route, page, persistence, or GraphQL op, despite three UI entry points (header icon, product-card heart, user sidebar `/user/wishlist`). All 404 / no-op.
- **Product reviews & ratings** — PDP placeholder only ("Les avis seront affichés ici prochainement"); no backend entity.
- **Reorder, invoice download, contact-support** — dead buttons on order detail (`orders/[id]/page.tsx:367-376`).
- **Newsletter & contact form** — both faked (contact `handleSubmit` is a `setTimeout`; newsletter is a bare input with no handler). No backend resolver for either.
- **`/user/settings`** — linked in sidebar, no page.
- **"Featured product" flag** — deliberately removed (`products.graphql:740`); "featured" now means featured *image* only, so storefront can't curate featured products.

## Two systemic issues

- **i18n is shallow despite the trilingual promise.** Only `HomePage`, `Common`, and `auth` namespaces are translated. The entire account area, order pages, all 9 static pages, footer, contact, and product-card strings are **hardcoded French** — Arabic/English visitors see French. Product *content* localization is also broken: Apollo sends `navigator.language` (browser, not app locale) and the PDP server fetch sends no `Accept-Language` at all (`[slug]/page.tsx:104`), so product name/description ignore the locale switcher.
- **Broken links / 404s from route-scheme mismatches.** Header nav → `/promotions`, `/help`, `/wishlist` (don't exist). Footer → `/terms`, `/privacy`, `/cookies` (real content is at `/legal/terms`, `/legal/privacy`) plus `/men`, `/women`, `/blog`, `/stores`. PDP breadcrumb/JSON-LD use `/collections/...` while the UI links `/products?collection=...`. Category detail page hardcodes Moroccan **MAD** currency (`categories/[slug]/page.tsx:17-19`) — wrong market.

## What's genuinely solid

- **Back-office** is the strongest part — real dashboard service, full product/order/customer/RBAC/promotion/facet/collection/asset management, CSV reports, order refunds/modifications/notes.
- Storefront **search + faceted discovery + category browse** are production-quality.
- **Cart + multi-step checkout UI** is well-built (mini-cart, coupons, guest checkout, wilaya/commune entry, confirmation page).
- **Auth + account + order history** are complete, backed by real Vendure operations. Coupons and the collection-discount promotion work end-to-end.

## Detailed feature inventories

### Browse & PDP

| Feature | Status | Evidence | Gap note |
|---|---|---|---|
| Home: hero section | Stub | `(shop)/page.tsx:48-68` | Static gradient, hardcoded FR copy, both CTAs → `/products`. |
| Home: featured / popular / new arrivals | Missing | backend `oscar-shop.resolver.ts:9-31` exists; frontend never calls | Home renders zero real products. |
| Home: category preview tiles | Stub | `(shop)/page.tsx:94-108` | 4 hardcoded names, all → `/products`, no images, not from collections API. |
| Product catalog/listing grid | Complete | `products/page.tsx:255-265,419-437` | Real query, grid + compact toggle, skeletons, empty/error states. |
| Catalog pagination / infinite scroll | Partial | `products/page.tsx:283-322` | Works, but Apollo `products` typePolicy merge (`apollo-client.ts:52-67`) written for Relay `edges`/`offset` while query returns `items`/`skip`. |
| Catalog sorting | Missing (on /products) | no sort control imported | Sorting only on /search. |
| Catalog in-page search box | Stub | `products/page.tsx:276-280` | Client-side `filter()` over loaded page only; ignores backend + URL `?q=`. |
| Faceted filters — size & color | Complete | `useFacetedSearch.ts:122-127`, `facet-utils.ts:46-71` | Auto-detected by code (EN/FR/AR); OR-within/AND-between correct. |
| Faceted filters — category | Partial | `useFacetedSearch.ts:117-119` | Wired in hook, no UI control surfaced; URL param only. |
| Faceted filters — price range | Stub | `FacetPriceRange.tsx:16-40`; `useFacetedSearch.ts:129` | Never added to query — cosmetic. |
| Active filter pills / clear | Complete | `search/page.tsx:313-331` | Remove individual / clear-all functional. |
| Mobile filter drawer | Complete | `search/page.tsx:541-553` | Fully wired. |
| Search results page | Complete | `search/page.tsx`, `SearchProductsWithFacets` | Real index query, grid, pagination, facets, sorting. |
| Search autocomplete/suggestions | Complete | `search/page.tsx:32-54,201-292` | Debounced, thumbnails, popular-searches fallback. |
| Header search | Stub | `Header.tsx:27-34` | Routes to `/products?q=` which ignores `q`. Should target `/search`. |
| Header nav links | Partial | `Header.tsx:36-42,52,111` | `/promotions`, `/help`, `/wishlist` 404. |
| Collections / categories landing | Complete | `categories/page.tsx` | Root collections + popular subcategories, real data. |
| Category detail + product list | Partial | `categories/[slug]/page.tsx` | Works, but hardcoded `'MAD'`/`'fr-MA'` (Morocco) currency (17-19,47); add-to-cart/wishlist are `// TODO` no-ops (76,102). |
| PDP: image gallery | Complete | `ProductDetailClient.tsx:148-199` | Multi-image, thumbnails, prev/next. |
| PDP: image zoom | Missing (on PDP) | `ImageZoom.tsx` unused | Gallery has no zoom; component is dead code. |
| PDP: variant / option selection | Complete* | `ProductDetailClient.tsx:111-124,217-239` | *See quality audit FE-8: multi-axis selection has a correctness bug. |
| PDP: stock / availability | Complete | `ProductDetailClient.tsx:241-254` | IN/LOW/OUT states; add-to-cart disabled on OOS. |
| PDP: price display | Partial | `ProductDetailClient.tsx:103-109,206-208` | No discount/compare-at/sale display. |
| PDP: add to cart + quantity | Complete | `ProductDetailClient.tsx:87-101,256-293` | Functional with toast. |
| PDP: size guide | Stub | `ProductDetailClient.tsx:336-364` | Hardcoded S/M/L table on every product; `/size-guide` page real but unlinked. |
| PDP: specs ("Caractéristiques") | Stub | `ProductDetailClient.tsx:325-334` | Hardcoded "100% Coton / Slim fit / Made in Algeria". |
| PDP: related products | Missing (on PDP) | `RelatedProducts.tsx` built but unused | Dead code; PDP shows none. |
| PDP: recently viewed | Missing (on PDP) | `RecentlyViewed.tsx`/`useRecentlyViewed` unused; `trackProductView` never called | Dead code. |
| PDP: reviews / ratings | Stub | `ProductDetailClient.tsx:368-374` | Placeholder text; no backend entity. |
| PDP: breadcrumbs | Complete | `ProductDetailClient.tsx:128-146` + JSON-LD | `/collections/...` in JSON-LD vs `/products?collection=` in UI. |
| PDP: wishlist button | Stub | `ProductDetailClient.tsx:290-292` | No onClick. |
| Social share | Missing (on PDP) | `SocialShare.tsx` unused | Dead code. |
| SEO: JSON-LD + metadata | Complete | `[slug]/page.tsx:127-223` | OpenGraph, Product + Breadcrumb structured data, canonical. |
| Multilingual product content | Partial/broken | `apollo-client.ts:21` sends `navigator.language`; PDP server fetch `[slug]/page.tsx:104-112` sends no Accept-Language | Content doesn't follow locale switcher. |

### Cart, Checkout & Payments

| Feature | Status | Evidence | Gap note |
|---|---|---|---|
| Add to cart | Complete | `CartContext.tsx:132` → `AddItemToOrder` | Handles `INSUFFICIENT_STOCK_ERROR`. |
| Cart page | Complete | `(shop)/cart/page.tsx` | Empty-state, clear-cart confirm, summary. |
| Mini-cart drawer | Complete | `components/cart/CartDrawer.tsx` | Qty +/-, remove, subtotal, esc-close, scroll-lock. |
| Quantity update | Complete | `CartContext.tsx:163` → `AdjustOrderLine` | qty<1 auto-removes. |
| Remove item / clear cart | Complete | `CartContext.tsx:193/218` | — |
| Cart persistence across sessions | Partial | `GetActiveOrder` via Vendure session token | Guest cart persistence unclear; may be lost on reload. |
| Cart totals | Complete | `CartContext.tsx:87-89` | Server-computed totals (cents→DZD). |
| Taxes | Complete (display) | totals `...WithTax`; "TVA incluse" `CartSummary.tsx:227` | Tax rate config not seeded. |
| Shipping cost calculation | Partial / inconsistent | frontend `shippingZonePrices` (`algeria.ts:571`) vs `eligibleShippingMethods` (`checkout/page.tsx:64`) | Two sources of truth; wilaya price client-only, never sent to backend. |
| Free-shipping threshold UI | Stub | `CartSummary.tsx:35` hardcoded 5000 | Cosmetic; no backend rule. |
| Promotions / coupon codes | Complete | `CartContext.tsx:241/278`; UI `CartSummary.tsx:103` | Functional against Vendure. |
| Collection-discount promotion | Complete | `promotion/collection-discount-action.ts`; `vendure-config.ts:124` | Auto % off by collection slug. |
| Checkout multi-step flow | Complete | `checkout/page.tsx` (4 steps) | — |
| Guest checkout | Complete | `checkout/page.tsx:129` → `SetCustomerForOrder` | Handles `EmailAddressConflictError`. |
| Logged-in checkout / address pre-fill | Partial | `checkout/page.tsx:109` | Saved-address UI exists but `savedAddresses` never passed; "save address" not wired. |
| Address entry + validation | Complete | `ShippingAddressForm.tsx` (Yup, DZ phone, postal) → `SetOrderShippingAddress` | — |
| Wilaya / commune selection | Complete | `ShippingAddressForm.tsx:403-457` | Data duplicated frontend vs `@oscar/shared`. |
| Shipping method selection | Complete (flow) / data-thin | `checkout/page.tsx:192` → `SetOrderShippingMethod` | No methods seeded → empty list out of box. |
| Order placement / transition | Complete | `checkout/page.tsx:228` → `transitionOrderToState('ArrangingPayment')` → `AddPaymentToOrder` | — |
| Order confirmation page | Complete | `order-confirmation/page.tsx` via `GetOrderByCode` | Order number, items, totals, address, confetti. |
| COD payment | Stub (auto-authorize) | `cash-on-delivery-handler.ts:35` | OK for COD; `codFee` stored in metadata only, not added to total. |
| CIB payment | Stub / mocked | `cib-payment-handler.ts:54-88` | No SATIM call; both branches return fake `Authorized`. |
| Baridimob payment | Stub / mocked | `baridimob-payment-handler.ts:54-98` | Same as CIB. |
| Payment method code mismatch | Bug (launch-blocking for CIB) | `PaymentMethodForm.tsx:35` `cib-card` vs backend `cib` | Falls back to `cib-card`, rejected as ineligible. |
| Stock validation at checkout | Partial | enforced at add-to-cart (`CartContext.tsx:143`) | No explicit re-validation at placement. |
| Billing address | Missing (UI) | `SetOrderBillingAddress` exists, never called | Billing assumed = shipping. |
| Order receipt / invoice download | Missing | confirmation page has no PDF | Email referenced but `EmailPlugin devMode:true`. |

### Accounts, Orders & Content

| Feature | Status | Evidence | Gap note |
|---|---|---|---|
| Register | Complete | `(auth)/register/page.tsx`; `ShopRegister`; `AuthContext.register:167` | Phone-as-email (`+213…@phone.dz`); "check email" copy misleading. |
| Login | Complete | `(auth)/login/page.tsx`; `ShopLogin`; `AuthContext.login:111` | Handles all error variants; `rememberMe` wired. |
| Logout | Complete | `ShopLogout`; `AuthContext.logout:152` | (See quality audit FE-5: clears wrong client.) |
| Email verification | Complete (UI) | `(auth)/verify-email/page.tsx`; `VerifyCustomerAccount` | SMS-not-email given phone identifier. |
| Resend verification | Complete | `verification-pending/page.tsx`; `RefreshVerification` | Needs `?email=`; register doesn't pass it. |
| Forgot password | Complete | `forgot-password/page.tsx`; `RequestPasswordReset` | Phone-based; copy says "SMS". |
| Reset password | Complete | `reset-password/page.tsx`; `ResetPassword` | Full state machine. |
| Session persistence | Complete | `apollo-wrapper.tsx:26` `credentials:'include'` + Bearer; `ActiveCustomer` rehydrates | (See quality audit: bearer token path is effectively dead.) |
| Profile dashboard | Complete | `(user)/user/profile/page.tsx:364` | — |
| Edit profile | Complete | `profile/page.tsx:166`; `UpdateCustomerProfile` | Email not editable. |
| Change password (logged-in) | Complete | `profile/page.tsx:188`; `UpdateCustomerPassword` | — |
| Address book | Complete | `profile/page.tsx:692`; Create/Update/Delete address | Uses `confirm()`/`alert()`. |
| Order history list | Complete | `(user)/user/orders/page.tsx`; `GetMyOrders` | "Filtrer" button decorative (102). |
| Order detail | Complete | `orders/[id]/page.tsx`; `GetOrderByCode` | — |
| Order status display | Complete | `statusConfig` maps | — |
| Order tracking (timeline + #) | Partial | detail timeline + fulfillments `trackingCode` | Timeline from order `state`, not real events; no carrier link. |
| Reorder | Stub | "Racheter" buttons (217, 376) | No handler. |
| Invoice / receipt download | Stub | "Télécharger la facture" (367) | No handler. |
| Contact support (from order) | Stub | "Contacter le support" (371) | No handler. |
| Wishlist / favorites | Missing | heart prop never passed; `/wishlist`, `/user/wishlist` links | No route/page/op. |
| Account settings page | Missing | `UserSidebar.tsx:38` → `/user/settings` | No route. |
| Newsletter signup | Stub | `Footer.tsx:48-57` | No state/submit/mutation. |
| Contact form | Stub | `(shop)/contact/page.tsx:38` | `setTimeout` fake submit. |
| Notifications / toasts | Complete (infra) | `hooks/use-toast.ts`, `ui/toaster.tsx` | Account flows use native `confirm/alert`. |
| Static content pages | Complete (content) / Partial (wiring & i18n) | about/faq/careers/contact/returns/shipping/size-guide + `legal/[slug]` | French-only; several footer links 404. |

### Back-Office Admin

| Feature | Status | Evidence | Gap note |
|---|---|---|---|
| Dashboard KPIs | Complete | `DashboardWithPermissions.tsx:130-262`; `dashboard.service.ts` | Real data, permission-gated. |
| Dashboard charts (trend/status/category/top/low-stock) | Complete | `DashboardWithPermissions.tsx:264-481`; `dashboard.graphql:46-112` | Real backend service. |
| Reports (sales/customers/inventory) + CSV | Complete | `pages/reports/Reports.tsx`; `reports.graphql` | Client-side aggregation over capped fetches (take:200-1000). |
| Product list / search / filter / sort | Complete | `ProductList.tsx`; `AdminSearchProductsDocument` | — |
| Product create (wizard) | Complete | `ProductCreate.tsx` | — |
| Product edit (7-step) | Complete | `ProductEdit.tsx` | — |
| Multilingual product content (FR/EN/AR) | Complete | `ProductEdit.tsx:198-247` | — |
| Variants / pricing / stock | Complete | `VariantManager.tsx` | — |
| Product images / assets | Complete | `ProductEdit.tsx:724-889` | Drag-drop, library, featured, reorder. |
| "Featured product" flag | Missing (removed) | `products.graphql:740` | Featured *image* only; no boolean. |
| Bulk ops + CSV import | Complete | `BulkOperations.tsx` | — |
| Order list / filter / search | Complete | `OrderList.tsx`; `AdminOrdersDocument` | — |
| Order detail + status transitions | Complete | `OrderDetail.tsx:268-293,552-591` | Shipping = state transition only. |
| Order tracking # + notes | Complete | `OrderDetail.tsx:296-352` | Tracking as custom field, not fulfillment. |
| Order payments (settle/cancel/manual/refund) | Complete | `OrderDetail.tsx:208-240`; `OrderActionDialogs.tsx` | — |
| Order modification (line/surcharge/dry-run) | Complete | `OrderActionDialogs.tsx:312-499` | — |
| Invoice print | Complete | `OrderDetail.tsx:363` | — |
| Order fulfillment (Vendure entity) | Stub | `CreateFulfillment`/`TransitionFulfillmentToState` defined, no UI | No partial/per-line shipment. |
| Customer list / detail / CRUD / addresses / notes | Complete | `CustomerList.tsx`, `CustomerDetail.tsx`, `CustomerDialogs.tsx:46` | — |
| Administrator create / edit | Complete | `UserForm.tsx` | — |
| Roles & permissions (RBAC) | Complete | `RoleForm.tsx` | Full permission matrix. |
| Facets management | Complete | `FacetDetail.tsx` | — |
| Collections / categories management | Complete | `CategoryDetail.tsx` | — |
| Asset / media library | Complete | `AssetList.tsx` | — |
| Promotions / discounts | Complete | `PromotionForm.tsx`, `PromotionList.tsx` | — |
| Settings → Payment methods | Partial | `Settings.tsx:711-859` | Toggle/delete work; per-method config panels hardcoded display. |
| Settings → Shipping | Partial | `Settings.tsx:570-707` | Rate edit/delete; zones read-only; deferred to Vendure admin. |
| Settings → Store info & logo | Stub | `Settings.tsx:420-516` | Form `onSubmit` only toasts; logo upload no-op; not persisted. |
| Settings → Email (SMTP/templates/test) | Stub | `Settings.tsx:862-1013` | Toast-only, hardcoded; test email simulated. |
| Settings → System (reindex, jobs) | Complete | `Settings.tsx:1090-1296` | Real `Reindex`, job polling/cancel. |
| Channels management | Partial | assign-to-channel exists; no CRUD page | Deferred to Vendure admin. |
| Wilaya shipping config | Missing | no wilaya-zone admin UI | Operator can't manage wilaya→zone→price. |

## Suggested feature sequencing

1. **Payments** — integrate real CIB/Baridimob; fix the `cib`/`cib-card` mismatch.
2. **Seed shipping methods + wire wilaya pricing to the backend.**
3. **Wire the home page to existing resolvers + fix header search** (backend already exists).
4. **Reconnect orphaned PDP components** (related/recently-viewed/zoom).
5. **Fix the 404 link mess; decide wishlist: build or remove the entry points.**
6. **Enable real email** (flip `devMode`) and reconcile the synthetic-email identity story.
7. **Backfill i18n** for non-auth namespaces before any Arabic/English launch.

---

# Part 2 — Code Quality / Bug Audit

Focused on correctness/bugs, architecture/quality, and performance. By app.

## Overall assessment

Structure is sound (clean Vendure plugin layout, solid GraphQL union-error handling in most flows, good RBAC *config*). But a cluster of issues share a theme: **scaffolding that looks complete but isn't wired up** (payments auto-authorize, RBAC routes ungated, auth middleware checks a cookie never set), plus a **custom-fields migration out of sync with code that still queries those columns**. Not merge-ready as-is.

## 🔴 Critical (must fix)

### Backend

**BE-1. Custom-fields migration vs. service out of sync — live shop queries will 500.**
`services/oscar.service.ts:97,132,146,171-175` still query Product custom-field columns (`customFieldsIsfeatured`, `customFieldsViewcount`, `customFieldsNamefr/ar`, `customFieldsDescriptionfr/ar`) that `1737290000000-RemoveProductCustomFields.ts` drops and `vendure-config.ts` no longer declares. Postgres throws `column ... does not exist`, breaking `featuredProducts`, `popularProducts`, `searchProductsMultilingual`, and `trackProductView`. **Highest-impact issue.** Fix: rewrite against native `product_translation`, reintroduce `isFeatured`/`viewCount` as declared custom fields, or delete the dead queries.

**BE-2. Payment handlers silently auto-authorize.**
`payment/cib-payment-handler.ts:79-88` and `baridimob-payment-handler.ts:88-98` return `state:'Authorized'` with a fabricated `transactionId` outside `testMode` — the real gateway call is commented out. Every CIB/Baridimob order is marked paid with no money captured. Fix: throw / return `Declined` in the non-test branch until integration exists.

**BE-3. Unsafe production config.**
`vendure-config.ts:100-114` hardcodes `synchronize: true` for all environments (can silently alter/drop schema, races with boot-time migrations at `index.ts:9`), plus default superadmin password, default cookie secret, and `cors origin: true`. Gate `synchronize` on `IS_DEV`; fail fast if secrets unset in prod.

### Frontend

**FE-4. Auth middleware checks a cookie that's never set.**
`proxy.ts:45-53` guards `/checkout`, `/user/*`, `/wishlist` via `cookies.get('token')`, but the token lives only in `localStorage` (`lib/auth/session.ts:20`). Authenticated users are redirected to `/login` server-side every time. Fix: read the real Vendure session cookie, or drop server gating and rely on the client guard.

**FE-5. Logout clears the wrong Apollo client — data leaks between users.**
`contexts/AuthContext.tsx:5,157` calls `clearStore()` on the standalone client (`lib/apollo/apollo-client.ts`), but hooks run through the `NextSSRApolloClient` in `apollo-wrapper.tsx`. Previous user's data persists into the next session. Fix: clear the provider's client via `useApolloClient()`.

**FE-6. Two divergent Apollo clients.**
`apollo-client.ts` vs `apollo-wrapper.tsx` have different URIs (`:3000` vs `:8085`), different `typePolicies` (`edges` vs `items` merge), and different fetch policies. Only the wrapper is used; the standalone exists only for the broken `clearStore` call (FE-5). Delete the standalone and consolidate.

### Back-Office

**BO-7. Route permission guards are completely unused.**
`App.tsx:55-129` — the single `<ProtectedRoute>` wraps `/` with no permission prop (auth-only). No child route passes a permission. Any authenticated admin can navigate by URL to admin-only screens; the Sidebar only *hides* links. The entire `PAGE_PERMISSIONS`/`canAccessRoute`/`autoDetect` machinery is dead code. (Server still rejects unauthorized mutations, so this is defense-in-depth/UX — but the design clearly intends gating and delivers none.) Fix: wrap routes with `<ProtectedRoute autoDetect>` or explicit `permission=`.

## 🟠 Important (should fix)

### Backend

- **BE-8.** `api/oscar-admin.resolver.ts:212-220,236-244` — `updateOrderTracking`/`addOrderAdminNotes` use raw `repository.update()` with a spread of `order.customFields`, bypassing `OrderService`/events and clobbering concurrent writes (last-write-wins on the whole blob). Use `OrderService.updateCustomFields` or set the flattened column.
- **BE-9.** `services/dashboard.service.ts:316-339` (`getSalesTrend`: 2 queries × 30 days, serial) and `:344-402` (`getOrdersByStatus`: 5 × 7 days) — N+1 over date buckets. Replace with single `GROUP BY date_trunc(...), state`. Also `getTopSellingProducts:685-735`, `getRecentProducts:597-610`, `getLowStockAlerts:663-665`, `getRevenueByCategory:441-443` fan out `findOne` per row — use `In([...])`. `getRecentOrders:631` reads `order.lines` not loaded → `itemCount` always 0.
- **BE-10.** `promotion/collection-discount-action.ts:60` — `-unitPrice * (pct/100)` yields non-integer cents. Use `Math.round(...)`. Also `getCollectionsByProductId` runs per order line with no memoization (N+1 across cart on every recalc).
- **BE-11.** `services/oscar.service.ts:216-227` `getLowStockProducts` ignores the `threshold` arg; legacy `oscarDashboardStats` (admin resolver:139-175) loads all completed orders into memory and reports `lowStockProductsCount: 0`. Remove or back with the real dashboard service.

### Frontend

- **FE-12.** `next/link` + manual `/${locale}` everywhere (`Header.tsx`, `checkout/page.tsx`, `login/page.tsx`, `ProductDetailClient.tsx`, `RelatedProducts.tsx`, `products/page.tsx`) fights `as-needed` routing. French URLs must have no prefix; also breaks active-link detection (`Header.tsx:89`). Use `Link`/`useRouter`/`usePathname` from `@/i18n/routing` with unprefixed hrefs.
- **FE-13.** Three different post-login redirect param names: `(user)/layout.tsx:17` `?redirect=`, `login/page.tsx:19` `?returnUrl=`, `proxy.ts:51` `?from=`. Redirect-back never works. Standardize.
- **FE-14.** `(shop)/checkout/page.tsx:101-106` — empty-cart effect races with order completion; after success the cart empties, firing redirect to `/cart` + "panier est vide" toast, competing with the `/order-confirmation` push (line 269). Guard against in-flight/just-completed submissions.
- **FE-15.** `ProductDetailClient.tsx:112-239` — multi-axis variant selection broken: each option button sets `selectedVariantId` to one arbitrary matching variant, so picking a size can silently change color. Track chosen option per group and resolve the matching variant. (Also `description` via `dangerouslySetInnerHTML` at :213 without sanitization.)
- **FE-16.** `products/page.tsx:276-280` — product search filters only the loaded page client-side, never queries the backend, misleadingly shows "no results." Route search through the server query.
- **FE-17.** `Accept-Language` mis-sourced: Apollo links use `navigator.language` (browser) not active locale; PDP server fetch (`products/[slug]/page.tsx:104`) sends none → product content ignores `locale`. Pass the next-intl locale.

### Back-Office

- **BO-18.** `OrderList.tsx:325-350` — stats (total value, avg basket, pending/shipped) and customer/wilaya filters operate on the current page (15 rows) but display next to dataset-wide `totalItems`. Push into the server query.
- **BO-19.** `UserList.tsx:146-153,274-294` — create/edit/delete admin actions render unconditionally, unlike `ProductList`/`RoleList`/`FacetList`/`AssetList` which use `<PermissionGate>`. Wrap with matching Administrator permissions.
- **BO-20.** `ProductList.tsx:67-69` — delete `refetchQueries: [{ query: AdminSearchProductsDocument }]` with no variables refetches the default page, not the user's filtered search → stale list. Pass current variables or `cache.evict`.
- **BO-21.** `UserForm.tsx`/`RoleForm.tsx` — navigate back without refetching `AdminAdministrators`/`AdminRoles`; only saved by the global `network-only` default — fragile. Make refetch explicit.
- **BO-22.** `apollo-client.ts:26-55` — error link does `window.location.href='/login'` (drops SPA state, skips Redux `logout`, leaves `vendure_user` in localStorage); the operation-name skip-list (`OscarDashboardStats`…) doesn't match real dashboard ops (`DashboardKpiMetrics`…), so loop-avoidance is ineffective. Centralize logout via Redux + router.

### Shared

- **SH-23.** Wilaya dataset triplicated: `packages/shared/src/constants/wilayas.ts`, `apps/frontend/src/lib/data/algeria.ts` (and mobile). Frontend should import from `@oscar/shared`; otherwise fixes drift across copies.

## 🟡 Minor (nice to have)

### Backend
- `vendure-config.ts:110` — `+process.env.DB_PORT!` → `NaN` with no fallback; add `|| 5432`.
- `oscar.service.ts:52-55,197-211` — `shippingCost`/wilaya rates hardcoded, duplicating `@oscar/shared`.
- `index.ts:14-19` — Windows `/assets` backslash-rewrite middleware runs in all environments; guard to dev.

### Frontend
- `next.config.js:11-13` — `typescript.ignoreBuildErrors: true` hides real bugs (with heavy `as any`).
- Many hardcoded French strings bypass `useTranslations` (Arabic/English users see French).
- Header links to routeless `/promotions`, `/help`, `/wishlist`; `error.tsx` uses non-localized hrefs.
- `filteredProducts`/`optionGroups` rebuilt each render (could `useMemo`).

### Back-Office
- `authSlice.ts:66-93` — token model conflates channel token with auth token; cache never reset on logout.
- `PermissionGate.tsx:93-106,201-214` — `cloneElement` disable hack fragile for non-native children.
- `AuthInitializer.tsx:31-74` — broad effect deps can double-dispatch; guard with `initialized` flag.
- `useDashboardData.ts:313-419` — 11 parallel queries on mount; `refetch()` only refreshes 2.
- `OrderList.tsx:124-183` — hardcoded 58-wilaya array duplicates `@oscar/shared`.
- `window.location.reload()` used for refresh/retry in several lists (heavy in an SPA).

### Shared
- Duplicated `formatPrice` in `formatters/price.ts:7` and `facet-utils.ts:250` — remove the latter.
- `detectFacetType` uses exact `===` for Arabic but `includes()` for EN/FR (`facet-utils.ts:54,64`).
- `getShippingPrice:598` magic `500` fallback should reference `shippingZonePrices[3]`.

## Recommended order of attack

1. **BE-1** (custom-fields migration) — shop API is throwing.
2. **BE-2, BE-3** (payments + prod config) — security/financial correctness before deploy.
3. **FE-4, FE-5, FE-6** (frontend auth/Apollo) — auth broken and leaks data.
4. **BO-7** (RBAC route gating) — wire up the dead permission machinery.
5. Then the Important batch, grouped by app.
