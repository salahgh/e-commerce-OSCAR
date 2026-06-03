# M3e-1 — UI Primitives Brand-Font Wiring Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the 5 text-bearing `src/components/ui/` primitives to the locale brand fonts via `useAppFont()` — the first and highest-leverage slice of the M3e sweep (these primitives render text on nearly every screen).

**Architecture:** The established `useAppFont()` pattern — `const { fontFamily } = useAppFont();` in each component that renders branded text, then merge `{ fontFamily: fontFamily.<weight> }` onto each `<Text>`, the weight matching the style's **effective** `fontWeight`. StyleSheet definitions (incl. `fontWeight`) stay unchanged. No layout/copy/logic change. **Not self-enforcing** — rely on the per-file coverage heuristic + review.

**Reference spec:** `docs/superpowers/specs/2026-06-03-mobile-m3e-brand-font-application-design.md` (weight→family table, recipe, scope).

**Working directory:** all paths relative to `apps/mobile/`. Run gates from inside `apps/mobile` (`npm`, never `pnpm`). All 5 files import the hook from `'../../hooks/useAppFont'`.

---

## Weight → family quick table

| effective `fontWeight` | apply |
|---|---|
| `400`/regular | `fontFamily.regular` |
| `500`/medium | `fontFamily.medium` |
| `600`/semiBold | `fontFamily.semiBold` |
| `700`/bold | `fontFamily.bold` |

Read each `<Text>`'s style: the final `fontWeight` after any `{ ...typography.styles.X, fontWeight: ... }` override decides the family. These files were just dark-converted (M3d-10), so they already have `const styles = useStyles();` per component — add `useAppFont()` alongside.

## Task 1: Wire the 5 UI primitives

**Files (all `src/components/ui/`):** `Button.tsx`, `Chip.tsx`, `Divider.tsx`, `EmptyState.tsx`, `ErrorState.tsx`

Per file:
- Add `import { useAppFont } from '../../hooks/useAppFont';`
- In **every component that renders a `<Text>`**, add `const { fontFamily } = useAppFont();` and apply the matching family to each branded `<Text>`.
- Per-file notes:
  - **`Button.tsx`** — the label `<Text style={[styles.text, ...]}>`; button text is `typography.styles.button` (semiBold) → `fontFamily.semiBold`. Watch the size variants if they alter weight. Preserve the existing `getTextStyle()`/`getLoaderColor()` and the M3b `haptics.light()`.
  - **`Chip.tsx`** — the chip label `<Text>`; check its effective weight (likely medium or regular) → matching family.
  - **`Divider.tsx`** — only the **optional label** variant renders a `<Text>`; if there is no text branch, this file may need **no** change (then do NOT import `useAppFont` — an unused import is a lint error). Verify before editing.
  - **`EmptyState.tsx`** — title + message `<Text>`s (title likely heading weight, message body) → matching families.
  - **`ErrorState.tsx`** — **3 components**; wire each one that renders text (title/message/retry-label), each gets its own `const { fontFamily } = useAppFont();`.
- Wrap any bare `style={styles.x}` on a branded `<Text>` into `style={[styles.x, { fontFamily: fontFamily.<weight> }]}`.
- `npx prettier --write` each.

- [ ] **Step 1:** Apply the recipe to all five (skip `Divider` if it renders no text). Prettier each.
- [ ] **Step 2: Gates**
  - `cd /d/e-commerce-OSCAR/apps/mobile && npm run type-check 2>&1 | grep -c "error TS"` → **155**.
  - Coverage heuristic (per file: `fontFamily` count should be ≥ the number of branded `<Text>`): `cd /d/e-commerce-OSCAR/apps/mobile && for f in Button Chip Divider EmptyState ErrorState; do echo "$f: Text=$(grep -c "<Text" src/components/ui/$f.tsx) fontFamily=$(grep -c "fontFamily" src/components/ui/$f.tsx)"; done`
  - `cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Suites:"` → 104/21 (`product-detail.test` renders `Button` under providers).
  - Lint (no new unused-var; esp. an unused `useAppFont` in `Divider`): `cd /d/e-commerce-OSCAR/apps/mobile && npm run lint 2>&1 | grep -iE "ui/(Button|Chip|Divider|EmptyState|ErrorState)" || echo "clean"`
- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add src/components/ui/Button.tsx src/components/ui/Chip.tsx src/components/ui/Divider.tsx src/components/ui/EmptyState.tsx src/components/ui/ErrorState.tsx && git commit -m "feat(mobile): wire ui primitives to brand fonts (M3e-1)"
```

## Task 2: Update the program status doc

**Files:** Modify `docs/superpowers/mobile-enhancement-status.md`

- [ ] **Step 1:** Add an **M3e — Brand-font application** subsection (or Done entry) noting the program kickoff and M3e-1 (5 ui primitives wired via `useAppFont`; not self-enforcing; gates + coverage heuristic). Set **M3e-2 (Tabs)** as the next RESUME HERE under M3e.
- [ ] **Step 2: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add ../../docs/superpowers/mobile-enhancement-status.md && git commit -m "docs(mobile): M3e kickoff; M3e-1 (ui fonts) done, M3e-2 (tabs) next"
```

---

## Self-Review notes (addressed)

- **Spec coverage:** the 5 ui primitives (Task 1), gates incl. the coverage heuristic (Task 1 Step 2), status handoff (Task 2). All 5 files map to the task.
- **Divider caveat:** may render no text → no change + no `useAppFont` import (unused-import lint guard). Called out.
- **ErrorState multi-component:** each text-rendering component gets its own `useAppFont()` — called out.
- **Not self-enforcing:** the coverage heuristic + the `product-detail` render test + review are the load-bearing checks; the device walkthrough is the appearance gate.
- **Preserve M3b/M3d work:** `Button`'s haptics + `getLoaderColor`/`getTextStyle` and all `useStyles()`/`useThemeColors()` hooks stay intact (font wiring is additive).
