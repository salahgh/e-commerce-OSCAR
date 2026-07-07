# MODULE M2: Product Catalog & Search

Product browsing, categories, faceted filtering and multilingual search are served by Vendure's core catalog plus `DefaultSearchPlugin`, with a set of custom Oscar shop resolvers (`featuredProducts`, `newArrivals`, `popularProducts`, `searchProductsMultilingual`, `trackProductView`). Both storefronts render the catalog client-side via Apollo, driven by shared GraphQL fragments and `facet-utils`.

**Stack:** Vendure catalog + search · oscar-shop.resolver · Apollo useQuery (web/mobile) · facet-utils (shared)

---

### 1. Feature Reliability & Business Logic

#### [HIGH · Reliability · CAT-1] Custom shop catalog queries return untranslated, soft-deleted, cross-channel products
- **Evidence:** `oscar.service.ts:92-139` — the four product queries build raw query builders with no `deletedAt IS NULL`, no channel join, and no translation hydration, so non-null `name`/`slug` fields error and withdrawn products leak.
- **Impact:** The public shop API exposes deleted/other-channel products and throws on translated fields. Latent because no client currently calls them — a live-but-broken API surface.
- **Fix:** Route through `ProductService.findAll`/`translateDeep` with channel + `deletedAt` filters, or delete the queries.

#### [MEDIUM · Reliability · CAT-2] Storefront catalog hard-caps at 48 items with client-only filter & sort
- **Evidence:** `products/page.tsx:13` `TAKE=48`, single fetch, no `fetchMore`; price/size/sort all computed over the loaded 48.
- **Impact:** Products beyond the newest 48 are unreachable from the main listing, and filters silently operate on a partial catalog.
- **Fix:** Use the `search` query with facet filters + the existing `LoadMore`, or paginate server-side.

#### [MEDIUM · Reliability · CAT-3] Mobile size filter collects selections that are never applied
- **Evidence:** `products/index.tsx:30` `selectedSizes` is set by the sheet but the query input (`:53-63`) sends no `facetValueFilters` and the client filter only handles price.
- **Impact:** Users pick "M / L", the sheet shows a count, the list doesn't change — the filter appears broken.
- **Fix:** Map sizes to facet value IDs and pass `facetValueFilters` (or filter client-side as price does).

#### [MEDIUM · Reliability · CAT-4] Multi-facet selection matches OR instead of AND; URL params unvalidated
- **Evidence:** `facet-utils.ts:88-91` degrades to a single OR group when called with empty `facetGroups` — which is exactly how `search/page.tsx:57` calls it; `:151-170` `parseInt`s `page`/`perPage` with no `isNaN`/clamp.
- **Impact:** Selecting "Rouge" + "XL" returns red *or* XL products instead of the intersection; `?perPage=999999` is accepted into state.
- **Fix:** Pass real facet groups so intra-group ORs and inter-group ANDs apply; clamp and validate numeric params.

**Also noted (low severity)**
- **CAT-5** — `searchProductsMultilingual` doesn't escape LIKE wildcards (`oscar.service.ts:167`) — `%`/`_` in a keyword force match-all + a full `product_translation` scan. Escape and add a trigram index.
- **CAT-6** — Mobile "View All" routes to explore with a `q` param explore ignores (`search.tsx:187`); the home screen fires a 10-item search whose results are never rendered (`index.tsx:61`). Wire or drop.

### 2. Standard E-Commerce Security & Data Protection

#### [CRITICAL · Security · CAT-7] Product descriptions render via `dangerouslySetInnerHTML` with no sanitizer (stored XSS)
- **Evidence:** `products/[slug]/page.tsx:322` — `dangerouslySetInnerHTML={{ __html: product.description }}`; no DOMPurify/sanitize-html in the project.
- **Impact:** Any HTML stored in a product description (editable by any admin role, or via a compromised backend) executes in every shopper's browser. With cookie sessions, injected script can silently drive cart/checkout/profile mutations.
- **Fix:** Sanitize with a DOMPurify allowlist before rendering, or render through a trusted rich-text renderer.

#### [MEDIUM · Security · CAT-8] `trackProductView` is an unauthenticated, unvalidated, rate-limitless write
- **Evidence:** `oscar-shop.resolver.ts:25-79` — no `@Allow` declared on any shop op; `oscar.service.ts:144-156` increments `viewCount` for any `productId` with no existence check, returning `true` regardless.
- **Impact:** Any anonymous client can loop the mutation to inflate `viewCount` and manipulate the `popularProducts` ranking.
- **Fix:** Add explicit `@Allow(Permission.Public)` to all shop ops and per-session dedupe/rate-limit the increment.

#### [MEDIUM · Security · CAT-9] Unbounded client-controlled `take`/`skip` on shop list queries
- **Evidence:** `oscar-shop.resolver.ts:30-59` passes `args.take` straight into `qb.take()` with no maximum — `featuredProducts(take: 2147483647)` returns the whole table.
- **Impact:** Trivial memory/DoS vector on the public API (Vendure's `shopListQueryLimit` doesn't cover custom resolvers).
- **Fix:** Clamp with `Math.min(take ?? 10, 50)` and reject negative `skip`.

### 3. Performance & Speed Bottlenecks

#### [HIGH · Performance · CAT-10] Product pages are fully client-rendered — invisible to SEO/social, slow LCP
- **Evidence:** `products/[slug]/page.tsx:1` `'use client'`; the only `generateMetadata` is the locale layout; `sitemap.ts:57` leaves products a TODO; the hero is a raw `<img>` with no `priority`.
- **Impact:** Product name/price/description exist only after hydration + a GraphQL round-trip, so the money pages forfeit rich results, social previews, and non-Google crawlers; LCP is skeleton → late full-size image.
- **Fix:** Fetch product data in a server component with per-product `generateMetadata` + server JSON-LD; add products to the sitemap; use `next/image` with `priority`.

#### [HIGH · Performance · CAT-11] List queries fetch the entire product graph per item (N² variant payloads)
- **Evidence:** `shop-products.graphql:38-67` — the `ProductFields` used by list *and* collection queries pulls full description, all assets, all variants (options+group+customFields) and facetValues; collection queries nest it as `product{...ProductFields}` per variant. Mobile replicates it.
- **Impact:** A 48-card grid transfers tens-to-hundreds of KB of unused data; painful on Algerian mobile networks and TTFB.
- **Fix:** Add a slim `ProductCardFields` fragment (id, name, slug, featuredAsset, price range) for lists; group by product server-side for collections.

#### [MEDIUM · Performance · CAT-12] Apollo cache-key collision between the home rail and the products listing
- **Evidence:** `apollo-wrapper.tsx:81` keys `products` on `filter/sort` only, so the home rail (`take:10`) and the listing (`take:48`, same sort) share one entry; the merge replaces at `skip 0`.
- **Impact:** Navigating listing → home renders up to 48 cards in the rail; the rail's 10-item response then truncates the cached 48, causing flicker/refetch churn.
- **Fix:** Slice in the rail or add a discriminator to `keyArgs` / use a distinct operation for rails.

#### [MEDIUM · Performance · CAT-13] Missing DB indexes on hot catalog columns; full-res thumbnails; keystroke search
- **Evidence:** No index on `customFieldsIsfeatured`/`customFieldsViewcount` (migration adds columns only); no `?preset=`/`?w=` resize params anywhere; mobile `products/index.tsx:27` queries on every keystroke (no debounce) and caps at 50 with `onLoadMore` stubbed.
- **Impact:** Sequential scans that degrade with catalog growth; multi-MB image downloads for ~155px cells; 7 network calls to type "chemise".
- **Fix:** Add partial indexes on the custom fields; append Vendure resize params per slot; debounce mobile search and wire `fetchMore`.

### 4. Step-by-Step Improvement Plan

**Phase 1 — High priority (data leak & correctness)**
- [ ] Sanitize product-description HTML before render (CAT-7)
- [ ] Fix or delete the broken custom catalog resolvers (translation + channel + `deletedAt`) (CAT-1)
- [ ] Clamp `take`/`skip` and add `@Allow(Public)` + rate-limit on shop ops (CAT-8, CAT-9)

**Phase 2 — Structural hardening**
- [ ] Server-render product pages with per-product metadata + sitemap entries (CAT-10)
- [ ] Paginate the catalog listing; apply facet AND-logic; wire mobile size filter (CAT-2, CAT-3, CAT-4)
- [ ] Introduce a slim card fragment for all list/collection queries (CAT-11)

**Phase 3 — Speed tuning**
- [ ] Add catalog indexes; image resize params; debounce mobile keystroke search (CAT-13)
- [ ] Resolve the rail/listing cache-key collision; escape search LIKE wildcards + trigram index (CAT-12, CAT-5)

---

### ✓ Verified OK
- Search is debounced (300ms) on both web and mobile `search` screens; history capped, min-2-chars enforced.
- `viewCount` increment is a single atomic SQL `UPDATE ... SET x = x + 1` — not read-modify-write.
- No SQL injection: the one raw query is parameterized; QB inputs are bound; `next/image` `remotePatterns` whitelists the Vendure asset hosts.
- Search terms are `encodeURIComponent`'d and rendered as escaped JSX text; JSON-LD is `<`-escaped. `LoadMore` infinite scroll is correctly guarded.
