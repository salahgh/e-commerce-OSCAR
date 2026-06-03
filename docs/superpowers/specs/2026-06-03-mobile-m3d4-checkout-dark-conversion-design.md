# M3d-4 — Checkout flow dark conversion (design)

_Date: 2026-06-03. Milestone M3d-4 of the Mobile Enhancement Program (fourth slice of the M3d screen-by-screen dark sweep). Scope: mobile-only (`apps/mobile`). Builds on the M3d-1 foundation and the M3d-2/M3d-3 recipe._

## Problem

M3d-1 shipped the dark-mode foundation; M3d-2 converted tabs + home; M3d-3 converted the products feature. The **checkout flow** — the address/shipping/payment/review screen, the order-confirmation screen, and their components — still reads the static light `colors`, so it stays light in dark mode. This slice converts the live checkout area to the dynamic palette.

No new harness work is needed: `renderWithProviders` already wraps `ThemeProvider` (added in M3d-3), and there are **no checkout-specific tests**, so this slice is purely the conversion + gates.

## Decisions (locked during brainstorming)

1. **Scope: the 6 live, colored checkout files** (the two screens + four rendered components). `app/checkout/_layout.tsx` is colorless (excluded).
2. **Exclude the orphaned `PaymentMethodSelector.tsx`** — it carries 17 `colors.` uses but is dead code: M1d replaced it with the inline payment list in `checkout/index.tsx`; it is exported but never rendered. Theming unrendered dead code is wasted effort, and M1d explicitly left it deferred/untouched. (Convert later only if it is ever wired back in.)
3. **Confetti literals stay fixed:** in `confirmation.tsx`, `confettiColors = [colors.primary, colors.success, '#FFD700', '#FF69B4', '#00CED1']` — the `colors.*` entries flow through the conversion; the three decorative hex particles (`#FFD700`/`#FF69B4`/`#00CED1`) are theme-agnostic festive colors and stay fixed (same stance as M3d-2's gold star).
4. **Test depth: gates-only** (carried from M3d-2/3) — no new render tests; rely on `tsc`, `lint`, the full suite staying green, an import guard, and a manual walkthrough.
5. **Standard recipe** — no module-level `colors` in this set (verified: every file's `colors.` use is inside its component), so no `orders.tsx`-style parameter refactor.

## Scope — the 6 live files

| File | `colors.` uses | Notes |
|---|---|---|
| `app/checkout/index.tsx` | 42 | the multi-step checkout; the M1d "coming soon" section + step indicators use inline `color={colors.…}` props |
| `app/checkout/confirmation.tsx` | 16 | order-confirmation success screen; `renderConfetti` references `colors` inside the component (3 fixed hex particles kept) |
| `src/components/checkout/OrderSummary.tsx` | 14 | |
| `src/components/checkout/WilayaPicker.tsx` | 12 | |
| `src/components/checkout/SavedAddressPicker.tsx` | 7 | |
| `src/components/checkout/ShippingAddressForm.tsx` | 2 | |

**Excluded:** `app/checkout/_layout.tsx` (no theme colors), `src/components/checkout/PaymentMethodSelector.tsx` (orphaned dead code — see decision 2).

All six files render inline `color={colors.…}` props in their JSX, so each needs `const colors = useThemeColors();` in its component body (recipe wrinkle 1), in addition to the themed StyleSheet.

## Conversion recipe (per file) — the proven M3d-1/2/3 recipe

- Replace `const styles = StyleSheet.create({…})` with `const useStyles = makeThemedStyles((colors) => StyleSheet.create({…}))` — body unchanged (the factory param is named `colors`).
- In the component body add `const styles = useStyles();`, and `const colors = useThemeColors();` (all six have inline color props).
- Replace the static `import { colors, spacing, typography } from '…/theme'` with `import { spacing, typography } from '…/theme'` + `import { makeThemedStyles, useThemeColors } from '…/theme'` (the M3d-1 barrel re-exports them).
- **Literals:** keep the three confetti hex particles in `confirmation.tsx`; no other themeable literals in this set.
- **No module-level `colors`**, so no parameter refactor.

## Data flow

Unchanged from M3d-1: `ThemeContext.resolved` → `useThemeColors()` → `getPalette(resolved)` → `makeThemedStyles` factory (memoized) → component styles. On toggle, every converted checkout file re-renders with the dark palette.

## Testing — gates-only

- **`npm test`** — the existing **104 tests / 21 suites** stay green (no checkout tests; `renderWithProviders` already provides `ThemeProvider`).
- **`npm run type-check`** — **zero new** errors over the 155 baseline.
- **`npm run lint`** — **0 errors**.
- **Automated guard** — for each of the 6 converted files, assert it no longer statically imports `colors` from the theme barrel (`grep` → expect none).
- **Manual** — toggle dark mode and walk the checkout flow (address form + saved-address picker + wilaya picker, shipping-method step, payment step incl. the "coming soon" section, review + order summary) and the confirmation screen (confetti, order info), confirming everything flips and no hardcoded light blocks remain. Per `docs/superpowers/plans/RUNTIME-VERIFICATION-runbook.md`.

## Scope boundary

**In:** the 6 live files (standard recipe; confetti literals kept), the import guard, the status-doc handoff.

**Out (later slices):** the orphaned `PaymentMethodSelector`, `_layout.tsx` (colorless), auth screens, orders/address-detail, search, remaining `profile/*` + `info/*`, shared `components/ui`/`cart`/`navigation`, Arabic-font wiring, and any redesign — like-for-like palette conversion only.

## Risks & notes

- **Large file (`index.tsx`, 42 uses, ~800 lines):** the conversion is mechanical (StyleSheet wrap + one `useThemeColors()` + import swap), but the file is big — convert carefully and lean on `tsc` + the import guard.
- **Gates-only:** the manual walkthrough is the real appearance check; `tsc` + the import guard cover the mechanical wiring. There are no checkout render tests to guard a missing provider, but every checkout screen renders under the app's `ThemeProvider` at runtime.
- **No new dependencies**; like-for-like conversion.
