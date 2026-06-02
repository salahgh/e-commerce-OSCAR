# M3c — Accessibility Pass (Shared Interactive Components) — Design Spec

**Date:** 2026-06-02
**App:** `apps/mobile` (standalone npm Expo project)
**Milestone:** M3c — third slice of M3 ("UX polish"), mobile-only scope
**Status:** Approved design — ready for implementation planning

---

## 1. Goal & background

Accessibility is sparse — only ~6 files carry any `accessibility*` props, and the shared `Button` has **none**. This slice adds screen-reader semantics (role / label / state) to the **most-reused shared interactive components**, where one change propagates across the whole app, plus a tested pure helper for consistent product labels. Mobile-only; no backend.

**Verified:** shared components exist — `src/components/ui/Button.tsx` (no a11y props), `src/components/ui/Input.tsx`, `src/components/navigation/BackButton.tsx`, and the product cards `src/components/home/ProductCardFigma.tsx` (a `TouchableOpacity`) and the card inside `src/components/products/HorizontalProductRow.tsx` (a `Pressable`).

## 2. Tested helper — `src/utils/a11y.ts` (the testable core)

```
productAccessibilityLabel(p: { name: string; price?: number | null; currencyCode?: string }): string
```
- Returns `"{name}, {price} {currencyCode}"` when `price` is a positive number (currency defaults to `'DZD'`), else just `"{name}"` (missing/zero/negative price → name only). Trims safely. Pure + deterministic.

This gives every product card one consistent spoken label ("T-Shirt, 2500 DZD") instead of the screen reader reading the raw child text nodes.

## 3. Shared components (one change each, broad reach)

**3.1 `Button` (`src/components/ui/Button.tsx`)** — `ButtonProps` already `extends Omit<TouchableOpacityProps, 'style'>` and the `TouchableOpacity` already spreads `{...props}` (so `accessibility*` props are inherited and pass through). Add these three as **defaults placed BEFORE `{...props}`** (so a caller can still override any of them, e.g. an icon-context button overriding the label):
- `accessibilityRole="button"`
- `accessibilityLabel={title}` (defaults the spoken label to the visible title)
- `accessibilityState={{ disabled: isDisabled, busy: loading }}`

No new prop is needed (`accessibilityLabel` is already part of the inherited `TouchableOpacityProps`).

**3.2 `Input` (`src/components/ui/Input.tsx`)** — on the underlying `TextInput`, set `accessibilityLabel` to the field's `label` (falling back to `placeholder`) so the field is announced. If the component shows an error, add `accessibilityState`/`accessibilityHint` for it only if trivial; otherwise label-only is the minimum.

**3.3 `BackButton` (`src/components/navigation/BackButton.tsx`)** — add `accessibilityRole="button"` and `accessibilityLabel={t('a11y.goBack', 'Go back')}` to its touchable.

**3.4 Product cards** — on the card's `TouchableOpacity`/`Pressable`, add `accessibilityRole="button"` and `accessibilityLabel={productAccessibilityLabel({ name, price, currencyCode })}` (and, to stop the reader from also reading the inner text, the inner `Text`/`Image` may be marked non-accessible where the wrapper owns the label — keep this minimal: setting the wrapper label is the required change):
- `src/components/products/HorizontalProductRow.tsx` (the `Pressable` card) — `price`/`currencyCode` are already on the `SimpleProduct`.
- `src/components/home/ProductCardFigma.tsx` (the `TouchableOpacity`) — uses `FigmaProduct` (`name`, `price`, has no `currencyCode` → default `'DZD'`).

## 4. i18n — `src/i18n/locales/{en,fr,ar}.json`
Add an `a11y` object with `goBack` (en "Go back" / fr "Retour" / ar "رجوع"). Card labels come from product data via the helper (no new keys).

## 5. Testing

`src/utils/__tests__/a11y.test.ts`:
- `productAccessibilityLabel({ name:'T-Shirt', price:2500, currencyCode:'DZD' })` → `'T-Shirt, 2500 DZD'`.
- missing price (`price: 0` and `price: undefined`) → `'T-Shirt'`.
- custom currency → uses it; omitted currency → defaults `'DZD'`.

Components are not render-tested (consistent with M1–M3b); the spoken behavior is **runtime-verified** with a screen reader (TalkBack on Android / VoiceOver on iOS), recorded in the runbook. (The available `chrome-devtools` a11y skill targets web pages, not this RN app, so it is not used here.)

## 6. Out of scope (deferred)
- A full screen-by-screen icon-only-button sweep (header search/cart icons, quantity steppers, close buttons, wishlist heart on each screen).
- Tab-bar a11y (Expo Router supplies tab roles).
- Live-region announcements, focus management, reduce-motion, and a color-contrast audit.
- A shared `IconButton` component / migration (a larger refactor).

## 7. Success criteria
1. `productAccessibilityLabel` exists and is correct (tested): name+price when priced, name-only otherwise.
2. The shared `Button` exposes `role="button"`, a `disabled`/`busy` state, and a label (its `title` by default); `Input` announces its label; `BackButton` announces "Go back"; product cards announce "{name}, {price}".
3. New `a11y` tests pass; full `npm test` green; `npm run lint` 0 errors; **zero new `tsc` errors** (baseline 155).
