# M3d-5 — Auth screens dark conversion (design)

_Date: 2026-06-03. Milestone M3d-5 of the Mobile Enhancement Program (fifth slice of the M3d screen-by-screen dark sweep). Scope: mobile-only (`apps/mobile`). Builds on the M3d-1 foundation and the M3d-2/3/4 recipe._

## Problem

The `app/(auth)/*` screens (login, register, verification, password reset, etc.) still read the static light `colors`, so they stay light in dark mode. This slice converts the auth area to the dynamic palette — and, unlike M3d-4, routes several **hardcoded hex literals** to palette tokens so they adapt.

No harness work is needed: `renderWithProviders` already wraps `ThemeProvider` and there are **no auth-specific tests**, so this slice is conversion + gates.

## Decisions (locked during brainstorming)

1. **Scope: all 8 `app/(auth)/*` files** — the 7 screens + `_layout.tsx` (which has 2 `colors.` uses).
2. **Route the hardcoded hex literals to palette tokens** (the M3d-2 stance — accept minor light-mode shifts to gain dark adaptivity). Mapping table below.
3. **`#183DE5` (link text color) → `colors.info`.** It is the "Sign in"/"Sign up"/"Forgot password" link color (`color: '#183DE5'`, fontSize 15). Kept fixed it would be near-invisible on the dark `#121212` page (dark blue on near-black). `info` (`#11CAEF`, cyan) is the only blue-ish token and reads on both themes; the light-mode accent shifts blue→cyan. (A dedicated `link` palette token is a deferred refinement.)
4. **Test depth: gates-only** — no new render tests; rely on `tsc`, `lint`, the suite staying green, an import guard, and a "no routed literal remains" check.
5. **Standard recipe**, watching for module-level `colors` (wrinkle 2) per file — auth screens are simple, expected none.

## Scope — the 8 files

| File | `colors.` uses | inline color props | hex literals to route |
|---|---|---|---|
| `app/(auth)/login.tsx` | 17 | 4 | `#183DE5`, `#6A7282`, `#FFE5E5` |
| `app/(auth)/register.tsx` | 23 | 8 | `#183DE5`, `#6A7282`, `#F9FAFB`, `#FFE5E5` |
| `app/(auth)/verify-phone.tsx` | 14 | 3 | `#183DE5`, `#6A7282`, `#F0F0F0`, `#FFCCCC`, `#FFE5E5` |
| `app/(auth)/forgot-password.tsx` | 10 | 2 | — |
| `app/(auth)/register-success.tsx` | 7 | 1 | `#183DE5`, `#6A7282`, `#F0F0F0` |
| `app/(auth)/verify-email.tsx` | 6 | 3 | — |
| `app/(auth)/reset-password.tsx` | 5 | 2 | — |
| `app/(auth)/_layout.tsx` | 2 | 0 | — |

## Literal → token mapping (apply everywhere the literal appears)

| literal | → token | rationale |
|---|---|---|
| `#183DE5` | `colors.info` | link accent; ensures dark contrast (light shifts blue→cyan) — decision 3 |
| `#6A7282` | `colors.text.secondary` | muted/secondary text; flips to white-60% in dark |
| `#FFE5E5` | `colors.errorLight` | pale-red error tint (precedented M3d-2; → dark `#3A1717`) |
| `#FFCCCC` | `colors.errorLight` | pale-red error tint (same family) |
| `#F0F0F0` | `colors.gray[2]` | light gray (precedented M3d-2; `gray[2]` = `#EDEEF2`) |
| `#F9FAFB` | `colors.gray[1]` | near-white (precedented M3d-3; `gray[1]` = `#FAFBFF`) |

`#000` shadows and `#fff` (if any) stay fixed (theme-agnostic).

## Conversion recipe (per file) — the proven M3d-1..4 recipe

- Replace `const styles = StyleSheet.create({…})` with `const useStyles = makeThemedStyles((colors) => StyleSheet.create({…}))` — body unchanged.
- In each component (and any sub-component) using `styles.*`/inline `colors.*`, add `const styles = useStyles();` and `const colors = useThemeColors();` (where inline color props exist).
- Swap the theme import: remove `colors`, add `makeThemedStyles` + `useThemeColors` (keep `spacing`/`typography` as the file uses them). Screens here import from `../../src/theme`.
- **Route the literals** per the mapping table — they become `colors.<token>` and so live inside the StyleSheet factory or the component (already in `colors` scope).
- **No module-level `colors`** expected; if a file uses `colors` at import scope outside a StyleSheet/component, refactor to take the palette as a parameter (M3d-2 `getOrderStateInfo` precedent) and note it.

## Testing — gates-only

- **`npm test`** — the existing **104 tests / 21 suites** stay green (no auth tests; `renderWithProviders` already provides `ThemeProvider`).
- **`npm run type-check`** — **zero new** errors over the 155 baseline.
- **`npm run lint`** — **0 errors**.
- **Import guard** — each converted file no longer statically imports `colors` from the theme barrel.
- **Literal guard** — none of the six routed literals (`#183DE5`, `#6A7282`, `#FFE5E5`, `#FFCCCC`, `#F0F0F0`, `#F9FAFB`) remain in the 8 files.
- **Manual** — toggle dark and walk login → register → verify (email/phone) → forgot/reset password, confirming everything flips, links/inputs/error tints read on dark, and no light blocks remain. Per `docs/superpowers/plans/RUNTIME-VERIFICATION-runbook.md`.

## Scope boundary

**In:** the 8 auth files (recipe + the six literal routes), the import + literal guards, the status-doc handoff.

**Out (later slices):** orders/address detail, search, remaining `profile/*` + `info/*`, shared `components/ui`/`cart`/`navigation`, a dedicated `link` palette token, Arabic-font wiring, and any redesign — like-for-like conversion only.

## Risks & notes

- **`#183DE5`→`info` is a deliberate light-mode hue shift** (blue→cyan) for dark legibility; surfaced here for review. If preserving the exact blue matters, the follow-up is a dedicated `link` token (blue/​light-blue twin) — deferred.
- **Gates-only:** the manual walkthrough is the real appearance check; `tsc` + the import/literal guards cover the mechanical wiring. No auth render tests exist to guard a missing provider, but auth screens render under the app `ThemeProvider` at runtime.
- **No new dependencies.**
