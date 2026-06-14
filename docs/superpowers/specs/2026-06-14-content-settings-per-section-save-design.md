# Content Settings — Per-Section Save (Design)

**Date:** 2026-06-14
**Area:** `apps/backoffice` — Settings → Content tab (`Contenu`)
**Status:** Approved (Approach A)

## Problem

The back-office Settings → Content tab (`ContentSettings.tsx`) is a single long form with **one** "Save" button that pushes every custom field (localized text, scalar/URL fields, and images) in a single `updateChannel` mutation. There is no visual grouping, no indication of unsaved changes, and the editor cannot save one area without re-submitting everything.

## Goals

- Reorganize the form into **4 logical sections**, each in a titled card with a short description.
- Give each section its **own independent Save button** that persists only that section's fields (partial update).
- Add **dirty tracking**: a section's Save is disabled until something in that section changes, with an "Unsaved changes" hint and a per-section loading state; the success toast names the section.
- No backend or GraphQL schema changes; reuse the existing `ActiveChannelContent` query and `UpdateChannelContent` mutation.

## Non-Goals (YAGNI)

- No inline validation (email/URL formats), per-language completeness indicators, or image reordering (these were the "full overhaul" option, not chosen).
- No new custom fields, resolvers, or migrations.
- No changes to other settings tabs.

## Sections & Field Ownership

| Section id | Card title | Fields (custom-field keys) |
|------------|-----------|----------------------------|
| `localized` | Localized text | `promoText`, `footerAddress`, `reviewsTitle`, `reviewsSubtitle`, `copyrightText` — each × `Fr`/`Ar`/`En` (e.g. `promoTextFr`). Language tab strip lives inside this card; one Save persists all three languages. |
| `store` | Store & contact | `freeShippingThreshold` (number), `contactEmail`, `contactPhone` |
| `social` | Social & app links | `socialFacebook`, `socialInstagram`, `socialTwitter`, `socialLinkedin`, `socialYoutube`, `appAppStore`, `appGooglePlay` |
| `media` | Media | `heroImageId` (single), `bannerImagesIds` (array), `reviewImagesIds` (array) |

The existing `LOCALE_FIELDS` and `SCALAR_FIELDS` config arrays are kept and extended: scalar fields gain a `section: 'store' | 'social'` tag; localized fields are all `localized`; images are handled separately as `media`.

## Architecture (Approach A)

Three units, each with one clear purpose:

1. **`ContentSettings.tsx`** (container) — runs the `ActiveChannelContent` query, instantiates the `useChannelContentForm` hook, renders the 4 `<SettingsSection>` cards, and hosts the single shared `AssetPickerModal` (driven by container-level `picker` state). Thin; no save logic of its own.

2. **`useChannelContentForm` hook** — owns all form state and save behaviour:
   - State: `form: Record<string,string>` (text/number fields), `media: { hero, banners, reviews }`, plus `baseline` snapshots of both (the last-saved values).
   - Hydration: initialize `form`/`baseline`/`media` from the query result **once** (guarded on channel id / a `hydrated` flag) so later edits are never clobbered.
   - `dirtyFor(sectionId): boolean` — compares the section's keys in `form` vs `baseline`; for `media`, compares hero id and the banner/review id arrays.
   - `saveSection(sectionId): Promise<void>` — builds a `customFields` object containing **only** that section's keys, calls `UpdateChannelContent`, handles `ErrorResult`, and on success copies that section's keys `form → baseline` (section becomes clean) and dispatches a success toast naming the section.
   - `savingSection: string | null` — which section's save is in flight (per-section loading).
   - Exposes setters: `setField(key, value)`, and media setters used by the media section.

3. **`SettingsSection` wrapper** (presentational, built on `Card`) — renders the title, description, `children` (the fields), and a footer row: left = "Unsaved changes" hint when `dirty`; right = `<Button loading={saving} disabled={!dirty || saving}>Save</Button>`. Receives `dirty`, `saving`, `onSave` as props.

## Data Flow (independence guarantee)

- Vendure's `updateChannel(input: { id, customFields })` **merges** the provided `customFields` into the entity — keys not included are left unchanged. Therefore sending only one section's keys never affects another section. This is the foundation of independent per-section saves.
- After a successful save we **do not** re-hydrate the whole form from the server (that would overwrite unsaved edits in other sections). Instead we copy only the saved section's keys from `form` into `baseline`, which clears that section's dirty state while leaving every other section's in-progress edits intact.
- Empty text fields are sent as `null` (matches current behaviour); `freeShippingThreshold` is `parseInt` or `null`; media sends `heroImageId`, `bannerImagesIds`, `reviewImagesIds`.

## UI Details

- Each section is a `Card` with a heading + one-line description. Localized card keeps the existing FR/AR/EN tab strip and renders the active language's fields.
- Footer per card: dirty hint on the left, Save on the right. The previous single bottom "Save" button is removed.
- Replace the raw `<textarea>` (reviews subtitle) with the existing `TextArea` UI component for consistency.
- Media card keeps the `ImageField` rows and the "Choose"/"Clear" buttons; the `AssetPickerModal` remains a single instance at the container level.

## Error Handling

- Mutation returns `ErrorResult` (has `errorCode`) → error toast with `message`.
- Thrown/network error → generic "Save failed" toast.
- The section's Save is disabled while that section is saving. (Preserves the current try/catch + toast pattern.)

## Verification

No unit-test runner exists in `apps/backoffice` (no vitest/jest), so:

1. **Type-check** — `pnpm --filter @oscar/backoffice build` (`tsc -b`) passes; codegen unaffected (no schema change).
2. **Live E2E** in the logged-in back-office (Playwright MCP) on the local stack:
   - Open Settings → Contenu; confirm 4 cards render, all Saves disabled initially.
   - Edit one field in **Store & contact**; confirm only that card's Save enables and shows the dirty hint.
   - Click Save; confirm success toast names the section and the Save returns to disabled.
   - Reload; confirm the saved value persisted.
   - Edit fields in two cards, save one; confirm the other card's unsaved edit survives (independence).
   - Save the **Media** section after changing the hero image; confirm persistence.

## Files

- `apps/backoffice/src/pages/settings/sections/ContentSettings.tsx` — refactor to container + sections.
- `apps/backoffice/src/pages/settings/sections/useChannelContentForm.ts` — new hook (colocated).
- `apps/backoffice/src/pages/settings/sections/SettingsSection.tsx` — new small presentational wrapper (title + description + footer with Save/dirty hint), built on the existing `Card`. Kept in the sections folder as it is settings-specific.
- Reuse existing UI primitives unchanged: `Card`, `Button` (`loading`/`disabled`), `Input`, `TextArea`, `AssetPickerModal`.

No changes to GraphQL operations, generated types, or the backend.
