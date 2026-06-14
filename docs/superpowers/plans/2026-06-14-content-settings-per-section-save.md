# Content Settings — Per-Section Save Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Split the back-office Settings → Content tab into 4 independent cards (Localized text, Store & contact, Social & app links, Media), each with its own Save button, dirty tracking, and a partial `customFields` update.

**Architecture:** A `useChannelContentForm` hook owns form state, a last-saved `baseline` snapshot, per-section dirty detection, and a `saveSection` that submits only one section's keys (Vendure merges `customFields`, so partial saves never clobber other sections). A presentational `SettingsSection` Card wrapper renders title + description + footer (dirty hint + Save with loading). `ContentSettings.tsx` becomes a thin container wiring the hook to 4 sections and the shared asset picker.

**Tech Stack:** React 19, Apollo Client, Redux Toolkit (toasts), TypeScript, Tailwind (theme tokens), Vite. No backend or GraphQL changes — reuses `ActiveChannelContentDocument` + `UpdateChannelContentDocument`.

> **Testing note:** `apps/backoffice` has no unit-test runner (no vitest/jest). The automated gate for each task is the TypeScript compiler (`tsc -b`). Behavioural verification is a final live-E2E task against the running, logged-in back-office. Do not add a test framework — it is out of scope.

> **All commands run from the repo root:** `C:/Users/B_TAS_SDRH/Documents/GitHub/e-commerce-OSCAR`. Work happens on branch `feat/content-settings-per-section-save` (already created).

---

### Task 1: Create the `useChannelContentForm` hook

**Files:**
- Create: `apps/backoffice/src/pages/settings/sections/useChannelContentForm.ts`

- [ ] **Step 1: Write the hook + exported field configs**

Create `apps/backoffice/src/pages/settings/sections/useChannelContentForm.ts` with exactly this content:

```ts
import { useEffect, useMemo, useRef, useState } from 'react';
import { useQuery, useMutation } from '@apollo/client';
import { useDispatch } from 'react-redux';
import { addToast } from '../../../store/slices/uiSlice';
import {
  ActiveChannelContentDocument,
  UpdateChannelContentDocument,
} from '../../../graphql/generated/graphql';

export type PickedAsset = { id: string; preview: string };
export type SectionId = 'localized' | 'store' | 'social' | 'media';

export const LANGS = [
  { code: 'Fr', label: 'Français' },
  { code: 'Ar', label: 'العربية' },
  { code: 'En', label: 'English' },
] as const;
export type LangCode = (typeof LANGS)[number]['code'];

export type LocaleField = { base: string; label: string; textarea?: boolean };
export const LOCALE_FIELDS: LocaleField[] = [
  { base: 'promoText', label: 'Promo banner text' },
  { base: 'footerAddress', label: 'Footer address' },
  { base: 'reviewsTitle', label: 'Reviews section title' },
  { base: 'reviewsSubtitle', label: 'Reviews section subtitle', textarea: true },
  { base: 'copyrightText', label: 'Footer copyright line' },
];

export type ScalarField = { name: string; label: string; type?: string };
export const STORE_FIELDS: ScalarField[] = [
  { name: 'freeShippingThreshold', label: 'Free shipping threshold (DZD)', type: 'number' },
  { name: 'contactEmail', label: 'Contact email' },
  { name: 'contactPhone', label: 'Contact phone' },
];
export const SOCIAL_FIELDS: ScalarField[] = [
  { name: 'socialFacebook', label: 'Facebook URL' },
  { name: 'socialInstagram', label: 'Instagram URL' },
  { name: 'socialTwitter', label: 'Twitter URL' },
  { name: 'socialLinkedin', label: 'LinkedIn URL' },
  { name: 'socialYoutube', label: 'YouTube URL' },
  { name: 'appAppStore', label: 'App Store URL' },
  { name: 'appGooglePlay', label: 'Google Play URL' },
];

const SECTION_LABEL: Record<SectionId, string> = {
  localized: 'Localized text',
  store: 'Store & contact',
  social: 'Social & app links',
  media: 'Media',
};

function localizedKeys(): string[] {
  const keys: string[] = [];
  for (const { base } of LOCALE_FIELDS) for (const { code } of LANGS) keys.push(`${base}${code}`);
  return keys;
}

const SECTION_KEYS: Record<'localized' | 'store' | 'social', string[]> = {
  localized: localizedKeys(),
  store: STORE_FIELDS.map((f) => f.name),
  social: SOCIAL_FIELDS.map((f) => f.name),
};

type MediaState = { hero: PickedAsset | null; banners: PickedAsset[]; reviews: PickedAsset[] };
const EMPTY_MEDIA: MediaState = { hero: null, banners: [], reviews: [] };

export function useChannelContentForm() {
  const dispatch = useDispatch();
  const { data, loading } = useQuery(ActiveChannelContentDocument, { fetchPolicy: 'network-only' });
  const [updateChannel] = useMutation(UpdateChannelContentDocument);

  const [form, setForm] = useState<Record<string, string>>({});
  const [baseline, setBaseline] = useState<Record<string, string>>({});
  const [media, setMedia] = useState<MediaState>(EMPTY_MEDIA);
  const [mediaBaseline, setMediaBaseline] = useState<MediaState>(EMPTY_MEDIA);
  const [savingSection, setSavingSection] = useState<SectionId | null>(null);
  const hydratedRef = useRef(false);

  const channelId = data?.activeChannel?.id ?? '';
  const cf = useMemo(
    () => (data?.activeChannel?.customFields ?? {}) as Record<string, unknown>,
    [data]
  );

  // Hydrate form + baseline once from the server response. Guarded so later
  // edits in any section are never overwritten by a re-render.
  useEffect(() => {
    if (hydratedRef.current || !data?.activeChannel) return;
    const next: Record<string, string> = {};
    for (const { base } of LOCALE_FIELDS)
      for (const { code } of LANGS) next[`${base}${code}`] = (cf[`${base}${code}`] as string) ?? '';
    for (const { name } of [...STORE_FIELDS, ...SOCIAL_FIELDS])
      next[name] = cf[name] == null ? '' : String(cf[name]);
    const m: MediaState = {
      hero: (cf.heroImage as PickedAsset) ?? null,
      banners: ((cf.bannerImages as PickedAsset[]) ?? []).map((a) => ({ id: a.id, preview: a.preview })),
      reviews: ((cf.reviewImages as PickedAsset[]) ?? []).map((a) => ({ id: a.id, preview: a.preview })),
    };
    setForm(next);
    setBaseline(next);
    setMedia(m);
    setMediaBaseline(m);
    hydratedRef.current = true;
  }, [data, cf]);

  const setField = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));
  const setHero = (hero: PickedAsset | null) => setMedia((m) => ({ ...m, hero }));
  const setBanners = (banners: PickedAsset[]) => setMedia((m) => ({ ...m, banners }));
  const setReviews = (reviews: PickedAsset[]) => setMedia((m) => ({ ...m, reviews }));

  const idsEqual = (a: PickedAsset[], b: PickedAsset[]) =>
    a.length === b.length && a.every((x, i) => x.id === b[i].id);

  const dirtyFor = (section: SectionId): boolean => {
    if (section === 'media') {
      return (
        (media.hero?.id ?? null) !== (mediaBaseline.hero?.id ?? null) ||
        !idsEqual(media.banners, mediaBaseline.banners) ||
        !idsEqual(media.reviews, mediaBaseline.reviews)
      );
    }
    return SECTION_KEYS[section].some((k) => (form[k] ?? '') !== (baseline[k] ?? ''));
  };

  const saveSection = async (section: SectionId) => {
    setSavingSection(section);
    try {
      const customFields: Record<string, unknown> = {};
      if (section === 'localized') {
        for (const k of SECTION_KEYS.localized) customFields[k] = form[k] || null;
      } else if (section === 'store') {
        for (const { name, type } of STORE_FIELDS)
          customFields[name] =
            type === 'number' ? (form[name] ? parseInt(form[name], 10) : null) : form[name] || null;
      } else if (section === 'social') {
        for (const { name } of SOCIAL_FIELDS) customFields[name] = form[name] || null;
      } else {
        customFields.heroImageId = media.hero?.id ?? null;
        customFields.bannerImagesIds = media.banners.map((a) => a.id);
        customFields.reviewImagesIds = media.reviews.map((a) => a.id);
      }

      const res = await updateChannel({ variables: { input: { id: channelId, customFields } as any } });
      const r = res.data?.updateChannel as { errorCode?: string; message?: string } | undefined;
      if (r && 'errorCode' in r && r.errorCode) throw new Error(r.message);

      // Mark only this section clean; leave other sections' edits/baseline intact.
      if (section === 'media') {
        setMediaBaseline(media);
      } else {
        setBaseline((prev) => {
          const nextB = { ...prev };
          for (const k of SECTION_KEYS[section]) nextB[k] = form[k] ?? '';
          return nextB;
        });
      }
      dispatch(addToast({ type: 'success', message: `${SECTION_LABEL[section]} saved` }));
    } catch (e) {
      dispatch(addToast({ type: 'error', message: (e as Error).message || 'Save failed' }));
    } finally {
      setSavingSection(null);
    }
  };

  return {
    loading,
    form,
    setField,
    media,
    setHero,
    setBanners,
    setReviews,
    dirtyFor,
    saveSection,
    savingSection,
  };
}
```

- [ ] **Step 2: Type-check**

Run: `pnpm --filter @oscar/backoffice exec tsc -b`
Expected: PASS (no errors). The hook is not yet imported anywhere, so this only validates the hook itself compiles against the generated GraphQL types.

- [ ] **Step 3: Commit**

```bash
git add apps/backoffice/src/pages/settings/sections/useChannelContentForm.ts
git commit -m "feat(backoffice): add useChannelContentForm hook for per-section content saves"
```

---

### Task 2: Create the `SettingsSection` Card wrapper

**Files:**
- Create: `apps/backoffice/src/pages/settings/sections/SettingsSection.tsx`

- [ ] **Step 1: Write the presentational wrapper**

Create `apps/backoffice/src/pages/settings/sections/SettingsSection.tsx` with exactly this content:

```tsx
import React from 'react';
import { Card, CardContent, CardFooter } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';

interface SettingsSectionProps {
  title: string;
  description?: string;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
  children: React.ReactNode;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  title,
  description,
  dirty,
  saving,
  onSave,
  children,
}) => {
  return (
    <Card>
      <div className="px-6 py-4 border-b border-border">
        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
        {description && <p className="mt-1 text-sm text-muted-foreground">{description}</p>}
      </div>
      <CardContent className="space-y-4">{children}</CardContent>
      <CardFooter className="flex items-center justify-end gap-3">
        {dirty && <span className="text-sm text-muted-foreground">Unsaved changes</span>}
        <Button onClick={onSave} loading={saving} disabled={!dirty || saving}>
          Save
        </Button>
      </CardFooter>
    </Card>
  );
};
```

- [ ] **Step 2: Type-check**

Run: `pnpm --filter @oscar/backoffice exec tsc -b`
Expected: PASS (no errors).

- [ ] **Step 3: Commit**

```bash
git add apps/backoffice/src/pages/settings/sections/SettingsSection.tsx
git commit -m "feat(backoffice): add SettingsSection card wrapper with per-section save footer"
```

---

### Task 3: Refactor `ContentSettings.tsx` into 4 sections

**Files:**
- Modify (full replace): `apps/backoffice/src/pages/settings/sections/ContentSettings.tsx`

- [ ] **Step 1: Replace the file contents**

Replace the entire contents of `apps/backoffice/src/pages/settings/sections/ContentSettings.tsx` with exactly this:

```tsx
import React, { useState } from 'react';
import { Input } from '../../../components/ui/Input';
import { TextArea } from '../../../components/ui/TextArea';
import { Spinner } from '../../../components/ui/Spinner';
import { Button } from '../../../components/ui/Button';
import { AssetPickerModal } from '../../../components/ui/AssetPickerModal';
import { SettingsSection } from './SettingsSection';
import {
  useChannelContentForm,
  LANGS,
  LOCALE_FIELDS,
  STORE_FIELDS,
  SOCIAL_FIELDS,
  type PickedAsset,
  type LangCode,
} from './useChannelContentForm';

export const ContentSettings: React.FC = () => {
  const {
    loading,
    form,
    setField,
    media,
    setHero,
    setBanners,
    setReviews,
    dirtyFor,
    saveSection,
    savingSection,
  } = useChannelContentForm();

  const [activeLang, setActiveLang] = useState<LangCode>('Fr');
  const [picker, setPicker] = useState<null | 'hero' | 'banners' | 'reviews'>(null);

  if (loading) return <Spinner />;

  return (
    <div className="space-y-6">
      {/* Localized text */}
      <SettingsSection
        title="Localized text"
        description="Storefront copy shown per language (French, Arabic, English)."
        dirty={dirtyFor('localized')}
        saving={savingSection === 'localized'}
        onSave={() => saveSection('localized')}
      >
        <div className="flex gap-2 border-b border-border">
          {LANGS.map((l) => (
            <button
              key={l.code}
              type="button"
              onClick={() => setActiveLang(l.code)}
              className={`px-3 py-2 text-sm ${
                activeLang === l.code
                  ? 'border-b-2 border-primary font-semibold text-foreground'
                  : 'text-muted-foreground'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>
        {LOCALE_FIELDS.map(({ base, label, textarea }) => {
          const key = `${base}${activeLang}`;
          return (
            <div key={key} className="space-y-1">
              <label className="block text-sm font-medium text-foreground">{label}</label>
              {textarea ? (
                <TextArea rows={2} value={form[key] ?? ''} onChange={(e) => setField(key, e.target.value)} />
              ) : (
                <Input value={form[key] ?? ''} onChange={(e) => setField(key, e.target.value)} />
              )}
            </div>
          );
        })}
      </SettingsSection>

      {/* Store & contact */}
      <SettingsSection
        title="Store & contact"
        description="Free-shipping threshold and customer contact details."
        dirty={dirtyFor('store')}
        saving={savingSection === 'store'}
        onSave={() => saveSection('store')}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {STORE_FIELDS.map(({ name, label, type }) => (
            <div key={name} className="space-y-1">
              <label className="block text-sm font-medium text-foreground">{label}</label>
              <Input
                type={type ?? 'text'}
                value={form[name] ?? ''}
                onChange={(e) => setField(name, e.target.value)}
              />
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* Social & app links */}
      <SettingsSection
        title="Social & app links"
        description="Social media profiles and mobile app store links."
        dirty={dirtyFor('social')}
        saving={savingSection === 'social'}
        onSave={() => saveSection('social')}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {SOCIAL_FIELDS.map(({ name, label, type }) => (
            <div key={name} className="space-y-1">
              <label className="block text-sm font-medium text-foreground">{label}</label>
              <Input
                type={type ?? 'text'}
                value={form[name] ?? ''}
                onChange={(e) => setField(name, e.target.value)}
              />
            </div>
          ))}
        </div>
      </SettingsSection>

      {/* Media */}
      <SettingsSection
        title="Media"
        description="Hero image, marketing banners, and review carousel images."
        dirty={dirtyFor('media')}
        saving={savingSection === 'media'}
        onSave={() => saveSection('media')}
      >
        <ImageField
          label="Hero image"
          assets={media.hero ? [media.hero] : []}
          onPick={() => setPicker('hero')}
          onClear={() => setHero(null)}
        />
        <ImageField
          label="Marketing banners"
          assets={media.banners}
          onPick={() => setPicker('banners')}
          onClear={() => setBanners([])}
        />
        <ImageField
          label="Review carousel images"
          assets={media.reviews}
          onPick={() => setPicker('reviews')}
          onClear={() => setReviews([])}
        />
      </SettingsSection>

      <AssetPickerModal
        isOpen={picker !== null}
        onClose={() => setPicker(null)}
        multiple={picker !== 'hero'}
        selectedIds={
          picker === 'hero'
            ? media.hero
              ? [media.hero.id]
              : []
            : picker === 'banners'
              ? media.banners.map((a) => a.id)
              : media.reviews.map((a) => a.id)
        }
        onSelect={(assets) => {
          const picked = assets.map((a) => ({ id: a.id, preview: a.preview }));
          if (picker === 'hero') setHero(picked[0] ?? null);
          else if (picker === 'banners') setBanners(picked);
          else if (picker === 'reviews') setReviews(picked);
          setPicker(null);
        }}
      />
    </div>
  );
};

function ImageField({
  label,
  assets,
  onPick,
  onClear,
}: {
  label: string;
  assets: PickedAsset[];
  onPick: () => void;
  onClear: () => void;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-foreground">{label}</label>
        <div className="flex gap-2">
          <Button type="button" variant="secondary" onClick={onPick}>
            Choose
          </Button>
          {assets.length > 0 && (
            <Button type="button" variant="secondary" onClick={onClear}>
              Clear
            </Button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2">
        {assets.length === 0 ? (
          <span className="text-sm text-muted-foreground">No image selected</span>
        ) : (
          assets.map((a) => (
            <img key={a.id} src={a.preview} alt="" className="h-20 w-20 rounded border object-cover" />
          ))
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Type-check**

Run: `pnpm --filter @oscar/backoffice exec tsc -b`
Expected: PASS (no errors). This validates the container against the hook's and `SettingsSection`'s exported signatures.

- [ ] **Step 3: Commit**

```bash
git add apps/backoffice/src/pages/settings/sections/ContentSettings.tsx
git commit -m "feat(backoffice): split Content settings into 4 cards with per-section save"
```

---

### Task 4: Live E2E verification

No code changes. The back-office dev server (`:5173`) and backend (`:8085`) are running and logged in as `superadmin`. Use the Playwright MCP browser.

- [ ] **Step 1: Open the Content tab**

Navigate to `http://localhost:5173/` then click the **Paramètres** nav link, then the **Contenu** tab (or navigate directly if a settings route exists). Take a snapshot.
Expected: 4 cards render — "Localized text", "Store & contact", "Social & app links", "Media". Every Save button is **disabled**, no "Unsaved changes" hints.

- [ ] **Step 2: Dirty isolation**

Change the **Contact email** field in "Store & contact".
Expected: only the "Store & contact" card shows "Unsaved changes" and an enabled Save; the other three Saves stay disabled.

- [ ] **Step 3: Save one section**

Click Save on "Store & contact".
Expected: success toast reads "Store & contact saved"; the hint disappears and its Save returns to disabled.

- [ ] **Step 4: Cross-section independence**

Edit a field in "Social & app links" (do not save), then edit and Save "Localized text".
Expected: "Localized text saved" toast; the unsaved edit in "Social & app links" survives (its Save stays enabled, value unchanged).

- [ ] **Step 5: Persistence + media**

Reload the page; confirm the saved Store & contact and Localized values persisted. Change the **Hero image** in "Media", Save, reload, confirm it persisted.
Expected: all saved values persist across reload; "Media saved" toast on media save.

- [ ] **Step 6: Final state confirmation**

Confirm `git log --oneline` shows the three feature commits (Tasks 1–3) on `feat/content-settings-per-section-save`, and the working tree is clean.

---

## Notes for the implementer

- Run every command from the repo root. `pnpm --filter @oscar/backoffice exec tsc -b` is the type-check gate (same `tsc -b` the build script runs).
- The Vite dev server hot-reloads on save; you can watch the live UI while implementing.
- Do **not** modify GraphQL operations, generated types, or any backend file — the existing `ActiveChannelContent` query and `UpdateChannelContent` mutation already expose every field used here.
- If `tsc -b` reports a stale build-info error, run `pnpm --filter @oscar/backoffice exec tsc -b --force`.
