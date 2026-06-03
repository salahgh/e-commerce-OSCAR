# M3d-10 — Shared `components/ui` dark conversion (design)

_Date: 2026-06-03. Milestone M3d-10 of the Mobile Enhancement Program (tenth slice of the M3d screen-by-screen dark sweep). Scope: mobile-only (`apps/mobile`). Builds on the M3d-1 foundation and the M3d-2..9 recipe._

## Problem

The 15 shared UI primitives in `src/components/ui/` still read the static light `colors`, so every `Button`/`Input`/`Card`/`Modal`/`Badge`/`Toast`/etc. stays light in dark mode — the largest single source of un-themed surface left. This slice converts them all. Highest-impact slice: these primitives are used by nearly every screen, so converting them makes the shared chrome dark-adaptive app-wide.

## Decisions (locked during brainstorming)

1. **Scope: the 15 `components/ui` files** that still import static `colors` (table below). No hex literals in any of them.
2. **Per-component hooks** — several files export/define multiple components (`Badge`×2, `Card`×4, `ErrorState`×3, `Loading`×6, `Modal`×3) and `Toast` has an internal `ToastItem`. **Each component that uses `styles.*` or `colors.*` gets its own `const styles = useStyles();` (+ `useThemeColors()`)** — the M3d-8 `InfoScreen` wrinkle, applied throughout.
3. **`useThemeColors` is needed wherever `colors.*` appears OUTSIDE the StyleSheet factory** — including helper functions defined inside the component (`Button`'s `getLoaderColor`, `Toast`'s `getBackgroundColor`/`getIcon`), not just direct inline `color={colors.…}` props. This is **self-enforcing**: after removing the static `colors` import and wrapping the StyleSheet (whose factory param is `colors`), any `colors.*` outside the factory is an undefined reference → tsc error; adding `useThemeColors()` where it isn't used → a lint unused-var. So **tsc (stays 155) + lint (0 errors) together force the correct per-component decision** — do not guess from the inline-prop count.
4. **Test depth: gates-only** — there are no `components/ui` unit tests, but tested screens (`product-detail.test`, `settings.test`) render these primitives under `renderWithProviders`' `ThemeProvider` (added in M3d-3). **The full-suite gate is the real safety net here** and must stay green after each batch.
5. **No literals, no module-level `colors`** (verified).

## Scope — the 15 files (`src/components/ui/`, import `'../../theme'`)

| File | `colors.` | exports/components | notes |
|---|---|---|---|
| `Avatar.tsx` | 2 | 1 | — |
| `Badge.tsx` | 12 | 2 | each export → hooks |
| `Button.tsx` | 13 | 1 | `getLoaderColor()` uses `colors` → needs `useThemeColors` |
| `Card.tsx` | 2 | 4 | each export → `useStyles()` |
| `Checkbox.tsx` | 12 | 1 | inline color prop |
| `Chip.tsx` | 7 | 1 | — |
| `Divider.tsx` | 2 | 1 | — |
| `EmptyState.tsx` | 3 | 1 | inline color prop |
| `ErrorState.tsx` | 9 | 3 | each export → `useStyles()` |
| `Input.tsx` | 14 | 1 | inline color prop |
| `Loading.tsx` | 7 | 6 | each export → `useStyles()` |
| `Modal.tsx` | 13 | 3 | each export → hooks; inline color prop |
| `Select.tsx` | 27 | 1 | most inline props (largest) |
| `Switch.tsx` | 7 | 1 | — |
| `Toast.tsx` | 9 | 1 export + internal `ToastItem` | `ToastItem` uses `styles.*` + `getBackgroundColor()`/`getIcon()` (colors) → its OWN hooks; `ToastProvider` uses `styles.*` |

## Conversion recipe (per file) — the proven M3d-1..9 recipe

- Replace `const styles = StyleSheet.create({…})` with `const useStyles = makeThemedStyles((colors) => StyleSheet.create({…}))` — body unchanged.
- In **every** component in the file that uses `styles.*`, add `const styles = useStyles();`. Add `const colors = useThemeColors();` to any component that references `colors.*` outside the StyleSheet (inline props, helper functions, computed values).
- Swap the theme import: remove `colors`, add `makeThemedStyles` (+ `useThemeColors` where any component needs it); keep `spacing`/`typography` as used. Path `'../../theme'`.
- No literals to route. No module-level `colors`.
- **Verify each file with tsc (155) + lint (0 errors)** — these catch a missed hook (tsc: `colors` undefined) and an unnecessary one (lint: unused `useThemeColors`/`colors`).

## Testing — gates-only

- **`npm test`** — the existing **104 tests / 21 suites** stay green. This is the key check: `product-detail.test` renders the PDP (which uses `Button`, etc.) and `settings.test` renders the settings screen (which may use `Switch`/`SettingsItem`/etc.) under `renderWithProviders`' `ThemeProvider`. Run the **full suite after each batch**.
- **`npm run type-check`** — **zero new** errors over the 155 baseline (also the missed-hook detector).
- **`npm run lint`** — **0 errors** (also the unnecessary-hook detector).
- **Import guard** — none of the 15 files statically imports `colors`.
- **Manual** — toggle dark; exercise buttons, inputs, the select/checkbox/switch, cards, badges/chips, modals, toasts (success/error), loading/empty/error states. Confirm everything flips. Per `docs/superpowers/plans/RUNTIME-VERIFICATION-runbook.md`.

## Scope boundary

**In:** the 15 `components/ui` files (recipe; per-component hooks; no literals), import guard, status-doc handoff.

**Out (final M3d slice + follow-ups):** `components/cart` (5) + `components/navigation` (2) + leftover `components/orders`/`home`, deferred payment-gateway components, Arabic-font wiring, `darkColors` tint refinement — like-for-like only.

## Risks & notes

- **Multi-component files** (`Loading` has 6, `Card` 4, `Modal`/`ErrorState`/`Badge` multiple, `Toast` + `ToastItem`) are the main risk — a missed `useStyles()`/`useThemeColors()` in any sub-component is caught by tsc (undefined `colors`) or a runtime/render-test failure. The per-component rule + the suite gate cover it.
- **`Select.tsx`** (27 uses, 4 inline) is the largest — convert carefully.
- **Gates-only**; the suite + tsc + lint are unusually load-bearing here (these primitives are everywhere). Manual walkthrough is the appearance check.
- **No new dependencies.**
