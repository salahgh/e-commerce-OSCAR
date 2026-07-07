# MODULE M5: Order Management & Fulfillment

Customers view their own order history on web and mobile; admins run the full order lifecycle from the back-office — state transitions, fulfillment, refunds, tracking numbers, admin notes, and printable invoices. Custom admin mutations (`updateOrderTracking`, `addOrderAdminNotes`) write order custom fields directly.

**Stack:** activeCustomer.orders (web/mobile) · OrderList/Detail (admin) · oscar-admin.resolver · export-utils (invoices)

---

### 1. Feature Reliability & Business Logic

#### [MEDIUM · Reliability · ORD-1] Tracking/notes mutations: lost-update race, no transaction, no validation, no history
- **Evidence:** `oscar-admin.resolver.ts:206-247` — both read `order.customFields` then `repo.update({id},{customFields:{...order.customFields, x}})`, writing all custom-field columns from a stale snapshot; no transaction, no `HistoryEntry`, and `trackingNumber` (varchar 255) has no length guard.
- **Impact:** Two concurrent admin edits (tracking vs notes) silently clobber each other; order history has no record of the change; a 256-char input 500s.
- **Fix:** Update the single field inside a transaction (or `orderService.updateCustomFields`), validate length, and emit a history entry.

#### [MEDIUM · Reliability · ORD-2] Admin "low stock" list ignores stock and threshold entirely
- **Evidence:** `oscar.service.ts:225-236` — `getLowStockProducts` returns the first 100 enabled products via `findAll`; the `threshold` arg is never used and stock is never read. The back-office queries this (`dashboard.graphql:187`).
- **Impact:** The admin "low stock" panel is just the first 100 enabled products — actively misleading inventory data during restock decisions.
- **Fix:** Implement via `DashboardService.getVariantStockRows` aggregation, or drop the legacy query (a correct `dashboardLowStockAlerts` already exists).

#### [MEDIUM · Reliability · ORD-3] Order-transition buttons use a hardcoded state map instead of the server's `nextStates`
- **Evidence:** `OrderDetail.tsx:68-166` hardcodes `ORDER_STATUS[state].next`; the schema exposes `Order.nextStates` but the fragment never selects it. Fulfillment transitions are likewise hardcoded.
- **Impact:** If the Vendure order process is ever customized, the UI offers invalid transitions (fail server-side) or omits valid ones. Failures *are* surfaced via toasts, so this is consistency, not data loss.
- **Fix:** Select and render from `order.nextStates`/`fulfillment.nextStates`.

### 2. Standard E-Commerce Security & Data Protection

#### [MEDIUM · Security · ORD-4] Invoice print builds HTML from unescaped order data via `document.write`
- **Evidence:** `export-utils.ts:62-249` string-interpolates `customer.*`, `shippingAddress.*`, and `productVariant.name/sku` into markup; `printInvoice` does `printWindow.document.write(html)` (called from `OrderDetail.tsx:399`).
- **Impact:** Customer-controlled checkout data containing `<script>`/`<img onerror>` executes in the print window — a stored-XSS vector driven by shipping names/addresses.
- **Fix:** HTML-escape all interpolated values, or build the document with DOM APIs / `textContent`.

**Also noted (low severity)**
- **ORD-5** — Bulk order/customer operations run unbounded sequential mutations with per-item catch and no cancel (`BulkOperations.tsx:115`, `CustomerList.tsx:138`); a mid-loop network drop leaves a partial result. Bound concurrency and report the per-item error list.

### 3. Performance & Speed Bottlenecks

Order-history reads are paginated and bounded. The heavy order-aggregation cost (loading all orders into memory) surfaces through the dashboard — see [M7 (DASH-1)](./07-dashboard-analytics.md#per--dash-1) — and the bounded per-row hydration loops in `DashboardService` are noted there too.

### 4. Step-by-Step Improvement Plan

**Phase 1 — High priority (XSS & misleading data)**
- [ ] Escape all invoice-print interpolation (or build via DOM) (ORD-4)
- [ ] Make the low-stock query actually read stock vs threshold (ORD-2)

**Phase 2 — Structural hardening**
- [ ] Make tracking/notes writes single-field, transactional, length-checked, history-logged (ORD-1)
- [ ] Drive transition buttons from server `nextStates`; bound bulk-op concurrency (ORD-3, ORD-5)

---

### ✓ Verified OK
- **No IDOR** on customer order history: web/mobile read `activeCustomer.orders`, which Vendure scopes to the session — a customer can't fetch another's orders.
- Order action dialogs (refund, manual payment, modify, fulfill) correctly branch on Vendure union results, treat missing data as failure, guard double-submit, and refetch after success.
- Admin order mutations carry correct `@Allow(UpdateOrder)`; no order/admin data is exposed on the shop API.
- COD orders render a neutral "Cash on delivery," never a green "Paid," in both order lists.
