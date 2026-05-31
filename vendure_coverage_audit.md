# Vendure API Coverage — Gap Analysis

> Status: **documentation only — to be implemented later.**
> Date: 2026-05-31. Target: **full Admin API parity** in the back-office + full Shop API coverage in the frontend. Mobile excluded.
> Method: every root field in the **Admin API** schema (`apps/backoffice/src/graphql/schema.graphql`) and **Shop API** schema (`apps/frontend/schema.graphql`) compared against the operations the apps define and wire into UI.
> Classification: **Implemented** = operation defined AND consumed by a page/hook. **Partial** = defined but read-only/narrow, OR defined-but-not-wired (dead hook). **Missing** = no operation references the root field.

This is a coverage map, not a bug report — see `feature_audit.md` for correctness/feature findings.

---

## TL;DR

| Surface | Root fields | Implemented | Partial | Missing |
|---|---|---|---|---|
| **Admin API** (back-office) | ~190 | ~78 (~41%) | ~31 (~16%) | ~81 (~43%) |
| **Shop API** (frontend) | 62 (57 distinct rows) | 34 (~60%) | 3 (~5%) | 20 (~35%) |

**Two kinds of work to reach parity:**
1. **Wire existing dead operations** — many Admin CRUD ops (Tax, Zone, Channel, Payment/Shipping-method create, Fulfillments, billing address on checkout) are *already authored* but never imported by a page. Cheap.
2. **Build from scratch** — whole domains have no operations at all: Sellers, Stock Locations, Customer Groups, Draft/manual Orders, Countries/Provinces, Tags, Settings Store, Scheduled Tasks. Expensive.

---

# Part A — Admin API (Back-Office)

Scope: `apps/backoffice` vs full Admin API. Operations defined in `apps/backoffice/src/graphql/vendure/*.graphql`; "wired" verified by which generated `*Document` constants are imported under `pages/`, `components/`, `hooks/`, `contexts/`.

> Note: the dashboard capabilities (`dashboardKpiMetrics`, `dashboardSalesTrend`, …) are wired via **inline `gql`** in `hooks/useDashboardData.ts`, so they count as Implemented even though the entire `dashboard.graphql` document file is a dead duplicate.

## Products & Variants / Options
| Capability | Type | Status | Evidence / Note |
|---|---|---|---|
| `products`, `product` | Q | Implemented | `AdminProducts`/`AdminProduct`/`TopSellingProducts` |
| `productVariants`, `productVariant` | Q | Implemented | `LowStockVariants`, `StockOverview`, `StockMovements` |
| `productOptionGroups` | Q | Implemented | `AdminProductOptionGroups` |
| `productOptionGroup`, `productOptions`, `productOption` | Q | Missing | only the plural group query exists |
| `createProduct`/`updateProduct`/`deleteProduct` | M | Implemented | `updateProduct` reused for assets/facets/featured |
| `deleteProducts` (bulk) | M | Implemented | `DeleteProducts` |
| `updateProducts` (bulk) | M | Missing | — |
| `createProductVariants`/`updateProductVariants`/`deleteProductVariant` | M | Implemented | — |
| `deleteProductVariants` (bulk) | M | Partial | `DeleteProductVariants` defined, dead |
| `addOptionGroupToProduct`/`removeOptionGroupFromProduct` | M | Implemented | — |
| `create/updateProductOptionGroup`, `create/update/deleteProductOption` | M | Implemented | @ ProductEdit |
| `assignProductsToChannel`/`removeProductsFromChannel` (+ variants) | M | Implemented | — |
| `toggleProductFeatured` (custom) | M | Missing | schema-only; removed |

## Collections — full parity (8/8)
| Capability | Type | Status |
|---|---|---|
| `collections`, `collection`, `collectionFilters`, `previewCollectionVariants` | Q | Implemented |
| `create/update/deleteCollection`, `deleteCollections`, `moveCollection`, `assign/removeCollectionsToChannel` | M | Implemented |

## Facets & Facet Values
| Capability | Type | Status | Note |
|---|---|---|---|
| `facets`, `facet` | Q | Implemented | — |
| `facetValues`, `facetValue` (root) | Q | Missing | only nested selections used |
| `create/update/deleteFacet` | M | Implemented | — |
| `deleteFacets` (bulk) | M | Missing | — |
| `createFacetValues`/`updateFacetValues`/`deleteFacetValues` | M | Implemented | — |
| `createFacetValue`/`updateFacetValue` (single) | M | Missing | — |
| `assign/removeFacetsToChannel` | M | Implemented | — |

## Assets & Tags
| Capability | Type | Status | Note |
|---|---|---|---|
| `assets`, `asset` | Q | Implemented | — |
| `createAssets`/`updateAsset`/`deleteAsset`/`deleteAssets` | M | Implemented | — |
| `assignAssetsToChannel` | M | Missing | — |
| `tags`, `tag` | Q | Partial/Missing | `AssetTags` dead; `tag` absent |
| `createTag`/`updateTag`/`deleteTag` | M | Missing | **Tag CRUD entirely absent** |

## Orders / Drafts
| Capability | Type | Status | Note |
|---|---|---|---|
| `orders`, `order` | Q | Implemented | — |
| `transitionOrderToState`, `addNoteToOrder`, `setOrderCustomFields`, `cancelOrder`, `modifyOrder` | M | Implemented | — |
| `updateOrderNote`/`deleteOrderNote`, `setOrderCustomer` | M | Missing | — |
| `eligibleShippingMethodsForDraftOrder` | Q | Missing | — |
| **All 14 draft-order mutations** (`createDraftOrder`, `deleteDraftOrder`, `addItemToDraftOrder`, `adjustDraftOrderLine`, `removeDraftOrderLine`, `setCustomerForDraftOrder`, `setDraftOrderShippingAddress`, `setDraftOrderBillingAddress`, `unsetDraftOrderShippingAddress`, `unsetDraftOrderBillingAddress`, `setDraftOrderCustomFields`, `applyCouponCodeToDraftOrder`, `removeCouponCodeFromDraftOrder`, `setDraftOrderShippingMethod`) | M | **Missing** | **Manual/phone-order creation impossible** |

## Fulfillments — 0 wired
| Capability | Type | Status | Note |
|---|---|---|---|
| `addFulfillmentToOrder`, `transitionFulfillmentToState` | M | Partial | `CreateFulfillment`/`TransitionFulfillmentToState` defined, dead |
| `fulfillmentHandlers` | Q | Partial | `FulfillmentHandlers` defined, dead |

## Payments & Refunds
| Capability | Type | Status | Note |
|---|---|---|---|
| `settlePayment`, `cancelPayment`, `addManualPaymentToOrder`, `refundOrder`, `settleRefund` | M | Implemented | — |
| `transitionPaymentToState` | M | Partial | defined, dead |
| `paymentMethodEligibilityCheckers`, `paymentMethodHandlers` | Q | Partial | defined, dead config-pickers |

## Customers & Groups / Addresses
| Capability | Type | Status | Note |
|---|---|---|---|
| `customers`, `customer` | Q | Implemented | + reports/counts |
| `create/update/deleteCustomer` | M | Implemented | — |
| `deleteCustomers` (bulk) | M | Missing | done client-side one-by-one |
| `create/update/deleteCustomerAddress` | M | Implemented | — |
| `addNoteToCustomer`/`deleteCustomerNote` | M | Implemented | — |
| `updateCustomerNote` | M | Missing | — |
| **Customer Groups — entire domain** (`customerGroups`, `customerGroup`, `create/update/deleteCustomerGroup`, `deleteCustomerGroups`, `addCustomersToGroup`, `removeCustomersFromGroup`) | Q/M | **Missing** | **0/9** |

## Administrators / Profile
| Capability | Type | Status | Note |
|---|---|---|---|
| `administrators`, `administrator`, `activeAdministrator`, `me` | Q | Implemented | — |
| `create/update/deleteAdministrator` | M | Implemented | — |
| `deleteAdministrators` (bulk) | M | Partial | defined, dead |
| `updateActiveAdministrator` | M | Implemented | — |
| `assignRoleToAdministrator` | M | Missing | roles set via `updateAdministrator.roleIds` |

## Roles & Permissions
| Capability | Type | Status | Note |
|---|---|---|---|
| `roles`, `role` | Q | Implemented | — |
| `create/update/deleteRole` | M | Implemented | — |
| `deleteRoles` (bulk) | M | Partial | defined, dead |

## Promotions
| Capability | Type | Status | Note |
|---|---|---|---|
| `promotions`, `promotion`, `promotionConditions`, `promotionActions` | Q | Implemented | — |
| `create/update/deletePromotion` | M | Implemented | — |
| `deletePromotions` (bulk) | M | Missing | — |
| `assign/removePromotionsToChannel` | M | Partial | defined, dead |

## Shipping Methods — ~3/9 wired
| Capability | Type | Status | Note |
|---|---|---|---|
| `shippingMethods`, `shippingMethod` | Q | Implemented | — |
| `shippingEligibilityCheckers`, `shippingCalculators` | Q | Partial | defined, dead |
| `testShippingMethod`, `testEligibleShippingMethods` | Q | Missing | — |
| `updateShippingMethod`, `deleteShippingMethod` | M | Implemented | — |
| `createShippingMethod` | M | Partial | defined, dead |
| `deleteShippingMethods` (bulk), `assign/removeShippingMethodsToChannel` | M | Missing | — |

## Payment Methods — ~4/8 wired
| Capability | Type | Status | Note |
|---|---|---|---|
| `paymentMethods`, `paymentMethod` | Q | Implemented | — |
| `updatePaymentMethod`, `deletePaymentMethod` | M | Implemented | — |
| `createPaymentMethod` | M | Partial | defined, dead |
| `deletePaymentMethods` (bulk), `assign/removePaymentMethodsToChannel` | M | Missing | — |

## Tax (Rates / Categories) — ~1/11 wired
| Capability | Type | Status | Note |
|---|---|---|---|
| `taxCategories` | Q | Implemented | read for variant pricing |
| `taxRates` | Q | Partial | `TaxRates` defined, dead |
| `taxRate`, `taxCategory` | Q | Missing | — |
| `create/update/deleteTaxRate` | M | Partial | defined, dead |
| `create/update/deleteTaxCategory` | M | Partial | defined, dead |
| `deleteTaxRates`, `deleteTaxCategories` (bulk) | M | Missing | — |

## Zones & Countries / Provinces
| Capability | Type | Status | Note |
|---|---|---|---|
| `zones` | Q | Implemented | read in shipping config |
| `zone` | Q | Missing | — |
| `countries` | Q | Partial | `AdminCountries` defined, dead |
| `country`, `provinces`, `province` | Q | Missing | — |
| `create/update/deleteZone`, `addMembersToZone`/`removeMembersFromZone` | M | Partial | defined, dead |
| `deleteZones` (bulk) | M | Missing | — |
| **Country CRUD** (`create/update/deleteCountry`, `deleteCountries`) | M | **Missing** | — |
| **Province CRUD** (`create/update/deleteProvince`) | M | **Missing** | — |

## Channels
| Capability | Type | Status | Note |
|---|---|---|---|
| `channels`, `activeChannel` | Q | Implemented | read @ Settings |
| `channel` (by id) | Q | Missing | — |
| `create/update/deleteChannel` | M | Partial | defined, dead |
| `deleteChannels` (bulk) | M | Missing | — |

## Sellers — 0/6 (entire domain missing)
`sellers`, `seller`, `createSeller`, `updateSeller`, `deleteSeller`, `deleteSellers` — only `seller` is read as a *field* inside `ActiveChannel`.

## Stock Locations — 0/8 (entire domain missing)
`stockLocations`, `stockLocation`, `create/update/deleteStockLocation`, `deleteStockLocations`, `assign/removeStockLocationsToChannel` — only referenced in `permissions.config`.

## Settings / Global
| Capability | Type | Status | Note |
|---|---|---|---|
| `globalSettings` | Q | Implemented | — |
| `updateGlobalSettings` | M | Partial | defined, dead |
| `getSettingsStoreValue(s)`, `setSettingsStoreValue(s)` | Q/M | Missing | settings-store unused (0/4) |

## Jobs / System / Search
| Capability | Type | Status | Note |
|---|---|---|---|
| `job`, `jobs` | Q | Implemented | — |
| `search` | Q | Implemented | `AdminSearchProducts` |
| `reindex`, `runPendingSearchIndexUpdates`, `cancelJob`, `importProducts` | M | Implemented | — |
| `jobQueues` | Q | Partial | `GetJobQueues` defined, dead |
| `jobsById`, `jobBufferSize`, `pendingSearchIndexUpdates`, `scheduledTasks` | Q | Missing | — |
| `removeSettledJobs`, `flushBufferedJobs`, `updateScheduledTask`, `runScheduledTask` | M | Missing | — |

## Misc
| Capability | Type | Status | Note |
|---|---|---|---|
| `entityDuplicators`, `duplicateEntity` | Q/M | Implemented | — |
| `slugForEntity`, `metricSummary` | Q | Missing | custom dashboard used instead of `metricSummary` |
| `login`, `logout` | M | Implemented | `AdminLogin`/`AdminLogout` |
| `authenticate` | M | Missing | native login only |

## Admin API — biggest gaps for full parity
**Build-from-scratch domains (no operations at all):**
1. **Sellers** — 6 ops.
2. **Stock Locations** — 8 ops.
3. **Customer Groups** — 9 ops.
4. **Draft / manual order creation** — 14 mutations + `eligibleShippingMethodsForDraftOrder`.
5. **Countries & Provinces CRUD** — 7 ops.
6. **Tags CRUD** — 4 ops.
7. **Settings Store** — 4 ops.
8. **Scheduled Tasks** — `scheduledTasks`, `updateScheduledTask`, `runScheduledTask`.

**Wire-existing-dead-operations (cheaper):** Tax rate/category CRUD, Zone CRUD + members, Channel CRUD, `createShippingMethod`, `createPaymentMethod`, Fulfillments (`addFulfillmentToOrder`/`transitionFulfillmentToState`), `transitionPaymentToState`, `updateGlobalSettings`, bulk deletes (`deleteRoles`, `deleteAdministrators`, `deleteProductVariants`), promotion channel-assignment.

**Smaller missing pieces:** `updateProducts`, single `productOption(s)` queries, `deleteFacets`, single `create/updateFacetValue`, `assignAssetsToChannel`, `assignRoleToAdministrator`, `setOrderCustomer`, `updateCustomerNote`, `update/deleteOrderNote`, `slugForEntity`, `metricSummary`.

---

# Part B — Shop API (Frontend)

Scope: `apps/frontend` vs full Shop API. Operations in `packages/graphql-shop/src/operations/*.graphql` (mirrored in `apps/frontend/src/graphql/vendure/*.graphql`, which the frontend codegen compiles). Root fields: 27 Query + 35 Mutation.

## Catalog / Products
| Capability | Type | Status | Note |
|---|---|---|---|
| `products`, `product` | Q | Implemented | id & slug |
| `featuredProducts`, `newArrivals`, `popularProducts` (custom) | Q | Missing | homepage rails not wired |
| `trackProductView` (custom) | M | Missing | view-count analytics never called |

## Search / Facets
| Capability | Type | Status | Note |
|---|---|---|---|
| `search` | Q | Implemented | `SearchProducts`/`SearchProductsWithFacets` |
| `facets` | Q | Implemented | — |
| `facet` (single) | Q | Missing | — |
| `searchProductsMultilingual` (custom) | Q | Missing | native `search` used instead |

## Collections — 2/2
`collections`, `collection` — Implemented (id & slug, nav + category pages).

## Active Order (Cart) & Line Ops
| Capability | Type | Status | Note |
|---|---|---|---|
| `activeOrder` | Q | Implemented | CartContext |
| `addItemToOrder`, `adjustOrderLine`, `removeOrderLine`, `removeAllOrderLines`, `applyCouponCode`, `removeCouponCode` | M | Implemented | — |
| `addItemsToOrder` (bulk) | M | Missing | — |
| `setOrderCustomFields` | M | Missing | can't persist delivery notes etc. |

## Checkout
| Capability | Type | Status | Note |
|---|---|---|---|
| `setCustomerForOrder`, `setOrderShippingAddress`, `setOrderShippingMethod`, `addPaymentToOrder`, `transitionOrderToState` | M | Implemented | — |
| `eligibleShippingMethods`, `eligiblePaymentMethods` | Q | Implemented | — |
| `setOrderBillingAddress` | M | **Partial** | defined + hook generated, **never called** — billing defaults to shipping. *Most material gap.* |
| `nextOrderStates` | Q | Partial | `GetNextOrderStates` defined, hook unused |
| `unsetOrderShippingAddress`, `unsetOrderBillingAddress` | M | Missing | — |

## Order History & Detail
| Capability | Type | Status | Note |
|---|---|---|---|
| `orderByCode` | Q | Implemented | confirmation + order detail |
| `activeCustomer.orders` | Q | Implemented | `GetMyOrders` |
| `order` (by id) | Q | Partial | `GetOrder` hook unused (detail uses `orderByCode`) |
| `GetCustomerOrders` (dup) | — | Partial | dead duplicate of `GetMyOrders` |

## Auth
| Capability | Type | Status | Note |
|---|---|---|---|
| `login`, `logout`, `registerCustomerAccount`, `verifyCustomerAccount`, `refreshCustomerVerification`, `requestPasswordReset`, `resetPassword` | M | Implemented | — |
| `authenticate` (generic) | M | Missing | native auth only (acceptable) |
| `me` | Q | Missing | `activeCustomer` used instead (functionally covered) |

## Customer Account
| Capability | Type | Status | Note |
|---|---|---|---|
| `activeCustomer` | Q | Implemented | — |
| `updateCustomer`, `updateCustomerPassword`, `create/update/deleteCustomerAddress` | M | Implemented | — |
| `requestUpdateCustomerEmailAddress`, `updateCustomerEmailAddress` | M | Missing | no email-change flow |

## Misc
| Capability | Type | Status | Note |
|---|---|---|---|
| `activeChannel` | Q | Missing | channel/currency not read from API |
| `availableCountries` | Q | Missing | country list hardcoded (Algeria) |
| `activePaymentMethods`, `activeShippingMethods` | Q | Missing | uses `eligible*` instead |
| `wilayas`, `shippingCost` (custom) | Q | Missing | uses local `@oscar/shared` data |

## Shop API — biggest gaps
- **`setOrderBillingAddress`** — wire it into checkout (currently billing = shipping silently).
- **`setOrderCustomFields`** — needed for order-level data (delivery notes).
- **Homepage merchandising rails** — `featuredProducts`/`newArrivals`/`popularProducts` exist in the backend but the storefront never calls them (also flagged in `feature_audit.md`).
- **`trackProductView`** — recently-viewed/analytics never recorded.
- **Email-change flow** — `requestUpdateCustomerEmailAddress` + `updateCustomerEmailAddress`.
- Minor: `addItemsToOrder` (bulk add), `availableCountries`, `activeChannel`, `me`, single `facet`.

---

# Dead code to clean up (found during coverage)

### Back-office — defined-but-unused operations
- **`dashboard.graphql` — entire file is dead** (all `Dashboard*`, `OscarDashboardStats`, `RecentOrders`, `LowStockProducts` duplicated by inline `gql` in `hooks/useDashboardData.ts`).
- **`settings.graphql`:** `UpdateGlobalSettings`, `CreatePaymentMethod`, `CreateShippingMethod`, `UpdateShippingMethodFull`, `CreateChannel`, `UpdateChannel`, `DeleteChannel`, `CreateTaxCategory`, `UpdateTaxCategory`, `DeleteTaxCategory`, `TaxRates`, `CreateTaxRate`, `UpdateTaxRate`, `DeleteTaxRate`, `CreateZone`, `UpdateZone`, `DeleteZone`, `AddMembersToZone`, `RemoveMembersFromZone`, `AdminCountries`, `PaymentMethodHandlers`, `PaymentMethodCheckers`, `ShippingEligibilityCheckers`, `ShippingCalculators`, `FulfillmentHandlers`.
- **`orders.graphql`:** `CreateFulfillment`, `TransitionFulfillmentToState`, `TransitionPaymentToState`.
- **`promotions.graphql`:** `AssignPromotionsToChannel`, `RemovePromotionsFromChannel`.
- **`products.graphql`:** `DeleteProductVariants`, `SetVariantFeaturedAsset`, `AddAssetsToVariant`, `UpdateVariantStock`, `UpdateVariantsStock`, `AdminFacets`.
- **`administrators.graphql`:** `DeleteAdministrators`, `DeleteRoles`.
- **`assets.graphql`:** `AssetTags`.
- **`system.graphql`:** `GetJobQueues`.
- **`test.graphql`:** `mldjfd` — stray scratch query; delete the file.

> Caveat: several of these "dead" ops are exactly the ones to *wire up* for parity (Tax/Zone/Channel/method-create/Fulfillments) — don't delete those; delete only true duplicates/scratch (`dashboard.graphql`, `AdminFacets`, `test.graphql`).

### Frontend — dead code
- Unused generated hooks: `GetNextOrderStates`, `GetOrder`, `GetCustomerOrders`, `SetOrderBillingAddress` (wire this one rather than delete).
- **Non-Vendure GraphQL files** under `apps/frontend/src/graphql/queries/*` and `.../mutations/*` target a different (Spring-style) schema (`nameAr`, `basePrice`, `Long!`, `myOrders`, `createOrder`), are excluded by codegen, and map to zero Vendure root fields — **delete to avoid confusion.**

---

# Suggested approach to reach parity

**Phase 1 — wire what already exists (low effort, high parity gain):** billing address in checkout; Tax rate/category CRUD; Zone CRUD + members; Channel CRUD; `createShippingMethod`/`createPaymentMethod`; Fulfillments; `transitionPaymentToState`; `updateGlobalSettings`; bulk deletes. These have authored operations — just build the UI/import the hooks.

**Phase 2 — build missing high-value domains:** Customer Groups (segmentation/promotions), Draft Orders (phone/manual orders — valuable for the Algerian COD market), Fulfillment UI (real shipments vs. the current state-flip), Stock Locations (if multi-warehouse), Countries/Provinces.

**Phase 3 — long-tail parity:** Sellers (only if going multi-vendor), Settings Store, Scheduled Tasks, Tags, and the small missing query/mutation pieces.

**Cleanup (anytime):** delete the dead `dashboard.graphql`, the stray `test.graphql`, and the non-Vendure frontend GraphQL files.
