# M3d-1 — Dark-mode Foundation + Settings-screen Proof Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a conventional dark palette and a `makeThemedStyles`/`useThemeColors` API so resolved theme mode reaches StyleSheets, then prove it by converting `app/profile/settings.tsx` so toggling dark mode visibly darkens it.

**Architecture:** A twin `darkColors` object mirrors the existing structural `colors` keys with conventional-dark values (near-black `#121212` page, `#1E1E1E` cards lighter than page, off-white text, neutral `#ECECEC` primary, brand yellow `#FFD500` kept as the pop accent). A pure `getPalette(resolved)` selector backs a `useThemeColors()` hook; `makeThemedStyles(factory)` returns a memoizing `useStyles` hook so a StyleSheet recomputes only on a light↔dark flip. The conversion recipe keeps the StyleSheet body unchanged because the factory parameter is also named `colors`.

**Tech Stack:** React Native 0.83 / Expo SDK 55, TypeScript, Jest (`jest-expo`) + `@testing-library/react-native` (incl. `renderHook`), existing `ThemeContext` (`useThemeMode().resolved`).

**Reference spec:** `docs/superpowers/specs/2026-06-03-mobile-m3d1-dark-mode-foundation-design.md`

**Working directory note:** All paths below are relative to `apps/mobile/`. `apps/mobile` is a **standalone npm project** — run `npm test` / `npm run lint` / `npm run type-check` from inside `apps/mobile`, never `pnpm --filter`.

---

## File Structure

| File | Responsibility |
|---|---|
| `src/theme/darkColors.ts` (create) | The `darkColors` object + the widened `ColorPalette` type (key-parity with `colors`, values not locked). |
| `src/theme/palettes.ts` (create) | `palettes` map (`{light, dark}`) + pure `getPalette(resolved)` selector. |
| `src/theme/useThemedStyles.ts` (create) | `useThemeColors()` hook + `makeThemedStyles(factory)` memoizing-hook factory. |
| `src/theme/index.ts` (modify) | Re-export the new foundation symbols from the theme barrel. |
| `app/profile/settings.tsx` (modify) | The proof: convert to `makeThemedStyles` + `useThemeColors`, add `testID`. |
| `src/theme/__tests__/darkColors.test.ts` (create) | Key-parity vs `colors` + anchor values. |
| `src/theme/__tests__/palettes.test.ts` (create) | `getPalette` identity + light default. |
| `src/theme/__tests__/useThemedStyles.test.tsx` (create) | Hook returns right palette; styles differ light vs dark; memoization. |
| `src/theme/__tests__/index.test.ts` (create) | Barrel re-exports the foundation symbols. |
| `app/profile/__tests__/settings.test.tsx` (create) | Settings root paints `#121212` (dark) / `#FAFBFF` (light). |

---

## Task 1: Dark palette + `ColorPalette` type

**Files:**
- Create: `src/theme/darkColors.ts`
- Test: `src/theme/__tests__/darkColors.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/theme/__tests__/darkColors.test.ts`:

```ts
import { colors } from '../colors';
import { darkColors } from '../darkColors';

/** Collect every leaf key path (e.g. "text.primary", "primaryScale.4"). */
function keyPaths(obj: Record<string, unknown>, prefix = ''): string[] {
  return Object.entries(obj).flatMap(([k, v]) => {
    const path = prefix ? `${prefix}.${k}` : k;
    return v && typeof v === 'object' ? keyPaths(v as Record<string, unknown>, path) : [path];
  });
}

describe('darkColors', () => {
  it('has exactly the same key structure as the light palette', () => {
    expect(keyPaths(darkColors).sort()).toEqual(keyPaths(colors).sort());
  });

  it('uses the conventional-dark anchor values', () => {
    expect(darkColors.background).toBe('#121212'); // near-black page
    expect(darkColors.surface).toBe('#1E1E1E'); // cards lighter than page
    expect(darkColors.primary).toBe('#ECECEC'); // neutral accent
    expect(darkColors.text.primary).toBe('#ECECEC'); // off-white text
    expect(darkColors.text.inverse).toBe('#1E1E1E'); // text on light buttons
  });

  it('keeps the brand yellow and vivid status hues unchanged', () => {
    expect(darkColors.secondary).toBe('#FFD500');
    expect(darkColors.success).toBe('#2FD976');
    expect(darkColors.error).toBe('#EB3E3E');
    expect(darkColors.warning).toBe('#FFBC1F');
    expect(darkColors.info).toBe('#11CAEF');
  });

  it('darkens the pale status tint backgrounds', () => {
    expect(darkColors.successLight).toBe('#12301E');
    expect(darkColors.errorLight).toBe('#3A1717');
    expect(darkColors.warningLight).toBe('#3A2E12');
    expect(darkColors.infoLight).toBe('#12303A');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- darkColors`
Expected: FAIL — `Cannot find module '../darkColors'`.

- [ ] **Step 3: Write the implementation**

Create `src/theme/darkColors.ts`:

```ts
/**
 * OSCAR Fashion Design System — Mobile Dark Palette (conventional dark).
 *
 * Twin of `colors` (same key structure) with conventional-dark values:
 * near-black page, elevated surfaces LIGHTER than the page, off-white text,
 * a neutral (#ECECEC) primary accent, and brand yellow (#FFD500) kept as the
 * "pop" secondary. Brand/status hues read fine on dark and stay vivid; only the
 * pale status TINT backgrounds are darkened. See the M3d-1 design spec.
 */
import { colors } from './colors';

/** Widen the `as const` literal palette type so a twin can supply different values. */
type Widen<T> = {
  [K in keyof T]: T[K] extends string ? string : Widen<T[K]>;
};

export type ColorPalette = Widen<typeof colors>;

export const darkColors: ColorPalette = {
  // Primary — neutral accent on dark (was near-black)
  primary: '#ECECEC',
  primaryLight: '#FFFFFF',
  primaryDark: '#D5D5D5',
  primaryScale: {
    1: '#2A2A2A',
    2: '#3D3D3D',
    3: '#5C5C5C',
    4: '#8A8A8A',
    5: '#B7B7B7',
    6: '#ECECEC',
  },

  // Secondary — brand yellow stays the pop accent; pale tints muted for dark bg
  secondary: '#FFD500',
  secondaryLight: '#3D3517',
  secondaryDark: '#D8B506',
  secondaryScale: {
    1: '#FFFDF5',
    2: '#FEF9E2',
    3: '#FCEEA6',
    4: '#F9D72A',
    5: '#D8B506',
    6: '#6E5C03',
  },

  // Backgrounds — conventional dark: elevated surfaces are LIGHTER than the page
  background: '#121212',
  surface: '#1E1E1E',
  surfaceDark: '#2A2A2A',

  // Text — off-white primary, white-based alpha ramp
  text: {
    primary: '#ECECEC',
    secondary: 'rgba(255, 255, 255, 0.6)',
    tertiary: 'rgba(255, 255, 255, 0.4)',
    disabled: 'rgba(255, 255, 255, 0.3)',
    inverse: '#1E1E1E',
  },

  // Dark Text Scale — inverted to a light-on-dark alpha ramp
  darkText: {
    DEFAULT: '#ECECEC',
    1: 'rgba(255, 255, 255, 0.2)',
    2: 'rgba(255, 255, 255, 0.3)',
    3: 'rgba(255, 255, 255, 0.4)',
    4: 'rgba(255, 255, 255, 0.5)',
    5: 'rgba(255, 255, 255, 0.6)',
    6: 'rgba(255, 255, 255, 0.8)',
  },

  // Gray Scale — inverted neutral ramp (subtle → mid grey on dark)
  gray: {
    1: '#1E1E1E',
    2: '#242424',
    3: '#2E2E2E',
    4: '#3A3A3A',
    5: '#4A4A4A',
    6: '#8A8A8A',
  },

  // Status — vivid base + scales kept (read fine on dark); pale tints darkened
  success: '#2FD976',
  successLight: '#12301E',
  successScale: {
    1: '#E5FFEE',
    2: '#99FFBB',
    3: '#66FF99',
    4: '#2EE56B',
    5: '#24B755',
    6: '#2EA154',
  },

  error: '#EB3E3E',
  errorLight: '#3A1717',
  errorScale: {
    1: '#FFE5E5',
    2: '#FF9999',
    3: '#FF6666',
    4: '#E53C3C',
    5: '#CC3636',
    6: '#B22F2F',
  },

  warning: '#FFBC1F',
  warningLight: '#3A2E12',
  warningScale: {
    1: '#FFF7E5',
    2: '#FFDB87',
    3: '#FFCA4F',
    4: '#E5A91C',
    5: '#CC9619',
    6: '#B28416',
  },

  info: '#11CAEF',
  infoLight: '#12303A',
  infoScale: {
    1: '#E5FBFF',
    2: '#99EEFF',
    3: '#66E6FF',
    4: '#43CBE5',
    5: '#29B1CC',
    6: '#1298B2',
  },

  // Borders — subtle dark greys
  border: '#2E2E2E',
  borderLight: '#242424',
  borderDark: '#3A3A3A',

  // Base Colors — literal, unchanged
  white: '#FFFFFF',
  black: '#000000',

  // Special — overlays slightly stronger on dark
  overlay: 'rgba(0, 0, 0, 0.6)',
  overlayLight: 'rgba(0, 0, 0, 0.4)',
  overlayDark: 'rgba(0, 0, 0, 0.8)',
  overlayWhite: 'rgba(255, 255, 255, 0.2)',
  overlayWhiteLight: 'rgba(255, 255, 255, 0.6)',
  overlayWhiteMedium: 'rgba(255, 255, 255, 0.9)',
  shadow: 'rgba(0, 0, 0, 0.3)',
  transparent: 'transparent',

  // Gradient — dark
  gradient: {
    start: '#2A2A2A',
    end: '#121212',
  },
};
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- darkColors`
Expected: PASS (4 tests). The key-parity test confirms `darkColors` has exactly the same leaf keys as `colors`.

- [ ] **Step 5: Commit**

```bash
git add src/theme/darkColors.ts src/theme/__tests__/darkColors.test.ts
git commit -m "feat(mobile): add conventional dark palette (M3d-1)"
```

---

## Task 2: `palettes` map + `getPalette` selector

**Files:**
- Create: `src/theme/palettes.ts`
- Test: `src/theme/__tests__/palettes.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/theme/__tests__/palettes.test.ts`:

```ts
import { colors } from '../colors';
import { darkColors } from '../darkColors';
import { palettes, getPalette } from '../palettes';

describe('getPalette', () => {
  it('returns the light palette (identity) for "light"', () => {
    expect(getPalette('light')).toBe(colors);
  });

  it('returns the dark palette (identity) for "dark"', () => {
    expect(getPalette('dark')).toBe(darkColors);
  });

  it('exposes both palettes on the map', () => {
    expect(palettes.light).toBe(colors);
    expect(palettes.dark).toBe(darkColors);
  });

  it('defaults to the light palette for any non-dark value', () => {
    // @ts-expect-error — defensive default for an out-of-type value
    expect(getPalette('weird')).toBe(colors);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- palettes`
Expected: FAIL — `Cannot find module '../palettes'`.

- [ ] **Step 3: Write the implementation**

Create `src/theme/palettes.ts`:

```ts
import type { ResolvedTheme } from '../contexts/ThemeContext';
import { colors } from './colors';
import { darkColors, type ColorPalette } from './darkColors';

/** Light/dark palette map. `light` holds the existing `colors` by reference. */
export const palettes: Record<ResolvedTheme, ColorPalette> = {
  light: colors,
  dark: darkColors,
};

/** Pure selector: resolved theme mode → palette. Defaults to light. */
export function getPalette(resolved: ResolvedTheme): ColorPalette {
  return resolved === 'dark' ? palettes.dark : palettes.light;
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- palettes`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/theme/palettes.ts src/theme/__tests__/palettes.test.ts
git commit -m "feat(mobile): add palette map + getPalette selector (M3d-1)"
```

---

## Task 3: `useThemeColors` + `makeThemedStyles`

**Files:**
- Create: `src/theme/useThemedStyles.ts`
- Test: `src/theme/__tests__/useThemedStyles.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `src/theme/__tests__/useThemedStyles.test.tsx`:

```tsx
import { StyleSheet } from 'react-native';
import { renderHook } from '@testing-library/react-native';

// Mock the theme context so `resolved` is fully controlled (no provider needed).
jest.mock('@/src/contexts/ThemeContext', () => ({ useThemeMode: jest.fn() }));

import { useThemeMode } from '@/src/contexts/ThemeContext';
import { colors } from '../colors';
import { darkColors } from '../darkColors';
import { useThemeColors, makeThemedStyles } from '../useThemedStyles';

const mockUseThemeMode = useThemeMode as jest.Mock;
const setDark = () => mockUseThemeMode.mockReturnValue({ mode: 'dark', resolved: 'dark', setMode: jest.fn() });
const setLight = () => mockUseThemeMode.mockReturnValue({ mode: 'light', resolved: 'light', setMode: jest.fn() });

const useProbeStyles = makeThemedStyles((c) =>
  StyleSheet.create({ box: { backgroundColor: c.background } }),
);

describe('useThemeColors', () => {
  it('returns the dark palette when resolved is dark', () => {
    setDark();
    const { result } = renderHook(() => useThemeColors());
    expect(result.current).toBe(darkColors);
  });

  it('returns the light palette when resolved is light', () => {
    setLight();
    const { result } = renderHook(() => useThemeColors());
    expect(result.current).toBe(colors);
  });
});

describe('makeThemedStyles', () => {
  it('builds dark styles under dark mode and light styles under light mode', () => {
    setDark();
    expect(renderHook(() => useProbeStyles()).result.current.box.backgroundColor).toBe('#121212');
    setLight();
    expect(renderHook(() => useProbeStyles()).result.current.box.backgroundColor).toBe('#FAFBFF');
  });

  it('returns a stable (memoized) style object across re-renders at a fixed mode', () => {
    setDark();
    const { result, rerender } = renderHook(() => useProbeStyles());
    const first = result.current;
    rerender({});
    expect(result.current).toBe(first);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- useThemedStyles`
Expected: FAIL — `Cannot find module '../useThemedStyles'`.

- [ ] **Step 3: Write the implementation**

Create `src/theme/useThemedStyles.ts`:

```ts
import { useMemo } from 'react';
import { useThemeMode } from '../contexts/ThemeContext';
import { getPalette } from './palettes';
import type { ColorPalette } from './darkColors';

/** Current palette for the resolved theme mode. */
export function useThemeColors(): ColorPalette {
  const { resolved } = useThemeMode();
  return getPalette(resolved);
}

/**
 * Bind a style factory to the theme. Returns a hook that builds the StyleSheet
 * from the current palette, memoized on the palette (a stable module constant),
 * so it recomputes only on an actual light↔dark flip.
 *
 * Usage (StyleSheet body is unchanged — the factory param is also named `colors`):
 *   const useStyles = makeThemedStyles((colors) => StyleSheet.create({ ... }));
 *   function Screen() { const styles = useStyles(); ... }
 */
export function makeThemedStyles<T>(factory: (colors: ColorPalette) => T) {
  return function useStyles(): T {
    const colors = useThemeColors();
    return useMemo(() => factory(colors), [colors]);
  };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- useThemedStyles`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**

```bash
git add src/theme/useThemedStyles.ts src/theme/__tests__/useThemedStyles.test.tsx
git commit -m "feat(mobile): add useThemeColors + makeThemedStyles hooks (M3d-1)"
```

---

## Task 4: Re-export the foundation from the theme barrel

**Files:**
- Modify: `src/theme/index.ts`
- Test: `src/theme/__tests__/index.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/theme/__tests__/index.test.ts`:

```ts
import * as theme from '../index';

describe('theme barrel', () => {
  it('re-exports the dark-mode foundation', () => {
    expect(typeof theme.getPalette).toBe('function');
    expect(typeof theme.useThemeColors).toBe('function');
    expect(typeof theme.makeThemedStyles).toBe('function');
    expect(theme.darkColors.background).toBe('#121212');
    expect(theme.palettes.light).toBe(theme.colors);
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- theme/__tests__/index`
Expected: FAIL — `theme.getPalette` is `undefined` (not yet re-exported).

- [ ] **Step 3: Write the implementation**

Edit `src/theme/index.ts`. Keep the existing content and add the new re-exports. The full file becomes:

```ts
import { colors } from './colors';
import { typography, fonts, textStyles } from './typography';
import { spacing } from './spacing';

export const theme = {
  colors,
  typography,
  fonts,
  textStyles,
  spacing,
} as const;

export type Theme = typeof theme;

export { colors, typography, fonts, textStyles, spacing };

// ── Dark-mode foundation (M3d-1) ──
export { darkColors, type ColorPalette } from './darkColors';
export { palettes, getPalette } from './palettes';
export { useThemeColors, makeThemedStyles } from './useThemedStyles';
```

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- theme/__tests__/index`
Expected: PASS (1 test).

- [ ] **Step 5: Commit**

```bash
git add src/theme/index.ts src/theme/__tests__/index.test.ts
git commit -m "feat(mobile): re-export dark-mode foundation from theme barrel (M3d-1)"
```

---

## Task 5: Convert `app/profile/settings.tsx` (the proof)

**Files:**
- Modify: `app/profile/settings.tsx`
- Test: `app/profile/__tests__/settings.test.tsx`

- [ ] **Step 1: Write the failing test**

Create `app/profile/__tests__/settings.test.tsx`:

```tsx
import React from 'react';
import { StyleSheet } from 'react-native';

jest.mock('@expo/vector-icons', () => ({ Ionicons: () => null }));
jest.mock('expo-router', () => ({ useRouter: () => ({ back: jest.fn() }) }));
jest.mock('@/src/components/profile', () => ({ SettingsItem: () => null }));
jest.mock('@/src/contexts/ThemeContext', () => ({ useThemeMode: jest.fn() }));

import { useThemeMode } from '@/src/contexts/ThemeContext';
import { renderWithProviders } from '@/src/test/renderWithProviders';
import SettingsScreen from '../settings';

const mockUseThemeMode = useThemeMode as jest.Mock;

function pageBackground() {
  const { getByTestId } = renderWithProviders(<SettingsScreen />);
  return StyleSheet.flatten(getByTestId('settings-screen').props.style).backgroundColor;
}

describe('SettingsScreen — themed background', () => {
  it('paints the dark page background when resolved is dark', () => {
    mockUseThemeMode.mockReturnValue({ mode: 'dark', resolved: 'dark', setMode: jest.fn() });
    expect(pageBackground()).toBe('#121212');
  });

  it('paints the light page background when resolved is light', () => {
    mockUseThemeMode.mockReturnValue({ mode: 'light', resolved: 'light', setMode: jest.fn() });
    expect(pageBackground()).toBe('#FAFBFF');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm test -- settings`
Expected: FAIL — `getByTestId('settings-screen')` throws (no `testID` yet) and the static `colors` background never changes with mode.

- [ ] **Step 3: Write the implementation**

Make four edits to `app/profile/settings.tsx`:

**(a) Swap the theme import.** Change:

```ts
import { colors, spacing, typography } from '../../src/theme';
```

to:

```ts
import { spacing, typography, makeThemedStyles, useThemeColors } from '../../src/theme';
```

**(b) Resolve the palette + styles inside the component.** Just after `const { mode: themeMode, setMode: setThemeMode } = useThemeMode();`, add:

```ts
  const colors = useThemeColors();
  const styles = useStyles();
```

**(c) Add a `testID` to the root container.** Change:

```tsx
    <View style={styles.container}>
```

to:

```tsx
    <View style={styles.container} testID="settings-screen">
```

**(d) Wrap the StyleSheet in the themed factory.** Change the closing of the component and the StyleSheet declaration. Replace:

```ts
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
```

with:

```ts
const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
```

and replace the final closing of the StyleSheet object:

```ts
  languageNameSelected: {
    color: colors.primary,
  },
});
```

with:

```ts
    languageNameSelected: {
      color: colors.primary,
    },
  }),
);
```

> The intervening style rules are unchanged — only the wrapper opening/closing and indentation shift. The factory parameter is named `colors`, so every `colors.*` reference inside the StyleSheet body resolves to the themed palette without edits.

- [ ] **Step 4: Run test to verify it passes**

Run: `npm test -- settings`
Expected: PASS (2 tests).

- [ ] **Step 5: Verify no type/lint regressions, then commit**

Run: `npm run type-check`
Expected: no NEW errors beyond the ~155 pre-existing baseline (the `src/theme/*` and `app/profile/settings.tsx` files are clean). To confirm settings/theme add nothing, check they do not appear in the error list:
Run: `npm run type-check 2>&1 | grep -E "theme/(darkColors|palettes|useThemedStyles|index)|profile/settings"`
Expected: no output.

Run: `npm run lint`
Expected: 0 errors (pre-existing warnings unchanged).

```bash
git add app/profile/settings.tsx app/profile/__tests__/settings.test.tsx
git commit -m "feat(mobile): convert settings screen to dynamic dark palette (M3d-1)"
```

---

## Task 6: Milestone verification

**Files:** none (verification only).

- [ ] **Step 1: Full suite green**

Run: `npm test`
Expected: PASS. This plan adds **5 new test files** → **16 → 21 suites**, and **15 new tests** (4 darkColors + 4 palettes + 4 useThemedStyles + 1 index + 2 settings) → **89 → 104 tests**. (The spec sketched "two test files"; the plan splits per-unit for cleaner TDD — an intentional granularity bump.) Read the actual totals from the runner output; the binding gate is **all green, zero failures**, with the five new suites present.

- [ ] **Step 2: Lint + type-check gates**

Run: `npm run lint` → 0 errors.
Run: `npm run type-check` → zero new errors (baseline ~155 unchanged).

- [ ] **Step 3: Manual runtime check (if a simulator/device is available)**

Per `docs/superpowers/plans/RUNTIME-VERIFICATION-runbook.md`: start `npm run dev`, open the app, go to Profile → Settings, toggle **Appearance → Dark**. Expected: the settings screen background darkens to `#121212`, cards become `#1E1E1E`, text turns off-white, and the selected-state checkmarks/labels stay readable; the status bar and any native header flip too (via the existing `NavigationThemeBridge`). Toggling back to **Light** restores `#FAFBFF`. Note that other screens remain light — this is the expected incremental M3d state.

> No commit in this task — it is a gate.

---

## Task 7: Update the program status doc

**Files:**
- Modify: `docs/superpowers/mobile-enhancement-status.md`

- [ ] **Step 1: Mark M3d-1 done**

In `docs/superpowers/mobile-enhancement-status.md`, under the **Done** list add a bullet:

```markdown
- **M3d-1 — Dark-mode foundation + Settings proof** (branch `m3d1-dark-mode-foundation`): conventional dark palette (`darkColors` twin of `colors` — near-black `#121212` page, `#1E1E1E` cards lighter than page, off-white text, neutral `#ECECEC` primary, brand yellow `#FFD500` kept as the pop accent; vivid status hues unchanged, pale status tints darkened). Pure `getPalette(resolved)` + `useThemeColors()` + a memoizing `makeThemedStyles(factory)` hook (`src/theme/`); `app/profile/settings.tsx` converted end-to-end as the proof (global chrome already flips via the existing `NavigationThemeBridge`). Twin-structural shape was chosen over semantic role tokens so the remaining sweep stays mechanical. See `specs/2026-06-03-mobile-m3d1-*` + `plans/2026-06-03-mobile-m3d1-*`.
```

In the **M3d** "Next up" section, update the sub-slice status so **M3d-1 is marked done** and **M3d-2 (screen-by-screen conversion, tabs/home first)** is the new RESUME HERE. Update the health line's test count to the actual number from Task 6.

- [ ] **Step 2: Commit**

```bash
git add docs/superpowers/mobile-enhancement-status.md
git commit -m "docs(mobile): mark M3d-1 done; M3d-2 is next (status handoff)"
```

---

## Self-Review notes (addressed)

- **Spec coverage:** palette (Task 1), `getPalette`/`useThemeColors`/`makeThemedStyles` API (Tasks 2–3), barrel exports (Task 4), settings proof (Task 5), test strategy (Tasks 1–5), verification gates (Task 6), status handoff (Task 7). All spec sections map to a task.
- **Test-count note:** the exact suite/test totals in Task 6 Step 1 are to be read from the runner output; the binding gate is "all green + new suites present," not a hard-coded number.
- **Type safety:** `ColorPalette = Widen<typeof colors>` keeps key-parity at compile time without locking values; `palettes` is typed `Record<ResolvedTheme, ColorPalette>` so `colors`/`darkColors` are checked against it once.
- **No new tsc errors:** new files are self-contained and typed; the settings edit only swaps imports and wraps the existing StyleSheet — Task 5 Step 5 explicitly greps to confirm the touched files contribute zero errors.
