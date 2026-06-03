# M3d-10 — Shared `components/ui` Dark Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the 15 shared `src/components/ui/` primitives to the M3d-1 dynamic palette (no literals).

**Architecture:** The proven M3d recipe — wrap each `StyleSheet.create` in `makeThemedStyles((colors) => …)`, give EVERY component in the file (exported + internal sub-components) `const styles = useStyles();` and, where it references `colors.*` outside the StyleSheet (inline props OR helper functions like `getLoaderColor`/`getBackgroundColor`), `const colors = useThemeColors();`. Drop the static `colors` import. **tsc (stays 155) + lint (0 errors) self-enforce the per-component hook decision** (missed hook → `colors` undefined → tsc error; unnecessary hook → unused-var lint). Gates-only; the full suite is the load-bearing check (tested screens render these primitives).

**Reference spec:** `docs/superpowers/specs/2026-06-03-mobile-m3d10-ui-components-dark-conversion-design.md`

**Working directory:** all paths relative to `apps/mobile/`. Run gates from inside `apps/mobile` (`npm`, never `pnpm`). All 15 files import the theme from `'../../theme'`.

---

## Shared conversion procedure (every conversion task)

For each file:
1. **Theme import** — remove `colors`; add `makeThemedStyles` and (if ANY component in the file references `colors.*` outside the StyleSheet) `useThemeColors`. Keep `spacing`/`typography` as used.
2. **Wrap the StyleSheet** — `const styles = StyleSheet.create({` → `const useStyles = makeThemedStyles((colors) =>\n  StyleSheet.create({`, trailing `});` → `}),\n);`.
3. **Hooks in EVERY component** (exported + internal sub-components): `const styles = useStyles();`; add `const colors = useThemeColors();` to any component that references `colors.*` outside the StyleSheet (inline `color=` props, or helper functions defined inside it that use `colors`).
4. No literals to route.
5. `npx prettier --write <file>`.

**Self-check per file (do this — it catches mistakes deterministically):**
- `npm run type-check 2>&1 | grep -c "error TS"` → must be **155**. (A missed hook leaves a `colors` reference undefined → a NEW tsc error above 155.)
- `npm run lint 2>&1 | grep -i "<File>"` → no NEW unused-var (an unnecessary `useThemeColors`/`colors` → unused-var warning).

### Import guard (per task + final) — expect NO output
```bash
grep -nE "import \{[^}]*\bcolors\b[^}]*\} from '\.\./\.\./theme'" <files>
```

---

## Task 1: Simple + simple-multi-export — Avatar, Divider, Chip, Switch, Card, Loading

**Files:** `src/components/ui/{Avatar,Divider,Chip,Switch,Card,Loading}.tsx`

Per-file: `Avatar`/`Divider`/`Chip`/`Switch` — 1 component, 0 inline → `useStyles()` only. `Card` — 4 exported components → `useStyles()` in EACH, no `useThemeColors` (0 inline). `Loading` — 6 exported components → `useStyles()` in EACH, no `useThemeColors` (0 inline).

- [ ] **Step 1:** Apply the procedure to all six; `npx prettier --write` each.
- [ ] **Step 2: Gates** — `cd /d/e-commerce-OSCAR/apps/mobile && npm run type-check 2>&1 | grep -c "error TS"` → `155`; import guard on the six (empty); `cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Suites:"` → 104/21.
- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add src/components/ui/Avatar.tsx src/components/ui/Divider.tsx src/components/ui/Chip.tsx src/components/ui/Switch.tsx src/components/ui/Card.tsx src/components/ui/Loading.tsx && git commit -m "feat(mobile): theme simple ui primitives (Avatar/Divider/Chip/Switch/Card/Loading) for dark mode (M3d-10)"
```

## Task 2: Multi-export + status — Badge, ErrorState, EmptyState, Modal

**Files:** `src/components/ui/{Badge,ErrorState,EmptyState,Modal}.tsx`

Per-file: `Badge` (2 exports) + `ErrorState` (3 exports) → `useStyles()` in each; add `useThemeColors` to any that reference `colors.*` outside the StyleSheet (check). `EmptyState` (1 inline) → `useStyles()` + `useThemeColors()`. `Modal` (3 components, ≥1 inline) → `useStyles()` in each + `useThemeColors()` where colors is referenced.

- [ ] **Step 1:** Apply the procedure to all four; `npx prettier --write` each.
- [ ] **Step 2: Gates** — `cd /d/e-commerce-OSCAR/apps/mobile && npm run type-check 2>&1 | grep -c "error TS"` → `155`; import guard (empty); lint check for new unused-var on these four; `cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Suites:"` → 104/21.
- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add src/components/ui/Badge.tsx src/components/ui/ErrorState.tsx src/components/ui/EmptyState.tsx src/components/ui/Modal.tsx && git commit -m "feat(mobile): theme ui badge/error/empty/modal for dark mode (M3d-10)"
```

## Task 3: Form controls + Toast — Button, Input, Checkbox, Select, Toast

**Files:** `src/components/ui/{Button,Input,Checkbox,Select,Toast}.tsx`

Per-file:
- `Button` — `getLoaderColor()` (defined in the component) uses `colors` → add `useThemeColors()` even though there's no direct inline `color={colors.…}`.
- `Input` (1 inline), `Checkbox` (1 inline), `Select` (4 inline, the largest — 27 `colors.` uses) → `useStyles()` + `useThemeColors()`.
- `Toast` — has an **internal `ToastItem`** component that uses `styles.*` and `getBackgroundColor()`/`getIcon()` (which return `colors.*`) → `ToastItem` gets its OWN `const styles = useStyles();` + `const colors = useThemeColors();`. `ToastProvider` uses `styles.*` → `const styles = useStyles();` (add `useThemeColors` only if it references `colors.*` directly). **Preserve the M3b haptic calls** in `show` (`haptics.success/error/warning`).

- [ ] **Step 1:** Apply the procedure to all five; `npx prettier --write` each.
- [ ] **Step 2: Gates** — `cd /d/e-commerce-OSCAR/apps/mobile && npm run type-check 2>&1 | grep -c "error TS"` → `155`; import guard (empty); `cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Suites:"` → 104/21 (this batch includes `Button`, rendered by `product-detail.test`); lint check (no new warnings).
- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add src/components/ui/Button.tsx src/components/ui/Input.tsx src/components/ui/Checkbox.tsx src/components/ui/Select.tsx src/components/ui/Toast.tsx && git commit -m "feat(mobile): theme ui form controls + Toast for dark mode (M3d-10)"
```

## Task 4: Final verification gates

**Files:** none.

- [ ] **Step 1: Global import guard** (expect empty):
```bash
cd /d/e-commerce-OSCAR/apps/mobile && grep -rnE "import \{[^}]*\bcolors\b[^}]*\} from '\.\./\.\./theme'" src/components/ui/Avatar.tsx src/components/ui/Badge.tsx src/components/ui/Button.tsx src/components/ui/Card.tsx src/components/ui/Checkbox.tsx src/components/ui/Chip.tsx src/components/ui/Divider.tsx src/components/ui/EmptyState.tsx src/components/ui/ErrorState.tsx src/components/ui/Input.tsx src/components/ui/Loading.tsx src/components/ui/Modal.tsx src/components/ui/Select.tsx src/components/ui/Switch.tsx src/components/ui/Toast.tsx
```
- [ ] **Step 2: Type-check** — `cd /d/e-commerce-OSCAR/apps/mobile && npm run type-check 2>&1 | grep -c "error TS"` → exactly `155`.
- [ ] **Step 3: Lint** — `cd /d/e-commerce-OSCAR/apps/mobile && npm run lint 2>&1 | grep -E "problems" | tail -1` → `0 errors`.
- [ ] **Step 4: Full suite** — `cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Test Suites:"` → **104 / 21**.
- [ ] **Step 5: Manual (if a device)** — toggle dark; exercise buttons/inputs/select/checkbox/switch, cards, badges/chips, modals, success+error toasts, loading/empty/error states. Confirm everything flips. No commit — gate.

## Task 5: Update the program status doc

**Files:** Modify `docs/superpowers/mobile-enhancement-status.md`

- [ ] **Step 1:** Under **Done**, add an M3d-10 entry (15 ui primitives; per-component hooks incl. `Toast`'s `ToastItem` + helper-function color usage like `Button.getLoaderColor`; gates-only). Match the M3d-9 style.
- [ ] **Step 2:** Update the **M3d** section: add an M3d-10 ✅ DONE sub-bullet, set **M3d-11 (`components/cart` 5 + `components/navigation` 2 + leftover `components/orders`/`home` — the final conversion batch)** as the new RESUME HERE.
- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add ../../docs/superpowers/mobile-enhancement-status.md && git commit -m "docs(mobile): mark M3d-10 done; M3d-11 (cart/nav) next (status handoff)"
```

---

## Self-Review notes (addressed)

- **Spec coverage:** simple+multi-export (Task 1), multi-export+status (Task 2), form controls+Toast (Task 3), gates incl. import guard (Task 4), status handoff (Task 5). All 15 files map to a task.
- **Per-component hooks** are emphasized for every multi-component file (`Card`/`Loading`/`Badge`/`ErrorState`/`Modal` + `Toast`'s `ToastItem`).
- **Helper-function color usage** (`Button.getLoaderColor`, `Toast.getBackgroundColor`) is explicitly flagged — these need `useThemeColors` despite no direct inline `color={colors.…}` prop; tsc enforces it.
- **`Toast` M3b haptics** must be preserved (`show` fires `haptics.success/error/warning`).
- **The suite gate runs after each batch** (not just at the end) — these primitives are rendered by `product-detail`/`settings` tests, so a missing-provider/missing-hook break surfaces immediately.
