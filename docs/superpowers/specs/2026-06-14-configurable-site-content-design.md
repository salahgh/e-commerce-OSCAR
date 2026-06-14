# Design: Configurable site content via the back-office

**Date:** 2026-06-14
**Status:** Approved (pending spec review)

## Problem

Several pieces of user-facing content are hardcoded in the frontend:

- **Header:** the free-shipping promo banner text and its threshold (12 000 DZD).
- **Footer:** contact email, phone, physical address; social links (Facebook/Instagram/
  Twitter/LinkedIn/YouTube); app-store links (App Store / Google Play); legal/copyright line.
- **Home:** hero image, marketing banner images, the testimonials section title/subtitle, and
  the reviews-carousel images.

Editors cannot change any of this without a code deploy. We will make it configurable from the
custom back-office, **per channel**, with full **ar/fr/en** support for prose.

## Decisions (from brainstorming)

1. **Scope:** header promo, footer contact, social + app links, home media + testimonial text.
2. **Languages:** per-locale (ar/fr/en) for prose; single value for URLs, threshold, images.
3. **Storage:** Vendure **`Channel` custom fields** (per-channel). Chosen over `GlobalSettings`
   because settings must be per-channel, and because the shop-api exposes
   `activeChannel { customFields }` natively — no custom shop resolver required.
4. **Images:** Vendure **Asset** relations, edited with an upload/select asset picker in the
   back-office.
5. **Sequence:** one implementation plan. Per-channel.

## Architecture

```
Back-office (admin-api)                Backend (Vendure)                 Frontend (shop-api)
─────────────────────                  ─────────────────                 ───────────────────
Settings ▸ "Content" tab    ── updateChannel(customFields) ──▶  Channel.customFields
  per-language text inputs                                       (localeString / string /
  url/number inputs                                              int / Asset relations)
  asset picker (hero/banner/reviews)                                   │
                                                                       ▼
SiteSettingsProvider  ◀──── activeChannel { customFields { … } } ──────┘  (public fields)
  Header / Footer / MarketingBanner / CustomerReviews read context
```

## 1. Backend — `Channel` custom fields

Add to `apps/backend/src/vendure-config.ts` `customFields.Channel`, all under
`ui: { tab: 'Site Content' }`, all `public: true` (readable on shop-api):

| Field | Type | Notes |
|---|---|---|
| `promoText` | `localeString` | header free-shipping banner |
| `freeShippingThreshold` | `int`, default 12000 | DZD |
| `contactEmail` | `string`, nullable | footer |
| `contactPhone` | `string`, nullable | footer |
| `footerAddress` | `localeString` | footer address |
| `socialFacebook` `socialInstagram` `socialTwitter` `socialLinkedin` `socialYoutube` | `string`, nullable | footer social URLs |
| `appAppStore` `appGooglePlay` | `string`, nullable | footer app links |
| `reviewsTitle` | `localeString` | testimonials heading |
| `reviewsSubtitle` | `localeText` | testimonials subheading |
| `copyrightText` | `localeString`, nullable | footer legal line |
| `heroImage` | `relation` → `Asset`, nullable | home hero |
| `bannerImages` | `relation` → `Asset`, `list: true` | marketing banners |
| `reviewImages` | `relation` → `Asset`, `list: true` | reviews carousel |

`localeString`/`localeText` resolve to the request `languageCode` automatically in both APIs.
Asset relations resolve to `Asset { id preview }`.

**Migration:** `pnpm --filter @oscar/backend migration:generate` creates the new columns /
join tables. **Seed:** `populate.ts` sets defaults (current hardcoded values + existing
`/images/home/*` uploaded as assets) on the default channel so the live site is unchanged
on first deploy.

No new resolver is required — `activeChannel` (shop-api) and `channel`/`updateChannel`
(admin-api) already surface custom fields.

## 2. Shop-api (frontend data)

New operation in `packages/graphql-shop/src/operations/`:

```graphql
query GetSiteSettings {
  activeChannel {
    id
    customFields {
      promoText
      freeShippingThreshold
      contactEmail
      contactPhone
      footerAddress
      socialFacebook socialInstagram socialTwitter socialLinkedin socialYoutube
      appAppStore appGooglePlay
      reviewsTitle reviewsSubtitle copyrightText
      heroImage { preview }
      bannerImages { preview }
      reviewImages { preview }
    }
  }
}
```

Re-run `pnpm --filter @oscar/graphql-shop codegen`.

## 3. Frontend

- `SiteSettingsProvider` — server-fetches `GetSiteSettings` in the `[locale]/layout.tsx` (so the
  request `Accept-Language` resolves localeString correctly) and passes it via React context;
  a `useSiteSettings()` hook reads it.
- Update consumers to read from settings with a **fallback** to the existing `t()` / default,
  so an empty field never breaks the UI:
  - `Header` → `promoText`, `freeShippingThreshold`
  - `Footer` → email, phone, `footerAddress`, social/app URLs, `copyrightText`
  - `MarketingBanner` → `bannerImages`
  - `CustomerReviews` → `reviewImages`, `reviewsTitle`, `reviewsSubtitle`
  - hero → `heroImage`

## 4. Back-office

- New **"Content"** section in `apps/backoffice/src/pages/settings/Settings.tsx`
  (`sections/ContentSettings.tsx`), beside Channel/Payment/Shipping/Tax/Zone.
- Reads the active/selected channel via admin-api `channel`/`activeChannel` and writes via
  `updateChannel(input: { id, customFields })`.
- Form controls:
  - language-tabbed text inputs (ar/fr/en) for `promoText`, `footerAddress`, `reviewsTitle`,
    `reviewsSubtitle`, `copyrightText`;
  - plain inputs for email, phone, social/app URLs, threshold;
  - an **asset picker** (`AssetPickerField`) — upload new or select existing assets — for
    `heroImage` (single), `bannerImages` (list), `reviewImages` (list), reusing the existing
    asset infrastructure (`pages/settings/assets` / `AssetList`).
- Re-run `pnpm --filter @oscar/backoffice codegen` for the admin-api types.

## 5. Testing

- **Backend:** unit/integration test that `updateChannel` persists the custom fields and
  `activeChannel.customFields` returns localized values per `languageCode`.
- **Frontend:** Playwright E2E asserting the header promo + footer contact reflect the
  configured values (mock or seed), and that an unset field falls back to the default.
- **Back-office:** smoke test that the Content form loads channel values and submits an update.

## Out of scope

- Multiple storefront channels beyond the existing default (the per-channel model supports it,
  but only the default channel is configured/seeded now).
- Making shipping fees / wilaya pricing configurable here (already managed via Vendure shipping
  methods and `@oscar/shared`).
- Rich-text/WYSIWYG for prose (plain text + existing formatting only).

## Risks

- **Asset picker** is the largest piece of new back-office UI; if it slips, images can degrade
  to URL inputs without changing the data model materially.
- **Custom-field migration** must seed defaults so the live site renders identically pre-config.
- localeString custom fields require the correct `languageCode` to reach the API (handled by the
  existing Apollo `Accept-Language` link on the frontend and the back-office language selector).
