# M3d-2 — Tabs + Home dark conversion (design)

_Date: 2026-06-03. Milestone M3d-2 of the Mobile Enhancement Program (first slice of the M3d screen-by-screen dark sweep). Scope: mobile-only (`apps/mobile`). Builds on the M3d-1 foundation (`docs/superpowers/specs/2026-06-03-mobile-m3d1-dark-mode-foundation-design.md`)._

## Problem

M3d-1 shipped the dark-mode foundation (`darkColors` palette, `getPalette`, `useThemeColors`, `makeThemedStyles`) and proved it on `app/profile/settings.tsx`. Every other screen still reads the static light `colors` at import time, so toggling dark mode leaves them light. This slice converts the **five bottom-tab screens + the shared tab bar + the home components the home screen renders** — the app's most-visible surface — to the dynamic palette.

A second problem surfaced during scoping: these screens **hardcode light hex values** (`#F9FAFB`, `#1E1E1E`, `#EB3E3E`, `#999`, …) directly in their StyleSheets rather than routing through `colors.*`. Wrapping the StyleSheet alone would leave those literals fixed, so dark mode would look half-broken. The conversion therefore must also route themeable literals through the palette.

## Decisions (locked during brainstorming)

1. **Scope: all 5 tab screens + tab bar + the home components the home screen renders** (the user chose the broad "all 5 tab screens" option). The **3 dead home components** (`CategoryScroll`, `HeroBanner`, `ProductSection` — not imported anywhere) and **`PromoBanner`** (references no theme colors — a pure image banner) are **excluded** (YAGNI; don't theme unrendered or color-free code).
2. **Test depth: gates only** (the user's choice) — no new render tests. Rely on `tsc` (zero new errors), `lint` (0 errors), the existing suite staying green, an automated "no static `colors` import remains" guard, and a manual dark-toggle walkthrough.
3. **Literal routing: hybrid** — route themeable hardcoded literals to the nearest palette token; keep theme-agnostic literals (shadow `#000`) and deliberate fixed accents (gold star `#F2C94C`) as constants.

## Scope — the 10 live files

| File | `colors.*` uses | Conversion notes |
|---|---|---|
| `app/(tabs)/_layout.tsx` | 6 | Tab bar chrome — inline `screenOptions` colors (`tabBarActiveTintColor`, `tabBarInactiveTintColor`, `tabBarStyle.backgroundColor/borderTopColor`) need `useThemeColors()`; badge StyleSheet via `makeThemedStyles`. Always visible. |
| `app/(tabs)/index.tsx` | 4 | Home screen container/dots; inline `RefreshControl` `colors`/`tintColor`. |
| `app/(tabs)/explore.tsx` | 15 | + hardcoded literals (`#F9FAFB`, `#EFEFEF`, `#1E1E1E`, `#999DAF`, `#F0F0F0`). |
| `app/(tabs)/orders.tsx` | 33 | + shadow `#000`. Largest file. |
| `app/(tabs)/cart.tsx` | 32 | + literals (`#F0F0F0`, `#F9FAFB`). |
| `app/(tabs)/profile.tsx` | 13 | + literals (`#EB3E3E` logout, `#F0F0F0`). |
| `src/components/home/CategoryTabs.tsx` | 8 | inline `ActivityIndicator` color. |
| `src/components/home/SearchHeader.tsx` | 3 | inline icon color. |
| `src/components/home/SectionHeader.tsx` | 2 | StyleSheet only. |
| `src/components/home/ProductCardFigma.tsx` | 3 | + literals + **module-level color constants** (`STAR_COLOR`, `STAR_EMPTY_COLOR`, `BORDER_COLOR`). |

## Conversion recipe (per file) — two tiers

### Tier 1 — mechanical (the proven M3d-1 recipe)
- Replace the module-level `const styles = StyleSheet.create({…})` with `const useStyles = makeThemedStyles((colors) => StyleSheet.create({…}))` — the body is unchanged because the factory param is named `colors`.
- In the component body add `const styles = useStyles();` and, where the JSX has inline `color={colors.X}` / `tintColor={colors.X}` / `screenOptions` colors, `const colors = useThemeColors();`.
- Remove the static `import { colors } from '@/src/theme'` (keep `spacing`, `typography`, and now import `makeThemedStyles`, `useThemeColors`).

### Tier 2 — literal routing (makes dark actually work)
Replace themeable hardcoded hex literals with palette tokens:

| Literal | → token | Rationale |
|---|---|---|
| `#1E1E1E` | `colors.primary` | brand near-black (text/border) → flips to `#ECECEC` |
| `#EB3E3E` | `colors.error` | error/destructive (logout, error border) |
| `#B22F2F` | `colors.errorScale[6]` | deep error text |
| `#FFE5E5` | `colors.errorLight` | error tint background → flips to `#3A1717` |
| `#F9FAFB` | `colors.gray[1]` | lightest subtle surface |
| `#F0F0F0` / `#EFEFEF` | `colors.gray[2]` | muted surface |
| `#D1D5DC` | `colors.gray[5]` | borders / empty-star |
| `#999` / `#999DAF` | `colors.text.tertiary` | muted text |
| `#000` (shadowColor) | **left as-is** | shadows are theme-agnostic |
| `#F2C94C` (gold star) | **left as-is** | deliberate fixed accent in both themes |

`ProductCardFigma`'s module-level constants that must flip (`STAR_EMPTY_COLOR` → `colors.gray[5]`, `BORDER_COLOR` → `colors.border`) move **into** the `makeThemedStyles` factory / read from `useThemeColors()` inside the component; the gold `STAR_COLOR` stays a module constant. (If a literal’s nearest token is ambiguous, pick the closest by lightness and note it in the plan — exact picks are finalized there.)

## Data flow

Unchanged from M3d-1: `ThemeContext.resolved` → `useThemeColors()` reads `palettes[resolved]` → `makeThemedStyles` factory memoized on the palette → component styles. On toggle, every converted file re-renders with the new palette. The tab bar (`_layout.tsx`) re-renders too, so the bottom nav flips on every tab.

## Testing — gates only

No new render tests (the `makeThemedStyles` mechanism is already unit-tested in M3d-1; these are mechanical conversions).

- **`npm test`** — the existing **104 tests / 21 suites** stay green (no regressions; e.g. the `ProductCardFigma` accessibility test from M3c must still pass).
- **`npm run type-check`** — **zero new** errors over the 155 baseline (a typo'd token like `colors.gray[9]` fails to compile).
- **`npm run lint`** — **0 errors** (pre-existing warnings only).
- **Automated guard** — for each of the 10 converted files, assert it no longer statically imports `colors` from the theme barrel (`grep` for `import {... colors ...} from '@/src/theme'` / `'../../src/theme'` → expect none). This catches a "forgot to wrap a StyleSheet / left the static import" mistake that `tsc` would otherwise let pass.
- **Manual** — toggle dark mode and walk all five tabs + the home screen, confirming backgrounds/cards/text/borders flip and no hardcoded light blocks remain (per `docs/superpowers/plans/RUNTIME-VERIFICATION-runbook.md`).

## Scope boundary

**In:** the 10 live files (Tier 1 + Tier 2 conversion), the automated import guard, the status-doc handoff update.

**Out (later slices):** dead home components (`CategoryScroll`/`HeroBanner`/`ProductSection`), `PromoBanner`, all non-tab screens (PDP, cart-detail/checkout flow, orders detail, auth, search, address book, etc.), Arabic-font wiring, and any redesign — this is a like-for-like palette conversion only.

## Risks & notes

- **Gates-only means the manual walkthrough is the real correctness check** for Tier 2 literal routing (gray→token picks are judgment calls). The automated import guard + `tsc` cover the mechanical wiring; appearance is verified by toggling.
- **`ProductCardFigma` is shared** (home rows, related products, recently-viewed) and has an existing M3c accessibility test — converting it ripples positively but must keep that test green.
- **Provisional `darkColors` tints** (`secondaryLight`, status `*Scale`) noted in M3d-1 are not exercised by this slice; refine when a screen that uses them is converted.
- **No new dependencies**; like-for-like conversion, so no behavior change beyond theming.
