# OSCAR Fashion — Platform Audit Dossier

A cross-layer performance, security, and reliability audit of the OSCAR Fashion stack — Vendure backend, Next.js storefront, React admin back-office, and the Expo mobile app — read against the live source and verified finding by finding.

- **Date:** 2026-07-07
- **Method:** 6 parallel read-only deep-dive audits (backend plugin, payment/promotion layer, Next.js storefront, back-office, Expo mobile, shared packages/repo hygiene). Every finding carries `file:line` evidence and is cross-verified against how each app actually calls the code.
- **Scope:** `apps/backend` · `apps/frontend` · `apps/backoffice` · `apps/mobile` · `packages/*`

## Findings scorecard

| Severity | Count |
|---|---|
| 🔴 Critical | 2 |
| 🟠 High | 16 |
| 🟡 Medium | 31 |
| ⚪ Low | 27 |
| **Total** | **~76 across 9 modules** |

Severity reflects **blast radius × exploitability × whether it is live today**. Several High/Critical items are *latent* (e.g. the fake-payment paths only become reachable once CIB/Baridimob methods are enabled) — they are flagged because the unsafe default is one admin toggle away from production impact.

## Fix before the next flash sale (executive priority)

Ranked by blast radius. The top three are exploitable or already broken in production today; the rest are the failure modes a traffic spike will expose first.

1. **Rotate the committed production credentials** — a real, reused password (`majmajBS13..`) and a static `COOKIE_SECRET` are checked into git. `docs/archive/deploy-hestia/*`, `.claude/settings.local.json`. → [M9](./09-platform-devops.md#sec--plat-1)
2. **Sanitize product descriptions (stored XSS)** — the PDP renders `product.description` through `dangerouslySetInnerHTML` with no sanitizer. `products/[slug]/page.tsx:322`. → [M2](./02-catalog-search.md#sec--cat-7)
3. **Close the free-order payment paths** — `dummyPaymentHandler` ships in the production handler list and CIB/Baridimob default `testMode:true`; settlement is stubbed to always succeed. → [M4](./04-payments.md)
4. **Add a checkout recovery path** — both clients transition to `ArrangingPayment` with no way back; a declined payment or dropped connection permanently bricks the cart. → [M3](./03-cart-checkout.md#rel--cart-1)
5. **Own shipping price on the server** — two seed paths charge shipping 100× apart and no server-side wilaya calculator exists. → [M9](./09-platform-devops.md#rel--plat-3)
6. **Turn on real email** — `EmailPlugin` is hard-wired to `devMode:true`; production password-reset/verification/order emails are written to disk, never sent. → [M9](./09-platform-devops.md#rel--plat-2)

## Module map (Phase 1)

Nine functional modules discovered across the four apps and two shared packages. Each is audited in full — see its file.

| # | Module | Stack touched | Severity mix | File |
|---|---|---|---|---|
| M1 | Authentication & Customer Profile | backend · web · mobile · admin | 2H · 3M · 4L | [01](./01-authentication-profile.md) |
| M2 | Product Catalog & Search | backend · web · mobile · shared | 1C · 3H · 6M | [02](./02-catalog-search.md) |
| M3 | Cart & Checkout | web · mobile · backend | 4H · 4M · 5L | [03](./03-cart-checkout.md) |
| M4 | Payments (COD / CIB / Baridimob) | backend · mobile · web | 4H · 2M · 2L | [04](./04-payments.md) |
| M5 | Order Management & Fulfillment | backend · admin · web · mobile | 4M · 2L | [05](./05-order-management.md) |
| M6 | Promotions & Discounts | backend · web · shared | 4M · 1L | [06](./06-promotions-discounts.md) |
| M7 | Admin Dashboard & Analytics | backend · admin | 1H · 5M · 1L | [07](./07-dashboard-analytics.md) |
| M8 | Content & Site Settings | backend · web · mobile · admin | 2M · 2L | [08](./08-content-site-settings.md) |
| M9 | Platform, Infrastructure & DevOps | backend · infra · shared · repo | 1C · 2H · 6M | [09](./09-platform-devops.md) |

## How each module is evaluated (Phase 2)

Every module file follows the same four-part structure:

1. **Feature Reliability & Business Logic** — does it work as expected? (race conditions, session continuity, edge cases)
2. **Standard E-Commerce Security & Data Protection** — access control (IDOR), token/PII safety, input validation
3. **Performance & Speed Bottlenecks** — N+1 queries, blocking work, render cost, caching, image weight
4. **Step-by-Step Improvement Plan** — a checklist grouped **Phase 1 (High priority)**, **Phase 2 (Structural hardening)**, **Phase 3 (Speed tuning)**

Each module also closes with a **Verified OK** list — things checked and found correct, including several a generic audit would wrongly flag.

## What is reassuringly fine

The platform *architecture* is sound. Verified correct across the audit: server-authoritative payment amounts (no client price manipulation), genuine server-side RBAC (not client-side theater), atomic view-count increments, no IDOR on customer data, the service worker correctly bypassing `/shop-api`, the default Vendure stock-allocation race being intact (the "two customers, last item" case is safe), and idempotent double-tap payment via the order state machine.
