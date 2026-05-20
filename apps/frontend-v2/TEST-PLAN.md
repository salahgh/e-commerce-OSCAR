# Frontend v2 — Functional Test Plan

End-to-end functional test plan for `apps/frontend-v2`. Used as a live worksheet — tick a box when a case passes, replace with `❌` and a note when it fails.

## Test environment

| Item | Value |
|---|---|
| Frontend | `http://localhost:3001` (dev server) |
| Backend (Vendure Shop API) | `http://localhost:8085/shop-api` |
| Locales | `fr` (default, no prefix), `en` (`/en`), `ar` (`/ar`, RTL) |
| Test customer | provide manually — needed for D-04, F-04 etc. |
| Browser driver | Chrome DevTools MCP (preferred) — fallback: `apps/frontend-v2/scripts/verify-i18n.mjs` for headless SSR checks |

## Scope

- Pages reachable from nav, header, footer, auth, shop, cart
- Cross-cutting: i18n, RTL, theme, a11y, console/network sanity
- Resilience: backend down, slow network

Out of scope: design-system showcase page (`/design-system`), checkout/payment flows (not implemented in v2 yet), mobile-app, performance benchmarking.

## Stub routes (known to currently 404)

These are linked from existing UI but pages don't exist yet. Each gets its own row in section **M**.

`/forgot-password` · `/verification-pending` · `/user/profile` · `/user/orders` · `/user/wishlist` · `/categories` · `/categories/[slug]` · `/search` · `/checkout` · `/shipping` · `/returns` · `/size-guide` · `/faq` · `/about` · `/careers` · `/contact` · `/legal/terms` · `/legal/privacy`

---

## A. Smoke

- [ ] **A-01** Dev server reachable on `:3001`
- [ ] **A-02** `GET /` returns 200, contains `<html lang="fr" dir="ltr">`
- [ ] **A-03** `GET /en` returns 200, contains `<html lang="en" dir="ltr">`
- [ ] **A-04** `GET /ar` returns 200, contains `<html lang="ar" dir="rtl">`
- [ ] **A-05** No console errors on initial load (each locale)
- [ ] **A-06** No 5xx in network log for static assets
- [ ] **A-07** GraphQL endpoint reachable from page (`api.shop-api` or `localhost:8085`)
- [ ] **A-08** Font loaded (IBM Plex Sans Arabic) — no FOUT

## B. Header (Shop layout)

- [ ] **B-01** Logo image/text present and links to `/`
- [ ] **B-02** TopBar promo string visible
- [ ] **B-03** MainNav shows 5 links (Accueil, Boutique, Catégories, À propos, Contact) on desktop ≥1024px
- [ ] **B-04** MainNav hidden on mobile (<1024px)
- [ ] **B-05** Mobile menu button visible on <1024px with `aria-label` translated
- [ ] **B-06** SearchBar input visible on ≥768px
- [ ] **B-07** Type "robe" → Enter → URL becomes `/search?q=robe`
- [ ] **B-08** LocaleSwitcher shows current locale name
- [ ] **B-09** LocaleSwitcher dropdown opens on click, closes on outside click
- [ ] **B-10** LocaleSwitcher fr → en navigates and rewrites URL prefix + content
- [ ] **B-11** LocaleSwitcher en → ar applies `dir="rtl"` and Arabic content
- [ ] **B-12** AccountMenu (logged out) renders "Se connecter" link → `/login`
- [ ] **B-13** AccountMenu (logged in) shows initials + first name + dropdown
- [ ] **B-14** AccountMenu dropdown items: Mon profil, Mes commandes, Mes favoris, Déconnexion
- [ ] **B-15** AccountMenu Déconnexion clears auth and routes to `/`
- [ ] **B-16** Wishlist icon link → `/user/wishlist` (404 expected — see M-05)
- [ ] **B-17** CartButton icon present
- [ ] **B-18** CartButton shows badge with item count after adding a product
- [ ] **B-19** Header stays sticky on scroll

## C. Footer

- [ ] **C-01** 4-column grid on desktop, single column on mobile
- [ ] **C-02** Tagline (translated) visible
- [ ] **C-03** Contact column: mailto + tel + address rows
- [ ] **C-04** Help column: Livraison, Retours, Guide des tailles, FAQ links
- [ ] **C-05** Company column: 5 links (À propos, Carrières, Contact, CGV, Privacy)
- [ ] **C-06** Copyright shows current year
- [ ] **C-07** 4 social icons (Facebook/Instagram/Twitter/YouTube) link out with `target="_blank"`
- [ ] **C-08** All footer text translates correctly across fr/en/ar

## D. Auth — Login (`/login`)

- [ ] **D-01** Form renders: Email, Mot de passe, Se souvenir de moi, Mot de passe oublié link, Submit
- [ ] **D-02** Submit empty → HTML5 validation prevents submission
- [ ] **D-03** Submit invalid credentials → Alert with error message
- [ ] **D-04** Submit valid credentials → success toast "Bienvenue !" + redirect to `/`
- [ ] **D-05** "Pas encore de compte ?" link → `/register`
- [ ] **D-06** "Mot de passe oublié ?" link → `/forgot-password` (404 — see M-01)
- [ ] **D-07** Submit shows loading state on button (disabled + spinner)
- [ ] **D-08** Remember-me checkbox toggles
- [ ] **D-09** AuthLayout shows "Retour à la boutique" link → `/`

## E. Auth — Register (`/register`)

- [ ] **E-01** Form fields: Prénom, Nom, Email, Mot de passe (with "Au moins 8 caractères" hint), Submit
- [ ] **E-02** Submit empty → HTML5 validation
- [ ] **E-03** Submit invalid email → HTML5 validation
- [ ] **E-04** Submit short password → server error in Alert
- [ ] **E-05** Submit valid → info toast "Inscription réussie" + redirect to `/verification-pending`
- [ ] **E-06** "Vous avez déjà un compte ?" link → `/login`
- [ ] **E-07** Submit shows loading state on button

## F. Home (`/`)

- [ ] **F-01** Hero eyebrow "Collection 2026" + title + subtitle render
- [ ] **F-02** CTA "Acheter maintenant" → `/products`
- [ ] **F-03** CTA "Toutes les catégories" → `/categories` (404 — see M-06)
- [ ] **F-04** Featured products section: heading + "Voir tout" link
- [ ] **F-05** "Voir tout" → `/products`
- [ ] **F-06** Up to 8 product cards render when backend up
- [ ] **F-07** Skeleton placeholders show while products loading
- [ ] **F-08** Error alert shows when backend unreachable
- [ ] **F-09** Collections section renders when data present
- [ ] **F-10** Each collection card has image overlay + name + link to `/categories/[slug]`
- [ ] **F-11** Brand belt renders with localized eyebrow/title/body
- [ ] **F-12** Brand belt CTA "En savoir plus" → `/shipping` (404 — see M-10)
- [ ] **F-13** Arrow icons flip correctly between LTR and RTL

## G. Products list (`/products`)

- [ ] **G-01** PageHeader breadcrumbs: Accueil → Tous les produits
- [ ] **G-02** Title and translated count (`{n} produits`) display
- [ ] **G-03** Sort select shows two options (asc / desc), default asc
- [ ] **G-04** Changing sort triggers refetch, list reorders
- [ ] **G-05** Pagination component shows when `pageCount > 1`
- [ ] **G-06** Page change refetches with `skip` applied
- [ ] **G-07** Loading skeletons (12) appear during fetch
- [ ] **G-08** Empty state shows "Aucun produit trouvé." when no items
- [ ] **G-09** Error alert shows when GraphQL errors
- [ ] **G-10** Clicking a card → `/products/[slug]`

## H. Product detail (`/products/[slug]`)

- [ ] **H-01** Loading skeleton renders before data arrives
- [ ] **H-02** Invalid slug shows error alert "Produit introuvable"
- [ ] **H-03** Breadcrumb: Accueil → Produits → product name
- [ ] **H-04** Title, price, stock indicator visible
- [ ] **H-05** Image gallery: main image + thumbnails when multiple assets
- [ ] **H-06** Clicking thumbnail switches main image
- [ ] **H-07** Color swatches render when product has color option group
- [ ] **H-08** Selecting a color updates `aria-pressed`
- [ ] **H-09** Size buttons render when product has size option group
- [ ] **H-10** Quantity stepper: + increments, − decrements, respects min/max
- [ ] **H-11** Direct number input in stepper clamps within bounds
- [ ] **H-12** Add to cart without color (when required) → error toast "Veuillez sélectionner une couleur."
- [ ] **H-13** Add to cart without size (when required) → error toast "Veuillez sélectionner une taille."
- [ ] **H-14** Add to cart valid → CartButton badge increments + toast "Produit ajouté au panier"
- [ ] **H-15** Tabs switch between Description, Détails, Livraison
- [ ] **H-16** Détails tab shows Référence (SKU) + facet values
- [ ] **H-17** Wishlist icon button present
- [ ] **H-18** Share icon button present
- [ ] **H-19** RTL: layout mirrors correctly (gallery on the left, details on right)

## I. Cart (`/cart`)

- [ ] **I-01** Empty cart shows icon + title + body + "Voir les produits" CTA
- [ ] **I-02** Loading skeleton while cart fetches
- [ ] **I-03** Line items render: image, product name link, variant + SKU, qty stepper, line price, remove icon
- [ ] **I-04** Quantity stepper change → updates line price and total
- [ ] **I-05** Decreasing qty to 0 removes the item
- [ ] **I-06** Remove icon triggers `removeItem`, line disappears
- [ ] **I-07** Coupon form: enter valid code → "Code promo appliqué" toast + discount row in summary
- [ ] **I-08** Coupon form: enter invalid code → "Code promo invalide" toast
- [ ] **I-09** Applied coupon shows in code list with Retirer button
- [ ] **I-10** Retirer button removes coupon, discount row disappears
- [ ] **I-11** Summary rows: Sous-total, Livraison ("À calculer" when 0), discounts, Total
- [ ] **I-12** Checkout button → `/checkout` (404 — see M-09)
- [ ] **I-13** Cart title shows quantity: "Votre panier (3)"

## J. i18n

- [ ] **J-01** Default locale (fr) has no URL prefix
- [ ] **J-02** `/en/...` paths serve English content
- [ ] **J-03** `/ar/...` paths serve Arabic content with `dir="rtl"`
- [ ] **J-04** LocaleSwitcher persists locale across multiple navigations
- [ ] **J-05** No raw `Namespace.key.path` strings rendered as visible text
- [ ] **J-06** No mixed-language content (e.g., French + Arabic on same surface in same locale)
- [ ] **J-07** Date/number formatting follows locale (where used)
- [ ] **J-08** RTL aware icons (chevrons, arrows) flip via `ltr:inline rtl:hidden` patterns

## K. Accessibility sanity

- [ ] **K-01** All interactive elements have accessible names (aria-label or text)
- [ ] **K-02** Tab order traverses header → main → footer in DOM order
- [ ] **K-03** Focus ring visible on primary buttons and links
- [ ] **K-04** Color contrast for primary CTA passes WCAG AA (target 4.5:1)
- [ ] **K-05** RTL: keyboard nav respects logical order
- [ ] **K-06** Heading hierarchy is sane on each page (no h1 skipped)
- [ ] **K-07** Form fields have associated labels (Field component)
- [ ] **K-08** Error alerts use `role="alert"` or equivalent

## L. Theme & appearance

- [ ] **L-01** Light theme is default
- [ ] **L-02** No flash of unstyled content (FOUC) on load
- [ ] **L-03** Dark theme styling exists in CSS but user has no toggle yet (note only)

## M. Stub routes (expected 404 — confirms they don't silently break)

- [x] **M-01** ~~`/forgot-password` → 404~~ → now implemented (P-41)
- [x] **M-02** ~~`/verification-pending` → 404~~ → now implemented (P-40)
- [ ] **M-03** `/user/profile` → 404
- [ ] **M-04** `/user/orders` → 404
- [ ] **M-05** `/user/wishlist` → 404
- [ ] **M-06** `/categories` → 404
- [ ] **M-07** `/search` → 404
- [ ] **M-08** `/checkout` → 404
- [ ] **M-09** `/shipping`, `/returns`, `/size-guide`, `/faq` → 404
- [ ] **M-10** `/about`, `/careers`, `/contact`, `/legal/terms`, `/legal/privacy` → 404

## N. Resilience

- [ ] **N-01** Backend down: home shows error alert in featured section
- [ ] **N-02** Backend down: `/products` shows error alert
- [ ] **N-03** Backend down: cart and account menu handle gracefully (no white screen)
- [ ] **N-04** Slow network (DevTools throttle Slow 3G): skeletons render before content
- [ ] **N-05** Add-to-cart mid-failure: error toast appears, no broken state

## O. Console & network hygiene (per page)

For each page in A-G-H-I, capture:
- [ ] **O-01** Zero console errors
- [ ] **O-02** Zero failed (4xx/5xx) network requests other than the expected stub-route 404s
- [ ] **O-03** No `[next-intl] MISSING_MESSAGE` warnings
- [ ] **O-04** No React hydration mismatch warnings

---

## P. Standard e-commerce features — gap analysis

For each standard storefront capability: ✅ Implemented · 🟡 Partial · ❌ Missing. "Missing" items aren't bugs — they're features the v2 storefront hasn't built yet. Add a checkbox row only for items in the **Implemented** or **Partial** state to verify they work.

### Discovery & browsing

| ID | Feature | State | Notes |
|---|---|---|---|
| P-01 | Product listing with sort | ✅ | `/products` — verify in G-03/G-04 |
| P-02 | Pagination | ✅ | verify in G-05/G-06 |
| P-03 | Faceted filters (size, color, price, brand) | ❌ | no UI; backend has facet system, `@oscar/shared/facet-utils` exists for this |
| P-04 | Category browsing | ❌ | links exist but `/categories` and `/categories/[slug]` not built |
| P-05 | Full-text search | ❌ | search bar submits to `/search?q=` but page doesn't exist |
| P-06 | Search autocomplete / suggestions | ❌ | not implemented |
| P-07 | Recently viewed products | ❌ | no localStorage hook or component |
| P-08 | Related / recommended products on PDP | ❌ | PDP has no recommendation section |
| P-09 | Trending / new arrivals carousel on home | 🟡 | home has "featured products" via `useGetProductsQuery({take: 8})` — not actually a "trending" query |
| P-10 | Collections landing page | 🟡 | home shows collections grid but no dedicated landing |
| P-11 | Breadcrumbs on PDP and products list | ✅ | verify in G-01, H-03 |

### Product detail

| ID | Feature | State | Notes |
|---|---|---|---|
| P-12 | Variant selection (color + size) | ✅ | verify in H-07..H-09 |
| P-13 | Stock indicator (in/low/out) | ✅ | `StockIndicator` component wired |
| P-14 | Image gallery with thumbnails | ✅ | verify in H-05/H-06 |
| P-15 | Image zoom / pinch on mobile | ❌ | no zoom interaction |
| P-16 | Image carousel touch swipe | ❌ | thumbnails only |
| P-17 | Reviews & ratings display | ❌ | `ProductCard` accepts rating prop but no backend query and no reviews tab |
| P-18 | Review submission | ❌ | no form, no mutation |
| P-19 | Q&A section | ❌ | not in scope |
| P-20 | Price strikethrough / discount % | 🟡 | `PriceDisplay` accepts `originalAmount`, `ProductCard` has `discountPercent` — verify wiring once backend provides |
| P-21 | "Notify me" when out of stock | ❌ | no UI |
| P-22 | Size guide modal | ❌ | footer link exists, no modal/page |
| P-23 | Share product (native share + social) | 🟡 | share icon present, no handler — see H-18 |

### Cart & checkout

| ID | Feature | State | Notes |
|---|---|---|---|
| P-24 | Cart persistence (server-side via Vendure active order) | ✅ | through `CartContext` — verify in I-* |
| P-25 | Quantity adjust in cart | ✅ | I-04 |
| P-26 | Remove from cart | ✅ | I-05/I-06 |
| P-27 | Apply / remove coupon code | ✅ | I-07..I-10 |
| P-28 | Mini-cart drawer (hover/click cart icon) | ❌ | `CartButton` navigates to `/cart` only |
| P-29 | Cart upsell / cross-sell | ❌ | not implemented |
| P-30 | Checkout flow (cart → address → shipping → payment → confirm) | ❌ | `/checkout` not built |
| P-31 | Guest checkout | ❌ | depends on P-30 |
| P-32 | Multiple shipping addresses | ❌ | depends on P-30 |
| P-33 | Wilaya-based shipping calculator | ❌ | `@oscar/shared/constants/wilayas.ts` data exists, no UI |
| P-34 | Cash-on-delivery option | ❌ | depends on P-30 — Vendure has payment handler for COD |
| P-35 | CIB / Baridimob payment | ❌ | backend payment handlers exist; no frontend integration |
| P-36 | Gift cards | ❌ | not in scope |
| P-37 | Order confirmation page | ❌ | depends on P-30 |
| P-38 | Order tracking | ❌ | not implemented |

### Customer account

| ID | Feature | State | Notes |
|---|---|---|---|
| P-39 | Sign up / sign in | ✅ | verify D-01..D-04, E-01..E-07 |
| P-40 | Email verification flow | ✅ | `/verify` + `/verification-pending` built — SSR verified |
| P-41 | Forgot / reset password | ✅ | `/forgot-password` + `/reset-password` built — SSR verified |
| P-42 | Profile page (view + edit) | 🟡 | `AuthContext.updateProfile` exists, `/user/profile` page doesn't |
| P-43 | Change password | 🟡 | `AuthContext.changePassword` exists, no page |
| P-44 | Order history list | ❌ | no `/user/orders` page or query |
| P-45 | Order detail view | ❌ | not implemented |
| P-46 | Address book CRUD | ❌ | not implemented |
| P-47 | Wishlist (add/remove/list) | 🟡 | `ProductCard` accepts `isFavorited` + `onToggleFavorite` but no provider, persistence, or `/user/wishlist` page |
| P-48 | Compare products | ❌ | not implemented |
| P-49 | Newsletter subscription | ❌ | not implemented |

### i18n, theming, infrastructure

| ID | Feature | State | Notes |
|---|---|---|---|
| P-50 | 3 locales (fr/en/ar) with `as-needed` prefix | ✅ | verify J-01..J-03 |
| P-51 | RTL for Arabic | ✅ | verify J-03/J-08 |
| P-52 | Light theme | ✅ | L-01 |
| P-53 | Dark theme | ✅ | `ThemeToggle` in header — light/dark/system via next-themes |
| P-54 | DZD currency formatting | ✅ | `@oscar/shared/formatters/price` |
| P-55 | Phone format for Algeria (`0555 00 00 00`) | 🟡 | placeholder present; no input mask / validation |

### Trust, legal, marketing

| ID | Feature | State | Notes |
|---|---|---|---|
| P-56 | Terms of service page | ❌ | footer link exists, no page |
| P-57 | Privacy policy page | ❌ | footer link exists, no page |
| P-58 | Cookie consent banner | ❌ | not implemented |
| P-59 | Newsletter signup form | ❌ | not implemented |
| P-60 | Contact page with form | ❌ | not implemented |
| P-61 | About / careers static pages | ❌ | footer links exist, no pages |
| P-62 | FAQ page | ❌ | footer link exists, no page |
| P-63 | Size guide page or modal | ❌ | not implemented |
| P-64 | Shipping policy page | ❌ | not implemented |
| P-65 | Returns policy page | ❌ | not implemented |

### SEO & analytics

| ID | Feature | State | Notes |
|---|---|---|---|
| P-66 | Per-page metadata (`title`/`description`) | 🟡 | root `app/layout.tsx` only — pages don't export `metadata` |
| P-67 | Open Graph / Twitter cards | ❌ | not configured |
| P-68 | Structured data (Product / Breadcrumb JSON-LD) | ❌ | not implemented |
| P-69 | `sitemap.ts` | ❌ | v1 has one, v2 doesn't |
| P-70 | `robots.ts` | ❌ | v1 has one, v2 doesn't |
| P-71 | `next-sitemap` integration | ❌ | — |
| P-72 | Google Analytics tag | 🟡 | env vars exist (`NEXT_PUBLIC_GA_MEASUREMENT_ID`), no script |
| P-73 | Facebook Pixel | 🟡 | env vars exist, no script |
| P-74 | Canonical URLs per locale + `hreflang` | ❌ | not configured |

### Performance & resilience

| ID | Feature | State | Notes |
|---|---|---|---|
| P-75 | Loading skeletons on data fetches | ✅ | I-02, F-07, G-07, H-01 |
| P-76 | Error boundary at locale layout | ✅ | A-05/O-01 — `[locale]/error.tsx` wired |
| P-77 | Not-found page (translated) | ✅ | M-* paths render `[locale]/not-found.tsx` |
| P-78 | Image optimization (`next/image`) | 🟡 | `ProductCard` uses `next/image`; PDP uses raw `<img>` |
| P-79 | Font self-hosting via `next/font` | ✅ | IBM Plex Sans Arabic |
| P-80 | Service worker / PWA | ❌ | not implemented |
| P-81 | Offline support | ❌ | not implemented |

### Accessibility

| ID | Feature | State | Notes |
|---|---|---|---|
| P-82 | aria-labels on icon buttons | ✅ | verify K-01 |
| P-83 | Form labels via `Field` component | ✅ | K-07 |
| P-84 | Skip-to-content link | ❌ | not implemented |
| P-85 | Reduced-motion preference | ❌ | no `prefers-reduced-motion` styles |
| P-86 | Color-contrast WCAG AA | 🟡 | verify K-04 — needs Lighthouse audit |

---

## Recommended next builds (prioritized)

Based on the gaps above, suggested in order of customer impact:

1. **`/checkout` flow** (P-30..P-37) — cart-to-confirmation including COD, CIB, Baridimob. Largest revenue blocker.
2. **`/forgot-password` + `/reset-password` + `/verification-pending` + `/verify`** (P-40, P-41) — auth completeness. Logic is already in `AuthContext`; only pages missing.
3. **`/user/*` pages** (P-42..P-47) — profile, orders, wishlist, addresses. Repeat-customer retention.
4. **`/categories` + `/categories/[slug]`** (P-04) — primary browsing path.
5. **`/search` page + filters** (P-03, P-05) — discovery.
6. **Static content pages** (P-56..P-65) — legal + trust requirement before going live.
7. **SEO basics** (P-66..P-74) — required for organic traffic; sitemap + per-page metadata.
8. **Dark mode toggle** (P-53) — styling already supports it; just need a switch.

## Execution log

Use this section to log failures with timestamp + screenshot path. Example:

```
2026-05-20 14:32 — H-12 FAIL — Add-to-cart without color shows generic Apollo error, not the
                   "Veuillez sélectionner une couleur." toast. Screenshot: docs/test-shots/H-12.png
```
