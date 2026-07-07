# MODULE M3: Cart & Checkout

The cart is an optimistic Apollo layer over Vendure's active order on both clients; checkout collects address and shipping method, then transitions the order to `ArrangingPayment` and calls `addPaymentToOrder`. This is the revenue path and the module most exposed to network turbulence during a flash sale.

**Stack:** CartContext (web + mobile) · Vendure order FSM · optimisticCart (mobile) · checkout pages

---

### 1. Feature Reliability & Business Logic

#### [HIGH · Reliability · CART-1] Checkout dead-ends in `ArrangingPayment` — no rollback on either client
- **Evidence:** The only transition in the codebase is to `ArrangingPayment` (`checkout/page.tsx:231`, mobile `checkout/index.tsx:191`); grep finds no transition back to `AddingItems` and no code reads `order.state` to recover.
- **Impact:** If `addPaymentToOrder` fails (decline, dropped connection) or the user leaves, the order is stuck: retry throws `OrderStateTransitionError` and every cart mutation returns `OrderModificationError`. The customer cannot buy without support — and this is the *normal* failure under spike load.
- **Fix:** On mount/submit, if `state === 'ArrangingPayment'` resume at payment or transition back to `AddingItems` before edits; roll back on payment failure/cancel.

#### [HIGH · Reliability · CART-2] Ghost cart after checkout — `activeOrder` is never cleared
- **Evidence:** Mobile `checkout/index.tsx:202-215` navigates to confirmation without `refetchCart()` or a cache write; `AddPaymentToOrder` returns the same order id, so the normalized `activeOrder` reference stays populated and `CartContext` derives items from `order.lines` with no `active` check.
- **Impact:** After "order confirmed", the cart tab and badge still show the purchased items; tapping +/− there errors until a manual refresh.
- **Fix:** Write `activeOrder: null` to the cache (or refetch) after a successful payment and ignore orders where `active === false`.

#### [HIGH · Reliability · CART-3] Guest→login cart merge never reflected on the web client
- **Evidence:** `AuthContext.tsx:90-98` `login` only calls `refetchCustomer()`; `CartContext` discards the auth value and never refetches on auth change. Vendure merges the guest cart server-side on authenticate.
- **Impact:** After login (SPA, no remount) the badge/mini-cart/checkout show the stale pre-login cart until a full reload — users can check out against a cart that differs from what the server will charge.
- **Fix:** Await a `GetActiveOrder` refetch in `login`/`verifyEmail` (or add it to the login mutation's `refetchQueries`).

#### [HIGH · Reliability · CART-4] RetryLink retries *mutations* — duplicate cart items and double payment attempts
- **Evidence:** `apollo-wrapper.tsx:68-74` — `RetryLink({attempts:{max:3}})` sits ahead of all operations, mutations included, retrying on any non-`UNAUTHENTICATED` error.
- **Impact:** A network error after the server committed (common on mobile) re-runs `addItemToOrder` (quantity doubled) or `addPaymentToOrder`/`transitionOrderToState` up to 3× — duplicate lines, double payment attempts, state errors.
- **Fix:** Gate `retryIf` to query operations only.

#### [MEDIUM · Reliability · CART-5] Checkout mutation error unions ignored; guest email not required or validated
- **Evidence:** `checkout/page.tsx:159` `ready` omits email; only `AlreadyLoggedInError` is checked on `setCustomerForOrder`, and `setShipping`/`setBilling`/`setShippingMethod` results are never inspected (arrive as data under `errorPolicy:'all'`).
- **Impact:** Guests with an empty/conflicting email get no shipping methods and a cryptic `OrderStateTransitionError` at submit, with no pointer to the cause.
- **Fix:** Require + validate email in `ready`, branch on each union variant, surface field-level errors.

#### [MEDIUM · Reliability · CART-6] Android hardware back abandons payment/checkout into an inconsistent state (mobile)
- **Evidence:** No `BackHandler`/`usePreventRemove` anywhere; `PaymentWebView.tsx:87` guards only the footer Cancel button; `predictiveBackGestureEnabled:true` (`app.json:29`) pops the whole route.
- **Impact:** A mid-payment back-swipe silently abandons the gateway (order left in `ArrangingPayment`, compounding CART-1); from the summary step, back exits checkout entirely.
- **Fix:** Intercept hardware/predictive back on both screens and route it into the existing cancel-confirm / step-back logic.

**Also noted (low severity)**
- **CART-7** — No stock-aware quantity clamping; rapid +/− taps enqueue racing `adjustOrderLine` mutations (mobile `cart.tsx:175`); web cart "+" is unbounded (`cart/page.tsx:101`). Debounce to latest-value; disable at stock ceiling.
- **CART-8** — Checkout progress is in-memory only (mobile) — an app kill mid-flow restarts at the shipping step (server-side address/method survive, so recovery is partial).
- **CART-9** — Storefront "Buy now" calls the same handler as "Add to cart" with no navigation (`products/[slug]/page.tsx:296`) — mislabeled duplicate CTA.
- **CART-10** — No scheduled cleanup for orders stranded in `ArrangingPayment`; default allocation means no stock is locked, but draft orders accumulate.

### 2. Standard E-Commerce Security & Data Protection

Checkout inherits the payment-integrity findings in [M4 Payments](./04-payments.md) (client-trusted settlement, metadata spread) and the PII-persistence finding in [M1 (AUTH-3)](./01-authentication-profile.md#high--security--auth-3). Cart-specific: the full `OrderFields` fragment returned on every mutation includes `payments{metadata}` — safe today, but a leak vector if a handler ever writes non-public gateway data (see [CART-11](#per--cart-11)).

**✓ Verified OK**
- Optimistic cart is correct and unit-tested (mobile): full recomputed-cents optimistic order, Apollo auto-reverts on error, the update writer ignores error unions and avoids refetch waterfalls.
- Double-submit is guarded at the UI on both clients (Place Order disabled while submitting); `QuantityStepper` parses/clamps typed values so negatives/huge numbers can't reach the API.
- Guest→login cart *data* merges server-side (the same session token is kept across login) — CART-3 is a client-refresh gap, not data loss.
- Apollo order normalization uses `merge:false` on `Order.lines`/`Customer.addresses` — no stale-line anomalies.

### 3. Performance & Speed Bottlenecks

#### [MEDIUM · Performance · CART-11] Every cart mutation returns the full order mega-fragment, then clients refetch it again
- **Evidence:** `shop-cart.graphql:37-102` — `OrderFields` (both addresses, customer, payments, fulfillments) is the response for every add/adjust/remove; `checkout/page.tsx:180-184` then also runs `setShipping→setBilling→refetch→refetchCart` (same fragment again).
- **Impact:** 2–3× redundant payloads on every quantity change.
- **Fix:** Slim `CartFields` (totals + lines) for mutations; reserve payments/fulfillments for the confirmation query; drop the redundant refetches (the mutation already updates the cache).

#### [MEDIUM · Performance · CART-12] Cart context value rebuilt every render (web + mobile) — provider-wide re-render storm
- **Evidence:** `CartContext.tsx` (web `:240-255`, mobile `:220-262`) passes fresh object literals + non-memoized methods; mobile product cards additionally subscribe to Wishlist without `React.memo`.
- **Impact:** Mini-cart open/close and any cart tick re-render every consumer incl. the tab badge; wishlist heart-taps re-render every visible card — visible jank on mid-range Android.
- **Fix:** `useMemo` the value (ideally split state/actions contexts); `React.memo` cards and narrow the wishlist subscription to `has(id)`.

### 4. Step-by-Step Improvement Plan

**Phase 1 — High priority (broken checkouts)**
- [ ] Add an `ArrangingPayment` recovery/rollback path on both clients (CART-1)
- [ ] Clear `activeOrder` after successful payment; ignore inactive orders in cart (CART-2)
- [ ] Gate `RetryLink` to queries only (CART-4)
- [ ] Refetch the active order on login to reflect the merged cart (CART-3)

**Phase 2 — Structural hardening**
- [ ] Validate/require guest email; branch on every checkout mutation union (CART-5)
- [ ] Intercept Android back in payment/checkout; debounce quantity adjusts with stock clamping (CART-6, CART-7)
- [ ] Persist/resume checkout step from order state; fix the "Buy now" CTA (CART-8, CART-9)

**Phase 3 — Speed tuning**
- [ ] Introduce a slim cart fragment; remove redundant post-mutation refetches (CART-11)
- [ ] Memoize cart contexts and product cards (CART-12)
- [ ] Add a scheduled sweep for stale `ArrangingPayment` orders (CART-10)
