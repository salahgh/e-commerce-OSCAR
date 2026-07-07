# MODULE M1: Authentication & Customer Profile

Login, registration, email verification, password reset, and profile management (including avatar upload) run on Vendure's native auth. The web storefront rides the Vendure session cookie, the mobile app stores a bearer token in SecureStore, and the back-office layers a Redux/RBAC model on top of Vendure roles.

**Stack:** Vendure authStrategy · AuthContext (web) · SecureStore (mobile) · authSlice + RBAC (admin)

---

### 1. Feature Reliability & Business Logic

#### [HIGH · Reliability · AUTH-1] Registration always tells users to verify — but verification is off and email never sends
- **Evidence:** `AuthContext.tsx:130` hard-codes `requiresVerification:true` on success, while the backend runs `requireVerification:false` (`vendure-config.ts:115`) and `EmailPlugin` is in permanent devMode.
- **Impact:** New users are routed to `/verification-pending` and told to check an inbox for a mail that is written to disk, never delivered — a dead-end onboarding funnel.
- **Fix:** Derive `requiresVerification` from the actual mutation response, align the backend flag with intent, and enable a real SMTP transport (see [PLAT-2](./09-platform-devops.md#rel--plat-2)).

#### [MEDIUM · Reliability · AUTH-2] Avatar upload is a non-atomic two-step write that orphans assets and 500s on bad input
- **Evidence:** `oscar-shop.resolver.ts:106-125` creates the Asset then updates the customer; the previous avatar is never deleted and a rejected mime type is rethrown as `InternalServerError`.
- **Impact:** Every re-upload leaks an orphaned asset; a wrong file type surfaces to the user as a 5xx instead of a validation message.
- **Fix:** Replace/delete the prior asset and map `MimeTypeError` to a user-facing error result.

### 2. Standard E-Commerce Security & Data Protection

#### [HIGH · Security · AUTH-3] Customer PII persisted unencrypted to AsyncStorage on mobile
- **Evidence:** `persistence.ts:14,36` snapshots the whole Apollo cache — which holds `customer{firstName,lastName,emailAddress}`, full addresses with `phoneNumber`, and order history — to plaintext AsyncStorage key `oscar-apollo-cache`; `USER_DATA` is stored the same way.
- **Impact:** On a rooted or backup-extracted Android device, names, emails, phones and street addresses are readable in the clear; guest data lingers indefinitely (purge only on explicit logout).
- **Fix:** Allowlist the persisted cache to product/collection entities (drop `Customer:*`/`Order:*`/`activeOrder`), or encrypt the snapshot with a SecureStore-held key; purge on login too.

#### [MEDIUM · Security · AUTH-4] Dead bearer-token plumbing contradicts the docs and invites an XSS regression
- **Evidence:** `apollo-wrapper.tsx:43` reads `localStorage.getItem('token')`, but nothing ever writes it — auth actually rides the Vendure session cookie (`credentials:'include'`). CLAUDE.md still claims "JWT in localStorage."
- **Impact:** Not exploitable today, but a future dev "fixing" auth by storing the session token in localStorage would reintroduce an XSS-stealable credential. The real lever — cross-subdomain `SameSite` cookie config — is undocumented.
- **Fix:** Delete the dead bearer path and correct the docs to describe the cookie session.

#### [MEDIUM · Security · AUTH-5] Back-office bootstraps auth & permissions from tamperable localStorage
- **Evidence:** `authSlice.ts:35-57` sets `isAuthenticated = !!storedToken` and restores `permissions` from `localStorage['vendure_user']` before the async `Me` refresh returns.
- **Impact:** Editing local storage flips client-side gating (e.g. injecting `SuperAdmin`) until `Me` resolves. **Cosmetic only** — the server still enforces `@Allow` per role — but "logged-in/authorized" UI derives from a non-authoritative source.
- **Fix:** Treat `Me` as the sole source of truth before rendering privileged UI; don't derive `isAuthenticated` from a channel token.

**Also noted (low severity)**
- **AUTH-6** — Back-office login accepts a 4-char password (`Login.tsx:13` `min(4)`) and defaults remember-me on. Client hint only; raise to match server policy.
- **AUTH-7** — Storefront login discards the intended destination (no `redirect` param); users bounced from `/user/orders` land on the homepage. Add a same-origin, path-only redirect.

### 3. Performance & Speed Bottlenecks

#### [MEDIUM · Performance · AUTH-8] AuthContext value rebuilt on every render (shared blast radius with cart)
- **Evidence:** `AuthContext.tsx:241-258` passes a fresh object literal with non-`useCallback` methods (contrast the correctly-memoized `WishlistContext`).
- **Impact:** Every provider render re-renders all `useAuth()` consumers; compounds the cart re-render storm ([CART-12](./03-cart-checkout.md#per--cart-12)).
- **Fix:** `useMemo` the value and `useCallback` the methods.

### 4. Step-by-Step Improvement Plan

**Phase 1 — High priority (data leaks & broken flows)**
- [ ] Stop persisting PII: allowlist the mobile Apollo cache to catalog entities or encrypt the snapshot (AUTH-3)
- [ ] Fix the registration→verification funnel: derive `requiresVerification` from the response and enable real email (AUTH-1)

**Phase 2 — Structural hardening**
- [ ] Delete dead bearer-token code; make `Me` the single source of truth for admin auth state (AUTH-4, AUTH-5)
- [ ] Make avatar upload atomic; map mime errors to user-facing results (AUTH-2)
- [ ] Raise password minimums to match server policy; add a validated post-login redirect (AUTH-6, AUTH-7)

**Phase 3 — Speed tuning**
- [ ] Memoize AuthContext value/methods (AUTH-8)

---

### ✓ Verified OK
- Mobile session token is stored in **expo-secure-store** (Keychain/Keystore), captured only from response headers, never logged.
- No IDOR on profile: `updateCustomerAvatar` is strictly self-scoped via `ctx.activeUserId` — it never accepts a customer id.
- Union-type error handling is thorough across login/register/verify/reset on both web and mobile (branch on `__typename`).
- Server-side RBAC is genuine — admin resolvers carry real `@Allow(Permission.*)`; client role gating maps to true Vendure permission strings.
