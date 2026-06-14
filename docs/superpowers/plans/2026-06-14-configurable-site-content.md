# Configurable Site Content Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the header promo, footer contact/social/app links, and home media + testimonial text editable per-channel from the custom back-office, with ar/fr/en support.

**Architecture:** Store config as Vendure `Channel` custom fields (localeString for prose, string/int for scalars, Asset relations for images). The frontend reads `activeChannel.customFields` over the shop-api (client-side Apollo; the auth link sends `Accept-Language`, so localeString resolves per locale) through a `SiteSettingsProvider`, with fallback to current `t()` defaults. The back-office edits the active channel via the existing `updateChannel` admin-api mutation, in a new "Content" tab.

**Tech Stack:** Vendure 3.5 (NestJS/TypeORM), Next.js 16 + Apollo, React + Vite back-office + Apollo + Formik, GraphQL codegen.

**Reference spec:** `docs/superpowers/specs/2026-06-14-configurable-site-content-design.md`

---

## File Structure

**Backend**
- Modify: `apps/backend/src/vendure-config.ts` — add `customFields.Channel`
- Create: `apps/backend/src/migrations/<timestamp>-site-content-fields.ts` — generated
- Modify: `apps/backend/src/populate.ts` — seed defaults on the default channel

**Shared GraphQL (shop)**
- Create: `packages/graphql-shop/src/operations/shop-settings.graphql`
- Regenerate: `packages/graphql-shop/src/generated/graphql.ts`

**Frontend**
- Create: `apps/frontend/src/contexts/SiteSettingsContext.tsx`
- Modify: `apps/frontend/src/app/[locale]/layout.tsx` — mount provider
- Modify: `apps/frontend/src/components/layout/Header.tsx`
- Modify: `apps/frontend/src/components/layout/Footer.tsx`
- Modify: `apps/frontend/src/components/home/MarketingBanner.tsx` + `CustomerReviews.tsx` + home `page.tsx`
- Create: `apps/frontend/e2e/site-settings.spec.ts`

**Back-office**
- Modify: `apps/backoffice/src/graphql/vendure/channels.graphql` — select/write `customFields`
- Regenerate: `apps/backoffice/src/graphql/generated/graphql.ts`
- Create: `apps/backoffice/src/pages/settings/sections/ContentSettings.tsx`
- Create: `apps/backoffice/src/pages/settings/sections/AssetPickerField.tsx`
- Modify: `apps/backoffice/src/pages/settings/Settings.tsx` — add "Content" tab

---

## Phase A — Backend

### Task 1: Add Channel custom fields

**Files:**
- Modify: `apps/backend/src/vendure-config.ts` (the `customFields` object, ~line 150)

- [ ] **Step 1: Add the `Channel` custom-fields array**

In `apps/backend/src/vendure-config.ts`, inside the `customFields: { ... }` object, add a `Channel` key (alongside `Product`, `Order`, etc.). `LanguageCode` is already imported in this file.

```ts
    Channel: [
      // --- Header ---
      { name: 'promoText', type: 'localeString', nullable: true, public: true,
        ui: { tab: 'Site Content' },
        label: [{ languageCode: LanguageCode.en, value: 'Promo banner text' }] },
      { name: 'freeShippingThreshold', type: 'int', nullable: true, defaultValue: 12000, public: true,
        ui: { tab: 'Site Content' },
        label: [{ languageCode: LanguageCode.en, value: 'Free shipping threshold (DZD)' }] },
      // --- Footer contact ---
      { name: 'contactEmail', type: 'string', nullable: true, public: true,
        ui: { tab: 'Site Content' }, label: [{ languageCode: LanguageCode.en, value: 'Contact email' }] },
      { name: 'contactPhone', type: 'string', nullable: true, public: true,
        ui: { tab: 'Site Content' }, label: [{ languageCode: LanguageCode.en, value: 'Contact phone' }] },
      { name: 'footerAddress', type: 'localeString', nullable: true, public: true,
        ui: { tab: 'Site Content' }, label: [{ languageCode: LanguageCode.en, value: 'Footer address' }] },
      // --- Social + app links ---
      { name: 'socialFacebook', type: 'string', nullable: true, public: true, ui: { tab: 'Site Content' }, label: [{ languageCode: LanguageCode.en, value: 'Facebook URL' }] },
      { name: 'socialInstagram', type: 'string', nullable: true, public: true, ui: { tab: 'Site Content' }, label: [{ languageCode: LanguageCode.en, value: 'Instagram URL' }] },
      { name: 'socialTwitter', type: 'string', nullable: true, public: true, ui: { tab: 'Site Content' }, label: [{ languageCode: LanguageCode.en, value: 'Twitter URL' }] },
      { name: 'socialLinkedin', type: 'string', nullable: true, public: true, ui: { tab: 'Site Content' }, label: [{ languageCode: LanguageCode.en, value: 'LinkedIn URL' }] },
      { name: 'socialYoutube', type: 'string', nullable: true, public: true, ui: { tab: 'Site Content' }, label: [{ languageCode: LanguageCode.en, value: 'YouTube URL' }] },
      { name: 'appAppStore', type: 'string', nullable: true, public: true, ui: { tab: 'Site Content' }, label: [{ languageCode: LanguageCode.en, value: 'App Store URL' }] },
      { name: 'appGooglePlay', type: 'string', nullable: true, public: true, ui: { tab: 'Site Content' }, label: [{ languageCode: LanguageCode.en, value: 'Google Play URL' }] },
      // --- Testimonials ---
      { name: 'reviewsTitle', type: 'localeString', nullable: true, public: true, ui: { tab: 'Site Content' }, label: [{ languageCode: LanguageCode.en, value: 'Reviews section title' }] },
      { name: 'reviewsSubtitle', type: 'localeString', nullable: true, public: true, ui: { tab: 'Site Content' }, label: [{ languageCode: LanguageCode.en, value: 'Reviews section subtitle' }] },
      { name: 'copyrightText', type: 'localeString', nullable: true, public: true, ui: { tab: 'Site Content' }, label: [{ languageCode: LanguageCode.en, value: 'Footer copyright line' }] },
      // --- Images ---
      { name: 'heroImage', type: 'relation', entity: Asset, nullable: true, public: true, ui: { tab: 'Site Content' }, label: [{ languageCode: LanguageCode.en, value: 'Hero image' }] },
      { name: 'bannerImages', type: 'relation', entity: Asset, list: true, public: true, ui: { tab: 'Site Content' }, label: [{ languageCode: LanguageCode.en, value: 'Marketing banner images' }] },
      { name: 'reviewImages', type: 'relation', entity: Asset, list: true, public: true, ui: { tab: 'Site Content' }, label: [{ languageCode: LanguageCode.en, value: 'Review carousel images' }] },
    ],
```

- [ ] **Step 2: Import `Asset`**

Ensure the import at the top of `vendure-config.ts` includes `Asset`:

```ts
import { Asset, LanguageCode /* …existing… */ } from '@vendure/core';
```
(Add `Asset` to the existing `@vendure/core` import; do not duplicate the import line.)

- [ ] **Step 3: Generate the migration**

Run (backend must compile; DB reachable):
```bash
pnpm --filter @oscar/backend migration:generate
```
Expected: a new file under `apps/backend/src/migrations/` adding `customFieldsPromotext`, `customFieldsFreeshippingthreshold`, … columns to `channel`, plus join tables for the Asset list relations. If the tool reports "No changes in database schema were found", confirm the customFields compiled (re-check Step 1) before proceeding.

- [ ] **Step 4: Run the migration**
```bash
pnpm --filter @oscar/backend migration:run
```
Expected: migration applied, no error.

- [ ] **Step 5: Verify exposure on shop-api**

Start the backend (`pnpm dev:backend`), then query the shop-api:
```bash
curl -s localhost:8085/shop-api -H 'content-type: application/json' \
  -d '{"query":"{ activeChannel { customFields { promoText freeShippingThreshold contactEmail heroImage { preview } bannerImages { preview } } } }"}'
```
Expected: JSON with a `data.activeChannel.customFields` object (values null until seeded). No GraphQL errors.

- [ ] **Step 6: Commit**
```bash
git add apps/backend/src/vendure-config.ts apps/backend/src/migrations
git commit -m "feat(backend): add Channel site-content custom fields"
```

---

### Task 2: Seed defaults on the default channel

**Files:**
- Modify: `apps/backend/src/populate.ts`

- [ ] **Step 1: Read the current populate flow**

Open `apps/backend/src/populate.ts` and find where it bootstraps the app and has access to the Vendure services (it already creates products/collections). Identify the `INTERNAL_ADMIN` request context / `ChannelService` usage pattern already present. You will add a step that, after assets exist, sets the default channel custom fields.

- [ ] **Step 2: Add a `seedSiteContent` step**

Add this helper and call it near the end of the populate run (after assets/collections are created). It uploads the existing `apps/frontend/public/images/home/*` images as Vendure assets and sets the channel custom fields. Use the app's `AssetService`, `ChannelService`, and a server admin `RequestContext` (the file already constructs one — reuse it; named `ctx` below).

```ts
import { AssetService, ChannelService, RequestContext } from '@vendure/core';
import { createReadStream } from 'fs';
import path from 'path';

async function seedSiteContent(app: import('@nestjs/common').INestApplicationContext, ctx: RequestContext) {
  const assetService = app.get(AssetService);
  const channelService = app.get(ChannelService);

  const homeImagesDir = path.join(__dirname, '../../frontend/public/images/home');
  const upload = async (file: string) => {
    const asset = await assetService.create(ctx, {
      file: {
        createReadStream: () => createReadStream(path.join(homeImagesDir, file)),
        filename: file,
        mimetype: file.endsWith('.svg') ? 'image/svg+xml' : 'image/png',
      } as any,
      tags: ['site-content'],
    });
    if ('id' in asset) return asset.id;
    throw new Error(`Failed to upload ${file}: ${JSON.stringify(asset)}`);
  };

  const hero = await upload('hero-1.png');
  const banner = await upload('banner-1.png');
  const reviews = [];
  for (const f of ['review-1.png', 'review-2.png', 'review-3.png', 'review-4.png', 'review-5.png']) {
    reviews.push(await upload(f));
  }

  const channel = await channelService.getDefaultChannel(ctx);
  await channelService.update(ctx, {
    id: channel.id,
    customFields: {
      promoText: 'شحن مجاني للطلبات التي تزيد قيمتها عن 12000 دينار جزائري',
      freeShippingThreshold: 12000,
      contactEmail: 'contact@oscarfashion.dz',
      contactPhone: '+213 555 000 000',
      socialFacebook: 'https://facebook.com',
      socialInstagram: 'https://instagram.com',
      socialTwitter: 'https://twitter.com',
      socialLinkedin: 'https://linkedin.com',
      socialYoutube: 'https://youtube.com',
      appAppStore: 'https://apps.apple.com',
      appGooglePlay: 'https://play.google.com',
      heroImageId: hero,
      bannerImagesIds: [banner],
      reviewImagesIds: reviews,
    } as any,
  });

  // localeString fields must be set per language via translations:
  for (const languageCode of ['ar', 'fr', 'en'] as const) {
    // Re-run update per language so Vendure stores the translated localeString.
    // (Vendure resolves localeString custom fields from the ctx languageCode.)
  }
  console.log('✓ Seeded site content on default channel');
}
```

> **localeString note:** Vendure stores `localeString` custom fields in the channel *translations* table keyed by languageCode. Set them by calling `channelService.update` within a `RequestContext` whose `languageCode` is each target language, passing only the localeString fields. Implement the loop body as:
> ```ts
> const texts = {
>   ar: { promoText: 'شحن مجاني للطلبات التي تزيد قيمتها عن 12000 دينار جزائري', footerAddress: 'شارع ديدوش مراد، الجزائر العاصمة 16000', reviewsTitle: 'آراء عملائنا', reviewsSubtitle: 'نفخر بثقة عملائنا ونسعى دائمًا لتقديم تجربة تسوق مميزة.', copyrightText: 'جميع الحقوق محفوظة' },
>   fr: { promoText: 'Livraison gratuite pour les commandes de plus de 12000 DZD', footerAddress: 'Rue Didouche Mourad, Alger 16000', reviewsTitle: 'Avis de nos clients', reviewsSubtitle: 'Nous sommes fiers de la confiance de nos clients.', copyrightText: 'Tous droits réservés' },
>   en: { promoText: 'Free shipping on orders over 12,000 DZD', footerAddress: 'Didouche Mourad St, Algiers 16000', reviewsTitle: 'Customer reviews', reviewsSubtitle: 'We take pride in our customers’ trust.', copyrightText: 'All rights reserved' },
> } as const;
> const langCtx = await requestContextService.create({ apiType: 'admin', languageCode: LanguageCode[lc] });
> await channelService.update(langCtx, { id: channel.id, customFields: texts[lc] as any });
> ```
> Use the `RequestContextService` (`app.get(RequestContextService)`) to build a per-language ctx.

- [ ] **Step 3: Make seeding idempotent**

Guard so re-running populate doesn't duplicate assets: before uploading, check for an existing asset tagged `site-content` (via `assetService.findAll` filtered by tag) and skip upload if the channel already has `customFields.heroImageId`. If present, return early from `seedSiteContent`.

- [ ] **Step 4: Run populate and verify**
```bash
pnpm --filter @oscar/backend populate
```
Then re-run the Step-5 curl from Task 1 — expect `promoText`, `contactEmail`, and `heroImage.preview` to be populated.

- [ ] **Step 5: Commit**
```bash
git add apps/backend/src/populate.ts
git commit -m "feat(backend): seed site-content defaults on default channel"
```

---

## Phase B — Shop-api operation + frontend

### Task 3: Add the `GetSiteSettings` shop operation

**Files:**
- Create: `packages/graphql-shop/src/operations/shop-settings.graphql`

- [ ] **Step 1: Write the operation**
```graphql
# Vendure Shop API - Site content settings (Channel custom fields)
query GetSiteSettings {
  activeChannel {
    id
    customFields {
      promoText
      freeShippingThreshold
      contactEmail
      contactPhone
      footerAddress
      socialFacebook
      socialInstagram
      socialTwitter
      socialLinkedin
      socialYoutube
      appAppStore
      appGooglePlay
      reviewsTitle
      reviewsSubtitle
      copyrightText
      heroImage { id preview }
      bannerImages { id preview }
      reviewImages { id preview }
    }
  }
}
```

- [ ] **Step 2: Regenerate types (backend must be running)**
```bash
pnpm --filter @oscar/graphql-shop codegen
```
Expected: `useGetSiteSettingsQuery` and `GetSiteSettingsDocument` appear in `packages/graphql-shop/src/generated/graphql.ts`. Verify:
```bash
grep -c "GetSiteSettings" packages/graphql-shop/src/generated/graphql.ts
```
Expected: ≥ 1.

- [ ] **Step 3: Commit**
```bash
git add packages/graphql-shop/src/operations/shop-settings.graphql packages/graphql-shop/src/generated/graphql.ts
git commit -m "feat(graphql-shop): add GetSiteSettings query"
```

---

### Task 4: SiteSettingsProvider + hook

**Files:**
- Create: `apps/frontend/src/contexts/SiteSettingsContext.tsx`
- Modify: `apps/frontend/src/app/[locale]/layout.tsx`

- [ ] **Step 1: Create the context/provider**
```tsx
'use client';

import * as React from 'react';
import { useGetSiteSettingsQuery } from '@oscar/graphql-shop/generated';

type SiteSettings = NonNullable<
  ReturnType<typeof useGetSiteSettingsQuery>['data']
>['activeChannel']['customFields'];

const SiteSettingsContext = React.createContext<SiteSettings | null>(null);

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  // Apollo's auth link sends Accept-Language, so localeString fields resolve per locale.
  const { data } = useGetSiteSettingsQuery();
  const value = data?.activeChannel?.customFields ?? null;
  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

/** Returns the channel site settings, or null until loaded. Consumers must fall back to defaults. */
export function useSiteSettings(): SiteSettings | null {
  return React.useContext(SiteSettingsContext);
}
```

- [ ] **Step 2: Mount the provider in the locale layout**

In `apps/frontend/src/app/[locale]/layout.tsx`, import `SiteSettingsProvider` and wrap it just inside `NextIntlClientProvider` (so children can use both i18n and settings):
```tsx
import { SiteSettingsProvider } from '@/contexts/SiteSettingsContext';
// …
<NextIntlClientProvider locale={locale} messages={messages}>
  <SiteSettingsProvider>
    <ToastProvider>
      {/* …existing tree… */}
    </ToastProvider>
  </SiteSettingsProvider>
</NextIntlClientProvider>
```
(Place `SiteSettingsProvider` so it sits under `ApolloWrapper`, which it already does given the existing nesting.)

- [ ] **Step 3: Type-check**
```bash
pnpm --filter @oscar/frontend type-check 2>&1 | grep -v ".next/types" | grep "SiteSettings"
```
Expected: no output (no errors referencing the new file).

- [ ] **Step 4: Commit**
```bash
git add apps/frontend/src/contexts/SiteSettingsContext.tsx "apps/frontend/src/app/[locale]/layout.tsx"
git commit -m "feat(frontend): SiteSettingsProvider reading activeChannel custom fields"
```

---

### Task 5: Header consumes promo + threshold

**Files:**
- Modify: `apps/frontend/src/components/layout/Header.tsx`

- [ ] **Step 1: Read settings and use with fallback**

In `Header.tsx`, import the hook and replace the promo text. Keep `t('promo')` as the fallback:
```tsx
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
// inside component:
const settings = useSiteSettings();
const promo = settings?.promoText || t('promo');
// in JSX:
<div className="…bg-accent…">{promo}</div>
```

- [ ] **Step 2: Verify in browser (manual)**

With backend seeded + frontend running, load `/ar` and confirm the promo banner still shows the Arabic free-shipping text (now sourced from settings). Change the value in the back-office later (Task 9) and confirm it updates.

- [ ] **Step 3: Commit**
```bash
git add apps/frontend/src/components/layout/Header.tsx
git commit -m "feat(frontend): header promo from site settings (fallback to i18n)"
```

---

### Task 6: Footer consumes contact / social / app / address / copyright

**Files:**
- Modify: `apps/frontend/src/components/layout/Footer.tsx`

- [ ] **Step 1: Wire each value with fallback**

In `Footer.tsx`:
```tsx
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
// inside component:
const s = useSiteSettings();
const email = s?.contactEmail || 'contact@oscarfashion.dz';
const phone = s?.contactPhone || '+213 555 000 000';
const address = s?.footerAddress || t('address');
const socials = [
  { url: s?.socialFacebook || 'https://facebook.com', label: 'Facebook', icon: <Facebook className="h-6 w-6 fill-current" stroke="none" /> },
  { url: s?.socialTwitter || 'https://twitter.com', label: 'Twitter', icon: <Twitter className="h-6 w-6 fill-current" stroke="none" /> },
  { url: s?.socialInstagram || 'https://instagram.com', label: 'Instagram', icon: <Instagram className="h-6 w-6" strokeWidth={1.75} /> },
  { url: s?.socialLinkedin || 'https://linkedin.com', label: 'LinkedIn', icon: <Linkedin className="h-6 w-6 fill-current" stroke="none" /> },
  { url: s?.socialYoutube || 'https://youtube.com', label: 'YouTube', icon: <Youtube className="h-6 w-6 fill-current" stroke="none" /> },
];
```
Replace the hardcoded `<SocialLink>` list with `{socials.map(x => <SocialLink key={x.label} href={x.url} label={x.label}>{x.icon}</SocialLink>)}`, the `mailto:`/`tel:` anchors with `email`/`phone` (and their display text), the address `<span>{t('address')}</span>` with `{address}`, and the app links `href` with `s?.appAppStore || 'https://apps.apple.com'` / `s?.appGooglePlay || 'https://play.google.com'`. For copyright, use `s?.copyrightText || <existing default>`.

- [ ] **Step 2: Type-check + manual verify** (same commands/pattern as Task 5 Step 3/2).

- [ ] **Step 3: Commit**
```bash
git add apps/frontend/src/components/layout/Footer.tsx
git commit -m "feat(frontend): footer contact/social/app/address from site settings"
```

---

### Task 7: Home images + testimonial text from settings

**Files:**
- Modify: `apps/frontend/src/components/home/MarketingBanner.tsx`, `CustomerReviews.tsx`, `apps/frontend/src/app/[locale]/(shop)/page.tsx`

- [ ] **Step 1: CustomerReviews — images + title/subtitle**

In `CustomerReviews.tsx`, read settings and map `reviewImages` over the existing `phones` size classes, falling back to the bundled images; replace `t('title')`/`t('subtitle')`:
```tsx
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
const s = useSiteSettings();
const fallback = ['/images/home/review-3.png','/images/home/review-2.png','/images/home/review-1.png','/images/home/review-4.png','/images/home/review-5.png'];
const imgs = (s?.reviewImages?.length ? s.reviewImages.map(a => a.preview) : fallback);
const sizeCls = ['hidden h-[392px] w-[234px] lg:block','hidden h-[504px] w-[312px] md:block','h-[440px] w-[268px] sm:h-[560px] sm:w-[340px] lg:h-[615px] lg:w-[390px]','hidden h-[504px] w-[312px] md:block','hidden h-[392px] w-[234px] lg:block'];
const title = s?.reviewsTitle || t('title');
const subtitle = s?.reviewsSubtitle || t('subtitle');
```
Render `imgs.slice(0,5).map((src,i) => <div className={sizeCls[i] …}><Image src={src} …/></div>)` and use `{title}`/`{subtitle}` in the heading/paragraph.

- [ ] **Step 2: MarketingBanner / hero**

In `apps/frontend/src/app/[locale]/(shop)/page.tsx`, where `<MarketingBanner src=… />` and the hero image are rendered, source the URLs from settings with fallback. Read settings in the page (it's already `'use client'`):
```tsx
const s = useSiteSettings();
const bannerSrc = s?.bannerImages?.[0]?.preview || '/images/home/banner-1.png';
const heroSrc = s?.heroImage?.preview || '/images/home/hero-1.png';
```
Pass `bannerSrc`/`heroSrc` into the existing components.

- [ ] **Step 3: Type-check + manual verify**, then **commit**
```bash
git add apps/frontend/src/components/home/CustomerReviews.tsx apps/frontend/src/components/home/MarketingBanner.tsx "apps/frontend/src/app/[locale]/(shop)/page.tsx"
git commit -m "feat(frontend): home media + testimonial text from site settings"
```

---

## Phase C — Back-office

### Task 8: Expose Channel custom fields to the admin-api codegen

**Files:**
- Modify: `apps/backoffice/src/graphql/vendure/channels.graphql`

- [ ] **Step 1: Add a settings query + ensure update selects customFields**

Add operations (the `customFields` fields exist in the admin schema after Task 1 + a backend restart):
```graphql
query ActiveChannelContent {
  activeChannel {
    id
    customFields {
      promoText freeShippingThreshold contactEmail contactPhone footerAddress
      socialFacebook socialInstagram socialTwitter socialLinkedin socialYoutube
      appAppStore appGooglePlay reviewsTitle reviewsSubtitle copyrightText
      heroImage { id preview }
      bannerImages { id preview }
      reviewImages { id preview }
    }
  }
}

mutation UpdateChannelContent($input: UpdateChannelInput!) {
  updateChannel(input: $input) {
    ... on Channel { id }
    ... on ErrorResult { errorCode message }
  }
}
```
> The admin-api resolves localeString custom fields by the request `languageCode`. The back-office must send the language being edited (see Task 9, Step 4). To read/write all three languages, the form issues one `ActiveChannelContent` query per language and one `UpdateChannelContent` per language for the localeString fields.

- [ ] **Step 2: Regenerate (backend running)**
```bash
pnpm --filter @oscar/backoffice codegen
grep -c "ActiveChannelContentDocument\|UpdateChannelContentDocument" apps/backoffice/src/graphql/generated/graphql.ts
```
Expected: ≥ 1.

- [ ] **Step 3: Commit**
```bash
git add apps/backoffice/src/graphql/vendure/channels.graphql apps/backoffice/src/graphql/generated
git commit -m "feat(backoffice): admin-api ops for channel site content"
```

---

### Task 9: ContentSettings section (text/url/number)

**Files:**
- Create: `apps/backoffice/src/pages/settings/sections/ContentSettings.tsx`

- [ ] **Step 1: Build the form skeleton (non-image fields)**

Create `ContentSettings.tsx` modeled on `ChannelSettings.tsx` (Apollo `useQuery`/`useMutation`, Redux `addToast`, `Button`/`Input`/`Select` from `components/ui`). It manages three language tabs for localeString fields (`promoText`, `footerAddress`, `reviewsTitle`, `reviewsSubtitle`, `copyrightText`) and single inputs for the scalars/URLs.

```tsx
import React, { useState, useEffect } from 'react';
import { useQuery, useApolloClient, useMutation } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { addToast } from '../../../store/slices/uiSlice';
import {
  ActiveChannelContentDocument,
  UpdateChannelContentDocument,
  LanguageCode,
} from '../../../graphql/generated/graphql';
import { Button } from '../../../components/ui/Button';
import { Input } from '../../../components/ui/Input';
import { Spinner } from '../../../components/ui/Spinner';

const LANGS: { code: LanguageCode; label: string }[] = [
  { code: LanguageCode.Fr, label: 'Français' },
  { code: LanguageCode.Ar, label: 'العربية' },
  { code: LanguageCode.En, label: 'English' },
];
const LOCALE_FIELDS = ['promoText', 'footerAddress', 'reviewsTitle', 'reviewsSubtitle', 'copyrightText'] as const;
const SCALAR_FIELDS = ['contactEmail', 'contactPhone', 'freeShippingThreshold', 'socialFacebook', 'socialInstagram', 'socialTwitter', 'socialLinkedin', 'socialYoutube', 'appAppStore', 'appGooglePlay'] as const;

export const ContentSettings: React.FC = () => {
  const dispatch = useDispatch();
  const client = useApolloClient();
  const [channelId, setChannelId] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  // localeValues[lang][field] and scalarValues[field]
  const [localeValues, setLocaleValues] = useState<Record<string, Record<string, string>>>({});
  const [scalars, setScalars] = useState<Record<string, string>>({});
  const [activeLang, setActiveLang] = useState<LanguageCode>(LanguageCode.Fr);
  const [updateChannel] = useMutation(UpdateChannelContentDocument);

  useEffect(() => {
    (async () => {
      const next: Record<string, Record<string, string>> = {};
      for (const { code } of LANGS) {
        const { data } = await client.query({
          query: ActiveChannelContentDocument,
          fetchPolicy: 'network-only',
          context: { headers: { 'Accept-Language': code.toLowerCase() } },
        });
        const cf = data?.activeChannel?.customFields ?? {};
        setChannelId(data?.activeChannel?.id ?? '');
        next[code] = Object.fromEntries(LOCALE_FIELDS.map((f) => [f, (cf as any)[f] ?? '']));
        if (code === LanguageCode.Fr) {
          setScalars(Object.fromEntries(SCALAR_FIELDS.map((f) => [f, String((cf as any)[f] ?? '')])));
        }
      }
      setLocaleValues(next);
      setLoading(false);
    })();
  }, [client]);

  const save = async () => {
    setSaving(true);
    try {
      // 1) scalars (language-agnostic) once
      await updateChannel({ variables: { input: {
        id: channelId,
        customFields: {
          ...scalars,
          freeShippingThreshold: scalars.freeShippingThreshold ? parseInt(scalars.freeShippingThreshold, 10) : null,
        },
      } } });
      // 2) localeString fields, once per language
      for (const { code } of LANGS) {
        await updateChannel({
          variables: { input: { id: channelId, customFields: { ...localeValues[code] } } },
          context: { headers: { 'Accept-Language': code.toLowerCase() } },
        });
      }
      dispatch(addToast({ type: 'success', message: 'Content settings saved' }));
    } catch (e) {
      dispatch(addToast({ type: 'error', message: (e as Error).message }));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Spinner />;
  return (
    <div className="space-y-6">
      {/* language tabs for localeString fields */}
      <div className="flex gap-2">
        {LANGS.map((l) => (
          <button key={l.code} onClick={() => setActiveLang(l.code)}
            className={activeLang === l.code ? 'font-bold underline' : ''}>{l.label}</button>
        ))}
      </div>
      {LOCALE_FIELDS.map((f) => (
        <Input key={f} label={f} value={localeValues[activeLang]?.[f] ?? ''}
          onChange={(e) => setLocaleValues((p) => ({ ...p, [activeLang]: { ...p[activeLang], [f]: e.target.value } }))} />
      ))}
      {SCALAR_FIELDS.map((f) => (
        <Input key={f} label={f} value={scalars[f] ?? ''}
          onChange={(e) => setScalars((p) => ({ ...p, [f]: e.target.value }))} />
      ))}
      <Button onClick={save} loading={saving}>Save</Button>
    </div>
  );
};
```
> Confirm `Input` accepts a `label` prop (it is used elsewhere in this folder); if not, wrap with a `<label>` as the sibling sections do.

- [ ] **Step 2: Manual verify (after Task 11 wires the tab)** — load Settings ▸ Content, edit the promo text in Arabic, save, reload, confirm it persisted; reload the storefront `/ar` and confirm the header reflects it.

- [ ] **Step 3: Commit**
```bash
git add apps/backoffice/src/pages/settings/sections/ContentSettings.tsx
git commit -m "feat(backoffice): content settings form (text/url/number)"
```

---

### Task 10: AssetPickerField + image fields

**Files:**
- Create: `apps/backoffice/src/pages/settings/sections/AssetPickerField.tsx`
- Modify: `apps/backoffice/src/pages/settings/sections/ContentSettings.tsx`

- [ ] **Step 1: Inspect the existing asset operations**

Run:
```bash
sed -n '1,60p' apps/backoffice/src/graphql/vendure/assets.graphql
```
Identify the existing `CreateAssets`/asset-list operations + their generated Documents (`grep -n "Assets\|CreateAsset" apps/backoffice/src/graphql/generated/graphql.ts | head`). Reuse them; do not add new asset operations unless missing an upload mutation.

- [ ] **Step 2: Build `AssetPickerField`**

A controlled component: shows current asset preview(s), an "Upload" button (calls the existing create-assets mutation), and a "Pick existing" modal (queries the asset list). Props: `value: {id:string;preview:string}[]`, `multiple: boolean`, `onChange(ids: string[])`. Use `components/ui/Modal`, `Button`, and the `AssetList` query Document found in Step 1.

```tsx
import React, { useState } from 'react';
import { useMutation, useQuery } from '@apollo/client';
import { Button } from '../../../components/ui/Button';
import { Modal, ModalContent, ModalFooter } from '../../../components/ui/Modal';
// import the asset list query + create-assets mutation Documents found in Step 1

export interface PickedAsset { id: string; preview: string; }
export const AssetPickerField: React.FC<{
  label: string; multiple?: boolean; value: PickedAsset[]; onChange: (assets: PickedAsset[]) => void;
}> = ({ label, multiple, value, onChange }) => {
  const [open, setOpen] = useState(false);
  // const { data } = useQuery(AssetsDocument, { variables: { options: { take: 60 } } });
  // const [createAssets] = useMutation(CreateAssetsDocument);
  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{label}</p>
      <div className="flex flex-wrap gap-2">
        {value.map((a) => (
          <div key={a.id} className="relative h-20 w-20 overflow-hidden rounded border">
            <img src={a.preview} alt="" className="h-full w-full object-cover" />
            <button type="button" onClick={() => onChange(value.filter((x) => x.id !== a.id))}
              className="absolute right-0 top-0 bg-black/60 px-1 text-white">×</button>
          </div>
        ))}
        <Button type="button" onClick={() => setOpen(true)}>{multiple ? 'Add image' : 'Choose image'}</Button>
      </div>
      <Modal open={open} onClose={() => setOpen(false)}>
        <ModalContent>
          {/* grid of asset previews from AssetsDocument; clicking selects.
              An <input type="file"> calls createAssets then selects the new asset. */}
        </ModalContent>
        <ModalFooter><Button onClick={() => setOpen(false)}>Done</Button></ModalFooter>
      </Modal>
    </div>
  );
};
```
> Fill the modal body with the asset grid + file input wired to the create-assets mutation. On select: if `multiple`, append; else replace, then `onChange` and close.

- [ ] **Step 3: Wire image fields into ContentSettings**

Add `heroImage` (single), `bannerImages` (multiple), `reviewImages` (multiple) state initialized from the FR query result (`cf.heroImage`, `cf.bannerImages`, `cf.reviewImages`), render three `<AssetPickerField>`s, and include in the scalar `save()` mutation:
```ts
customFields: {
  ...scalars,
  freeShippingThreshold: scalars.freeShippingThreshold ? parseInt(scalars.freeShippingThreshold, 10) : null,
  heroImageId: hero[0]?.id ?? null,
  bannerImagesIds: banners.map((a) => a.id),
  reviewImagesIds: reviews.map((a) => a.id),
}
```

- [ ] **Step 4: Manual verify + commit**
```bash
git add apps/backoffice/src/pages/settings/sections/AssetPickerField.tsx apps/backoffice/src/pages/settings/sections/ContentSettings.tsx
git commit -m "feat(backoffice): asset picker for site content images"
```

---

### Task 11: Add the "Content" tab to Settings

**Files:**
- Modify: `apps/backoffice/src/pages/settings/Settings.tsx`

- [ ] **Step 1: Register the tab**

Import `ContentSettings` and add a tab to the existing `Tabs` config (follow how `ChannelSettings`/`TaxSettings` are registered — a `{ id, label, icon, content }` entry or a `<Tab>` element):
```tsx
import { ContentSettings } from './sections/ContentSettings';
// add a tab: { id: 'content', label: 'Content', icon: <FileText className="h-4 w-4" />, content: <ContentSettings /> }
```
Use the existing `FileText` icon already imported in `Settings.tsx`.

- [ ] **Step 2: Run the back-office and verify the tab renders**
```bash
pnpm --filter @oscar/backoffice dev
```
Open Settings, click **Content**, confirm fields load.

- [ ] **Step 3: Commit**
```bash
git add apps/backoffice/src/pages/settings/Settings.tsx
git commit -m "feat(backoffice): add Content tab to Settings"
```

---

## Phase D — Tests

### Task 12: Backend — activeChannel returns localized custom fields

**Files:**
- Create/Modify: a backend test under `apps/backend/src/**/*.spec.ts` (follow the existing test setup; if none, add a lightweight integration test using `@vendure/testing`).

- [ ] **Step 1: Write the failing test**

Assert that after setting `promoText` per language, a shop-api `activeChannel` query with `languageCode: ar` returns the Arabic value and `fr` returns the French value. (If the repo has no Vendure test harness, implement this as a scripted check in `apps/backend/scripts/` that hits the running shop-api with `Accept-Language: ar` vs `fr` and asserts different `promoText`.)

- [ ] **Step 2: Run / verify fail → implement (already implemented in Task 1/2) → pass.** Document exact command in the test file header.

- [ ] **Step 3: Commit.**

---

### Task 13: Frontend E2E — settings reflected + fallback

**Files:**
- Create: `apps/frontend/e2e/site-settings.spec.ts`

- [ ] **Step 1: Write the spec**
```ts
import { test, expect } from '@playwright/test';

test.describe('Site settings', () => {
  test('footer shows the configured contact email', async ({ page }) => {
    await page.goto('/ar');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('contentinfo')).toContainText('contact@oscarfashion.dz');
  });

  test('header promo reflects the seeded free-shipping text', async ({ page }) => {
    await page.goto('/ar');
    await page.waitForLoadState('networkidle');
    await expect(page.getByRole('banner')).toContainText('شحن مجاني');
  });
});
```

- [ ] **Step 2: Run**
```bash
cd apps/frontend && E2E_PORT=3001 pnpm exec playwright test site-settings.spec.ts
```
Expected: pass (backend seeded). 

- [ ] **Step 3: Commit**
```bash
git add apps/frontend/e2e/site-settings.spec.ts
git commit -m "test(frontend): e2e for site settings in header/footer"
```

---

## Final verification

- [ ] `pnpm --filter @oscar/backend type-check` and `migration:run` clean
- [ ] `pnpm --filter @oscar/frontend type-check` clean (ignore stale `.next/types`)
- [ ] `pnpm --filter @oscar/backoffice type-check` clean
- [ ] Full frontend E2E: `cd apps/frontend && E2E_PORT=3001 pnpm exec playwright test` green
- [ ] Manual: change promo + a social URL + hero image in the back-office Content tab → storefront reflects all three after reload
- [ ] Manual: clear a field → storefront falls back to its default (no blank/broken UI)
