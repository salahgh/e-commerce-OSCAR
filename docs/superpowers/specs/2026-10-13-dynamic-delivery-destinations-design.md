# Dynamic delivery destinations, managed from the back-office — design

**Date:** 2026-10-13 · **Status:** approved in chat ("do it and clean the old static data")

## Problem

Only delivery **prices** are dynamic today. The **destinations** (69 wilayas, ~1540 communes,
delay zone) are hardcoded in four unrelated places: `packages/shared/src/constants/wilayas.ts`,
a drifted copy in `apps/mobile/src/data/wilayas.ts`, and two name-only lists in the back-office
(`constants/index.ts`, `CustomerDialogs.tsx`). The `wilaya_shipping` table was seeded once by
migration and its rows cannot be added, removed or disabled from the UI.

The owner wants to manage the delivery map without a developer:

1. switch a wilaya on or off (an unserved wilaya must disappear from the storefront dropdowns);
2. add, rename or remove wilayas and communes.

Out of scope (not requested): commune-level prices, pick-up office lists, free-text delays,
CSV import, price history.

## Decision

A **destination registry in the database** is the single source of truth. Storefronts (web and
mobile) load it through a public shop-api query. The existing Settings → Livraison page becomes
the destination manager. **All static destination data is deleted** from the shared package,
the mobile app and the back-office; the seed data lives only in the migration.

Assumptions taken on the owner's behalf (listed so they can be overturned later):

- An inactive wilaya is hidden from customers, not greyed out.
- A customer whose saved address is in an inactive wilaya gets no delivery option at checkout
  (the same "no delivery method" state as today).
- Delays stay the four zones; each wilaya's zone is editable in the back-office so new wilayas
  can show a delay.
- Deleting is allowed but the UI recommends deactivating. Orders and addresses are plain text
  in Vendure, so deleting a destination never corrupts history.

## Data model

| Table | Change |
|---|---|
| `wilaya_shipping` (entity `WilayaShipping`) | + `active boolean NOT NULL DEFAULT true`; + `shippingZone int NOT NULL DEFAULT 3` (1–4). Migration sets each existing row's zone from the current constant. |
| `wilaya_commune` (new entity `WilayaCommune`) | `id`, `createdAt`, `updatedAt`, `code varchar UNIQUE` (4 digits `WWNN`), `name`, `nameAr`, `postalCode varchar NULL`, `active boolean NOT NULL DEFAULT true`, `wilayaId` FK → `wilaya_shipping.id` ON DELETE CASCADE. Migration inserts the communes of the current constant. |
| `address.customFields` | + `wilayaCode string`, + `communeCode string` (both nullable, public). Storefronts send them with every address so quoting can match by code; legacy addresses without codes keep matching by name. |

The migration's commune `INSERT` is generated once by `apps/backend/scripts/print-commune-seed.ts`
run against the shared constant **before** that constant is deleted; the script is deleted with
the constant (the migration is the durable artefact, like migration 1788).

## Backend rules (`wilaya-pricing.ts`, unit-tested)

- `findWilayaRow(rows, address)` matches, in order: `customFields.wilayaCode` → `province` as a bare
  code → `province` as French or Arabic name (existing normalisation).
- `quoteDelivery` returns `undefined` for both modes when the matched row is `active = false`.
- Unknown wilaya (no row at all) keeps today's fallback: home at 500 DZD, no office. This only
  serves legacy addresses whose name no longer matches; storefronts can no longer produce one.
- `OrderWilayaService` unchanged (still copies `province` onto the order/customer `wilaya` field).

## Admin API (replaces `wilayaShippingPrices`)

```graphql
type DeliveryWilaya {
  id: ID! code: String! name: String! nameAr: String!
  active: Boolean! shippingZone: Int!
  homePrice: Int officePrice: Int        # minor units; null = mode not offered
  communes: [DeliveryCommune!]!
}
type DeliveryCommune { id: ID! code: String! name: String! nameAr: String! postalCode: String active: Boolean! }

input CreateDeliveryWilayaInput { code: String! name: String! nameAr: String! shippingZone: Int! homePrice: Int officePrice: Int }
input UpdateDeliveryWilayaInput { id: ID! name: String nameAr: String active: Boolean shippingZone: Int homePrice: Int officePrice: Int }
input CreateDeliveryCommuneInput { wilayaId: ID! name: String! nameAr: String! postalCode: String }
input UpdateDeliveryCommuneInput { id: ID! name: String nameAr: String postalCode: String active: Boolean }

extend type Query { deliveryWilayas: [DeliveryWilaya!]! }          # all rows, ordered by code
extend type Mutation {
  createDeliveryWilaya(input: CreateDeliveryWilayaInput!): DeliveryWilaya!
  updateDeliveryWilaya(input: UpdateDeliveryWilayaInput!): DeliveryWilaya!
  deleteDeliveryWilaya(id: ID!): Boolean!                           # cascades to communes
  createDeliveryCommune(input: CreateDeliveryCommuneInput!): DeliveryCommune!
  updateDeliveryCommune(input: UpdateDeliveryCommuneInput!): DeliveryCommune!
  deleteDeliveryCommune(id: ID!): Boolean!
  updateWilayaShippingPrices(input: [UpdateWilayaShippingPriceInput!]!): [DeliveryWilaya!]!  # kept (bulk grid save)
}
```

Validation (in `WilayaShippingService`, errors thrown as `UserInputError`): wilaya code is exactly
two digits and unique; commune code is auto-generated as `<wilayaCode><NN>` using the first free
`NN`; prices are non-negative integers or null; `shippingZone` ∈ 1..4; names non-empty.
Permissions: queries `ReadShippingMethod`, mutations `UpdateShippingMethod` (same as the page today).

Update-price nullability: `UpdateDeliveryWilayaInput.homePrice`/`officePrice` use the Vendure
convention of "omitted = unchanged, explicit null = not offered"; the resolver distinguishes
`undefined` from `null` on the raw args.

## Shop API (public, no auth)

```graphql
type DeliveryDestination { code: String! name: String! nameAr: String! shippingZone: Int! communes: [DeliveryDestinationCommune!]! }
type DeliveryDestinationCommune { code: String! name: String! nameAr: String! postalCode: String }
extend type Query { deliveryDestinations: [DeliveryDestination!]! }   # active wilayas, active communes, ordered by code / name
```

Added to `packages/graphql-shop/src/operations/shop-settings.graphql` as `DeliveryDestinations`
so web gets `useDeliveryDestinationsQuery`; the mobile app adds the same document to its own
`src/graphql/queries` (it has its own codegen).

## Web storefront (`apps/frontend`)

- Checkout: wilaya and commune dropdowns come from `useDeliveryDestinationsQuery` (loading state
  disables the selects). Delay estimate uses the returned `shippingZone`. The address input gains
  `customFields: { wilayaCode, communeCode }`; names are still stored in French as today.
- Order detail page: Arabic place names resolved from the same query (small
  `useLocalizePlaceName()` hook in `src/hooks/`), replacing the shared `localizePlaceName`.
- `/shipping` static zones page: untouched.

## Mobile (`apps/mobile`)

- `src/data/wilayas.ts` deleted. A `useDeliveryDestinations()` hook (Apollo query, cache-first)
  feeds `WilayaPicker`, `CommunePicker`, checkout and the address book. The address helpers in
  `src/utils/address.ts` / `checkout.ts` keep their `wilayas: Wilaya[]` parameter; the `Wilaya`
  type becomes the generated query type. Address inputs gain the two custom fields.
- Order detail: Arabic name localisation via the hook, like the web.
- Ships after the web (store release).

## Back-office (`apps/backoffice`)

- Settings → Livraison: table of wilayas with code, FR / AR names, **active switch**, **zone
  select**, home and office price inputs (bulk save as today), row actions **edit** (modal: names,
  zone) and **delete** (confirm dialog that suggests deactivating). "Ajouter une wilaya" modal
  (code, names, zone, prices). Expanding a row shows its communes with add / rename / toggle /
  delete. Search filters wilayas by code or either name.
- The three hardcoded wilaya lists are removed: `OrderFilterBar` and `CustomerDialogs` read
  `deliveryWilayas` through a shared `useDeliveryWilayas()` hook; `WILAYAS` in `constants/index.ts`
  is deleted.
- Operations added as `.graphql` documents under `src/graphql/` and generated with the
  client preset (the admin `schema.graphql` snapshot is refreshed from the running backend).

## Removal of static data ("clean the old static data")

Deleted: `packages/shared/src/constants/wilayas.ts` and its exports (`wilayas`, `Wilaya`,
`Commune`, `shippingZoneDelays`, `getWilayaByCode`, `getCommunesByWilayaCode`, `getShippingDelay`,
`getShippingZone`, `formatWilayaName`, `localizePlaceName`), `apps/mobile/src/data/wilayas.ts`,
`WILAYAS` and `ALGERIA_WILAYAS` in the back-office, the design-system page's wilaya demo if any.
The `shipping-setup.service.ts` and CLAUDE.md descriptions are updated accordingly.

## Testing

- Unit (`pnpm --filter @oscar/backend test:unit`): code-first matching, inactive rule, commune code
  generation, validation errors.
- Mobile unit (`jest`): address helpers with the generated `Wilaya` shape.
- Manual, via Playwright against the local stack: add a wilaya, add a commune, deactivate a wilaya
  and confirm it disappears from the web checkout; rename and confirm quoting still works.
- Type-check all apps (`pnpm type-check`) after codegen.

## Deployment notes

Migration runs on the VPS deploy (`migration:run`); it is additive apart from the seed and is
reversible (`down` drops the new table and columns). Web and back-office deploy together with the
backend; the mobile release follows.
