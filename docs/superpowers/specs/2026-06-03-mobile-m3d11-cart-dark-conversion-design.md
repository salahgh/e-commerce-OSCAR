# M3d-11 — `components/cart` dark conversion (design)

_Date: 2026-06-03. Milestone M3d-11 of the Mobile Enhancement Program — the **final slice** of the M3d screen-by-screen dark sweep. Scope: mobile-only (`apps/mobile`). Builds on the M3d-1 foundation and the M3d-2..10 recipe._

## Problem

After M3d-10 (the 15 shared `components/ui` primitives), the only **live** surface still reading the static light `colors` is the cart feature — 5 components rendered by the cart tab, the mini-cart sheet (`app/_layout.tsx`), and the swipe-to-delete rows. This slice converts them, closing out dark mode for every rendered screen in the app.

A scope sweep (`grep` for static `colors` imports across `src`/`app`) found 18 remaining files. Only **5 are live**; the other 13 are **confirmed dead or deferred** and are excluded (see Scope boundary, with evidence).

## Decisions (locked)

1. **Scope: the 5 live `components/cart` files** — `CartItem`, `CartItemContent`, `CartBadge`, `SwipeableCartItem`, `MiniCartSheet`. The user explicitly chose to **exclude the 8 dead components** (not theme, not delete) — consistent with every prior slice's "exclude dead code" practice.
2. **Per-component hooks** — `CartBadge` (2 exports: `CartBadge`, `TabCartBadge`) and `SwipeableCartItem` (2 exports: `SwipeableCartItem`, `SwipeableCartItemWrapper`) get `const styles = useStyles();` in each component that uses `styles.*`. `SwipeableCartItemWrapper` is a **pure passthrough** (`<GestureHandlerRootView><SwipeableCartItem/></GestureHandlerRootView>` — no `styles.*`/`colors.*`) → **no hooks**.
3. **Wrinkle A — cross-file shared StyleSheet → hook.** `CartItemContent.tsx` exports `cartItemStyles` (a `StyleSheet` whose `container` uses `colors.surface` + `colors.text.primary` shadow), consumed by `CartItem.tsx:39` and `SwipeableCartItem.tsx:84` (`cartItemStyles.container`). To theme it, `cartItemStyles` becomes `makeThemedStyles(...)` exported as **`useCartItemStyles`**; both consumers replace the static import with the hook (`const cartItemStyles = useCartItemStyles();` inside the component) and keep `cartItemStyles.container` unchanged. The cart barrel (`index.ts`) does **not** re-export `cartItemStyles`, so the blast radius is exactly these 3 intra-dir files.
4. **Wrinkle B — themed default prop values.** `CartBadge`'s signature destructures `color = colors.text.primary` and `badgeColor = colors.error`. Parameter defaults execute **before** the body's `useThemeColors()` can run, so they cannot reference the hook's `colors`. Fix (behavior-preserving): rename the params (`color: colorProp`, `badgeColor: badgeColorProp`), drop the inline defaults, and resolve in the body after the hook — `const color = colorProp ?? colors.text.primary;` / `const badgeColor = badgeColorProp ?? colors.error;`. The rest of the component uses `color`/`badgeColor` unchanged.
5. **`getIconSize`/`getBadgeSize` in `CartBadge` return numbers, not colors** — they do **not** trigger `useThemeColors` (unlike `Button.getLoaderColor`).
6. **No hex literals** in any of the 5 files (verified) — nothing to route.
7. **Test depth: gates-only** — no cart unit tests exist; the full suite (104/21) is the safety net (these components aren't rendered by tested screens, so the load-bearing checks here are tsc + lint + the import guard).

## Scope — the 5 files (`src/components/cart/`, import `'../../theme'`)

| File | `colors.` | exports/components | hooks | notes |
|---|---|---|---|---|
| `CartItemContent.tsx` | 13 | 1 (`CartItemContent`) | `useStyles()` + `useThemeColors()` | **defines** `useCartItemStyles` (was exported `cartItemStyles`); 2 local StyleSheets (`cartItemStyles` + `styles`) → 2 `makeThemedStyles`; 3 inline color sites (L44; L80–81 ternary; L91) |
| `CartItem.tsx` | 1 | 1 (`CartItem`) | `useStyles()` + `useThemeColors()` + `useCartItemStyles()` | inline `colors.error` (L52); consumes `cartItemStyles.container` (L39); import is `{ colors, spacing }` (no `typography`) |
| `SwipeableCartItem.tsx` | 4 | 2 (`SwipeableCartItem`, `SwipeableCartItemWrapper`) | `SwipeableCartItem`: `useStyles()` + `useThemeColors()` + `useCartItemStyles()`; **`SwipeableCartItemWrapper`: none** | inline `colors.text.inverse` (L69), `colors.text.tertiary` (L92); consumes `cartItemStyles.container` (L84) |
| `CartBadge.tsx` | 5 | 2 (`CartBadge`, `TabCartBadge`) | `CartBadge`: `useStyles()` + `useThemeColors()` (Wrinkle B); `TabCartBadge`: `useStyles()` (uses `styles.*` only) | themed default props (L26–27); size-helpers are colorless |
| `MiniCartSheet.tsx` | 12 | 1 (`MiniCartSheet`) | `useStyles()` + `useThemeColors()` | inline `colors.text.primary` (L38); standard recipe |

## Conversion recipe (per file) — the proven M3d-1..10 recipe

- Replace `const styles = StyleSheet.create({…})` with `const useStyles = makeThemedStyles((colors) => StyleSheet.create({…}))` — body unchanged. For `CartItemContent`, do this for **both** StyleSheets: the exported `cartItemStyles` → `export const useCartItemStyles = makeThemedStyles((colors) => StyleSheet.create({…}))`, and the local `styles` → `useStyles`.
- In **every** component that uses `styles.*`, add `const styles = useStyles();`. Add `const colors = useThemeColors();` to any component referencing `colors.*` outside the StyleSheet (inline props, **themed default props**). Add `const cartItemStyles = useCartItemStyles();` to the two consumers.
- Swap the theme import: remove `colors`, add `makeThemedStyles` (+ `useThemeColors` where needed); keep `spacing`/`typography` as used. Path `'../../theme'`. In the two consumers, change `import { CartItemContent, cartItemStyles } from './CartItemContent'` → `import { CartItemContent, useCartItemStyles } from './CartItemContent'`.
- No literals to route.
- **Verify each file with tsc (155) + lint (0 errors)** — a missed hook → `colors`/`cartItemStyles` undefined (tsc); an unnecessary hook → unused-var (lint). Wrinkle B is the one case where tsc flags the *defaults* — restructure rather than fight it.

## Testing — gates-only

- **`npm test`** — the existing **104 tests / 21 suites** stay green (no cart-specific tests; this guards against import/compile regressions surfacing through the shared barrels).
- **`npm run type-check`** — **zero new** errors over the 155 baseline (also the missed-hook / broken-`cartItemStyles`-consumer detector).
- **`npm run lint`** — **0 errors** (also the unnecessary-hook detector).
- **Import guard** — none of the 5 files statically imports `colors`; and **no file imports the old `cartItemStyles`** symbol anymore (all use `useCartItemStyles`).
- **Manual** — toggle dark; open the cart tab (item rows, quantity steppers, price/subtotal), swipe a row to reveal delete, open the mini-cart sheet, and check the tab-bar cart badge count. Confirm everything flips. Per `docs/superpowers/plans/RUNTIME-VERIFICATION-runbook.md`.

## Scope boundary

**In:** the 5 live `components/cart` files (recipe; the two wrinkles; per-component hooks; no literals), import guard (incl. the `cartItemStyles`→hook migration), status-doc handoff marking **M3d complete for all live surfaces**.

**Out — 8 confirmed-dead components (excluded, evidence-backed):** their barrels are imported by **no screen** (`grep` for `from '…/components/{orders,navigation}'` returns nothing; the home trio has 0 render sites and was excluded since M3d-2):
- `components/orders/` — `OrderCard`, `OrderStatusBadge`, `OrderTimeline` (orders tab + detail render order UI inline).
- `components/navigation/` — `CustomHeader`, `BackButton` (app uses expo-router native headers).
- `components/home/` — `CategoryScroll`, `HeroBanner`, `ProductSection` (0 render sites; dead since M3d-2).

**Out — 5 deferred payment surfaces (backend-gated):** `app/payment/{cib,baridimob,status}.tsx`, `components/payment/PaymentWebView.tsx`, `components/checkout/PaymentMethodSelector.tsx` — CIB/BaridiMob gateways unimplemented; M1d gated payment "coming soon" (COD-only). These convert alongside the real-gateway work, not now.

**Follow-ups (post-M3d):** Arabic-font wiring (IBM Plex Sans Arabic loaded but not applied to `typography` for `ar`); refine the provisional `darkColors` tints (`secondaryLight`/`secondaryScale`, status `*Scale`); eventual dead-code cleanup decision (theme-or-delete the 8) and the deferred payment dark pass.

## Risks & notes

- **Wrinkle A (cross-file hook)** is the main risk: if a consumer is updated but `CartItemContent` still exports the old static `cartItemStyles` (or vice-versa), tsc breaks — so convert `CartItemContent` and both consumers in **one commit**, `CartItemContent` first. Ordering within the task matters; the end state is internally consistent.
- **Wrinkle B (themed defaults)** must preserve the "caller-passed value wins, else theme default" semantics — the `?? `fallback does exactly that.
- **`SwipeableCartItemWrapper`** must NOT get hooks (pure passthrough) — adding an unused `useStyles()` is a lint unused-var.
- **Gates-only**; tsc + lint + the import/`cartItemStyles` guards are the load-bearing checks. Manual walkthrough is the appearance check. No new dependencies.
