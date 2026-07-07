# MODULE M9: Platform, Infrastructure & DevOps

The cross-cutting layer: Vendure config (secrets, TLS, CORS, auth, email, jobs), repository hygiene, shared-package integrity, and dependency drift. This module holds the single Critical finding and the deployment-transport risks that undercut protections elsewhere.

**Stack:** vendure-config.ts · EmailPlugin / job queue · git hygiene · @oscar/shared + graphql-shop

---

### 1. Feature Reliability & Business Logic

#### [HIGH · Reliability · PLAT-2] `EmailPlugin` is permanently in devMode — production sends no email
- **Evidence:** `vendure-config.ts:263-265` — `EmailPlugin.init({devMode:true, …})` with no `IS_DEV` gate (unlike the playground options, which are gated).
- **Impact:** Password-reset, verification, and order-confirmation emails are written to `static/email/test-emails` and never delivered — account recovery is effectively broken for real users.
- **Fix:** Gate `devMode` on `IS_DEV` and configure a real SMTP transport for production.

#### [HIGH · Reliability · PLAT-3] Two seed paths charge shipping 100× apart; no server-side wilaya shipping calculator
- **Evidence:** `initial-data.ts:14` `{price:500}` (= 5.00 DZD) vs `seed-orders.ts:174` `{value:'50000'}` (= 500 DZD); the shared zone table `{1:300,2:400,3:500,4:800}` is referenced by no client checkout.
- **Impact:** Depending on which seed ran, every order is charged 5 DA or 500 DA flat; a zone-4 wilaya pays the same as Algiers; marketing copy promising zone pricing contradicts billing.
- **Fix:** Implement a server `ShippingCalculator` keyed on the order's wilaya (reuse the shared zone table on the backend); align the two seeds' units.

#### [MEDIUM · Reliability · PLAT-4] Five price formatters with two opposing unit conventions — an armed 100× foot-gun
- **Evidence:** Back-office `lib/utils.ts:10` expects whole DZD (callers must pre-divide) vs `lib/facet-utils.ts:279` expects cents, in the same app; the shared package duplicates `formatPrice` in two files.
- **Impact:** Any new call site that guesses the wrong convention renders prices 100× off — the exact class of unit bug that already shipped in PLAT-3.
- **Fix:** Export one shared cents-in formatter; delete the duplicate; make the back-office helper delegate to it.

#### [MEDIUM · Reliability · PLAT-5] Wilayas dataset mixes 58 official provinces with 11 pseudo-wilayas that duplicate communes
- **Evidence:** `wilayas.ts` holds codes 01–69; 59–69 (Aflou, Messaad, El Kantara…) aren't official wilayas and reuse existing commune postal codes; storefront copy says "les 48 wilayas."
- **Impact:** The same physical address can be stored with two different `province` values — breaking order filtering/reporting and any future zone shipping.
- **Fix:** Normalize to the official 58; map delivery-hub codes internally if the courier needs them; fix the copy.

#### [MEDIUM · Reliability · PLAT-6] Dependency drift: Apollo Client v3 vs v4, and a frozen mobile schema snapshot
- **Evidence:** `@apollo/client ^3.14` (web/backoffice/graphql-shop) vs `^4.0.9` (mobile); mobile codegen reads a committed `schema.graphql`, not live introspection.
- **Impact:** GraphQL-layer patterns/bugfixes can't be shared web↔mobile; backend schema changes silently miss mobile until someone re-fetches the schema.
- **Fix:** Document (or converge) the Apollo split; add a CI step that re-fetches the schema and fails on diff.

**Also noted (low severity)**
- **PLAT-7** — `@oscar/shared` is largely phantom: the back-office imports nothing from it and forks its own `facet-utils`/constants; several shared constants have no consumers. Pick one owner per utility.
- **PLAT-8** — `/health` never checks the DB (`health.controller.ts:5`) — deploy healthchecks pass while Postgres is down. Ping `SELECT 1`.
- **PLAT-9** — Job queue runs inside the API process (no `bootstrapWorker`); reindex/email jobs compete with request serving. Run a dedicated worker in prod.
- **PLAT-10** — `package.json` migration scripts point at a `VendureConfig`, not a `DataSource`, so the documented `migration:generate/run/revert` commands fail; no working revert path.
- **PLAT-11** — The `seed` script bakes in `SEED_CONFIRM=yes`, self-approving the destructive-write guard `populate.ts` exists to enforce. Gate on non-production.
- **PLAT-12** — Dead/duplicate GraphQL operations and unpaginated collection queries ship in the shared package; `ts-node`/`typescript` are backend prod dependencies. Prune.

### 2. Standard E-Commerce Security & Data Protection

#### [CRITICAL · Security · PLAT-1] A real, reused password and the cookie secret are committed to git
- **Evidence:** `docs/archive/deploy-hestia/*.sh` hardcode `DB_PASSWORD/USER_PASSWORD/SUPERADMIN_PASSWORD="majmajBS13.."` and `COOKIE_SECRET="oscar-production-cookie-secret-2024"`; the same password appears in tracked `apps/mobile/.claude/settings.local.json:12` (`PGPASSWORD=…`), confirming it is live and reused.
- **Impact:** Anyone with repo access can derive production DB, Vendure superadmin, and hosting-panel access, and can forge session cookies with the static secret.
- **Fix:** Rotate all four credentials now; generate a random `COOKIE_SECRET`; delete the archive scripts and `.claude/settings.local.json` from tracking and purge history (`git filter-repo`).

#### [HIGH · Security · PLAT-13] Production back-office talks to the Admin API over plain HTTP
- **Evidence:** Tracked `apps/backoffice/.env.production:1` — `VITE_GRAPHQL_URL=http://leqta.com:8085/admin-api` (the Apollo fallback is also `http://`).
- **Impact:** Every admin login, session cookie, order/customer PII, and mutation travels unencrypted and is trivially interceptable — a `Secure` cookie won't even transmit over HTTP. This nullifies most other protections. (The frontend `.env.production` uses HTTPS `api.oscarfashion.dz` — the two files disagree on the real domain.)
- **Fix:** Put the admin API behind TLS (the `deploy/caddy` infra exists) and use `https://`; confirm the cookie is `Secure; HttpOnly; SameSite`.

#### [MEDIUM · Security · PLAT-14] Postgres TLS with `rejectUnauthorized:false`; account verification off; dummy handler in prod
- **Evidence:** `vendure-config.ts:135` `ssl:{rejectUnauthorized:false}`; `:115` `requireVerification:false` (never flipped); `:140` registers `dummyPaymentHandler` in prod (see [PAY-3](./04-payments.md#high--security--pay-3)).
- **Impact:** DB TLS accepts any certificate (MITM-able); production accounts are created without proving email ownership.
- **Fix:** Pin the provider CA; set `requireVerification:!IS_DEV`; gate the dummy handler to dev.

#### [MEDIUM · Security · PLAT-15] Confidential business documents and local tool/IDE files are tracked; `.gitignore` misses `.env.production`
- **Evidence:** `git ls-files` shows invoices/commercial proposals under `docs/business/`, 9 `.idea/` files, 4 `.claude/settings.local.json` (one holding the PLAT-1 password), and `.env.production` files; `.gitignore` covers only `.env*.local`.
- **Impact:** Pricing/invoice data and a live DB password are exposed to anyone with repo access.
- **Fix:** Move docs to private storage; `git rm --cached` the tool files; add `.env.production` and `.claude/settings.local.json` to `.gitignore`.

#### [MEDIUM · Security · PLAT-16] Cleartext-HTTP fallback endpoints baked into client bundles; dev proxy skips TLS verify
- **Evidence:** Mobile `apollo/client.ts:35` falls back to `http://leqta.com:8085/shop-api`; back-office `apollo-client.ts:6` falls back to `http://localhost:8085`; `vite.config.ts:22` proxy `secure:false`.
- **Impact:** A misconfigured build silently transports the session token over HTTP instead of failing loudly.
- **Fix:** Remove the HTTP fallbacks; fail fast (visible error) when the API URL env var is unset.

**✓ Verified OK**
- Production **fails fast** on missing `COOKIE_SECRET`/`SUPERADMIN_PASSWORD` (`vendure-config.ts:25-33`).
- CORS **defaults to deny** cross-origin in production when `CORS_ORIGINS` is unset; GraphQL playground/debug are dev-only.
- No real secrets in any tracked `.env*` (`apps/backend/.env` was never committed); the current deploy path generates `COOKIE_SECRET` via `openssl rand`.
- Every shop mutation selects its `ErrorResult` variants; `graphql@^16.12` and the scalar maps are consistent across all packages.

### 3. Performance & Speed Bottlenecks

Running the job queue inside the API process (PLAT-9) is the main platform-level throughput risk under load — reindexing and email jobs contend with request serving. Shipping `ts-node`/`typescript` as prod dependencies (PLAT-12) inflates the image. Both are folded into the plan below.

### 4. Step-by-Step Improvement Plan

**Phase 1 — High priority (secrets, transport, delivery)**
- [ ] Rotate the committed credentials + cookie secret; purge from history (PLAT-1)
- [ ] Move the admin API to HTTPS; remove HTTP fallbacks from all bundles (PLAT-13, PLAT-16)
- [ ] Enable real SMTP email; implement server-side wilaya shipping calculation (PLAT-2, PLAT-3)
- [ ] Untrack confidential docs + `.env.production` + `.claude` files; fix `.gitignore` (PLAT-15)

**Phase 2 — Structural hardening**
- [ ] Pin DB CA; set `requireVerification:!IS_DEV`; gate the dummy handler to dev (PLAT-14)
- [ ] Unify on one cents-in price formatter; normalize the wilayas dataset (PLAT-4, PLAT-5)
- [ ] Add a DB check to `/health`; fix migration scripts; de-fang the seed script (PLAT-8, PLAT-10, PLAT-11)

**Phase 3 — Speed tuning & cleanup**
- [ ] Run a dedicated job worker in production (PLAT-9)
- [ ] Resolve the Apollo v3/v4 split + CI schema-drift check; prune dead deps/operations (PLAT-6, PLAT-7, PLAT-12)
