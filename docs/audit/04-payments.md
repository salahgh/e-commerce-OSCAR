# MODULE M4: Payments — COD / CIB / Baridimob

Three payment methods target the Algerian market: Cash on Delivery (the only one currently seeded), CIB interbank card, and Baridimob postal. The amount is server-authoritative — clients send only `{method, metadata}` — but settlement logic and the mobile WebView return-flow trust unverified signals.

**Stack:** cash-on-delivery-handler · cib / baridimob handlers · PaymentWebView (mobile) · addPaymentToOrder

---

### 1. Feature Reliability & Business Logic

#### [MEDIUM · Reliability · PAY-1] `createRefund` is stubbed — marks refunds Settled without moving money
- **Evidence:** `cib-payment-handler.ts:119-139` and `baridimob:126-148` return `state:'Settled'` with only a "call the refund API" comment.
- **Impact:** An admin issuing a CIB/Baridimob refund sees success in Vendure, but no funds are returned — accounting and customer-trust breakage.
- **Fix:** Call the real refund API and reflect its result; keep COD manual but label the state accordingly.

#### [MEDIUM · Reliability · PAY-2] Mobile payment screens are mocks with a hardcoded gateway URL and wrong callback scheme
- **Evidence:** `payment/cib.tsx:49-53` builds `https://cib-payment-gateway.dz/checkout?...returnUrl=myapp://payment/callback` — but the app's scheme is `oscar-fashion` (`app.json:8`); the backend is never called to initiate payment. Currently unreachable (checkout gates both as "coming soon").
- **Impact:** Dead code today, but a footgun: adding a route link drops users on a non-existent domain and the `myapp://` return can never fire.
- **Fix:** Keep the gate until a backend `initiatePayment` mutation supplies the URL; fix the return scheme; quarantine the mock.

### 2. Standard E-Commerce Security & Data Protection

#### [HIGH · Security · PAY-3] `dummyPaymentHandler` is registered in the production handler list
- **Evidence:** `vendure-config.ts:140` includes `dummyPaymentHandler` unconditionally; `seed-orders.ts:196` shows a method created on it with `automaticSettle:'true'`.
- **Impact:** The handler is selectable in the Admin UI; a method backed by it settles orders (`PaymentSettled`) with no payment — free, fully-paid orders.
- **Fix:** Include it only when `IS_DEV`: `...(IS_DEV ? [dummyPaymentHandler] : [])`.

#### [HIGH · Security · PAY-4] CIB/Baridimob fake an authorization in `testMode` — which defaults to `true`
- **Evidence:** `cib-payment-handler.ts:43-47` (`testMode … defaultValue:true`) and `:61-74` (`if (args.testMode) { … state:'Authorized' }`); same in Baridimob.
- **Impact:** If an admin enables a CIB/Baridimob method and leaves the default on, any customer calling `addPaymentToOrder` gets an `Authorized` order with no money captured. Latent (only COD is seeded) but unsafe-by-default.
- **Fix:** Default `testMode:false`; force it off when `NODE_ENV==='production'`; never return `Authorized` without a verified gateway response.

#### [HIGH · Security · PAY-5] No server-side payment verification exists; `settlePayment` always succeeds
- **Evidence:** `cib:106-113`, `baridimob:113-120`, `cod:52-60` all return `{success:true}` with a "verify in production" comment and no code; no webhook/callback controller exists anywhere in the backend.
- **Impact:** An `Authorized` (unpaid) online order can be moved to `PaymentSettled` with zero confirmation; there is no channel for a gateway to confirm or deny.
- **Fix:** Implement gateway status verification or a signed webhook; return success only on a confirmed capture whose amount equals `payment.amount`.

#### [HIGH · Security · PAY-6] Mobile WebView decides "paid" from a client-side URL substring, on any origin
- **Evidence:** `PaymentWebView.tsx:43` calls success on `url.includes('/payment/success')`; `status.tsx:39-43` clears the cart and shows "Payment Successful!" purely from a route param. No `originWhitelist`, no post-return order-state check.
- **Impact:** Any page the gateway navigates through containing that substring marks the payment successful in-app. Dead code today, but the design trusts a URL for settlement.
- **Fix:** Match exact host+path of the backend return URL, then query `orderByCode` payment state server-side before showing success; treat the WebView signal as "flow finished," never settlement.

**Also noted (low severity)**
- **PAY-7** — Client-supplied `metadata` is spread last in all three handlers (`cod:40-45`), so it can overwrite stored `paymentMethod`/`expectedAmount`. Audit-trail pollution only (state/amount are set outside metadata). Spread client metadata first.
- **PAY-8** — Mobile `status.tsx` "success" calls `removeAllOrderLines`, invalid against a settled order and unhandled — replace with the cache-null write from [CART-2](./03-cart-checkout.md#high--reliability--cart-2).

### 3. Performance & Speed Bottlenecks

No performance bottlenecks in the payment handlers themselves — they are synchronous, gateway-free stubs today. The relevant async-work concern (email/invoice generation blocking the API thread) lives in [M9 Platform](./09-platform-devops.md), and the promotion recalculation cost on the checkout hot path is in [M6 Promotions](./06-promotions-discounts.md#per--promo-5).

### 4. Step-by-Step Improvement Plan

**Phase 1 — High priority (free-order & fake-settlement risk)**
- [ ] Remove `dummyPaymentHandler` from production; default CIB/Baridimob `testMode:false` (PAY-3, PAY-4)
- [ ] Implement real settlement verification / signed webhook with amount check (PAY-5)

**Phase 2 — Structural hardening**
- [ ] Confirm order state server-side after the WebView return; exact host+path match + originWhitelist (PAY-6)
- [ ] Implement real refund calls; spread client metadata first (PAY-1, PAY-7)

**Phase 3 — Cleanup**
- [ ] Fix the mobile return scheme & mock-URL footguns; correct the status-screen cart clear (PAY-2, PAY-8)

---

### ✓ Verified OK
- **Amount is server-authoritative** — clients pass only `{method, metadata}`; Vendure computes the payment amount from the order total. No client price manipulation.
- **Idempotency** — once an order leaves `ArrangingPayment`, a second `addPaymentToOrder` returns `OrderPaymentStateError`; double-tap is safe.
- **Last-item stock race** — no custom OrderProcess/allocation strategy; Vendure's default allocation and `InsufficientStockError` handling are intact.
- CIB/Baridimob **decline** (not fake-succeed) on the non-test path; COD auto-authorize is appropriate and displayed honestly as unpaid.
