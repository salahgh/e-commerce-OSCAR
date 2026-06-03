# M3d-9 — Onboarding/Splash/Error-Boundary Dark Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert `app/onboarding.tsx`, `app/splash.tsx`, `src/components/AppErrorBoundary.tsx` to the M3d-1 dynamic palette.

**Architecture:** The proven M3d recipe — wrap `StyleSheet.create` in `makeThemedStyles((colors) => …)`, add `useStyles()` (+ `useThemeColors()` only for `onboarding`, the one file with an inline color prop), drop the static `colors` import. The `#2C3E50` onboarding slide-background literal is kept fixed (decorative). Gates-only; no harness change.

**Reference spec:** `docs/superpowers/specs/2026-06-03-mobile-m3d9-onboarding-splash-dark-conversion-design.md`

**Working directory:** all paths relative to `apps/mobile/`. Run gates from inside `apps/mobile` (`npm`, never `pnpm`).

---

## Task 1: Convert the 3 files

**Files:** `app/onboarding.tsx`, `app/splash.tsx`, `src/components/AppErrorBoundary.tsx`

Per-file recipe (remove `colors`, add `makeThemedStyles` + `useThemeColors` where noted, wrap the StyleSheet, `prettier --write`):

| File | import | hooks |
|---|---|---|
| `app/onboarding.tsx` | `{ spacing, typography, makeThemedStyles, useThemeColors } from '../src/theme'` | `useStyles()` + `useThemeColors()` (1 inline prop). **Keep `'#2C3E50'` slide bg as-is.** |
| `app/splash.tsx` | `{ spacing, typography, makeThemedStyles } from '../src/theme'` | `useStyles()` only (0 inline) |
| `src/components/AppErrorBoundary.tsx` | `{ spacing, typography, makeThemedStyles } from '../theme'` | `useStyles()` only (0 inline) |

- [ ] **Step 1:** Apply the recipe to all three (`splash`/`AppErrorBoundary` get `useStyles()` only — do NOT import `useThemeColors` for them). Keep `'#2C3E50'` in `onboarding.tsx`. `npx prettier --write` each.
- [ ] **Step 2: Gates**
  - `cd /d/e-commerce-OSCAR/apps/mobile && npm run type-check 2>&1 | grep -c "error TS"` → `155`.
  - Import guards (mixed paths; expect empty):
    ```bash
    cd /d/e-commerce-OSCAR/apps/mobile && grep -nE "import \{[^}]*\bcolors\b[^}]*\} from '\.\./src/theme'" "app/onboarding.tsx" "app/splash.tsx"; grep -nE "import \{[^}]*\bcolors\b[^}]*\} from '\.\./theme'" src/components/AppErrorBoundary.tsx
    ```
  - `cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Suites:"` → 104/21.
  - Lint on the 3 files (no new unused-var; esp. splash/AppErrorBoundary): `cd /d/e-commerce-OSCAR/apps/mobile && npm run lint 2>&1 | grep -iE "onboarding|splash|AppErrorBoundary" || echo "clean"`
- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add "app/onboarding.tsx" "app/splash.tsx" src/components/AppErrorBoundary.tsx && git commit -m "feat(mobile): theme onboarding/splash/error-boundary for dark mode (M3d-9)"
```

## Task 2: Final verification gates

**Files:** none.

- [ ] **Step 1: Import guard** (expect empty):
```bash
cd /d/e-commerce-OSCAR/apps/mobile && grep -nE "import \{[^}]*\bcolors\b[^}]*\} from '\.\./src/theme'" "app/onboarding.tsx" "app/splash.tsx"; grep -nE "import \{[^}]*\bcolors\b[^}]*\} from '\.\./theme'" src/components/AppErrorBoundary.tsx
```
- [ ] **Step 2: `#2C3E50` still present (kept):** `cd /d/e-commerce-OSCAR/apps/mobile && grep -c "#2C3E50" "app/onboarding.tsx"` → `1`.
- [ ] **Step 3: Type-check** — `cd /d/e-commerce-OSCAR/apps/mobile && npm run type-check 2>&1 | grep -c "error TS"` → exactly `155`.
- [ ] **Step 4: Lint** — `cd /d/e-commerce-OSCAR/apps/mobile && npm run lint 2>&1 | grep -E "problems" | tail -1` → `0 errors`.
- [ ] **Step 5: Full suite** — `cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Test Suites:"` → **104 / 21**.
- [ ] **Step 6: Manual (if a device)** — toggle dark; onboarding slides + dots/text, splash, and trigger an error for the boundary. Confirm flips; `#2C3E50` slide keeps its brand color. No commit — gate.

## Task 3: Update the program status doc

**Files:** Modify `docs/superpowers/mobile-enhancement-status.md`

- [ ] **Step 1:** Under **Done**, add an M3d-9 entry (3 files; `#2C3E50` kept; AppErrorBoundary is a function component; gates-only). Match the M3d-8 entry style.
- [ ] **Step 2:** Update the **M3d** section: add an M3d-9 ✅ DONE sub-bullet, set **M3d-10 (shared `components/ui` — 15 files)** as the new RESUME HERE.
- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add ../../docs/superpowers/mobile-enhancement-status.md && git commit -m "docs(mobile): mark M3d-9 done; M3d-10 (components/ui) next (status handoff)"
```

---

## Self-Review notes (addressed)

- **Spec coverage:** the 3-file conversion (Task 1), gates incl. mixed-path import guard + `#2C3E50`-kept check (Task 2), status handoff (Task 3).
- **Mixed import paths** (onboarding/splash `'../src/theme'`, AppErrorBoundary `'../theme'`) are called out per file and in the guard.
- **2 zero-inline files** (`splash`, `AppErrorBoundary`) get `useStyles()` only — no `useThemeColors` import (avoids unused-var).
- **`#2C3E50` kept** — a `grep -c` check (expect 1) guards against accidental routing/removal.
- **AppErrorBoundary is a function component** — the hook recipe is valid (no class wrapper needed).
