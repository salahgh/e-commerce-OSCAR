# MODULE M6: Promotions & Discounts

A single global promotion action applies the highest `discount-XX` collection percentage as a per-unit discount, evaluated server-side on every order mutation. Variants also carry independent sale-price custom fields, and coupon-code operations exist in the cart context.

**Stack:** collection-discount-action · variant discountPercent/originalPrice · coupon ops (CartContext) · discount formatters (shared)

---

### 1. Feature Reliability & Business Logic

#### [MEDIUM · Reliability · PROMO-1] Collection discount stacks with a variant sale price → double discount
- **Evidence:** `collection-discount-action.ts:60` takes its percentage off the variant's *current* price; the back-office stores an independent sale `price` alongside `originalPrice`/`discountPercent` with nothing deriving one from the other.
- **Impact:** A variant already priced at its sale value that is also in a `discount-30` collection is discounted a second time at the cart — the two mechanisms compound.
- **Fix:** Pick one source of truth: exclude variants carrying a `discountPercent` from the collection promotion, or drive the collection discount off `originalPrice`.

#### [MEDIUM · Reliability · PROMO-2] The checkout discount-code UI is decorative — not wired to anything
- **Evidence:** `checkout/page.tsx:259-264` — the coupon input has no state binding and the "apply" button no `onClick`; `applyCoupon`/`removeCoupon` exist in `CartContext` but are never consumed.
- **Impact:** Customers can't apply promotions anywhere in the purchase flow despite the UI advertising it — a support-ticket generator.
- **Fix:** Bind the input to `applyCoupon` (it already handles the `COUPON_CODE_*` error variants).

**Also noted (low severity)**
- **PROMO-3** — The discount is not rounded to integer cents (`collection-discount-action.ts:60`), e.g. `1333 × 0.30 = 399.9`, while the display path rounds — up to a 1-cent mismatch between shown and applied. Wrap in `Math.round`.

### 2. Standard E-Commerce Security & Data Protection

#### [MEDIUM · Security · PROMO-4] Promotion grants discounts from private/unpublished collections
- **Evidence:** `collection-discount-action.ts:48-53` calls `getCollectionsByProductId(ctx, productId, false)` — the `false` includes unpublished/private collections.
- **Impact:** A discount staged in a private collection (not yet meant to be live) silently applies at the cart.
- **Fix:** Pass `publicOnly:true` unless private-collection discounts are intentional.

**✓ Verified OK**
- Discount percentage is clamped `0 < pct ≤ 100` — can't go negative or exceed 100%.
- The promotion is **server-evaluated** from live collection membership on every mutation — not client-controllable, and re-checked server-side.
- Coupon operations (`ApplyCouponCode`/`RemoveCouponCode`) are correctly implemented in the cart context (only the checkout UI hookup is missing).

### 3. Performance & Speed Bottlenecks

#### [MEDIUM · Performance · PROMO-5] Promotion queries collections per order line on every recalculation (N+1 on the checkout hot path)
- **Evidence:** `collection-discount-action.ts:48-53` runs one `getCollectionsByProductId` DB query per line, re-executed on every add/adjust/remove and shipping change.
- **Impact:** N+1 DB hits on the busiest path exactly when a flash sale drives promotion recalcs hardest.
- **Fix:** Memoize per-product collection slugs in `RequestContextCacheService` (as core promotion conditions do).

### 4. Step-by-Step Improvement Plan

**Phase 1 — High priority (incorrect pricing)**
- [ ] Resolve the collection-vs-variant double-discount; pass `publicOnly:true` (PROMO-1, PROMO-4)
- [ ] Round the discount to integer cents (PROMO-3)

**Phase 2 — Structural hardening**
- [ ] Wire the checkout coupon input to `applyCoupon` (PROMO-2)

**Phase 3 — Speed tuning**
- [ ] Memoize per-product collection lookups on the promotion hot path (PROMO-5)
