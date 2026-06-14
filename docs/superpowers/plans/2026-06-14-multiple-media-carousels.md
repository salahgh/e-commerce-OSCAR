# Multiple Media Images + Dynamic Carousels — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:executing-plans (inline). Steps use checkbox (`- [ ]`) syntax.

**Goal:** Make hero/banner/review media all multiple end-to-end, consume them in three interactive storefront carousels (custom `useCarousel` hook), and finalise with e2e.

**Architecture:** Backend hero custom field single→list (`heroImages`); regenerate shop+admin GraphQL types; back-office hero becomes multi-select; frontend exposes `heroImages: string[]` and renders hero/banner/reviews as interactive carousels driven by a headless `useCarousel` hook reusing the existing `SliderDots`/arrows.

**Tech Stack:** Vendure 3.5 (custom fields, TypeORM), GraphQL codegen, React 19/Next 16, Tailwind, Playwright.

**Dev DB note:** `vendure-config.ts` runs with `synchronize: true` in dev, so the schema change applies on **backend restart** (no `migration:run` locally); the migration file is committed for prod parity. Codegen requires the backend running with the new field.

**Commands run from repo root:** `C:/Users/B_TAS_SDRH/Documents/GitHub/e-commerce-OSCAR`. Branch: `feat/content-settings-per-section-save`.

---

### Task 1: Backend — hero field single → list, migration, seed

**Files:**
- Modify: `apps/backend/src/vendure-config.ts` (heroImage field)
- Create: `apps/backend/src/migrations/1786000000000-HeroImagesList.ts`
- Modify: `apps/backend/src/seed-site-content.ts`

- [ ] **Step 1: Change the custom field** in `vendure-config.ts` — replace the `heroImage` definition:
```ts
{ name: 'heroImages', type: 'relation', entity: Asset, list: true, public: true, ui: { tab: 'Site Content' }, label: [{ languageCode: LanguageCode.en, value: 'Hero images' }] },
```
(was `{ name: 'heroImage', type: 'relation', entity: Asset, nullable: true, ... 'Hero image' }`)

- [ ] **Step 2: Create the migration** `apps/backend/src/migrations/1786000000000-HeroImagesList.ts` (mirrors the banner junction from `1781398104602`, drops the old single hero column):
```ts
import { MigrationInterface, QueryRunner } from 'typeorm';

export class HeroImagesList1786000000000 implements MigrationInterface {
  public async up(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "channel" DROP CONSTRAINT "FK_5acf26fe4f7dddb4447d4fcab0d"`, undefined);
    await queryRunner.query(`ALTER TABLE "channel" DROP COLUMN "customFieldsHeroimageid"`, undefined);
    await queryRunner.query(`CREATE TABLE "channel_custom_fields_hero_images_asset" ("channelId" integer NOT NULL, "assetId" integer NOT NULL, CONSTRAINT "PK_channel_hero_images_asset" PRIMARY KEY ("channelId", "assetId"))`, undefined);
    await queryRunner.query(`CREATE INDEX "IDX_channel_hero_images_channel" ON "channel_custom_fields_hero_images_asset" ("channelId")`, undefined);
    await queryRunner.query(`CREATE INDEX "IDX_channel_hero_images_asset" ON "channel_custom_fields_hero_images_asset" ("assetId")`, undefined);
    await queryRunner.query(`ALTER TABLE "channel_custom_fields_hero_images_asset" ADD CONSTRAINT "FK_channel_hero_images_channel" FOREIGN KEY ("channelId") REFERENCES "channel"("id") ON DELETE CASCADE ON UPDATE CASCADE`, undefined);
    await queryRunner.query(`ALTER TABLE "channel_custom_fields_hero_images_asset" ADD CONSTRAINT "FK_channel_hero_images_asset" FOREIGN KEY ("assetId") REFERENCES "asset"("id") ON DELETE CASCADE ON UPDATE CASCADE`, undefined);
  }
  public async down(queryRunner: QueryRunner): Promise<any> {
    await queryRunner.query(`ALTER TABLE "channel_custom_fields_hero_images_asset" DROP CONSTRAINT "FK_channel_hero_images_asset"`, undefined);
    await queryRunner.query(`ALTER TABLE "channel_custom_fields_hero_images_asset" DROP CONSTRAINT "FK_channel_hero_images_channel"`, undefined);
    await queryRunner.query(`DROP INDEX "public"."IDX_channel_hero_images_asset"`, undefined);
    await queryRunner.query(`DROP INDEX "public"."IDX_channel_hero_images_channel"`, undefined);
    await queryRunner.query(`DROP TABLE "channel_custom_fields_hero_images_asset"`, undefined);
    await queryRunner.query(`ALTER TABLE "channel" ADD "customFieldsHeroimageid" integer`, undefined);
    await queryRunner.query(`ALTER TABLE "channel" ADD CONSTRAINT "FK_5acf26fe4f7dddb4447d4fcab0d" FOREIGN KEY ("customFieldsHeroimageid") REFERENCES "asset"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`, undefined);
  }
}
```

- [ ] **Step 3: Update seed** in `seed-site-content.ts` — set `heroImagesIds` (≥2 to exercise the carousel; reuse `hero-1.png` + `banner-1.png`), e.g. upload both and `heroImagesIds: [heroId, heroId2]`; ensure `bannerImagesIds` keeps `[bannerId]`. Replace any `heroImageId: heroId` usage with `heroImagesIds: [...]`.

- [ ] **Step 4: Verify backend boots** — restart backend (Task 2). It must reach "✅ Server ready" with no schema error.

- [ ] **Step 5: Commit**
```bash
git add apps/backend/src/vendure-config.ts apps/backend/src/migrations/1786000000000-HeroImagesList.ts apps/backend/src/seed-site-content.ts
git commit -m "feat(backend): make hero a multi-image (heroImages) list custom field"
```

---

### Task 2: Restart backend + update GraphQL ops + regenerate types (orchestration)

**Files:**
- Modify: `packages/graphql-shop/src/operations/shop-settings.graphql`
- Modify: `apps/backoffice/src/graphql/vendure/settings.graphql`

- [ ] **Step 1: Restart the backend** so `synchronize` applies `heroImages` (stop the running dev backend, free :8085, `pnpm dev:backend`, wait for "Server ready").
- [ ] **Step 2: Update shop op** — in `shop-settings.graphql`, change `heroImage { id preview }` → `heroImages { id preview }`.
- [ ] **Step 3: Update admin op** — in `apps/backoffice/src/graphql/vendure/settings.graphql` `ActiveChannelContent`, change `heroImage { id preview }` → `heroImages { id preview }`.
- [ ] **Step 4: Regenerate** (backend running):
```bash
pnpm --filter @oscar/graphql-shop codegen
pnpm --filter @oscar/backoffice codegen
```
Expected: both succeed; generated types now expose `heroImages: Array<{id, preview}>`.
- [ ] **Step 5: Commit**
```bash
git add packages/graphql-shop/src/operations/shop-settings.graphql packages/graphql-shop/src/generated/graphql.ts apps/backoffice/src/graphql/vendure/settings.graphql apps/backoffice/src/graphql/generated
git commit -m "feat(graphql): heroImages (list) in shop + admin operations and generated types"
```

---

### Task 3: Back-office — hero multi-select

**Files:**
- Modify: `apps/backoffice/src/pages/settings/sections/useChannelContentForm.ts`
- Modify: `apps/backoffice/src/pages/settings/sections/ContentSettings.tsx`

- [ ] **Step 1: Hook** — in `useChannelContentForm.ts`: rename media `hero` → `heroes: PickedAsset[]`. `EMPTY_MEDIA = { heroes: [], banners: [], reviews: [] }`. Hydrate `heroes` from `cf.heroImages` (map `{id, preview}`). Add `setHeroes`. In `dirtyFor('media')`, also compare `idsEqual(media.heroes, mediaBaseline.heroes)`. In `saveSection('media')`, send `customFields.heroImagesIds = media.heroes.map(a => a.id)` (drop `heroImageId`). Return `heroes` + `setHeroes` (remove `hero`/`setHero`).
- [ ] **Step 2: ContentSettings** — replace hero `ImageField` usage to use `media.heroes` and `setHeroes`; relabel `"Image principale"` → `"Images principales"`. In the `AssetPickerModal`, make hero multiple: change `multiple={picker !== 'hero'}` → `multiple` (always true); `selectedIds` for `'hero'` → `media.heroes.map(a => a.id)`; `onSelect` for `'hero'` → `setHeroes(picked)` (was `setHero(picked[0])`). Update the hero `ImageField` `assets={media.heroes}` and `onClear={() => setHeroes([])}`.
- [ ] **Step 3: Type-check** — `pnpm --filter @oscar/backoffice exec tsc -b`. Expected PASS.
- [ ] **Step 4: Commit**
```bash
git add apps/backoffice/src/pages/settings/sections/useChannelContentForm.ts apps/backoffice/src/pages/settings/sections/ContentSettings.tsx
git commit -m "feat(backoffice): hero images multi-select in Content settings"
```

---

### Task 4: Frontend — carousels

**Files:**
- Modify: `apps/frontend/src/contexts/SiteSettingsContext.tsx`
- Create: `apps/frontend/src/components/home/useCarousel.ts`
- Modify: `apps/frontend/src/components/home/SliderDots.tsx`
- Create: `apps/frontend/src/components/home/BannerCarousel.tsx` (replaces `MarketingBanner.tsx`)
- Delete: `apps/frontend/src/components/home/MarketingBanner.tsx`
- Modify: `apps/frontend/src/components/home/index.ts`
- Modify: `apps/frontend/src/app/[locale]/(shop)/page.tsx`
- Modify: `apps/frontend/src/components/home/CustomerReviews.tsx`

- [ ] **Step 1: SiteSettings** — in `SiteSettingsContext.tsx`: change interface `heroImage: string | null` → `heroImages: string[]`; in the memo replace `heroImage: (cf.heroImage as ...)?.preview ?? null` with `heroImages: assetUrls('heroImages')`.

- [ ] **Step 2: useCarousel hook** — create `useCarousel.ts`:
```ts
'use client';
import { useCallback, useEffect, useState } from 'react';

export function useCarousel(length: number, opts?: { autoMs?: number }) {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    if (index > length - 1) setIndex(length > 0 ? length - 1 : 0);
  }, [length, index]);
  const goTo = useCallback(
    (i: number) => {
      if (length <= 0) return;
      setIndex(((i % length) + length) % length);
    },
    [length],
  );
  const next = useCallback(() => goTo(index + 1), [goTo, index]);
  const prev = useCallback(() => goTo(index - 1), [goTo, index]);
  useEffect(() => {
    if (!opts?.autoMs || length <= 1) return;
    const id = setInterval(() => setIndex((p) => (p + 1) % length), opts.autoMs);
    return () => clearInterval(id);
  }, [opts?.autoMs, length]);
  return { index, next, prev, goTo };
}
```

- [ ] **Step 3: SliderDots** — add an optional `onDotClick`; render interactive `<button>`s when provided:
```tsx
import { cn } from '@/lib/utils/cn';

interface SliderDotsProps {
  count: number;
  active?: number;
  className?: string;
  onDotClick?: (i: number) => void;
}

export function SliderDots({ count, active = 0, className, onDotClick }: SliderDotsProps) {
  const interactive = !!onDotClick;
  return (
    <div className={cn('flex items-center justify-center gap-2.5', className)} aria-hidden={interactive ? undefined : 'true'}>
      {Array.from({ length: count }).map((_, i) => {
        const cls = cn('rounded-full transition-all', i === active ? 'h-4 w-4 bg-accent' : 'h-3 w-3 bg-content-subtle opacity-50');
        return interactive ? (
          <button key={i} type="button" aria-label={`Aller à la diapo ${i + 1}`} aria-current={i === active} onClick={() => onDotClick!(i)} className={cls} />
        ) : (
          <span key={i} className={cls} />
        );
      })}
    </div>
  );
}
```

- [ ] **Step 4: BannerCarousel** — create `BannerCarousel.tsx` (replaces MarketingBanner):
```tsx
'use client';

import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { SliderDots } from './SliderDots';
import { useCarousel } from './useCarousel';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

interface BannerCarouselProps {
  settingKey: 'hero' | 'banner';
  fallbackSrcs: string[];
  alt: string;
  priority?: boolean;
}

export function BannerCarousel({ settingKey, fallbackSrcs, alt, priority }: BannerCarouselProps) {
  const s = useSiteSettings();
  const configured = settingKey === 'hero' ? s?.heroImages : s?.bannerImages;
  const images = configured && configured.length ? configured : fallbackSrcs;
  const { index, next, prev, goTo } = useCarousel(images.length);
  const multiple = images.length > 1;
  const arrowCls =
    'absolute top-1/2 -translate-y-1/2 inline-flex h-10 w-10 items-center justify-center rounded-full bg-bg-elevated/80 text-content-strong shadow-card transition-colors hover:bg-bg-elevated';
  return (
    <section className="flex flex-col items-center gap-7">
      <div className="relative w-full overflow-hidden rounded-[12px]">
        <Image
          key={images[index]}
          src={images[index]}
          alt={alt}
          width={1392}
          height={733}
          priority={priority}
          className="h-auto w-full object-cover"
        />
        {multiple && (
          <>
            <button type="button" aria-label="Précédent" onClick={prev} className={`${arrowCls} left-4`}>
              <ArrowLeft className="h-5 w-5" />
            </button>
            <button type="button" aria-label="Suivant" onClick={next} className={`${arrowCls} right-4`}>
              <ArrowRight className="h-5 w-5" />
            </button>
          </>
        )}
      </div>
      {multiple && <SliderDots count={images.length} active={index} onDotClick={goTo} />}
    </section>
  );
}
```

- [ ] **Step 5: index + delete MarketingBanner** — in `index.ts` replace `export { MarketingBanner } from './MarketingBanner';` with `export { BannerCarousel } from './BannerCarousel';`. Delete `MarketingBanner.tsx`.

- [ ] **Step 6: Home page** — in `page.tsx` swap the two banners:
```tsx
<BannerCarousel settingKey="hero" fallbackSrcs={['/images/home/hero-1.png']} alt={t('hero.alt')} priority />
...
<BannerCarousel settingKey="banner" fallbackSrcs={['/images/home/banner-1.png']} alt={t('promo.alt')} />
```
Update the import from `@/components/home` (`MarketingBanner` → `BannerCarousel`).

- [ ] **Step 7: CustomerReviews** — wire controls with `useCarousel`, centering the active review via rotation:
```tsx
'use client';

import Image from 'next/image';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { SliderDots } from './SliderDots';
import { useCarousel } from './useCarousel';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

const FALLBACK_REVIEWS = [
  '/images/home/review-3.png',
  '/images/home/review-2.png',
  '/images/home/review-1.png',
  '/images/home/review-4.png',
  '/images/home/review-5.png',
];
const SIZE_CLS = [
  'hidden h-[392px] w-[234px] lg:block',
  'hidden h-[504px] w-[312px] md:block',
  'h-[440px] w-[268px] sm:h-[560px] sm:w-[340px] lg:h-[615px] lg:w-[390px]',
  'hidden h-[504px] w-[312px] md:block',
  'hidden h-[392px] w-[234px] lg:block',
];

export function CustomerReviews() {
  const t = useTranslations('HomePage.reviews');
  const s = useSiteSettings();
  const images = s?.reviewImages.length ? s.reviewImages : FALLBACK_REVIEWS;
  const title = s?.reviewsTitle || t('title');
  const subtitle = s?.reviewsSubtitle || t('subtitle');
  const { index, next, prev, goTo } = useCarousel(images.length);
  // Coverflow window of 5, centered on the active index.
  const view = Array.from({ length: 5 }, (_, p) => images[((index - 2 + p) % images.length + images.length) % images.length]);
  return (
    <section className="flex flex-col items-center gap-12">
      <div className="flex flex-col items-center gap-4 text-center">
        <h2 className="text-[40px] font-medium leading-tight text-accent">{title}</h2>
        <p className="max-w-3xl text-24 text-accent">{subtitle}</p>
      </div>

      <div className="flex w-full items-center justify-center gap-4 overflow-hidden">
        {view.map((src, i) => (
          <div key={i} className={`relative shrink-0 overflow-hidden rounded-[39px] border border-border bg-bg-elevated shadow-card ${SIZE_CLS[i]}`}>
            <Image src={src} alt="" fill sizes="390px" className="object-cover" />
          </div>
        ))}
      </div>

      <div className="flex items-center gap-3">
        <button type="button" aria-label={t('prev')} onClick={prev} className="inline-flex h-9 w-9 items-center justify-center text-content-muted transition-colors hover:text-content-strong">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <SliderDots count={images.length} active={index} onDotClick={goTo} />
        <button type="button" aria-label={t('next')} onClick={next} className="inline-flex h-9 w-9 items-center justify-center text-content-muted transition-colors hover:text-content-strong">
          <ArrowRight className="h-5 w-5" />
        </button>
      </div>
    </section>
  );
}
```

- [ ] **Step 8: Type-check** — `pnpm --filter @oscar/frontend exec tsc --noEmit -p tsconfig.json` (or `pnpm type-check`). Expected PASS. Also confirm no remaining `MarketingBanner` references: `grep -rn MarketingBanner apps/frontend/src` returns nothing.
- [ ] **Step 9: Commit**
```bash
git add apps/frontend/src
git commit -m "feat(frontend): dynamic hero/banner/review carousels consuming configured images"
```

---

### Task 5: E2E — finalise

**Files:**
- Create: `apps/frontend/e2e/home-media.spec.ts`

- [ ] **Step 1: Ensure backend seeded** — backend on `:8085`, run `pnpm --filter @oscar/backend seed:site-content` (or set via back-office) so `heroImages` has ≥2, `bannerImages` ≥1, `reviewImages` 5.
- [ ] **Step 2: Write the spec** `apps/frontend/e2e/home-media.spec.ts`:
```ts
import { test, expect } from '@playwright/test';

test.describe('Home media carousels', () => {
  test('hero carousel renders configured images with working dots/arrows', async ({ page }) => {
    await page.goto('/ar');
    await page.waitForLoadState('networkidle');
    const hero = page.locator('main section').first();
    const img = hero.locator('img').first();
    await expect(img).toBeVisible();
    const firstSrc = await img.getAttribute('src');
    // dots present => multiple configured hero images
    const dots = hero.getByRole('button', { name: /Aller à la diapo/ });
    expect(await dots.count()).toBeGreaterThan(1);
    // next advances the slide
    await hero.getByRole('button', { name: 'Suivant' }).click();
    await expect(img).not.toHaveAttribute('src', firstSrc ?? '');
  });

  test('reviews carousel navigates', async ({ page }) => {
    await page.goto('/ar');
    await page.waitForLoadState('networkidle');
    const reviews = page.locator('main section').last();
    const centeredBefore = await reviews.locator('img').nth(2).getAttribute('src');
    await reviews.getByRole('button', { name: /suivant|next/i }).click();
    await expect(reviews.locator('img').nth(2)).not.toHaveAttribute('src', centeredBefore ?? '');
  });
});
```
(Adjust selectors to the actual DOM after Step-by-step verification; assert membership not exact order.)

- [ ] **Step 3: Run e2e** — `pnpm --filter @oscar/frontend exec playwright test home-media.spec.ts --project=desktop` (frontend served on E2E port; backend on :8085). Expected PASS.
- [ ] **Step 4: Commit**
```bash
git add apps/frontend/e2e/home-media.spec.ts
git commit -m "test(frontend): e2e for dynamic home media carousels"
```

---

## Self-review

- **Spec coverage:** hero→list + migration + seed (T1), codegen shop+admin (T2), backoffice multi-select (T3), SiteSettings + useCarousel + SliderDots + BannerCarousel + reviews wiring + fallbacks (T4), e2e (T5). ✓
- **Placeholders:** migration timestamp `1786000000000` is a concrete value > existing `1781398104602`; e2e selectors noted as "adjust to actual DOM" — acceptable since DOM is verified live during execution. ✓
- **Type consistency:** `heroImages` (list) / `heroImagesIds` (mutation) / `media.heroes` / `SiteSettings.heroImages: string[]` / `useCarousel` return `{index,next,prev,goTo}` used consistently in BannerCarousel + CustomerReviews + SliderDots `onDotClick`. ✓
