# Multiple Media Images + Dynamic Carousels (Design)

**Date:** 2026-06-14
**Area:** `apps/backend`, `packages/graphql-shop`, `apps/backoffice`, `apps/frontend`
**Status:** Approved (carousel approach A — custom hook, no new dependency)
**Builds on:** branch `feat/content-settings-per-section-save`

## Problem

The site-content media fields are inconsistent and under-consumed:
- **Hero** (`heroImage`) is a **single** Asset relation; banners/reviews are lists.
- The storefront only renders **one** hero image and only `bannerImages[0]` — the rest are ignored.
- The home page already has the carousel **chrome** (`SliderDots`, prev/next arrows) but it is static/decorative: dots are hardcoded `count={5} active={0}`, arrows have no handlers.

## Goal

1. Make all three media fields **multiple**: `heroImages`, `bannerImages`, `reviewImages` (lists of Assets).
2. The storefront **consumes all** configured images via three **dynamic, interactive carousels** — *image principale* (hero), *bannière marketing* (banner), *carousel d'avis* (reviews) — wiring the existing dots + arrows to real navigation.
3. **Finalise with e2e tests** asserting the configured images render and the carousels navigate.

## Non-Goals (YAGNI)

- No new carousel library (approach A: a tiny custom hook reusing existing markup).
- No autoplay requirement unless trivial to add (optional `autoMs`, off by default).
- No redesign of the coverflow layout for reviews — only make its controls functional.
- No changes to category images (those come from collection `featuredAsset`).

## Approach (locked): A — custom `useCarousel` hook + clickable `SliderDots`

No carousel dependency is installed; the dots/arrows markup already exists. A headless hook drives an active index; the existing components render slides and wire the controls. Works for both the full-width hero/banner layout and the reviews coverflow.

## Changes by layer (in dependency order)

### 1. Backend — `apps/backend`

- `src/vendure-config.ts`: change the hero custom field from single to list and rename for plural consistency:
  ```ts
  // before
  { name: 'heroImage', type: 'relation', entity: Asset, nullable: true, public: true, ui: { tab: 'Site Content' }, label: [{ languageCode: LanguageCode.en, value: 'Hero image' }] },
  // after
  { name: 'heroImages', type: 'relation', entity: Asset, list: true, public: true, ui: { tab: 'Site Content' }, label: [{ languageCode: LanguageCode.en, value: 'Hero images' }] },
  ```
- **Migration:** dev uses `synchronize: true`, so the schema updates on boot. For parity with the existing migration pattern, add a migration `src/migrations/<ts>-HeroImagesList.ts` that **drops** `channel.customFieldsHeroimageid` (+ its FK) and **creates** the `channel_custom_fields_hero_images_asset` junction table + FKs — mirroring the banner/review junctions in `1781398104602-SiteContentFields.ts`. (If `migration:generate` emits nothing because dev already synced, hand-write it from that template.)
- `src/seed-site-content.ts`: replace `heroImageId: heroId` with `heroImagesIds: [...]` and seed **≥2** hero images (reuse available files, e.g. `hero-1.png` + `banner-1.png`) so the carousel is demonstrable. Banner seed may also add a 2nd image for the same reason.
- **Regenerate types** (backend running): `pnpm --filter @oscar/graphql-shop codegen` and `pnpm --filter @oscar/backoffice codegen`.

### 2. graphql-shop — `packages/graphql-shop`

- `src/operations/shop-settings.graphql`: `heroImage { id preview }` → `heroImages { id preview }`.
- Regenerate `src/generated/graphql.ts`.

### 3. Back-office — `apps/backoffice`

- `src/graphql/vendure/settings.graphql`: in `ActiveChannelContent`, `heroImage { id preview }` → `heroImages { id preview }`. Regenerate admin types.
- `src/pages/settings/sections/useChannelContentForm.ts`: hero state becomes `PickedAsset[]` (like banners/reviews); hydrate from `cf.heroImages`; dirty/save use `heroImagesIds: media.heroes.map(a => a.id)`. The `media` shape becomes `{ heroes, banners, reviews }`.
- `src/pages/settings/sections/ContentSettings.tsx`: the hero `ImageField` becomes multiple; the `AssetPickerModal` for the hero target uses `multiple` (all three now multiple). Relabel "Image principale" → "Images principales" (FR).

### 4. Frontend — `apps/frontend`

- `src/contexts/SiteSettingsContext.tsx`: `heroImage: string | null` → `heroImages: string[]` (use the existing `assetUrls('heroImages')` helper).
- **New** `src/components/home/useCarousel.ts`: `useCarousel(length: number, opts?: { autoMs?: number })` → `{ index, next, prev, goTo }`. Clamps/wraps index; no-ops when `length <= 1`.
- `src/components/home/SliderDots.tsx`: add optional `onDotClick?: (i: number) => void`. When provided, render dots as `<button>`s with `aria-label`; otherwise keep current decorative behavior.
- **New/renamed** `src/components/home/BannerCarousel.tsx` (generalizes `MarketingBanner`): props `{ settingKey: 'hero' | 'banner'; fallbackSrcs: string[]; alt; priority? }`. Resolves the image array from `useSiteSettings()` (`heroImages`/`bannerImages`), falls back to `fallbackSrcs`, renders the current slide via `useCarousel`, with clickable `SliderDots` (count = images.length) and prev/next arrows. Arrows/dots hidden when a single image.
- `src/app/[locale]/(shop)/page.tsx`: use `BannerCarousel` for hero (`fallbackSrcs={['/images/home/hero-1.png']}`) and banner (`fallbackSrcs={['/images/home/banner-1.png']}`).
- `src/components/home/CustomerReviews.tsx`: wire the existing arrows + dots to `useCarousel(images.length)` — arrows call `prev/next`, dots reflect/seek `index`, and the coverflow centers the active review. Keep fallbacks.

### 5. E2E — `apps/frontend/e2e`

Add `home-media.spec.ts` (or extend `site-settings.spec.ts`). With the backend running on `:8085` and `seed:site-content` applied:
- Hero carousel renders the configured hero image (`<img>` `src` contains the asset preview path) and shows **N dots** == configured hero count.
- Clicking the next arrow (or 2nd dot) advances the hero slide (rendered `src` changes to the 2nd asset).
- Banner carousel renders the configured banner image(s).
- Reviews render the configured review set; next/prev changes the centered review.
- Keep assertions resilient to ordering (assert membership, not exact order).

## Data flow

channel `customFields` → shop-api `GetSiteSettings` → `SiteSettingsContext` (arrays of preview URLs) → `BannerCarousel` / `CustomerReviews` (client) render the active slide and wire dots/arrows via `useCarousel`.

## Error handling / fallbacks

- Empty arrays → fall back to static `/images/home/*` so the home page never renders blank.
- `length <= 1` → `useCarousel` no-ops; arrows and extra dots are hidden.
- Reviews keep `FALLBACK_REVIEWS` when settings are empty.

## Files

- Backend: `vendure-config.ts` (modify), `migrations/<ts>-HeroImagesList.ts` (new), `seed-site-content.ts` (modify).
- graphql-shop: `operations/shop-settings.graphql` (modify), `generated/graphql.ts` (regenerated).
- Back-office: `graphql/vendure/settings.graphql` (modify), generated admin types (regenerated), `sections/useChannelContentForm.ts` (modify), `sections/ContentSettings.tsx` (modify).
- Frontend: `contexts/SiteSettingsContext.tsx` (modify), `components/home/useCarousel.ts` (new), `components/home/SliderDots.tsx` (modify), `components/home/BannerCarousel.tsx` (new, replaces `MarketingBanner.tsx`), `components/home/index.ts` (modify), `app/[locale]/(shop)/page.tsx` (modify), `components/home/CustomerReviews.tsx` (modify).
- E2E: `e2e/home-media.spec.ts` (new).

## Verification

- `pnpm --filter @oscar/backend build` (or boot) applies the field change; `migration:run` clean.
- `pnpm type-check` passes across graphql-shop, backoffice, frontend after codegen.
- Back-office: hero now multi-select; saving persists `heroImages` (verified via admin-api query).
- Frontend e2e (`home-media.spec.ts`) passes against the seeded backend.
