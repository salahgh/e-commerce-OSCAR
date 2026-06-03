# M3d-6 — Orders/address detail dark conversion (design)

_Date: 2026-06-03. Milestone M3d-6 of the Mobile Enhancement Program (sixth slice of the M3d screen-by-screen dark sweep). Scope: mobile-only (`apps/mobile`). Builds on the M3d-1 foundation and the M3d-2..5 recipe._

## Problem

The order-detail screen (`app/orders/[id].tsx`) and the address book (`app/profile/addresses.tsx`) still read the static light `colors`, so they stay light in dark mode. This slice converts both. `[id].tsx` carries the M3d-2 **module-level `colors`** wrinkle: it defines its own `function getOrderStateInfo(state)` at module scope that returns palette colors per order state.

No harness work is needed (no tests touch these screens; `renderWithProviders` already wraps `ThemeProvider`).

## Decisions (locked during brainstorming)

1. **Scope: the 2 colored files** — `app/orders/[id].tsx` + `app/profile/addresses.tsx`. `app/orders/_layout.tsx` (0 `colors.` uses) is excluded.
2. **`getOrderStateInfo` param refactor** — mirror exactly what M3d-2 did for `app/(tabs)/orders.tsx`: change the module-level `function getOrderStateInfo(state: string)` → `function getOrderStateInfo(state: string, colors: ColorPalette)` (import the `ColorPalette` type), and the call site `const stateInfo = getOrderStateInfo(order.state)` → `getOrderStateInfo(order.state, colors)` where `colors = useThemeColors()` in the component.
3. **No literals to route** (neither file has hardcoded hex beyond any `#000` shadows).
4. **Test depth: gates-only** — no new tests; `tsc`, `lint`, suite green, import guard.
5. **`getOrderStateInfo` duplication is out of scope** — it now exists in both `(tabs)/orders.tsx` and `orders/[id].tsx`; extracting a shared helper is a deferred cleanup (the sweep is like-for-like conversion only).

## Scope — the 2 files

| File | `colors.` uses | inline props | special |
|---|---|---|---|
| `app/orders/[id].tsx` | 43 | 8 | module-level `getOrderStateInfo` → param refactor (decision 2) |
| `app/profile/addresses.tsx` | 4 | 1 | standard recipe |

**Excluded:** `app/orders/_layout.tsx` (colorless).

## Conversion recipe (per file)

- Replace `const styles = StyleSheet.create({…})` with `const useStyles = makeThemedStyles((colors) => StyleSheet.create({…}))` — body unchanged.
- In the component add `const styles = useStyles();` and `const colors = useThemeColors();` (both files have inline color props).
- Swap the theme import: remove `colors`, add `makeThemedStyles` + `useThemeColors` (keep `spacing`/`typography` as used). Both screens import from `../../src/theme`.
- **`[id].tsx` only:** add `ColorPalette` to the theme import; change `getOrderStateInfo(state: string)` → `getOrderStateInfo(state: string, colors: ColorPalette)` and the call to pass `colors`. (The `getOrderStateInfo` body already uses `colors.*`, which now resolve from the new parameter.)

## Testing — gates-only

- **`npm test`** — the existing **104 tests / 21 suites** stay green (no tests for these screens).
- **`npm run type-check`** — **zero new** errors over the 155 baseline.
- **`npm run lint`** — **0 errors**.
- **Import guard** — neither converted file statically imports `colors` from the theme barrel.
- **Manual** — toggle dark; open an order (status badge/timeline, totals, address block, reorder bar) and the address book (cards, default badge, add/edit form). Confirm everything flips and order-state colors read on dark. Per `docs/superpowers/plans/RUNTIME-VERIFICATION-runbook.md`.

## Scope boundary

**In:** the 2 files (recipe + the `getOrderStateInfo` param refactor), the import guard, the status-doc handoff.

**Out (later slices):** `app/search/*`, remaining `profile/*` + `info/*`, shared `components/ui`/`cart`/`navigation`, the shared-`getOrderStateInfo` extraction, Arabic-font wiring, and any redesign — like-for-like only.

## Risks & notes

- **`getOrderStateInfo` refactor** is the only non-trivial edit; it is a direct copy of the proven M3d-2 change. Status hues are theme-stable; the two text colors in the returned info now flip with the palette.
- **Gates-only**; the manual walkthrough is the appearance check. No tests for these screens to guard a missing provider, but both render under the app `ThemeProvider` at runtime.
- **No new dependencies.**
