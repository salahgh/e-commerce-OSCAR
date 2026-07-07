# MODULE M7: Admin Dashboard & Analytics

The back-office dashboard is backed by purpose-built Vendure aggregation resolvers (KPI, sales trend, orders-by-status, revenue-by-category) — done right. The gaps are a legacy in-memory stats query still in use, a Reports page that aggregates client-side, and per-day query fan-out.

**Stack:** DashboardService · useDashboardData · Reports.tsx · export-utils (CSV)

---

### 1. Feature Reliability & Business Logic

#### [MEDIUM · Reliability · DASH-2] Reports fetches `take:1000` orders and aggregates in JS — silently wrong past the cap
- **Evidence:** `Reports.tsx:146` `take:1000` orders (with nested lines), `:178` `take:500` customers, `:187` `take:500` variants; all metrics computed in `useMemo` over these arrays.
- **Impact:** Any store with more than 1000 orders in the window produces silently wrong totals (hard cap), plus heavy main-thread compute — unlike the Dashboard, which aggregates on the backend.
- **Fix:** Add backend aggregation resolvers for reports (as already done for the dashboard); never cap-then-aggregate.

#### [MEDIUM · Reliability · DASH-3] Customer lifetime spend computed from a server-truncated slice of orders
- **Evidence:** `CustomerList.tsx:170-178` sums `customer.orders.items`, but `AdminCustomers` selects nested orders with no `options`, so Vendure returns only a default page while `totalOrders` uses `totalItems`.
- **Impact:** "Total dépensé" is undercounted for any customer with more orders than the default page size — a wrong business metric shown as authoritative.
- **Fix:** Compute spend server-side, or fetch all completed orders explicitly for the calculation.

### 2. Standard E-Commerce Security & Data Protection

#### [MEDIUM · Security · DASH-4] CSV export is vulnerable to spreadsheet formula injection
- **Evidence:** `export-utils.ts:6-28` quotes only on comma/quote and never neutralizes a leading `= + - @`; product/customer names (user-supplied) are exported at `Reports.tsx:469,509`.
- **Impact:** A product named `=HYPERLINK(...)` or `=cmd|'/c calc'!A1` executes when an admin opens the export in Excel/Sheets — data exfiltration or command execution on the admin's machine.
- **Fix:** Prefix any cell starting with `= + - @ \t \r` with a `'` in `exportToCSV`/`exportProducts`.

The invoice-print XSS ([ORD-4](./05-order-management.md#medium--security--ord-4)) also lives in this file (`export-utils.ts`).

### 3. Performance & Speed Bottlenecks

#### [HIGH · Performance · DASH-1] `oscarDashboardStats` loads every completed order into memory to sum revenue
- **Evidence:** `oscar-admin.resolver.ts:159-165` — `orderService.findAll(ctx,{filter:{state:{in:[...]}}})` with no `take`, then `.reduce()` over all hydrated order entities. Actively queried by the back-office dashboard.
- **Impact:** A full-table order hydration on every dashboard load; cost grows linearly with order history — a spike-day landmine.
- **Fix:** Replace with `DashboardService.calculateRevenue` (a single SQL `SUM`) — which already exists in the same codebase.

#### [MEDIUM · Performance · DASH-5] Dashboard fires ~100 queries per load; missing order indexes
- **Evidence:** `dashboard.service.ts:360-417` loops queries per day (sales trend 2×60, orders-by-status 5×7) and `:203-277` runs ~20 sequential KPI counts; no index on `order(orderPlacedAt, state)`, which every chart ranges on.
- **Impact:** ~100+ queries against a 10-connection pool per load, serializing under concurrent admins, each a sequential scan.
- **Fix:** Replace per-day loops with one `GROUP BY date()` aggregate per chart; `Promise.all` independent counts; add the composite order index.

#### [MEDIUM · Performance · DASH-6] No route-level code splitting — `recharts` loads on the login screen
- **Evidence:** `App.tsx` statically imports all pages (zero `React.lazy`); dashboard charts and Reports pull in `recharts`; `vite.config.ts` sets no `manualChunks`.
- **Impact:** The entire admin app + recharts ships as one bundle downloaded before an unauthenticated user sees the login form.
- **Fix:** `React.lazy` + `Suspense` per route (at minimum split Dashboard/Reports/charts off the login path).

**Also noted (low severity)**
- **DASH-7** — Bounded per-row hydration loops across `DashboardService` (`getTopSellingProducts`, `getRecentProducts`: sequential `findOne` per row). Latency-only (limits 5–50) but batchable with a single `In(...)` query.

### 4. Step-by-Step Improvement Plan

**Phase 1 — High priority (data-leak & wrong numbers)**
- [ ] Neutralize CSV formula injection (DASH-4)
- [ ] Replace `oscarDashboardStats` in-memory sum with the existing SQL aggregate (DASH-1)
- [ ] Fix Reports/customer-spend truncated aggregation (DASH-2, DASH-3)

**Phase 2 — Structural hardening**
- [ ] Code-split admin routes so recharts is off the login path (DASH-6)

**Phase 3 — Speed tuning**
- [ ] Collapse per-day query loops into grouped aggregates; add the order index (DASH-5)
- [ ] Batch the dashboard per-row hydration loops (DASH-7)

---

### ✓ Verified OK
- The main dashboard uses backend aggregation resolvers with per-query permission gating and `cache-and-network` — **no** client-side fetch-all-and-aggregate, no polling storm.
- Dashboard math is sound: revenue anchored on `orderPlacedAt` with half-open intervals (carts excluded, no double counting), summed in SQL; counts exclude soft-deleted rows.
