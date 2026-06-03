# M3d-7 — Search screen dark conversion (design)

_Date: 2026-06-03. Milestone M3d-7 of the Mobile Enhancement Program (seventh slice of the M3d screen-by-screen dark sweep). Scope: mobile-only (`apps/mobile`). Builds on the M3d-1 foundation and the M3d-2..6 recipe._

## Problem

The search screen (`app/search.tsx`) still reads the static light `colors`, so it stays light in dark mode. This slice converts it. Single file, standard recipe, no wrinkles.

## Decisions (locked during brainstorming)

1. **Scope: `app/search.tsx` only** — it is a single root-level file (not a `app/search/` directory).
2. **No literals to route** (no hardcoded hex beyond any `#000`/`#fff`).
3. **Import path is `'../src/theme'`** (single `../`) — `search.tsx` sits at the `app/` root, unlike the `app/<dir>/...` screens that use `'../../src/theme'`.
4. **Test depth: gates-only** — no tests touch this screen; `tsc`, `lint`, suite green, import guard.
5. **Standard recipe** — the module-level consts (`SEARCH_HISTORY_KEY`, `MAX_HISTORY_ITEMS`, `SEARCH_DEBOUNCE_MS`, `popularSearches`) carry no `colors`; verify `popularSearches` stays colorless (no param refactor expected).

## Scope — 1 file

| File | `colors.` uses | inline props | import path |
|---|---|---|---|
| `app/search.tsx` | 25 | 8 | `'../src/theme'` (single `../`) |

## Conversion recipe

- Theme import: `import { colors, spacing, typography } from '../src/theme';` → `import { spacing, typography, makeThemedStyles, useThemeColors } from '../src/theme';` (keep `spacing`/`typography` as used).
- Wrap `const styles = StyleSheet.create({…})` → `const useStyles = makeThemedStyles((colors) => StyleSheet.create({…}))` — body unchanged.
- In the component add `const styles = useStyles();` and `const colors = useThemeColors();` (8 inline color props).
- Verify `popularSearches` (module-level) contains no `colors` — if it does, refactor per the M3d-2 module-level-`colors` precedent; expected: it does not.

## Testing — gates-only

- **`npm test`** — the existing **104 tests / 21 suites** stay green.
- **`npm run type-check`** — **zero new** errors over the 155 baseline.
- **`npm run lint`** — **0 errors**.
- **Import guard** (note the single-`../` path): `grep -nE "import \{[^}]*\bcolors\b[^}]*\} from '\.\./src/theme'" app/search.tsx` → no output.
- **Manual** — toggle dark; open search, type a query, view results + the recent/popular search chips and empty state. Confirm everything flips. Per `docs/superpowers/plans/RUNTIME-VERIFICATION-runbook.md`.

## Scope boundary

**In:** `app/search.tsx`, the import guard, the status-doc handoff.

**Out (later slices):** remaining `profile/*` + `info/*`, `onboarding.tsx`/`splash.tsx`, shared `components/ui`/`cart`/`navigation`, Arabic-font wiring — like-for-like only.

## Risks & notes

- **Smallest slice so far** (one file, standard recipe, no literals/wrinkles); the only deviation is the single-`../` import path.
- **Gates-only**; manual walkthrough is the appearance check. No search test to guard a missing provider, but it renders under the app `ThemeProvider` at runtime.
