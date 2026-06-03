# M3d-3 — Products Feature Dark Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the products feature — the PDP (`products/[slug].tsx`), the product-listing screen (`products/index.tsx`), and their ~13 themed components — to the M3d-1 dynamic palette, and add `ThemeProvider` to the test harness so the PDP render test survives.

**Architecture:** Apply the proven M3d-1/M3d-2 recipe per file — wrap the module-level `StyleSheet.create({…})` in `makeThemedStyles((colors) => …)`, add `const styles = useStyles()` (+ `const colors = useThemeColors()` where the JSX has inline color props), drop the static `colors` import. One literal is routed (`index.tsx` `#F9FAFB`→`gray[1]`); the two `#000` shadows stay. Verification is **gates-only** plus keeping the existing PDP render test green via a `renderWithProviders` ThemeProvider wrap.

**Tech Stack:** React Native 0.83 / Expo SDK 55, TypeScript, the M3d-1 theme foundation (`makeThemedStyles`, `useThemeColors`), Jest + RNTL.

**Reference spec:** `docs/superpowers/specs/2026-06-03-mobile-m3d3-products-dark-conversion-design.md`

**Working directory:** all paths relative to `apps/mobile/`. Run gates from inside `apps/mobile` (`npm`, never `pnpm --filter`).

---

## Shared conversion procedure (every conversion task)

For each target file:
1. **Edit the theme import** — remove `colors`, add `makeThemedStyles` and (only if the file has inline JSX color props) `useThemeColors`. Keep `spacing`/`typography` as present.
2. **Add hooks in the component body** — `const styles = useStyles();`, and `const colors = useThemeColors();` if there are inline `color=` / `tintColor=` / `placeholderTextColor=` props.
3. **Wrap the StyleSheet** — `const styles = StyleSheet.create({` → `const useStyles = makeThemedStyles((colors) =>\n  StyleSheet.create({` and the trailing `});` → `}),\n);`. Then `npx prettier --write <file>`.
4. **Route literals** per the file's note. Leave `shadowColor: '#000'`.

**Per-file specifics** (import path + whether `useThemeColors` is needed). Components import from `../../theme`; screens from `../../src/theme`:

| File | new import | `useThemeColors`? | literal |
|---|---|---|---|
| `app/products/[slug].tsx` | `{ spacing, typography, makeThemedStyles, useThemeColors }` from `../../src/theme` | yes (5) | `#000` shadow stays |
| `app/products/index.tsx` | `{ spacing, typography, makeThemedStyles, useThemeColors }` from `../../src/theme` | yes (7) | `#F9FAFB`→`colors.gray[1]` |
| `ImageCarousel.tsx` | `{ spacing, makeThemedStyles, useThemeColors }` from `../../theme` | yes (4) | — |
| `SizeGuideModal.tsx` | `{ spacing, typography, makeThemedStyles, useThemeColors }` from `../../theme` | yes (1) | — |
| `HorizontalProductRow.tsx` | `{ spacing, typography, makeThemedStyles }` from `../../theme` | **no** (0) | — |
| `VariantPicker.tsx` | `{ spacing, typography, makeThemedStyles }` from `../../theme` | **no** (0) | — |
| `ProductListItem.tsx` | `{ spacing, typography, makeThemedStyles, useThemeColors }` from `../../theme` | yes (2) | — |
| `FilterBottomSheet.tsx` | `{ spacing, typography, makeThemedStyles }` from `../../theme` | **no** (0) | — |
| `ProductCard.tsx` | `{ spacing, typography, makeThemedStyles }` from `../../theme` | **no** (0) | — |
| `SearchBar.tsx` | `{ spacing, typography, makeThemedStyles, useThemeColors }` from `../../theme` | yes (4) | — |
| `PriceSheet.tsx` | `{ spacing, typography, makeThemedStyles, useThemeColors }` from `../../theme` | yes (2) | — |
| `SizeSheet.tsx` | `{ spacing, typography, makeThemedStyles, useThemeColors }` from `../../theme` | yes (1) | — |
| `FilterSheet.tsx` | `{ spacing, typography, makeThemedStyles, useThemeColors }` from `../../theme` | yes (1) | `#000` shadow stays |
| `ProductGrid.tsx` | `{ spacing, makeThemedStyles, useThemeColors }` from `../../theme` | yes (2) | — |
| `SortSheet.tsx` | `{ spacing, typography, makeThemedStyles, useThemeColors }` from `../../theme` | yes (1) | — |

### The import guard (every task + final gate)

```bash
grep -nE "import \{[^}]*\bcolors\b[^}]*\} from '(\.\./\.\./src/theme|\.\./\.\./theme)'" <file>
```
Expected: **no output** (`colors` only appears as the `makeThemedStyles` factory param / `useThemeColors()` local).

---

## Task 1: Add `ThemeProvider` to the test harness

**Files:** Modify `src/test/renderWithProviders.tsx`

This must land **before** the PDP conversion (Task 2), or `product-detail.test.tsx` would throw once the PDP uses `useThemeColors()`.

- [ ] **Step 1: Edit `renderWithProviders.tsx`.** Replace its body with:

```tsx
import React, { ReactElement } from 'react';
import { render } from '@testing-library/react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { ThemeProvider } from '../contexts/ThemeContext';

const METRICS = {
  frame: { x: 0, y: 0, width: 390, height: 844 },
  insets: { top: 47, left: 0, right: 0, bottom: 34 },
};

export function renderWithProviders(ui: ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}
```

- [ ] **Step 2: Verify the full suite still passes** (existing tests render in light mode — unchanged):

Run: `npm test`
Expected: **104 tests / 21 suites** green.

- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/test/renderWithProviders.tsx
git commit -m "test(mobile): wrap renderWithProviders in ThemeProvider (M3d-3)"
```

## Task 2: PDP screen — `app/products/[slug].tsx`

**Files:** Modify `app/products/[slug].tsx`

- [ ] **Step 1:** Apply the Shared procedure. New import: `import { spacing, typography, makeThemedStyles, useThemeColors } from '../../src/theme';`. Add `const styles = useStyles();` + `const colors = useThemeColors();` in `ProductDetailScreen` (5 inline color props reference it). Wrap the StyleSheet. Leave `shadowColor: '#000'`. `npx prettier --write "app/products/[slug].tsx"`.
- [ ] **Step 2:** `npm run type-check 2>&1 | grep -c "error TS"` → `155`. Import guard on the file → no output.
- [ ] **Step 3: Confirm the PDP render test still passes** (validates the Task 1 harness fix):

Run: `npm test -- product-detail`
Expected: PASS (`ProductDetailScreen renders … and queries by slug`).

- [ ] **Step 4: Commit**

```bash
git add "apps/mobile/app/products/[slug].tsx"
git commit -m "feat(mobile): theme product-detail screen for dark mode (M3d-3)"
```

## Task 3: PDP components — ImageCarousel, SizeGuideModal, HorizontalProductRow

**Files:** Modify `src/components/products/ImageCarousel.tsx`, `src/components/products/SizeGuideModal.tsx`, `src/components/products/HorizontalProductRow.tsx`

- [ ] **Step 1:** Apply the Shared procedure to each, per the per-file table:
  - **ImageCarousel** — import `{ spacing, makeThemedStyles, useThemeColors }` from `../../theme`; add both hooks (4 inline props).
  - **SizeGuideModal** — import `{ spacing, typography, makeThemedStyles, useThemeColors }` from `../../theme`; add both hooks (1 inline prop).
  - **HorizontalProductRow** — import `{ spacing, typography, makeThemedStyles }` from `../../theme`; add **only** `const styles = useStyles();` (0 inline props).
  - `npx prettier --write` all three.
- [ ] **Step 2:** `npm run type-check 2>&1 | grep -c "error TS"` → `155`. Import guard on all three → no output.
- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/components/products/ImageCarousel.tsx apps/mobile/src/components/products/SizeGuideModal.tsx apps/mobile/src/components/products/HorizontalProductRow.tsx
git commit -m "feat(mobile): theme PDP components for dark mode (M3d-3)"
```

## Task 4: Listing screen — `app/products/index.tsx`

**Files:** Modify `app/products/index.tsx`

- [ ] **Step 1:** Apply the Shared procedure. New import: `import { spacing, typography, makeThemedStyles, useThemeColors } from '../../src/theme';`. Add both hooks (7 inline props). Wrap the StyleSheet. Route the literal: `backgroundColor: '#F9FAFB'` (~L236) → `backgroundColor: colors.gray[1]`. `npx prettier --write "app/products/index.tsx"`.
- [ ] **Step 2:** `npm run type-check 2>&1 | grep -c "error TS"` → `155`. Import guard → no output. Confirm no leftover literal: `grep -n "#F9FAFB" "app/products/index.tsx"` → no output.
- [ ] **Step 3: Commit**

```bash
git add "apps/mobile/app/products/index.tsx"
git commit -m "feat(mobile): theme product-listing screen for dark mode incl. literal (M3d-3)"
```

## Task 5: Listing components A — VariantPicker, ProductListItem, ProductCard, ProductGrid

**Files:** Modify `src/components/products/VariantPicker.tsx`, `src/components/products/ProductListItem.tsx`, `src/components/products/ProductCard.tsx`, `src/components/products/ProductGrid.tsx`

- [ ] **Step 1:** Apply the Shared procedure per the per-file table:
  - **VariantPicker** — import `{ spacing, typography, makeThemedStyles }` from `../../theme`; only `const styles = useStyles();` (0 inline).
  - **ProductListItem** — import `{ spacing, typography, makeThemedStyles, useThemeColors }` from `../../theme`; both hooks (2 inline).
  - **ProductCard** — import `{ spacing, typography, makeThemedStyles }` from `../../theme`; only `const styles = useStyles();` (0 inline).
  - **ProductGrid** — import `{ spacing, makeThemedStyles, useThemeColors }` from `../../theme`; both hooks (2 inline).
  - `npx prettier --write` all four.
- [ ] **Step 2:** `npm run type-check 2>&1 | grep -c "error TS"` → `155`. Import guard on all four → no output.
- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/components/products/VariantPicker.tsx apps/mobile/src/components/products/ProductListItem.tsx apps/mobile/src/components/products/ProductCard.tsx apps/mobile/src/components/products/ProductGrid.tsx
git commit -m "feat(mobile): theme listing grid/variant components for dark mode (M3d-3)"
```

## Task 6: Listing components B — SearchBar + the bottom sheets

**Files:** Modify `src/components/products/SearchBar.tsx`, `src/components/products/FilterBottomSheet.tsx`, `src/components/products/FilterSheet.tsx`, `src/components/products/SortSheet.tsx`, `src/components/products/SizeSheet.tsx`, `src/components/products/PriceSheet.tsx`

- [ ] **Step 1:** Apply the Shared procedure per the per-file table:
  - **SearchBar** — `{ spacing, typography, makeThemedStyles, useThemeColors }`; both hooks (4 inline).
  - **FilterBottomSheet** — `{ spacing, typography, makeThemedStyles }`; only `const styles = useStyles();` (0 inline).
  - **FilterSheet** — `{ spacing, typography, makeThemedStyles, useThemeColors }`; both hooks (1 inline); leave `shadowColor: '#000'`.
  - **SortSheet** — `{ spacing, typography, makeThemedStyles, useThemeColors }`; both hooks (1 inline).
  - **SizeSheet** — `{ spacing, typography, makeThemedStyles, useThemeColors }`; both hooks (1 inline).
  - **PriceSheet** — `{ spacing, typography, makeThemedStyles, useThemeColors }`; both hooks (2 inline).
  - `npx prettier --write` all six.
- [ ] **Step 2:** `npm run type-check 2>&1 | grep -c "error TS"` → `155`. Import guard on all six → no output.
- [ ] **Step 3: Commit**

```bash
git add apps/mobile/src/components/products/SearchBar.tsx apps/mobile/src/components/products/FilterBottomSheet.tsx apps/mobile/src/components/products/FilterSheet.tsx apps/mobile/src/components/products/SortSheet.tsx apps/mobile/src/components/products/SizeSheet.tsx apps/mobile/src/components/products/PriceSheet.tsx
git commit -m "feat(mobile): theme listing search + bottom-sheet components for dark mode (M3d-3)"
```

## Task 7: Final verification gates

**Files:** none (verification only).

- [ ] **Step 1: Global import guard** — confirm none of the 15 converted files still statically import `colors`:
```bash
cd apps/mobile && grep -rnE "import \{[^}]*\bcolors\b[^}]*\} from '(\.\./\.\./src/theme|\.\./\.\./theme)'" "app/products/[slug].tsx" "app/products/index.tsx" src/components/products/ImageCarousel.tsx src/components/products/SizeGuideModal.tsx src/components/products/HorizontalProductRow.tsx src/components/products/VariantPicker.tsx src/components/products/ProductListItem.tsx src/components/products/FilterBottomSheet.tsx src/components/products/ProductCard.tsx src/components/products/SearchBar.tsx src/components/products/PriceSheet.tsx src/components/products/SizeSheet.tsx src/components/products/FilterSheet.tsx src/components/products/ProductGrid.tsx src/components/products/SortSheet.tsx
```
Expected: **no output**.
- [ ] **Step 2: Type-check** — `npm run type-check 2>&1 | grep -c "error TS"` → exactly `155`.
- [ ] **Step 3: Lint** — `npm run lint` → `0 errors`.
- [ ] **Step 4: Full suite** — `npm test` → **104 tests / 21 suites** green (the PDP render test still passes via the Task 1 harness fix).
- [ ] **Step 5: Manual walkthrough (if a device is available)** — per `docs/superpowers/plans/RUNTIME-VERIFICATION-runbook.md`: toggle dark, open a product (carousel, size-guide modal, variant chips, add-to-cart bar, related + recently-viewed rows), then the listing (search bar, filter/sort/size/price sheets, grid + list cards). Confirm everything flips, sheet panels read on dark, and no hardcoded light blocks remain. No commit — gate.

## Task 8: Update the program status doc

**Files:** Modify `docs/superpowers/mobile-enhancement-status.md`

- [ ] **Step 1:** Under **Done**, add:
```markdown
- **M3d-3 — Products feature dark conversion** (branch `m3d3-products-dark`): converted the PDP (`app/products/[slug].tsx`), the listing screen (`app/products/index.tsx`), and 13 product components (`ImageCarousel`, `SizeGuideModal`, `HorizontalProductRow`, `VariantPicker`, `ProductListItem`, `ProductCard`, `ProductGrid`, `SearchBar`, `FilterBottomSheet`, `FilterSheet`, `SortSheet`, `SizeSheet`, `PriceSheet`) to `makeThemedStyles`/`useThemeColors`; routed the one themeable literal (`index.tsx` `#F9FAFB`→`gray[1]`), shadows left fixed. Added `ThemeProvider` to `renderWithProviders` so the PDP render test (and future screen tests) keep working. `HorizontalProductRow` conversion also fixes the home "Recently viewed" row left light after M3d-2. Colorless components (`RelatedProducts`/`RecentlyViewedRow`/`FilterBar`/`ZoomableImage`) excluded. Gates-only: zero new tsc errors, lint 0, 104 tests green, import guard across all 15 files. See `specs/2026-06-03-mobile-m3d3-*` + `plans/2026-06-03-mobile-m3d3-*`.
```
- [ ] **Step 2:** Update the **M3d** "Next up" section: mark M3d-3 done; set **M3d-4 (checkout flow, then auth screens)** as the new RESUME HERE.
- [ ] **Step 3: Commit**

```bash
git add docs/superpowers/mobile-enhancement-status.md
git commit -m "docs(mobile): mark M3d-3 done; M3d-4 next (status handoff)"
```

---

## Self-Review notes (addressed)

- **Spec coverage:** harness fix (Task 1), PDP screen (Task 2), PDP components (Task 3), listing screen + literal (Task 4), listing components (Tasks 5–6), gates incl. import guard (Task 7), status handoff (Task 8). All spec sections map to tasks.
- **Ordering:** Task 1 (renderWithProviders) precedes Task 2 so the PDP render test never breaks; Task 2 Step 3 explicitly re-runs it.
- **No new tests** is intentional (spec decision 2); per-task gate is `tsc` + import guard, full suite + lint at the end.
- **Token consistency:** the only routed literal uses `colors.gray[1]` (valid `ColorPalette` key); all other conversions are mechanical (existing `colors.*` keys unchanged).
- **`useThemeColors` per file** is driven by the inline-color-prop counts in the per-file table — files with 0 get `useStyles` only (avoids an unused-variable lint error).
