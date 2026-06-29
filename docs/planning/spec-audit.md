# OSCAR Fashion — Audit vs. Specification

**Date:** 2026-06-29
**Purpose:** Audit the delivered product and the remaining-tasks lists against the contractual specification.
**Specs audited:**
- `docs/business/cahier-charge.md` (functional requirements of record)
- `docs/business/master-project-plan.md` (scope, acceptance criteria §13, exclusions §11.2)
- `docs/business/facture-jalon5-integration.md` (official remaining scope — J5+J6 merged, 80 000 DZD)
- App specs: `docs/specs/{frontend,backoffice,mobile,technical}-spec.md`

Legend: ✅ Done · ⚠️ Partial · ❌ Missing · 🚫 Out of scope (per spec)

---

## 1. Headline findings

1. **The audit surfaced spec requirements that were NOT in the developer/PO task lists** — most importantly **SMS notifications**, an **in-app notification center**, **abandoned-cart reminders**, **social login**, and **personalized/recommended products**. See §3.
2. **Push notifications were under-prioritized.** They were P2 in the dev list, but the Jalon 5 invoice puts production push (Expo/FCM) **in scope** → should be **P1**.
3. **Two cahier-charge features are absent from the official Jalon 5 scope** — **social login (§4.1)** and **personalized/recommended products (§4.3)**. These need an explicit PO decision: deliver, or formally descope by avenant.
4. **Scope exclusions are now consistent and confirm earlier calls:** ERP/WMS/**POS** sync and **PDF generation** (invoices/delivery notes) are **out of scope** per master-plan §11.2 and the J5 invoice. Removing POS was correct. ⚠️ But the J3 frontend invoice listed "téléchargement factures PDF" — a **contradiction** to resolve with the PO.
5. **Reviews/ratings are not a contractual requirement** (absent from the cahier des charges). The review tasks in the dev backlog are **enhancements beyond spec**, not gaps — reclassify.

---

## 2. Requirement-by-requirement audit

### 2.1 User management (cahier §4.1)
| Requirement | Status | Notes |
|---|---|---|
| Register / login (email+password) | ✅ | Web + mobile |
| **Social login (Google, Facebook)** | ❌ | **Not implemented** (footer has social *links* only). Not in J5 scope → decision needed |
| Mandatory auth to place an order | ⚠️ | Mobile gates checkout → login (verified). Web: confirm guest checkout is blocked |
| Profile management | ✅ | |
| Order history + status | ✅ | |
| Password reset (email) | ✅ | Fixed in 2026-06-07 UAT pass |

### 2.2 Product catalog (cahier §4.2, §6.3)
| Requirement | Status | Notes |
|---|---|---|
| Detailed PDP, multiple **zoomable** images | ⚠️ | Zoom/lightbox exist; **real product images missing from seed** (placeholder only) |
| Variants & attributes (size/color/material) | ✅ | ~1799 variants |
| Stock availability | ✅ | |
| **Real-time stock by store** (§6.3) | 🚫/❌ | Per-store stock implies POS/multi-location → out of scope |

### 2.3 Smart home page (cahier §4.3)
| Requirement | Status | Notes |
|---|---|---|
| Hero carousel | ✅ | |
| Popular categories | ✅ | |
| Promotions / new / best-sellers | ✅ | Discounts shipped in Figma pass |
| **Recommended products (personalized by history)** | ❌ | Only recently-viewed (mobile) + featured/popular. **No personalization engine** |
| **Intelligent personalized content per user** | ❌ | Not implemented. Not in J5 scope → decision needed |

### 2.4 Order process (cahier §4.4)
| Requirement | Status | Notes |
|---|---|---|
| Cart (add/remove/update) | ✅ | |
| Checkout (address → summary → payment) | ✅ | COD path complete |
| Order tracking / status | ✅ | |
| **Address book — web** (J5 finalization) | ⚠️ | Mobile has it (M1b); **no standalone web `(user)/addresses` page** found |

### 2.5 Notifications (cahier §4.5 — J5 in scope)
| Requirement | Status | Notes |
|---|---|---|
| **Email** (order confirm, status) | ⚠️ | Works but `EmailPlugin` in **devMode** (writes to disk, localhost URLs). Needs real SMTP |
| **SMS** (confirm, status, offers) | ❌ | **Not implemented.** Needs Algerian SMS provider (client) + backend work |
| **Push** (mobile: promos, order, abandoned cart) | ❌ | No FCM/Expo push backend or client wiring |
| **Abandoned-cart reminder** | ❌ | Not implemented |
| **In-app notification center** (in profile) | ❌ | Not implemented (web or mobile) |

### 2.6 Payments (cahier §4.6 — J5 in scope)
| Requirement | Status | Notes |
|---|---|---|
| **CIB / SATIM** | ❌ | Scaffold only — simulates in test, declines in production |
| **BaridiMob** | ❌ | Scaffold only — same |
| Cash on Delivery | ✅ | Working |
| Settlement & refunds | ❌ | No-op stubs |
| SSL / secure transactions | ✅ | Production deployed with SSL |

### 2.7 Excluded scope (cahier §4.7, master-plan §11.2, J5 invoice)
| Item | Status |
|---|---|
| ERP / WMS / **POS** synchronization | 🚫 Out of scope (confirmed) |
| **PDF generation** (invoices, delivery notes) | 🚫 Out of scope per master-plan & J5 — ⚠️ but J3 invoice listed PDF download → **resolve with PO** |

### 2.8 Non-functional & UX (cahier §5, §6; master-plan §13)
| Requirement | Status | Notes |
|---|---|---|
| Performance < 3s / **Lighthouse > 80–90** | ⚠️ | PWA shipped; Lighthouse score not measured/verified |
| Security: HTTPS | ✅ | |
| Security: **OWASP basic audit / pen-test** | ⚠️ | Not evidenced; in spec §5.3 / master-plan §13.1 |
| Backups policy | ⚠️ | Ops task (deployment) |
| **Test coverage > 70% web/backend, > 60% mobile** | ⚠️ | Mobile 107 tests; frontend E2E good; **coverage targets not measured** across apps |
| Accessibility **WCAG 2.1** | ⚠️ | Partial — keyboard nav & some states incomplete |
| Breadcrumb navigation | ❌ | Missing (back-office confirmed; verify frontend) |
| Contact form + **map integration** | ⚠️/❌ | Form submission unverified; **map not implemented** |
| Bilingual RTL/LTR (AR/FR/EN) | ✅ | UI translated (seed product names EN-only) |
| Branding / design system | ⚠️ | Pending Figma deliverables (LTR layout, design system, states) |

### 2.9 Acceptance criteria & delivery (master-plan §13, J5 invoice)
| Criterion | Status |
|---|---|
| Production deployment (VPS + SSL) | ✅ Done |
| Payments functional in production (CIB/Baridimob/COD) | ❌ Only COD |
| Mobile apps published (App Store + Play) | ❌ Pending |
| Notifications (email/SMS/push) operational | ❌ Partial (email dev-mode only) |
| Admin training (2 sessions) + access transfer | ❌ Pending |
| Technical docs + admin guide | ⚠️ Partial |
| UAT passed + signed PV de recette | ⚠️ UAT run; sign-off pending |

---

## 3. Gaps NOT yet in the task lists (to add)

| New gap | Spec ref | Suggested owner | Priority |
|---|---|---|---|
| **SMS notifications** (order confirm/status) | §4.5, J5 | BE + PO (SMS provider) | P1 |
| **In-app notification center** | §4.5 | BE + FE + RN | P1 |
| **Abandoned-cart reminder** | §4.5 | BE | P2 |
| **Contact page map integration** | §6.3 | FE + PO (map key) | P2 |
| **Web address book** finalization | J5 | FE | P1 |
| **Lighthouse / performance verification** (>80) | §5.1, J5 | FE / QA | P1 |
| **OWASP basic security audit** | §5.3, master §13 | BE / QA | P1 |
| **Test-coverage measurement** (70%/60% targets) | master §13 | QA | P2 |
| **Breadcrumbs (frontend)** | §6.3 | FE | P2 |
| **Social login (Google/Facebook)** | §4.1 | FE/BE + PO decision | Decision |
| **Personalized / recommended products** | §4.3 | BE/FE + PO decision | Decision |

## 4. Reprioritize / reclassify (already in lists)

| Item | Change |
|---|---|
| **Push notifications** (BE-8 / RN-6) | P2 → **P1** (J5 scope) |
| **Production SMTP email** (BE-4) | Keep P0 — it's an explicit J5 acceptance criterion |
| **Product reviews & ratings** (BE-7, FE-6) | **Beyond spec** — not a contractual requirement; treat as optional enhancement |
| **Wishlist sync** (BE-9, RN-6) | Beyond core spec (only "Favoris" in the *Version Complète* proposal) — confirm with PO |

## 5. Decisions needed from the Product Owner

1. **Social login** (§4.1) — deliver or descope by avenant?
2. **Personalized/recommended products** (§4.3) — deliver a recommendation feature, or accept featured/recently-viewed as the "smart home"?
3. **PDF invoices** — spec exclusions say out of scope, but the J3 invoice promised PDF download. Clarify.
4. **SMS provider** — confirm the Algerian SMS gateway account (blocks SMS notifications).
5. **Reviews / wishlist sync** — in scope or not (both are beyond the cahier des charges core).
