# M3d-6 — Orders/Address Detail Dark Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert `app/orders/[id].tsx` and `app/profile/addresses.tsx` to the M3d-1 dynamic palette, mirroring M3d-2's `getOrderStateInfo(state, colors)` refactor for the order-detail screen.

**Architecture:** The proven M3d recipe — wrap `StyleSheet.create` in `makeThemedStyles((colors) => …)`, add `useStyles()` + `useThemeColors()`, drop the static `colors` import — plus, for `[id].tsx`, refactor the module-level `getOrderStateInfo(state)` to take the palette as a parameter (it uses `colors.*` at module scope). Gates-only; no harness change.

**Tech Stack:** React Native / Expo SDK 55, TypeScript, the M3d-1 theme foundation, Jest + RNTL.

**Reference spec:** `docs/superpowers/specs/2026-06-03-mobile-m3d6-orders-address-dark-conversion-design.md`

**Working directory:** all paths relative to `apps/mobile/`. Run gates from inside `apps/mobile` (`npm`, never `pnpm`).

### Import guard (per task + final) — expect NO output
```bash
grep -nE "import \{[^}]*\bcolors\b[^}]*\} from '\.\./\.\./src/theme'" <file>
```

---

## Task 1: Order-detail screen — `app/orders/[id].tsx` (with the `getOrderStateInfo` refactor)

**Files:** Modify `app/orders/[id].tsx`

- [ ] **Step 1:** Apply the recipe:
  - Theme import: `import { colors, spacing, typography } from '../../src/theme';` → `import { spacing, typography, makeThemedStyles, useThemeColors, type ColorPalette } from '../../src/theme';` (keep `spacing`/`typography` as the file uses them; add `type ColorPalette` for the refactor below — matches `(tabs)/orders.tsx`).
  - Module-level `const styles = StyleSheet.create({…})` → `const useStyles = makeThemedStyles((colors) => StyleSheet.create({…}))` (body unchanged).
  - In the component, add `const styles = useStyles();` and `const colors = useThemeColors();` (8 inline color props reference `colors`).
  - **`getOrderStateInfo` refactor** (mirrors `app/(tabs)/orders.tsx`): change the module-level `function getOrderStateInfo(state: string) {` → `function getOrderStateInfo(state: string, colors: ColorPalette) {` (its body's `colors.*` now resolve from the param), and the call site `const stateInfo = getOrderStateInfo(order.state);` → `const stateInfo = getOrderStateInfo(order.state, colors);`.
  - `npx prettier --write "app/orders/[id].tsx"`.
- [ ] **Step 2: Gates**
  - `cd /d/e-commerce-OSCAR/apps/mobile && npm run type-check 2>&1 | grep -c "error TS"` → `155`.
  - Import guard on the file → no output.
  - `cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Suites:"` → 104/21 green.
- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add "app/orders/[id].tsx" && git commit -m "feat(mobile): theme order-detail screen for dark mode incl. getOrderStateInfo (M3d-6)"
```

## Task 2: Address book — `app/profile/addresses.tsx`

**Files:** Modify `app/profile/addresses.tsx`

- [ ] **Step 1:** Apply the recipe (standard): swap the theme import (remove `colors`, add `makeThemedStyles` + `useThemeColors`, keep `spacing`/`typography` as used); wrap the StyleSheet in `makeThemedStyles((colors) => …)`; add `const styles = useStyles();` + `const colors = useThemeColors();` in the component (1 inline color prop). `npx prettier --write "app/profile/addresses.tsx"`.
- [ ] **Step 2: Gates**
  - `cd /d/e-commerce-OSCAR/apps/mobile && npm run type-check 2>&1 | grep -c "error TS"` → `155`.
  - Import guard on the file → no output.
- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add "app/profile/addresses.tsx" && git commit -m "feat(mobile): theme address-book screen for dark mode (M3d-6)"
```

## Task 3: Final verification gates

**Files:** none (verification only).

- [ ] **Step 1: Import guard** (expect NO output):
```bash
cd /d/e-commerce-OSCAR/apps/mobile && grep -rnE "import \{[^}]*\bcolors\b[^}]*\} from '\.\./\.\./src/theme'" "app/orders/[id].tsx" "app/profile/addresses.tsx"
```
- [ ] **Step 2: Type-check** — `cd /d/e-commerce-OSCAR/apps/mobile && npm run type-check 2>&1 | grep -c "error TS"` → exactly `155`.
- [ ] **Step 3: Lint** — `cd /d/e-commerce-OSCAR/apps/mobile && npm run lint 2>&1 | grep -E "problems" | tail -1` → `0 errors` (no new unused-var/import warnings on the 2 files).
- [ ] **Step 4: Full suite** — `cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Test Suites:"` → **104 / 21** green.
- [ ] **Step 5: Manual walkthrough (if a device is available)** — toggle dark; open an order detail (status badge/timeline, totals, address, reorder bar) and the address book (cards, default badge, add/edit form). Confirm everything flips and order-state colors read on dark. No commit — gate.

## Task 4: Update the program status doc

**Files:** Modify `docs/superpowers/mobile-enhancement-status.md`

- [ ] **Step 1:** Under **Done**, add an M3d-6 entry (the 2 files; `getOrderStateInfo` param refactor; gates-only, import guard). Match the M3d-5 entry style.
- [ ] **Step 2:** Update the **M3d** section: add an M3d-6 ✅ DONE sub-bullet, and set **M3d-7 (search — `app/search/*`)** as the new RESUME HERE (both the `### M3d` header and the "Recommended next action").
- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add ../../docs/superpowers/mobile-enhancement-status.md && git commit -m "docs(mobile): mark M3d-6 done; M3d-7 (search) next (status handoff)"
```

---

## Self-Review notes (addressed)

- **Spec coverage:** `[id].tsx` + `getOrderStateInfo` refactor (Task 1), `addresses.tsx` (Task 2), gates incl. import guard (Task 3), status handoff (Task 4). All spec sections map to tasks.
- **`getOrderStateInfo` refactor** is a verbatim copy of the proven M3d-2 change (`(tabs)/orders.tsx`): signature gains `colors: ColorPalette`, call site passes `colors` from `useThemeColors()`. Body unchanged.
- **`ColorPalette`** is the existing type re-exported from the theme barrel (used by `(tabs)/orders.tsx`); importing it adds no new tsc error.
- **No literals, no harness change, no new tests** — both screens have no tests; `renderWithProviders` already wraps `ThemeProvider`.
