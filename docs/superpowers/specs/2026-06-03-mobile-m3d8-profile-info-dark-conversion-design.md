# M3d-8 — Remaining profile + info screens dark conversion (design)

_Date: 2026-06-03. Milestone M3d-8 of the Mobile Enhancement Program (eighth slice of the M3d screen-by-screen dark sweep). Scope: mobile-only (`apps/mobile`). Builds on the M3d-1 foundation and the M3d-2..7 recipe._

## Problem

The remaining `app/profile/*` + `app/info/*` screens and their components still read the static light `colors` (profile/settings was done in M3d-1; profile/addresses in M3d-6). This slice converts the rest of that area — 12 files.

## Decisions (locked during brainstorming)

1. **Scope: the 12 remaining profile/info files** — 4 profile screens, 4 info screens, 3 profile components, 1 info component (table below).
2. **Two literals to route** (both precedented): `profile/edit.tsx` `#F0F0F0`→`colors.gray[2]`; `profile/support.tsx` `#6A7282`→`colors.text.secondary`.
3. **`useThemeColors` only where inline color props exist** — `info/size-guide.tsx`, `components/profile/AddressCard.tsx`, and `components/info/InfoScreen.tsx` have 0 inline props → `useStyles()` only (no `useThemeColors` import → no unused-var warning).
4. **Test depth: gates-only** — but `settings.test.tsx` renders `SettingsItem`/`ProfileHeader`; it already has the M3d-3 passthrough `ThemeProvider`, so the suite gate confirms those two components stay green after conversion.
5. **Standard recipe**, no module-level `colors` in this set (verified).

## Scope — the 12 files

**Profile screens** (`app/profile/`, import `'../../src/theme'`):
| File | `colors.` | inline | literal |
|---|---|---|---|
| `change-password.tsx` | 11 | 3 | — |
| `edit.tsx` | 21 | 6 | `#F0F0F0`→`gray[2]` |
| `support.tsx` | 9 | 2 | `#6A7282`→`text.secondary` |
| `wishlist.tsx` | 9 | 2 | — |

**Info screens** (`app/info/`, import `'../../src/theme'`):
| File | `colors.` | inline |
|---|---|---|
| `contact.tsx` | 8 | 4 |
| `index.tsx` | 7 | 2 |
| `size-guide.tsx` | 6 | 0 → `useStyles()` only |
| `faq.tsx` | 4 | 1 |

**Components** (`src/components/{profile,info}/`, import `'../../theme'`):
| File | `colors.` | inline |
|---|---|---|
| `profile/ProfileHeader.tsx` | 8 | 3 |
| `profile/SettingsItem.tsx` | 7 | 1 |
| `profile/AddressCard.tsx` | 9 | 0 → `useStyles()` only |
| `info/InfoScreen.tsx` | 10 | 0 → `useStyles()` only |

## Conversion recipe (per file) — the proven M3d-1..7 recipe

- Replace `const styles = StyleSheet.create({…})` with `const useStyles = makeThemedStyles((colors) => StyleSheet.create({…}))` — body unchanged.
- In each component add `const styles = useStyles();` and `const colors = useThemeColors();` **only where inline color props exist** (see table; the 3 zero-inline files get `useStyles()` only).
- Swap the theme import: remove `colors`, add `makeThemedStyles` (+ `useThemeColors` where needed); keep `spacing`/`typography` as used. Screens import from `'../../src/theme'`; components from `'../../theme'`.
- **Route the 2 literals** per decision 2.
- No module-level `colors` → no parameter refactor.

## Testing — gates-only

- **`npm test`** — the existing **104 tests / 21 suites** stay green. `settings.test.tsx` renders `SettingsItem`/`ProfileHeader` (now themed) under its passthrough `ThemeProvider` — confirm it stays green; if it mocks those components out, the conversion is invisible to it.
- **`npm run type-check`** — **zero new** errors over the 155 baseline.
- **`npm run lint`** — **0 errors** (no new unused-var; the 3 zero-inline files must NOT import `useThemeColors`).
- **Import guard** — none of the 12 files statically import `colors`.
- **Literal guard** — `#F0F0F0`/`#6A7282` gone from the 12 files.
- **Manual** — toggle dark; walk profile (edit, change-password, wishlist, support), the info hub (index, faq, contact, size-guide), and confirm the profile header/avatar, settings rows, address cards flip. Per `docs/superpowers/plans/RUNTIME-VERIFICATION-runbook.md`.

## Scope boundary

**In:** the 12 files (recipe + 2 literals), import + literal guards, status-doc handoff.

**Out (later slices):** `onboarding.tsx`/`splash.tsx` + `AppErrorBoundary`, the shared `components/ui`/`cart`/`navigation`/leftover `components/orders`+`home`, deferred payment-gateway screens, Arabic-font wiring — like-for-like only.

## Risks & notes

- **`settings.test.tsx`** is the only test that touches this slice's output (via `SettingsItem`/`ProfileHeader`); the passthrough `ThemeProvider` (M3d-3) already covers it. If it breaks, the fix is the established mocked-`ThemeContext` → passthrough `ThemeProvider` wrinkle.
- **Gates-only**; manual walkthrough is the appearance check.
- **No new dependencies.**
