# OSCAR Fashion — Remaining Tasks (Product Owner / Client)

**Date:** 2026-06-29
**Companion file:** the development backlog lives in `remaining-tasks-developers.md`.

This list covers **only what the client must provide or decide**. The development team cannot complete the matching work until these are delivered.

## Where we are (brief)

- Jalons 1–4 (Backend, Back-office, Frontend, Mobile) are built and invoiced.
- **Production is live** — server + domain you provided, system deployed.
- Remaining contractual work: **Jalon 5 (finish integration: payments, email, mobile stores) + Jalon 6 (Support)** — 80 000 DZD.
- Main gap: **online card payment** (CIB / BaridiMob) is not yet wired to real money — it needs the credentials below.

Priorities: **P0** = blocks go-live · **P1** = launch quality · **P2** = optional.

---

| # | What you need to provide / decide | Why it's needed | Priority |
|---|---|---|---|
| PO-1 | **CIB / SATIM merchant credentials** (sandbox + production). | Enables real CIB card payment, settlement & refunds. | **P0** |
| PO-2 | **BaridiMob credentials.** | Enables real BaridiMob payment, settlement & refunds. | **P0** |
| PO-3 | **SMTP credentials** (mail server / sending account). | Lets the site send real order, verification & password-reset emails (currently dev-only). | **P0** |
| PO-4 | **Apple Developer + Google Play Console accounts.** | Required to publish the iOS & Android apps to the stores. | **P0** |
| PO-5 | **Real product content** — photos, descriptions (FR/AR/EN), prices, discounts. | Replaces placeholder catalog; needed for go-live and to test images/search/discounts. | P1 |
| PO-6 | **Missing Figma deliverables** — LTR layout, full design system, missing UI states (out-of-stock, promo, empty cart, order confirmation, loading), mobile auth/notifications screens, mobile header. | Unblocks the remaining design-fidelity polish on web & mobile. | P2 |
| PO-7 | **Scope decisions** — confirm whether **product reviews, push notifications, and wishlist sync** are in scope. | Determines whether the team builds these optional features. | P2 |

---

**Already provided / done:** production server + domain (system deployed). ✅
