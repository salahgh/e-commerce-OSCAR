# M3d-3 — Products feature dark conversion (design)

_Date: 2026-06-03. Milestone M3d-3 of the Mobile Enhancement Program (third slice of the M3d screen-by-screen dark sweep). Scope: mobile-only (`apps/mobile`). Builds on the M3d-1 foundation and M3d-2 recipe._

## Problem

M3d-1 shipped the dark-mode foundation; M3d-2 converted the tabs + home surface. The **products feature** — the product-detail page (PDP), the product-listing screen, and their components — still reads the static light `colors`, so it stays light when dark mode is on. This slice converts the whole `products/` area to the dynamic palette.

A harness gap also surfaces here: the PDP has an existing **render test** (`app/products/__tests__/product-detail.test.tsx`) that mounts the screen via `renderWithProviders`, which today only wraps `SafeAreaProvider`. Once the PDP calls `useThemeColors()` (→ `useThemeMode()`), that test would throw outside a `ThemeProvider`. The fix is to add `ThemeProvider` to `renderWithProviders`.

## Decisions (locked during brainstorming)

1. **Scope: the full products feature** (the user chose the broad option): the PDP detail set **and** the listing screen + its filter/sort/grid/variant components. Colorless components (`RelatedProducts`, `RecentlyViewedRow`, `FilterBar`, `ZoomableImage`) are **excluded** (nothing to theme).
2. **Test depth: gates-only** (carried forward from M3d-2) — no new render tests; rely on `tsc`, `lint`, the full suite staying green, an import guard, and a manual walkthrough.
3. **Standard recipe** — no `orders.tsx`-style module-level `colors` refactor is needed (verified: every file's first `colors.` use is inside its component, not at module scope).

## Scope — the ~15 live files

**PDP detail set:**

| File | `colors.*` uses | Notes |
|---|---|---|
| `app/products/[slug].tsx` | 23 | shadow `#000` literal stays |
| `src/components/products/ImageCarousel.tsx` | 19 | |
| `src/components/products/SizeGuideModal.tsx` | 12 | |
| `src/components/products/HorizontalProductRow.tsx` | 4 | **also rendered on the home "Recently viewed" row** — converting it closes that M3d-2 gap |

**Listing set:**

| File | `colors.*` uses | Notes |
|---|---|---|
| `app/products/index.tsx` | 18 | `#F9FAFB` → `colors.gray[1]`; one literal to route |
| `src/components/products/VariantPicker.tsx` | 27 | largest |
| `src/components/products/ProductListItem.tsx` | 10 | |
| `src/components/products/FilterBottomSheet.tsx` | 9 | |
| `src/components/products/ProductCard.tsx` | 8 | |
| `src/components/products/SearchBar.tsx` | 9 | |
| `src/components/products/PriceSheet.tsx` | 7 | |
| `src/components/products/SizeSheet.tsx` | 6 | |
| `src/components/products/FilterSheet.tsx` | 4 | shadow `#000` literal stays |
| `src/components/products/ProductGrid.tsx` | 3 | |
| `src/components/products/SortSheet.tsx` | 3 | |

**Excluded (no theme colors):** `RelatedProducts.tsx`, `RecentlyViewedRow.tsx` (colorless pass-throughs that wrap `HorizontalProductRow`), `FilterBar.tsx`, `ZoomableImage.tsx`.

## Conversion recipe (per file) — the proven M3d-1/M3d-2 recipe

- Replace `const styles = StyleSheet.create({…})` with `const useStyles = makeThemedStyles((colors) => StyleSheet.create({…}))` — body unchanged (factory param is named `colors`).
- In the component body add `const styles = useStyles();`, and `const colors = useThemeColors();` where the JSX has inline `color={…}` / `tintColor={…}` / `placeholderTextColor={…}` props.
- Remove the static `import { colors } from '…/theme'` (keep `spacing`/`typography`, add `makeThemedStyles`/`useThemeColors`).
- **Literals:** `app/products/index.tsx` `#F9FAFB` → `colors.gray[1]`. Leave the two `#000` shadow colors (`[slug].tsx`, `FilterSheet.tsx`) — shadows are theme-agnostic.
- **No module-level `colors`** in this set, so no parameter refactor (unlike `orders.tsx`).

## Test-harness change (required)

Update `src/test/renderWithProviders.tsx` to wrap children in `<ThemeProvider>` (from `src/contexts/ThemeContext`), inside the existing `SafeAreaProvider`:

```tsx
import { ThemeProvider } from '../contexts/ThemeContext';
// …
export function renderWithProviders(ui: ReactElement) {
  return render(
    <SafeAreaProvider initialMetrics={METRICS}>
      <ThemeProvider>{ui}</ThemeProvider>
    </SafeAreaProvider>,
  );
}
```

`ThemeProvider` hydrates from AsyncStorage (mocked → returns null → stays `system`) and reads `useColorScheme()` (jest-expo default → `light`), so screens render in **light mode** under test — existing `product-detail.test.tsx` assertions are unchanged. This single change unblocks every future screen render test in the sweep.

## Data flow

Unchanged from M3d-1: `ThemeContext.resolved` → `useThemeColors()` → `palettes[resolved]` → `makeThemedStyles` factory (memoized) → component styles. On toggle, every converted PDP/listing file re-renders with the dark palette.

## Testing — gates-only

- **`npm test`** — the existing **104 tests / 21 suites** stay green. The PDP render test (`product-detail.test.tsx`) keeps passing **because of the `renderWithProviders` ThemeProvider fix**.
- **`npm run type-check`** — **zero new** errors over the 155 baseline.
- **`npm run lint`** — **0 errors**.
- **Automated guard** — for each of the ~15 converted files, assert it no longer statically imports `colors` from the theme barrel (`grep` → expect none).
- **Manual** — toggle dark mode and walk the PDP (image carousel, size guide, variant chips, add-to-cart bar, related/recently-viewed rows) and the listing screen (search, filters/sort sheets, grid/list cards), confirming everything flips and no hardcoded light blocks remain. Per `docs/superpowers/plans/RUNTIME-VERIFICATION-runbook.md`.

## Scope boundary

**In:** the ~15 live files (standard recipe + the one `index.tsx` literal), the `renderWithProviders` ThemeProvider change, the import guard, the status-doc handoff.

**Out (later slices):** colorless components, shared `components/ui/`, all non-products screens (checkout, auth, orders/address detail, search, profile/*, info), Arabic-font wiring, and any redesign — like-for-like palette conversion only.

## Risks & notes

- **Large slice, gates-only:** the manual walkthrough is the real correctness check for appearance; `tsc` + the import guard cover the mechanical wiring. The one render test (PDP) guards against the most likely break (missing provider).
- **`HorizontalProductRow` is shared** (home recently-viewed, PDP related/recently-viewed) — converting it ripples positively and removes a residual light row left after M3d-2.
- **Bottom-sheet components** (`FilterSheet`/`SortSheet`/`SizeSheet`/`PriceSheet`/`FilterBottomSheet`) render over an overlay; confirm their panel backgrounds (`surface`) and handles read correctly on dark during the manual pass.
- **No new dependencies**; like-for-like conversion.
