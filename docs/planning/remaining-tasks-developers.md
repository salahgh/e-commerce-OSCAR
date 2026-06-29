# OSCAR Fashion — Remaining Tasks (Development Team)

**Date:** 2026-06-29
**Scope:** Backend & Payments · Frontend (web) · Back-office · Mobile
**Companion file:** client-side prerequisites live in `remaining-tasks-product-owner.md`.

Owners by role: **BE** backend · **FE** frontend · **BO** back-office · **RN** mobile · **QA** test · **DevOps** deployment.
Priorities: **P0** = blocks go-live · **P1** = launch quality · **P2** = polish.

## Where we are (brief)

- Jalons 1–4 (Backend, Back-office, Frontend, Mobile) are built; **production is deployed** (backend, frontend, back-office live on the client's server + domain).
- Remaining: **payments, real email, mobile store publication, training** (Jalon 5), then **Support** (Jalon 6).
- COD works; **CIB and BaridiMob only simulate in test mode and decline in production** — real online card payment is the main gap.

---

## 1. Backend & Payments

| # | Task | Owner | Priority |
|---|---|---|---|
| BE-1 | Integrate the **real CIB / SATIM gateway** (initiate → redirect → callback → settle). | BE | **P0** |
| BE-2 | Integrate the **real BaridiMob gateway**. | BE | **P0** |
| BE-3 | Implement real **settle & refund** for CIB/BaridiMob (currently no-op stubs). | BE | P1 |
| BE-4 | Switch **email from dev mode to real SMTP** + production verify/reset URLs. | BE / DevOps | **P0** |
| BE-5 | Verify a clean **production migration set** (dev uses `synchronize:true`). | BE | **P0** |
| BE-6 | **Import the real catalog with images** (replaces placeholder seed). | BE | P1 |
| BE-7 | Product **reviews & ratings API** (not built). | BE | P2 |
| BE-8 | **Push-notification backend** (FCM/Expo) for mobile. | BE | P2 |
| BE-9 | **Wishlist sync API** (today client-only, no server sync). | BE | P2 |

## 2. Frontend (web)

| # | Task | Owner | Priority |
|---|---|---|---|
| FE-1 | Fix **PDP "Add to wishlist" button** (no handler; works only on grid cards). | FE | P1 |
| FE-2 | Align **email-verification flow + copy** (verification currently disabled). | FE | P1 |
| FE-3 | Validate **CIB/BaridiMob checkout end-to-end** once gateways are real. | FE / QA | P1 |
| FE-4 | Wire/verify **Contact page submission**. | FE | P1 |
| FE-5 | Finalize **responsive mobile header** (Figma 477-11265). | FE | P2 |
| FE-6 | **Product reviews UI** on PDP (after BE-7). | FE | P2 |
| FE-7 | Complete **keyboard navigation + loading skeletons** (accessibility). | FE / QA | P2 |
| FE-8 | Polish **generic error messages** (order lookup, password mismatch). | FE | P2 |
| FE-9 | **Automate** checkout/wishlist E2E + visual-regression baselines. | QA / FE | P2 |

## 3. Back-office

| # | Task | Owner | Priority |
|---|---|---|---|
| BO-1 | Add **action-level RBAC guards** on ~20 pages (users currently see buttons they can't use). | BO | **P1** |
| BO-2 | Fix **wrong permission checks** in Asset/Facet lists. | BO | P1 |
| BO-3 | Add missing **permission categories** to the Role form. | BO | P1 |
| BO-4 | Fix **edit-route permission downgrades** (`Read*` → `Update*`). | BO | P1 |
| BO-5 | Build **admin "Change password" UI**. | BO | P1 |
| BO-6 | Add **promotion action types** (% / fixed / free shipping). | BO / BE | P1 |
| BO-7 | Wire **image upload to the server** (currently local blob URLs). | BO | P1 |
| BO-8 | **Inventory & stock-management UI** (stock locations/thresholds). | BO | P2 |
| BO-9 | **RBAC cleanup + disable-with-tooltip** (instead of masking). | BO | P2 |
| BO-10 | **Global settings tab** + breadcrumbs. | BO | P2 |
| BO-11 | Deferred polish (typed arg editors, server fulfillment states, checkout i18n). | BO | P2 |

## 4. Mobile

The enhancement program (stabilization, checkout, address book, offline cart, dark mode, brand fonts, accessibility) is **complete and merged**.

| # | Task | Owner | Priority |
|---|---|---|---|
| RN-1 | **On-device QA pass** in Arabic + dark mode (the one check automation can't cover). | QA / RN | P1 |
| RN-2 | **Localize the search screen** (still English under Arabic). | RN | P1 |
| RN-3 | **Harden the global error boundary** (fallback UI can itself crash — UAT failure). | RN | P1 |
| RN-4 | Set the **production backend URL** (currently a placeholder). | RN / DevOps | **P0** |
| RN-5 | Build **real CIB/BaridiMob payment screens** + fix deep-link scheme/typos. | RN | P1 |
| RN-6 | **M2 engagement** (reviews, push, wishlist sync) — after BE-7/8/9. | RN | P2 |
| RN-7 | **M4 native hardening** (deep links, OTA updates, biometric, camera). | RN | P2 |
| RN-8 | Clear **`tsc` / Apollo-v4 codegen debt** (~155 pre-existing errors). | RN | P2 |

## 5. Deployment & handover (Jalon 5)

| # | Task | Owner | Priority |
|---|---|---|---|
| J5-1 | ✅ **Done** — backend + frontend + back-office deployed (Caddy + PM2). | DevOps | — |
| J5-2 | ✅ **Done** — domain, DNS, SSL/HTTPS and CORS configured. | DevOps | — |
| J5-3 | ✅ **Done** — production env config (recheck once payment/email credentials land). | DevOps / BE | — |
| J5-4 | **Submit mobile apps** to App Store & Google Play (EAS builds, assets). | RN / DevOps | **P0** |
| J5-5 | **Admin training + handover docs.** | BE / BO | P1 |

---

## Note on stale docs

Ignore the Nov-2024 `frontend-status.md` / `frontend-implementation-summary.md`, the Spring-Boot-era `frontend-backend-integration.md`, the early mobile "Phase 1" snapshots, and the pre-build calendars/budgets — they predate the current Vendure-based build. Current truth: this file, `docs/superpowers/mobile-enhancement-status.md`, `docs/audit/Backoffice-RBAC-Audit.md`, and `docs/uat/*_salah.md`.
