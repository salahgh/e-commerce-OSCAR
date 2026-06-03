# M3d-7 — Search Screen Dark Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert `app/search.tsx` to the M3d-1 dynamic palette (standard recipe, single file).

**Architecture:** The proven M3d recipe — wrap `StyleSheet.create` in `makeThemedStyles((colors) => …)`, add `useStyles()` + `useThemeColors()`, drop the static `colors` import. Note the single-`../` import path (root-level file). Gates-only.

**Reference spec:** `docs/superpowers/specs/2026-06-03-mobile-m3d7-search-dark-conversion-design.md`

**Working directory:** all paths relative to `apps/mobile/`. Run gates from inside `apps/mobile` (`npm`, never `pnpm`).

---

## Task 1: Search screen — `app/search.tsx`

**Files:** Modify `app/search.tsx`

- [ ] **Step 1:** Apply the recipe:
  - Theme import: `import { colors, spacing, typography } from '../src/theme';` → `import { spacing, typography, makeThemedStyles, useThemeColors } from '../src/theme';` (single `../`; keep `spacing`/`typography` as used).
  - Wrap `const styles = StyleSheet.create({…})` → `const useStyles = makeThemedStyles((colors) => StyleSheet.create({…}))` (body unchanged).
  - In the component, add `const styles = useStyles();` and `const colors = useThemeColors();` (8 inline color props).
  - Confirm the module-level `popularSearches` const has no `colors` reference (expected none; if it does, refactor per M3d-2's module-level pattern and report).
  - `npx prettier --write "app/search.tsx"`.
- [ ] **Step 2: Gates**
  - `cd /d/e-commerce-OSCAR/apps/mobile && npm run type-check 2>&1 | grep -c "error TS"` → `155`.
  - Import guard (note single `../`, expect no output): `cd /d/e-commerce-OSCAR/apps/mobile && grep -nE "import \{[^}]*\bcolors\b[^}]*\} from '\.\./src/theme'" "app/search.tsx"`
  - `cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Suites:"` → 104/21 green.
- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add "app/search.tsx" && git commit -m "feat(mobile): theme search screen for dark mode (M3d-7)"
```

## Task 2: Final verification gates

**Files:** none (verification only).

- [ ] **Step 1: Import guard** (expect no output): `cd /d/e-commerce-OSCAR/apps/mobile && grep -nE "import \{[^}]*\bcolors\b[^}]*\} from '\.\./src/theme'" "app/search.tsx"`
- [ ] **Step 2: Type-check** — `cd /d/e-commerce-OSCAR/apps/mobile && npm run type-check 2>&1 | grep -c "error TS"` → exactly `155`.
- [ ] **Step 3: Lint** — `cd /d/e-commerce-OSCAR/apps/mobile && npm run lint 2>&1 | grep -E "problems" | tail -1` → `0 errors` (no new warning on `search.tsx`).
- [ ] **Step 4: Full suite** — `cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Test Suites:"` → **104 / 21** green.
- [ ] **Step 5: Manual walkthrough (if a device)** — toggle dark; open search, type a query, view results + recent/popular chips + empty state. Confirm everything flips. No commit — gate.

## Task 3: Update the program status doc

**Files:** Modify `docs/superpowers/mobile-enhancement-status.md`

- [ ] **Step 1:** Under **Done**, add an M3d-7 entry (`app/search.tsx`; standard recipe; gates-only). Match the M3d-6 entry style.
- [ ] **Step 2:** Update the **M3d** section: add an M3d-7 ✅ DONE sub-bullet, and set **M3d-8 (remaining `profile/*` + `info/*` screens)** as the new RESUME HERE (both the `### M3d` header and the "Recommended next action").
- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add ../../docs/superpowers/mobile-enhancement-status.md && git commit -m "docs(mobile): mark M3d-7 done; M3d-8 (profile/info) next (status handoff)"
```

---

## Self-Review notes (addressed)

- **Spec coverage:** `search.tsx` conversion (Task 1), gates incl. import guard (Task 2), status handoff (Task 3). All spec sections map to tasks.
- **Single-`../` path** is called out explicitly (the import line and the guard use `'../src/theme'`, not `'../../src/theme'`).
- **No literals, no harness change, no new tests** — `search.tsx` has no test; `renderWithProviders` already wraps `ThemeProvider`.
- **`popularSearches`** verified-colorless step guards against a hidden module-level `colors` use.
