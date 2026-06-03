# M3d-11 — `components/cart` Dark Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the 5 live `src/components/cart/` components to the M3d-1 dynamic palette — the final live surface of the M3d dark sweep.

**Architecture:** The proven M3d recipe — wrap each `StyleSheet.create` in `makeThemedStyles((colors) => …)`, give every component that uses `styles.*` a `const styles = useStyles();` and every one referencing `colors.*` outside the StyleSheet a `const colors = useThemeColors();`. Two wrinkles: (A) `CartItemContent`'s **exported** `cartItemStyles` StyleSheet becomes an exported `useCartItemStyles` hook, and its two consumers (`CartItem`, `SwipeableCartItem`) call the hook; (B) `CartBadge`'s **themed default prop values** move from the destructuring into the body after `useThemeColors()`. tsc (stays 155) + lint (0 errors) self-enforce the per-component decision. Gates-only.

**Reference spec:** `docs/superpowers/specs/2026-06-03-mobile-m3d11-cart-dark-conversion-design.md`

**Working directory:** all paths relative to `apps/mobile/`. Run gates from inside `apps/mobile` (`npm`, never `pnpm`). All 5 files import the theme from `'../../theme'`.

---

## Shared conversion procedure (every conversion task)

For each file:
1. **Theme import** — remove `colors`; add `makeThemedStyles` and (if any component references `colors.*` outside the StyleSheet) `useThemeColors`. Keep `spacing`/`typography` as used.
2. **Wrap the StyleSheet** — `const styles = StyleSheet.create({` → `const useStyles = makeThemedStyles((colors) =>\n  StyleSheet.create({`, trailing `});` → `}),\n);`. Body unchanged.
3. **Hooks in every component** (exported + internal): `const styles = useStyles();`; add `const colors = useThemeColors();` to any component that references `colors.*` outside the StyleSheet.
4. No literals to route.
5. `npx prettier --write <file>`.

**Self-check per file:** `npm run type-check 2>&1 | grep -c "error TS"` → **155**; `npm run lint 2>&1 | grep -i "<File>"` → no new unused-var.

### Import guard (per task + final) — expect NO output
```bash
grep -nE "import \{[^}]*\bcolors\b[^}]*\} from '\.\./\.\./theme'" <files>
```

---

## Task 1: The `cartItemStyles` cluster — CartItemContent + CartItem + SwipeableCartItem

**Files:**
- Modify: `src/components/cart/CartItemContent.tsx`
- Modify: `src/components/cart/CartItem.tsx`
- Modify: `src/components/cart/SwipeableCartItem.tsx`

**Why together:** `CartItemContent` exports `cartItemStyles`, consumed by the other two. Converting it to a hook requires updating both consumers in the **same commit** to avoid a broken intermediate. Do `CartItemContent` first.

### `CartItemContent.tsx` (do first)
- Import: `import { spacing, typography, makeThemedStyles, useThemeColors } from '../../theme';`
- **Both** StyleSheets become themed:
  - The exported one: `export const cartItemStyles = StyleSheet.create({…})` → `export const useCartItemStyles = makeThemedStyles((colors) => StyleSheet.create({…}));` (the `container` body — `backgroundColor: colors.surface`, `shadowColor: colors.text.primary` — unchanged).
  - The local one: `const styles = StyleSheet.create({…})` → `const useStyles = makeThemedStyles((colors) => StyleSheet.create({…}));`.
- In `CartItemContent`: add `const styles = useStyles();` and `const colors = useThemeColors();` (3 inline color sites: L44 `colors.text.tertiary`, the L80–81 ternary `colors.text.tertiary`/`colors.primary`, L91 `colors.primary`). It does **not** call `useCartItemStyles` itself.

### `CartItem.tsx`
- Import: change `import { CartItemContent, cartItemStyles } from './CartItemContent';` → `import { CartItemContent, useCartItemStyles } from './CartItemContent';`
- Theme import: `import { spacing, makeThemedStyles, useThemeColors } from '../../theme';` (no `typography` — it wasn't imported before).
- Wrap this file's own `styles` StyleSheet in `makeThemedStyles`.
- In `CartItem`: add `const styles = useStyles();`, `const colors = useThemeColors();` (inline `colors.error` at L52), and `const cartItemStyles = useCartItemStyles();` (used at L39 `cartItemStyles.container`). Keep `cartItemStyles.container` unchanged.

### `SwipeableCartItem.tsx`
- Import: change `import { CartItemContent, cartItemStyles } from './CartItemContent';` → `import { CartItemContent, useCartItemStyles } from './CartItemContent';`
- Theme import: `import { spacing, typography, makeThemedStyles, useThemeColors } from '../../theme';`
- Wrap this file's own `styles` StyleSheet in `makeThemedStyles`.
- In `SwipeableCartItem` (the first export): add `const styles = useStyles();`, `const colors = useThemeColors();` (inline `colors.text.inverse` L69, `colors.text.tertiary` L92), and `const cartItemStyles = useCartItemStyles();` (used at L84). 
- **`SwipeableCartItemWrapper`** (the second export) is a pure passthrough — **do NOT add any hooks** (it uses neither `styles.*` nor `colors.*`; an unused `useStyles()` is a lint error).

- [ ] **Step 1:** Convert `CartItemContent.tsx` first, then `CartItem.tsx` and `SwipeableCartItem.tsx`. `npx prettier --write` each.
- [ ] **Step 2: Gates**
  - `cd /d/e-commerce-OSCAR/apps/mobile && npm run type-check 2>&1 | grep -c "error TS"` → `155`.
  - Import guard (empty): `cd /d/e-commerce-OSCAR/apps/mobile && grep -nE "import \{[^}]*\bcolors\b[^}]*\} from '\.\./\.\./theme'" src/components/cart/CartItemContent.tsx src/components/cart/CartItem.tsx src/components/cart/SwipeableCartItem.tsx`
  - Old symbol gone (empty): `cd /d/e-commerce-OSCAR/apps/mobile && grep -rnE "\bcartItemStyles\b" src | grep -v "useCartItemStyles"` → should show only the `const cartItemStyles = useCartItemStyles();` locals and `cartItemStyles.container` usages, **no** `import { … cartItemStyles … }` or `export const cartItemStyles =`.
  - `cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Suites:"` → 104/21.
  - Lint: `cd /d/e-commerce-OSCAR/apps/mobile && npm run lint 2>&1 | grep -iE "cart/(CartItemContent|CartItem|SwipeableCartItem)" || echo "clean"`
- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add src/components/cart/CartItemContent.tsx src/components/cart/CartItem.tsx src/components/cart/SwipeableCartItem.tsx && git commit -m "feat(mobile): theme cart item/content/swipe for dark mode (M3d-11)"
```

## Task 2: CartBadge (themed defaults) + MiniCartSheet

**Files:**
- Modify: `src/components/cart/CartBadge.tsx`
- Modify: `src/components/cart/MiniCartSheet.tsx`

### `CartBadge.tsx` — Wrinkle B
- Import: `import { spacing, typography, makeThemedStyles, useThemeColors } from '../../theme';`
- Wrap the single `styles` StyleSheet in `makeThemedStyles`.
- **`CartBadge`** (L22): the signature currently destructures `color = colors.text.primary` and `badgeColor = colors.error`. Parameter defaults run before hooks — restructure:
  - In the destructuring, rename and drop the themed defaults: `color: colorProp`, `badgeColor: badgeColorProp` (keep any non-themed defaults as-is).
  - In the body, after the hooks: `const color = colorProp ?? colors.text.primary;` and `const badgeColor = badgeColorProp ?? colors.error;`.
  - Add `const styles = useStyles();` and `const colors = useThemeColors();`.
  - The rest of the component references `color`/`badgeColor` unchanged. `getIconSize`/`getBadgeSize` return numbers — leave them.
- **`TabCartBadge`** (L123): uses `styles.*` → add `const styles = useStyles();`. Add `const colors = useThemeColors();` **only if** it references `colors.*` outside the StyleSheet (it likely doesn't — let tsc/lint decide).

### `MiniCartSheet.tsx` — standard recipe
- Import: `import { spacing, typography, makeThemedStyles, useThemeColors } from '../../theme';`
- Wrap the `styles` StyleSheet. In `MiniCartSheet` (a function component): `const styles = useStyles();` + `const colors = useThemeColors();` (inline `colors.text.primary` at L38).

- [ ] **Step 1:** Convert both. `npx prettier --write` each.
- [ ] **Step 2: Gates**
  - `cd /d/e-commerce-OSCAR/apps/mobile && npm run type-check 2>&1 | grep -c "error TS"` → `155`.
  - Import guard (empty): `cd /d/e-commerce-OSCAR/apps/mobile && grep -nE "import \{[^}]*\bcolors\b[^}]*\} from '\.\./\.\./theme'" src/components/cart/CartBadge.tsx src/components/cart/MiniCartSheet.tsx`
  - Behavior check (themed defaults preserved): `cd /d/e-commerce-OSCAR/apps/mobile && grep -nE "colorProp \?\?|badgeColorProp \?\?" src/components/cart/CartBadge.tsx` → 2 lines.
  - `cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Suites:"` → 104/21.
  - Lint: `cd /d/e-commerce-OSCAR/apps/mobile && npm run lint 2>&1 | grep -iE "cart/(CartBadge|MiniCartSheet)" || echo "clean"`
- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add src/components/cart/CartBadge.tsx src/components/cart/MiniCartSheet.tsx && git commit -m "feat(mobile): theme cart badge + mini-cart sheet for dark mode (M3d-11)"
```

## Task 3: Final verification gates

**Files:** none.

- [ ] **Step 1: Global import guard** (expect empty):
```bash
cd /d/e-commerce-OSCAR/apps/mobile && grep -rnE "import \{[^}]*\bcolors\b[^}]*\} from '\.\./\.\./theme'" src/components/cart/
```
- [ ] **Step 2: No stale `cartItemStyles` import/export** (expect empty):
```bash
cd /d/e-commerce-OSCAR/apps/mobile && grep -rnE "(import \{[^}]*\bcartItemStyles\b|export const cartItemStyles =)" src
```
- [ ] **Step 3: Type-check** — `cd /d/e-commerce-OSCAR/apps/mobile && npm run type-check 2>&1 | grep -c "error TS"` → exactly `155`.
- [ ] **Step 4: Lint** — `cd /d/e-commerce-OSCAR/apps/mobile && npm run lint 2>&1 | grep -E "problems" | tail -1` → `0 errors`.
- [ ] **Step 5: Full suite** — `cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Test Suites:"` → **104 / 21**.
- [ ] **Step 6: Manual (if a device)** — toggle dark; cart tab (rows, quantity steppers, price/subtotal), swipe-to-delete, mini-cart sheet, tab-bar cart badge. Confirm flips. No commit — gate.

## Task 4: Update the program status doc

**Files:** Modify `docs/superpowers/mobile-enhancement-status.md`

- [ ] **Step 1:** Under **Done**, add an M3d-11 entry (5 live cart components; the two wrinkles — `cartItemStyles`→`useCartItemStyles` cross-file hook, `CartBadge` themed-default-props; 8 dead + 5 deferred-payment excluded with evidence; gates-only). Match the M3d-10 style.
- [ ] **Step 2:** Update the **M3d** section: add an M3d-11 ✅ DONE sub-bullet; change the header from `(in progress; **M3d-11 = RESUME HERE**)` to note **M3d screen sweep COMPLETE for all live surfaces**, and set the new RESUME HERE to the **post-M3d follow-ups** (Arabic-font wiring; `darkColors` tint refinement; dead-code cleanup decision; deferred payment dark pass).
- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add ../../docs/superpowers/mobile-enhancement-status.md && git commit -m "docs(mobile): mark M3d-11 done; M3d live sweep complete (status handoff)"
```

---

## Self-Review notes (addressed)

- **Spec coverage:** the `cartItemStyles` cluster (Task 1), the themed-defaults + standard pair (Task 2), gates incl. import + `cartItemStyles` guards (Task 3), status handoff marking M3d live-complete (Task 4). All 5 files map to a task.
- **Wrinkle A** (cross-file hook) is contained to Task 1's 3 files, converted in one commit, `CartItemContent` first — no broken intermediate; a dedicated guard confirms the old symbol is gone.
- **Wrinkle B** (themed defaults) has an explicit restructure with a `grep` behavior check (`?? `fallbacks present).
- **`SwipeableCartItemWrapper` gets no hooks** — called out (pure passthrough; an unused hook is a lint error).
- **Type consistency:** the exported hook is named `useCartItemStyles` everywhere (definition + both consumers); local hooks are `useStyles`.
- **The suite gate runs after each task** — cart isn't covered by tested screens, so tsc + lint + the import/`cartItemStyles` guards are the load-bearing checks.
