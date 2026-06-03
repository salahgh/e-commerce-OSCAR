# M3d-1 — Dark-mode foundation + Settings-screen proof (design)

_Date: 2026-06-03. Milestone M3d-1 of the Mobile Enhancement Program. Scope: mobile-only (`apps/mobile`). See `docs/superpowers/mobile-enhancement-status.md` for the program roadmap._

## Problem

The theme toggle already exists (`app/profile/settings.tsx` → `setMode`) and `ThemeContext` resolves `light`/`dark` and persists it. But **nothing visually switches**: every screen's `StyleSheet.create` block reads the static `src/theme/colors.ts` (one light palette) at module-import time, so the resolved mode never reaches the styles. There is no dark palette yet — only shade names like `primaryDark`.

M3d (real dark mode) is an incremental program: **62 files import the static `colors`, across ~93 `StyleSheet.create` blocks and ~860 `colors.*` usages**. This slice (M3d-1) builds the foundation and proves it on one screen; the screen-by-screen sweep follows in M3d-2…N.

## Decisions (locked during brainstorming)

1. **Conventional dark palette** — diverge from the frontend's `.dark` tokens toward a Material-style theme: near-black page (`#121212`), elevated surfaces *lighter* than the page, off-white text. (The frontend mirror was considered and rejected by the user; its accent-inverts-to-white and elevated-darker-than-base behaviours were not wanted.)
2. **Twin structural `darkColors` object** — `darkColors` keeps the **same keys** as today's `colors` (`background`/`surface`/`primary`/`text.*`/…). The future sweep is then mechanical: wrap a StyleSheet in `makeThemedStyles((colors) => …)` and the body is unchanged because the factory param is still named `colors`. (Chosen over introducing semantic role tokens like the frontend's `bg-base`/`content-strong`, which would force re-interpreting all ~860 usages — much larger, riskier churn.)
3. **Neutral primary + yellow pop** — in dark mode `primary` → light neutral (`#ECECEC`) button fills with dark text; brand yellow (`#FFD500`, `secondary`) stays the highlight for badges/selected states. Keeps the two-tier black+yellow system intact and readable. (Chosen over yellow-forward, which collapses primary≈secondary, and muted-grey, which is low-contrast.)

## The dark palette (`darkColors`)

A twin of `colors` — identical key structure, conventional-dark values. Semantic anchors:

| Role (`colors.*`) | Light | Dark |
|---|---|---|
| `background` (page) | `#FAFBFF` | `#121212` |
| `surface` (cards; *elevated = lighter*) | `#FFFFFF` | `#1E1E1E` |
| `surfaceDark` (muted panel) | `#EDEEF2` | `#2A2A2A` |
| `primary` (button fill / selected accent) | `#1E1E1E` | `#ECECEC` |
| `primaryLight` (hover/brighter) | `#4D4D4D` | `#FFFFFF` |
| `primaryDark` (pressed/dimmer) | `#000000` | `#D5D5D5` |
| `text.inverse` (text on primary buttons) | `#FFFFFF` | `#1E1E1E` |
| `secondary` (yellow pop) | `#FFD500` | `#FFD500` *(unchanged)* |
| `text.primary` | `#010B38` | `#ECECEC` |
| `text.secondary` | `rgba(1,11,56,.6)` | `rgba(255,255,255,.6)` |
| `text.tertiary` | `rgba(1,11,56,.4)` | `rgba(255,255,255,.4)` |
| `text.disabled` | `rgba(1,11,56,.2)` | `rgba(255,255,255,.3)` |
| `border` | `#E1E2E5` | `#2E2E2E` |
| `borderLight` | `#EDEEF2` | `#242424` |
| `borderDark` | `#C8C9CC` | `#3A3A3A` |
| `gray.1 → gray.6` | `#FAFBFF`→`#646466` | `#1E1E1E`→`#8A8A8A` (inverted neutral ramp) |
| `success/error/warning/info` (base) | vivid | **unchanged** (read fine on dark) |
| `successLight / errorLight / warningLight / infoLight` | pale (`#E5FFEE`…) | darkened (`#12301E` / `#3A1717` / `#3A2E12` / `#12303A`) |
| `white` / `black` | literal | literal (unchanged) |
| `overlay` | `rgba(0,0,0,.5)` | `rgba(0,0,0,.6)` |
| `gradient` | `#1E1E1E`→`#000000` | `#2A2A2A`→`#121212` |

**Derivation rules** (for the keys not individually anchored above):
- **Neutral ramps** (`primaryScale`, `darkText`): remapped so they read against a dark page — the exact 6 stops are finalized at implementation with a quick contrast sanity-check, keeping monotonic ordering.
- **Status `*Scale` objects** (`successScale`…): kept as-is — the vivid mid/high stops read fine on dark; only the pale `*Light` tints (table above) are darkened.
- **`secondary*` tint variants** (`secondaryLight`, `secondaryScale`): brand yellow base stays; the pale yellow *tint backgrounds* may need a muted dark variant, but that is deferred to the sweep step where a screen actually uses them (the settings proof does not). Documented, not invented up front.

## Architecture & API

### New files (`src/theme/`)

- **`darkColors.ts`** — the `darkColors` object, typed against a widened `ColorPalette` type so key-parity with `colors` is enforced at compile time without locking values.
  ```ts
  type Widen<T> = { [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };
  export type ColorPalette = Widen<typeof colors>;
  export const darkColors: ColorPalette = { /* … */ };
  ```
- **`palettes.ts`** — the palette map + pure selector:
  ```ts
  export const palettes = { light: colors, dark: darkColors } as const;
  export function getPalette(resolved: ResolvedTheme): ColorPalette {
    return resolved === 'dark' ? palettes.dark : palettes.light; // defaults to light
  }
  ```
- **`useThemedStyles.ts`** — the runtime hooks:
  ```ts
  export function useThemeColors(): ColorPalette {
    return getPalette(useThemeMode().resolved);
  }
  export function makeThemedStyles<T>(factory: (c: ColorPalette) => T) {
    return function useStyles(): T {
      const colors = useThemeColors();
      return useMemo(() => factory(colors), [colors]); // palette objects are stable module constants
    };
  }
  ```

### Modified files

- **`src/theme/index.ts`** — re-export `darkColors`, `palettes`, `getPalette`, `ColorPalette`, `useThemeColors`, `makeThemedStyles`.
- **`app/profile/settings.tsx`** — the proof (below).

### The conversion recipe (established here for the whole sweep)

```ts
// module scope — StyleSheet body UNCHANGED; the factory param is also named `colors`
const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({ container: { backgroundColor: colors.background }, /* … */ }),
);

function Screen() {
  const styles = useStyles();        // memoized; recomputes only on a light↔dark flip
  const colors = useThemeColors();   // for inline JSX colors: color={colors.primary}
  // …
}
```

## Data flow

`ThemeContext.resolved` → `useThemeColors()` reads `palettes[resolved]` → `makeThemedStyles` factory memoized on the palette → component styles. On toggle, `resolved` changes → subscribed components re-render with the new palette → their StyleSheets recompute → the converted screen darkens. Global chrome (status bar, React Navigation headers) already flips via the existing `NavigationThemeBridge` in `app/_layout.tsx` and `<StatusBar style="auto" />`.

## The proof: `app/profile/settings.tsx`

Convert end-to-end (the toggle lives here — dogfood):
- Replace the module-level `const styles = StyleSheet.create({…})` (using imported `colors`) with `const useStyles = makeThemedStyles((colors) => StyleSheet.create({…}))` — body unchanged.
- Inside the component, `const styles = useStyles();` and `const colors = useThemeColors();` to feed the inline `color={colors.primary}` / `colors.text.secondary` icon props.
- Drop the static `colors` import.

Result: toggling System/Light/Dark on this screen visibly darkens it immediately.

## Testing (TDD)

- **`src/theme/__tests__/palettes.test.ts`**
  - `getPalette('dark')` === `darkColors`; `getPalette('light')` === `colors`.
  - **Recursive key-parity**: the deep key set of `darkColors` equals that of `colors` (guards future drift).
  - Anchor values: dark `background` = `#121212`, `primary` = `#ECECEC`, `text.inverse` = `#1E1E1E`, `secondary` = `#FFD500` (unchanged).
- **`src/theme/__tests__/useThemedStyles.test.tsx`**
  - Render a probe component using `makeThemedStyles` under a `ThemeProvider` forced to light vs. dark; assert `container.backgroundColor` differs (`#FAFBFF` vs `#121212`).
  - Memoization: at a fixed mode, the returned style object reference is stable across re-renders.

## Scope boundary

**In scope:** the `darkColors` palette, the 3 foundation files, `theme/index.ts` re-exports, the `settings.tsx` conversion, and the two test files.

**Out of scope (deferred to M3d-2…N):** the other ~92 `StyleSheet.create` blocks; Arabic-font wiring into `typography` for the `ar` locale; fine-tuning yellow *tint* backgrounds beyond what the settings screen touches.

## Verification / done criteria

- `npm test` green (existing 89 + the new tests), 16→18 suites (two new test files).
- `npm run lint` = 0 errors (pre-existing warnings unchanged).
- **Zero new** `tsc` errors over the ~155 pre-existing baseline.
- Manual: toggling dark mode on the settings screen visibly darkens it; the status bar/headers flip too.

## Risks & notes

- **Mid-program mixed state is expected**: after M3d-1, toggling dark leaves the other ~92 screens light. This is the agreed incremental shape of M3d, not a regression.
- **`makeThemedStyles` returns a hook** (`useStyles`) — it must be created at module scope and called inside the component body, satisfying the rules-of-hooks lint.
- **Contrast**: the conventional palette's exact ramp stops get a quick contrast sanity-check at implementation; anchors above are already legible (off-white text on `#121212`, dark text on `#ECECEC`).
