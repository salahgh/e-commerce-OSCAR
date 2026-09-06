# Home / office delivery (per-wilaya, back-office managed) — implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship two delivery methods (home delivery, courier office pickup), each priced per wilaya from the `wilaya_shipping` table and editable in the back-office, replacing the single flat method.

**Architecture:** Keep origin's DB-backed `WilayaShipping` entity/service/admin API and extend it to two nullable prices. The Vendure `ShippingCalculator` gains a `mode` argument; a bootstrap service creates the two shipping methods with that argument and retires the legacy one. The storefront already consumes `eligibleShippingMethods`, so it only needs the merged checkout logic tidied.

**Tech Stack:** Vendure 3.5 (NestJS, TypeORM, Postgres), Next.js 16 storefront (`@oscar/graphql-shop` Apollo hooks), React/Vite back-office, `node --test` via ts-node for backend unit tests.

**Spec:** `docs/superpowers/specs/2026-09-06-home-office-delivery-design.md`

## Global Constraints

- Prices are stored in minor units (centimes): 30000 = 300 DZD. Back-office and storefront display DZD.
- Method codes are exactly `home-delivery` and `office-delivery`; legacy code is `standard-shipping`.
- Calculator code stays `wilaya-shipping-calculator` (already referenced by the deployed `standard-shipping` row).
- Unknown wilaya: home delivery falls back to 50000 (500 DZD); office is not offered.
- Free shipping above channel `freeShippingThreshold` (DZD custom field) applies to both modes.
- Commit after each task.
- Backend unit tests: `pnpm --filter @oscar/backend test:unit`; storefront: `pnpm --filter @oscar/frontend test:unit`.

---

### Task 0: Finish the in-progress merge with a compiling tree

The local branch is mid-merge of `origin/main` (MERGE_HEAD 67da061). Resolution policy: origin's backend shipping stack wins; local's `OrderWilayaService`, storefront, shared and docs changes stay.

**Files:**
- Resolve: `apps/backend/src/vendure-config.ts` (take origin's version verbatim)
- Delete: `apps/backend/src/plugins/oscar-plugin/shipping/wilaya-rate-calculator.ts`, `.../shipping/wilaya-shipping-rates.ts`, `.../shipping/shipping-setup.service.ts`
- Modify: `apps/backend/src/plugins/oscar-plugin/oscar-plugin.ts` (origin's providers + `OrderWilayaService`)

- [ ] **Step 1: Resolve vendure-config.ts to origin's content and drop the static-table files**

```bash
git show origin/main:apps/backend/src/vendure-config.ts > apps/backend/src/vendure-config.ts
git add apps/backend/src/vendure-config.ts
git rm -q apps/backend/src/plugins/oscar-plugin/shipping/wilaya-rate-calculator.ts \
  apps/backend/src/plugins/oscar-plugin/shipping/wilaya-shipping-rates.ts \
  apps/backend/src/plugins/oscar-plugin/shipping/shipping-setup.service.ts
```

- [ ] **Step 2: Plugin registration** — `oscar-plugin.ts` providers become `[OscarService, DashboardService, WilayaShippingService, OrderWilayaService]`, `entities: [WilayaShipping]`; remove the `ShippingSetupService` import.

- [ ] **Step 3: Type-check** — `pnpm type-check` at the root must exit 0. Fix only compile errors caused by the merge.

- [ ] **Step 4: Storefront unit tests** — `pnpm --filter @oscar/frontend test:unit` → 11 pass.

- [ ] **Step 5: Commit the merge**

```bash
git add -A -- apps packages docs CLAUDE.md
git commit -m "Merge origin/main: keep DB-managed wilaya pricing, carry over checkout, i18n and wilaya bookkeeping"
```

### Task 1: Pure pricing helper (TDD)

**Files:**
- Create: `apps/backend/src/plugins/oscar-plugin/shipping/wilaya-pricing.ts`
- Test: `apps/backend/src/plugins/oscar-plugin/shipping/wilaya-pricing.test.ts`
- Modify: `apps/backend/package.json` (add `test:unit`)

**Interfaces (Produces):**

```ts
export type DeliveryMode = 'home' | 'office';
export const FALLBACK_HOME_PRICE = 50000;
export function normalizePlace(value: string): string; // "Béjaïa " -> "bejaia"
export function findWilayaRow<T extends { code: string; name: string; nameAr: string }>(
  rows: readonly T[], province: string | null | undefined): T | undefined;
export function quoteDelivery(
  row: { homePrice: number | null; officePrice: number | null } | undefined,
  mode: DeliveryMode, orderSubTotalWithTax: number, freeShippingThresholdMinor: number | null): number | undefined;
```

- [ ] **Step 1: package.json script**

```json
"test:unit": "cross-env TS_NODE_TRANSPILE_ONLY=1 \"NODE_OPTIONS=--require ts-node/register --no-experimental-strip-types\" node --test src/**/*.test.ts"
```

- [ ] **Step 2: Failing tests** (`node:test` + `node:assert/strict`):
  - `findWilayaRow` matches `'16'`, `'6'` (padded), `'Alger'`, `'ALGER'`, `'Bejaia'` against row name `'Béjaïa'`, Arabic `'الجزائر'`; returns undefined for `''`, `null`, `'Atlantis'`.
  - `quoteDelivery`: home price returned; office price returned; `null` office → undefined; `null` home → undefined; unknown row + home → 50000; unknown row + office → undefined; subtotal ≥ threshold → 0 for both modes; threshold null → no free shipping.
- [ ] **Step 3: Run** `pnpm --filter @oscar/backend test:unit` → fails with "Cannot find module './wilaya-pricing'".
- [ ] **Step 4: Implement** — normalize = NFD, strip combining marks, lowercase, collapse runs of non-alphanumerics to one space, trim; a province of `/^\d{1,2}$/` is a code (padStart 2); otherwise match normalized `name` or exact trimmed `nameAr`.
- [ ] **Step 5: Run** → all pass. Commit `feat(backend): pure per-wilaya delivery pricing helper`.

### Task 2: Two prices per wilaya — entity, migration, service, admin API, calculator

**Files:**
- Modify: `apps/backend/src/plugins/oscar-plugin/entities/wilaya-shipping.entity.ts` — `@Column({ name: 'price', type: 'int', nullable: true }) homePrice: number | null;` and `@Column({ type: 'int', nullable: true }) officePrice: number | null;`
- Create: `apps/backend/src/migrations/1789000000000-HomeOfficeDelivery.ts`
- Modify: `apps/backend/src/plugins/oscar-plugin/services/wilaya-shipping.service.ts`
- Modify: `apps/backend/src/plugins/oscar-plugin/api/api-extensions.ts` (admin types), `.../api/oscar-admin.resolver.ts`
- Modify: `apps/backend/src/plugins/oscar-plugin/shipping/wilaya-shipping-calculator.ts`

**Interfaces (Produces):**

```ts
export interface UpdateWilayaShippingPriceInput { code: string; homePrice: number | null; officePrice: number | null }
findAll(ctx): Promise<WilayaShipping[]>
updatePrices(ctx, input: UpdateWilayaShippingPriceInput[]): Promise<WilayaShipping[]>   // rejects non-integer or negative
quoteForAddress(ctx, address: { province?: string | null } | undefined, orderSubTotalWithTax: number, mode: DeliveryMode): Promise<number | undefined>
```

```graphql
type WilayaShippingPrice { id: ID! code: String! name: String! nameAr: String! homePrice: Int officePrice: Int }
input UpdateWilayaShippingPriceInput { code: String! homePrice: Int officePrice: Int }
```

- [ ] **Step 1: Migration**

```ts
export class HomeOfficeDelivery1789000000000 implements MigrationInterface {
  async up(q: QueryRunner) {
    await q.query(`ALTER TABLE "wilaya_shipping" ALTER COLUMN "price" DROP NOT NULL`);
    await q.query(`ALTER TABLE "wilaya_shipping" ADD COLUMN IF NOT EXISTS "officePrice" integer`);
    await q.query(`UPDATE "wilaya_shipping" SET "officePrice" = GREATEST("price" - 10000, 0) WHERE "officePrice" IS NULL AND "price" IS NOT NULL`);
  }
  async down(q: QueryRunner) {
    await q.query(`ALTER TABLE "wilaya_shipping" DROP COLUMN IF EXISTS "officePrice"`);
    await q.query(`UPDATE "wilaya_shipping" SET "price" = 50000 WHERE "price" IS NULL`);
    await q.query(`ALTER TABLE "wilaya_shipping" ALTER COLUMN "price" SET NOT NULL`);
  }
}
```

- [ ] **Step 2: Service** — `quoteForAddress` loads `findAll` rows, applies `findWilayaRow` then `quoteDelivery` with the channel threshold (existing private `freeShippingThreshold`). `updatePrices` validates each non-null price is a non-negative integer, then `repo.update({ code }, { homePrice, officePrice })`.
- [ ] **Step 3: Calculator** — add `mode` arg (`type: 'string'`, `defaultValue: 'home'`, `select-form-input` with home/office labels FR/AR/EN); `calculate` returns `undefined` when the quote is undefined, else `{ price, priceIncludesTax: true, taxRate: 0, metadata: { mode } }`.
- [ ] **Step 4: Admin API schema + resolver** compile; `pnpm --filter @oscar/backend build` → exit 0.
- [ ] **Step 5: Apply migration locally** — restart the local backend (`pnpm --filter @oscar/backend dev`); Vendure runs migrations on boot. Verify: `SELECT code, price, "officePrice" FROM wilaya_shipping WHERE code IN ('16','01')` → Alger 30000/20000, Adrar 80000/70000.
- [ ] **Step 6: Commit** `feat(backend): home and office delivery prices per wilaya`.

### Task 3: Bootstrap the two shipping methods

**Files:**
- Create: `apps/backend/src/plugins/oscar-plugin/shipping/shipping-setup.service.ts` — the local commit's design: `OnApplicationBootstrap`, server process only, creates any missing method from `DELIVERY_METHODS` with calculator `wilaya-shipping-calculator` and args `[{ name: 'mode', value: def.mode }]`, checker `default-shipping-eligibility-checker` with `orderMinimum` `'0'`, fulfillment `manual-fulfillment`, FR/AR/EN translations exactly as in the spec; after creating at least one method, soft-deletes `standard-shipping`.
- Modify: `oscar-plugin.ts` providers add `ShippingSetupService`.

- [ ] **Step 1:** Implement + register; `pnpm --filter @oscar/backend build` → 0.
- [ ] **Step 2:** Restart the local backend; logs show `Created shipping method "home-delivery"` / `"office-delivery"` and `Retired legacy shipping method "standard-shipping"`.
- [ ] **Step 3:** Shop API check (`http://localhost:8085/shop-api`): add an item to a new order, `setOrderShippingAddress` with `province: "Alger"`, query `eligibleShippingMethods { code name priceWithTax metadata }` → `home-delivery` 30000 `{mode:'home'}` and `office-delivery` 20000 `{mode:'office'}`. With `province: "Atlantis"` → only `home-delivery` at 50000.
- [ ] **Step 4: Commit** `feat(backend): create home/office delivery methods on boot, retire flat method`.

### Task 4: Back-office table with two prices

**Files:**
- Modify: `apps/backoffice/src/pages/settings/sections/WilayaShippingSettings.tsx`
- Modify: `apps/backoffice/src/pages/settings/Settings.tsx` (method list: when `method.calculator?.code === 'wilaya-shipping-calculator'` show "Tarif par wilaya · Domicile/Bureau" instead of the rate arg)

- [ ] **Step 1:** Query/mutation fields `homePrice officePrice`; `edited: Record<code, { home?: string; office?: string }>`; a row is dirty when either parsed value (empty → null) differs from the row; `input` sends `{ code, homePrice, officePrice }` (untouched field keeps its current value). Two `<input type="number">` per row, headers "Domicile (DA)" / "Bureau (DA)", helper text "Laisser vide pour ne pas proposer ce mode dans la wilaya."
- [ ] **Step 2:** `pnpm --filter @oscar/backoffice build` → 0.
- [ ] **Step 3:** `pnpm --filter @oscar/backoffice dev`, Settings → Livraison: edit Alger office to 250, save → toast, reload shows 250; clear it → save → shop API no longer offers office for Alger.
- [ ] **Step 4: Commit** `feat(backoffice): edit home and office delivery prices per wilaya`.

### Task 5: Storefront checkout tidy-up and order detail

**Files:**
- Modify: `apps/frontend/src/app/[locale]/(shop)/checkout/page.tsx` — delete the origin "auto-select when only one method" effect (block starting `// Auto-select the delivery method when there is only one`); the later `shippingMethods` memo + effect already covers it.
- Modify: `apps/frontend/src/app/[locale]/(shop)/orders/[code]/page.tsx` — show `order.shippingLines[0]?.shippingMethod.name` next to the shipping amount.
- Verify: `getShippingZone` and `localizePlaceName` are exported from `packages/shared`; `CheckoutPage.shipping.{fillAddressFirst,deliveryEstimate,delayZone1..4}` exist in `fr/ar/en.json`.

- [ ] **Step 1:** edits; `pnpm --filter @oscar/frontend type-check` → 0; `test:unit` → 11 pass.
- [ ] **Step 2:** `pnpm --filter @oscar/frontend dev`; browser: add a product, open `/checkout`, fill name/phone, pick wilaya "Alger" + a commune → two options, "Livraison à domicile" preselected at 300 DA, office 200 DA; switch to "Adrar" → 800/700, selection stays valid; summary total updates.
- [ ] **Step 3: Commit** `feat(frontend): home/office delivery options at checkout`.

### Task 6: Docs

- [ ] CLAUDE.md `shipping/` bullet → "Home / office delivery: two shipping methods created on boot by `shipping-setup.service.ts`, priced per wilaya from the `wilaya_shipping` table (`wilaya-shipping-calculator` + `mode` arg); prices edited in the back-office Settings → Livraison."
- [ ] Top of `docs/business/2026-09-03-questions-client-livraison-domicile-bureau.md`: "Mise à jour 6 septembre 2026" note — the feature is live with the default proposals and placeholder office prices (domicile − 100 DA), editable in the back-office; the client's answers now only change the grid.
- [ ] Commit `docs: describe home/office delivery`.

### Task 7: Push and deploy

- [ ] `git push origin main` (fast-forward on top of c08a8c4).
- [ ] On the VPS as `oscar`: `cd /var/www/oscar && bash deploy/scripts/deploy.sh` (migration + bootstrap run on backend boot).
- [ ] Verify: `pm2 logs oscar-backend --lines 50` shows the two methods created and the legacy one retired; live checkout on https://oscarfashion.dz shows both options for a wilaya; back-office table shows two columns.
