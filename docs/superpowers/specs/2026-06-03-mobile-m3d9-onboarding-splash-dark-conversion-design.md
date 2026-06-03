# M3d-9 — Onboarding/splash/error-boundary dark conversion (design)

_Date: 2026-06-03. Milestone M3d-9 of the Mobile Enhancement Program (ninth slice of the M3d screen-by-screen dark sweep). Scope: mobile-only (`apps/mobile`). Builds on the M3d-1 foundation and the M3d-2..8 recipe._

## Problem

Three standalone files still read the static light `colors`: the onboarding carousel, the splash screen, and the root error boundary. This slice converts them, clearing the root-level screens before the final shared-`components/ui` batch.

## Decisions (locked during brainstorming)

1. **Scope: 3 files** — `app/onboarding.tsx`, `app/splash.tsx`, `src/components/AppErrorBoundary.tsx`.
2. **`#2C3E50` kept fixed** — it is a decorative **per-slide background color** in the onboarding slide data (each slide has its own brand color); theme-independent, kept fixed (same stance as confetti/gold-star literals).
3. **`AppErrorBoundary` is a function component** (`export function AppErrorBoundary(...)`, not a class), so the hook recipe applies directly — no special class-component handling.
4. **`useThemeColors` only where inline props exist** — only `onboarding.tsx` (1 inline prop). `splash.tsx` and `AppErrorBoundary.tsx` have 0 inline props → `useStyles()` only.
5. **Test depth: gates-only** — no tests touch these files.

## Scope — the 3 files

| File | import path | `colors.` | inline | note |
|---|---|---|---|---|
| `app/onboarding.tsx` | `'../src/theme'` | 13 | 1 | `#2C3E50` slide bg kept fixed |
| `app/splash.tsx` | `'../src/theme'` | 3 | 0 → `useStyles()` only | — |
| `src/components/AppErrorBoundary.tsx` | `'../theme'` | 8 | 0 → `useStyles()` only | function component |

## Conversion recipe (per file) — the proven M3d-1..8 recipe

- Replace `const styles = StyleSheet.create({…})` with `const useStyles = makeThemedStyles((colors) => StyleSheet.create({…}))` — body unchanged.
- In the component add `const styles = useStyles();`, and `const colors = useThemeColors();` only for `onboarding.tsx` (1 inline prop).
- Swap the theme import: remove `colors`, add `makeThemedStyles` (+ `useThemeColors` for onboarding); keep `spacing`/`typography` as used. Note the import paths above.
- **`onboarding.tsx`:** the slide-data array (built inside the component via `t()`) may set `backgroundColor` to `colors.*` tokens (which now resolve from the local `colors`) for some slides and the fixed `'#2C3E50'` for the secure slide — **leave `'#2C3E50'` as-is**.

## Testing — gates-only

- **`npm test`** — the existing **104 tests / 21 suites** stay green.
- **`npm run type-check`** — **zero new** errors over the 155 baseline.
- **`npm run lint`** — **0 errors** (`splash`/`AppErrorBoundary` must NOT import `useThemeColors`).
- **Import guard** — none of the 3 files statically imports `colors` (note the mixed paths: onboarding/splash `'../src/theme'`, AppErrorBoundary `'../theme'`).
- **Manual** — toggle dark; view onboarding slides (each slide bg + the page text/dots), the splash, and trigger an error to see the boundary. Confirm flips; the `#2C3E50` slide stays its brand color. Per `docs/superpowers/plans/RUNTIME-VERIFICATION-runbook.md`.

## Scope boundary

**In:** the 3 files (recipe; `#2C3E50` kept), import guard, status-doc handoff.

**Out (later slices):** the shared `components/ui` (15), `components/cart` (5), `components/navigation` (2), leftover `components/orders`/`home`, deferred payment-gateway screens, Arabic-font wiring — like-for-like only.

## Risks & notes

- **`#2C3E50`** is the only judgment call — kept fixed as a decorative slide background. If onboarding is later redesigned to follow the theme, route it then.
- **`AppErrorBoundary`** being a function component means the hook recipe is safe (a class would have needed a wrapper); verified.
- **Gates-only**; manual walkthrough is the appearance check. No new dependencies.
