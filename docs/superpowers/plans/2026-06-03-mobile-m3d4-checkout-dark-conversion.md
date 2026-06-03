# M3d-4 — Checkout Flow Dark Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the live checkout flow — `checkout/index.tsx`, `checkout/confirmation.tsx`, and four checkout components — to the M3d-1 dynamic palette so it follows dark mode.

**Architecture:** Apply the proven M3d-1/2/3 recipe per file — wrap the module-level `StyleSheet.create({…})` in `makeThemedStyles((colors) => …)`, add `const styles = useStyles()` + `const colors = useThemeColors()` (all six files have inline JSX color props), drop the static `colors` import. No literals are routed (the three `confirmation.tsx` confetti hex particles are decorative and stay; `colors.primary`/`colors.success` in that array flow through). Verification is **gates-only**; no harness change is needed (`renderWithProviders` already wraps `ThemeProvider` from M3d-3, and there are no checkout tests).

**Tech Stack:** React Native / Expo SDK 55, TypeScript, the M3d-1 theme foundation (`makeThemedStyles`, `useThemeColors`), Jest + RNTL.

**Reference spec:** `docs/superpowers/specs/2026-06-03-mobile-m3d4-checkout-dark-conversion-design.md`

**Working directory:** all paths relative to `apps/mobile/`. Run gates from inside `apps/mobile` (`npm`, never `pnpm --filter`).

---

## Shared conversion procedure (every conversion task)

For each target file:
1. **Edit the theme import** — remove `colors`; add `makeThemedStyles` and `useThemeColors`. Keep `spacing`/`typography` exactly as the file already imports them. (Screens import from `../../src/theme`; components from `../../theme`.)
2. **Add hooks in the component body** — `const styles = useStyles();` and `const colors = useThemeColors();` (all six files have inline `color=` / `tintColor=` / `placeholderTextColor=` props).
3. **Wrap the StyleSheet** — `const styles = StyleSheet.create({` → `const useStyles = makeThemedStyles((colors) =>\n  StyleSheet.create({`, and the trailing `});` → `}),\n);`. Then `npx prettier --write <file>`.
4. **Literals:** none to route in this slice. In `confirmation.tsx` leave the three confetti particles `'#FFD700'`, `'#FF69B4'`, `'#00CED1'` unchanged.

**Per-file specifics** — all six need `useThemeColors`:

| File | import path | new import | inline props |
|---|---|---|---|
| `app/checkout/index.tsx` | `../../src/theme` | `{ spacing, typography, makeThemedStyles, useThemeColors }` | yes (step indicators, coming-soon section, icons) |
| `app/checkout/confirmation.tsx` | `../../src/theme` | `{ spacing, typography, makeThemedStyles, useThemeColors }` | yes (confetti uses `colors`; status icons) — keep 3 hex particles |
| `src/components/checkout/OrderSummary.tsx` | `../../theme` | `{ spacing, typography, makeThemedStyles, useThemeColors }` | yes |
| `src/components/checkout/WilayaPicker.tsx` | `../../theme` | `{ spacing, typography, makeThemedStyles, useThemeColors }` | yes |
| `src/components/checkout/SavedAddressPicker.tsx` | `../../theme` | `{ spacing, typography, makeThemedStyles, useThemeColors }` | yes |
| `src/components/checkout/ShippingAddressForm.tsx` | `../../theme` | `{ spacing, typography, makeThemedStyles, useThemeColors }` | yes |

> Keep `spacing`/`typography` only if the file actually uses them — match the file's existing non-`colors` theme imports; just swap `colors` out and add `makeThemedStyles` + `useThemeColors`.

### The import guard (every task + final gate)

```bash
grep -nE "import \{[^}]*\bcolors\b[^}]*\} from '(\.\./\.\./src/theme|\.\./\.\./theme)'" <file>
```
Expected: **no output** (`colors` only appears as the `makeThemedStyles` factory param / `useThemeColors()` local).

---

## Task 1: Checkout screen — `app/checkout/index.tsx`

**Files:** Modify `app/checkout/index.tsx`

- [ ] **Step 1:** Apply the Shared procedure. New import: `import { spacing, typography, makeThemedStyles, useThemeColors } from '../../src/theme';`. In `CheckoutScreen`, add `const styles = useStyles();` and `const colors = useThemeColors();` (the step indicator, the M1d coming-soon section, and the empty-cart/icon JSX use inline `color={colors.…}`). Wrap the StyleSheet. `npx prettier --write "app/checkout/index.tsx"`.
- [ ] **Step 2:** `npm run type-check 2>&1 | grep -c "error TS"` → `155`. Import guard on the file → no output.
- [ ] **Step 3:** `npm test 2>&1 | grep -E "Tests:|Suites:"` → 104/21 green.
- [ ] **Step 4: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add "app/checkout/index.tsx" && git commit -m "feat(mobile): theme checkout screen for dark mode (M3d-4)"
```

## Task 2: Confirmation screen — `app/checkout/confirmation.tsx`

**Files:** Modify `app/checkout/confirmation.tsx`

- [ ] **Step 1:** Apply the Shared procedure. New import: `import { spacing, typography, makeThemedStyles, useThemeColors } from '../../src/theme';` (keep only the non-`colors` tokens the file actually uses). Add `const styles = useStyles();` and `const colors = useThemeColors();` in the component (the confetti `renderConfetti` and status icons reference `colors`). **Leave the three confetti hex particles** `'#FFD700'`, `'#FF69B4'`, `'#00CED1'` in the `confettiColors` array unchanged. Wrap the StyleSheet. `npx prettier --write "app/checkout/confirmation.tsx"`.
- [ ] **Step 2:** `npm run type-check 2>&1 | grep -c "error TS"` → `155`. Import guard → no output. Confirm the confetti literals remain: `grep -c "#FFD700" "app/checkout/confirmation.tsx"` → `1`.
- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add "app/checkout/confirmation.tsx" && git commit -m "feat(mobile): theme order-confirmation screen for dark mode (M3d-4)"
```

## Task 3: Checkout components — OrderSummary, WilayaPicker, SavedAddressPicker, ShippingAddressForm

**Files:** Modify `src/components/checkout/OrderSummary.tsx`, `src/components/checkout/WilayaPicker.tsx`, `src/components/checkout/SavedAddressPicker.tsx`, `src/components/checkout/ShippingAddressForm.tsx`

- [ ] **Step 1:** Apply the Shared procedure to each — import `{ <spacing/typography as present>, makeThemedStyles, useThemeColors }` from `../../theme`; add both hooks (all four have inline color props); wrap the StyleSheet; `npx prettier --write` each.
- [ ] **Step 2:** `npm run type-check 2>&1 | grep -c "error TS"` → `155`. Import guard on all four → no output.
- [ ] **Step 3:** `npm test 2>&1 | grep -E "Tests:|Suites:"` → 104/21 green.
- [ ] **Step 4: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add src/components/checkout/OrderSummary.tsx src/components/checkout/WilayaPicker.tsx src/components/checkout/SavedAddressPicker.tsx src/components/checkout/ShippingAddressForm.tsx && git commit -m "feat(mobile): theme checkout components for dark mode (M3d-4)"
```

## Task 4: Final verification gates

**Files:** none (verification only).

- [ ] **Step 1: Global import guard** — confirm none of the 6 converted files still statically import `colors`:
```bash
cd /d/e-commerce-OSCAR/apps/mobile && grep -rnE "import \{[^}]*\bcolors\b[^}]*\} from '(\.\./\.\./src/theme|\.\./\.\./theme)'" "app/checkout/index.tsx" "app/checkout/confirmation.tsx" src/components/checkout/OrderSummary.tsx src/components/checkout/WilayaPicker.tsx src/components/checkout/SavedAddressPicker.tsx src/components/checkout/ShippingAddressForm.tsx
```
Expected: **no output**.
- [ ] **Step 2: Type-check** — `cd /d/e-commerce-OSCAR/apps/mobile && npm run type-check 2>&1 | grep -c "error TS"` → exactly `155`.
- [ ] **Step 3: Lint** — `cd /d/e-commerce-OSCAR/apps/mobile && npm run lint 2>&1 | grep -E "problems" | tail -1` → `0 errors`.
- [ ] **Step 4: Full suite** — `cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Test Suites:"` → **104 tests / 21 suites** green.
- [ ] **Step 5: Manual walkthrough (if a device is available)** — per `docs/superpowers/plans/RUNTIME-VERIFICATION-runbook.md`: toggle dark, walk the checkout (address form + saved-address picker + wilaya picker, shipping-method step, payment step incl. the "coming soon" section, review + order summary) and the confirmation screen (confetti, order info). Confirm everything flips and no hardcoded light blocks remain. No commit — gate.

## Task 5: Update the program status doc

**Files:** Modify `docs/superpowers/mobile-enhancement-status.md`

- [ ] **Step 1:** Under **Done**, add an M3d-4 entry (6 converted files; orphaned `PaymentMethodSelector` + colorless `_layout` excluded; confetti literals kept; gates-only, import guard). Match the M3d-3 entry style.
- [ ] **Step 2:** Update the **M3d** "Next up" section: mark M3d-4 done; set **M3d-5 (auth screens `app/(auth)/*`)** as the new RESUME HERE.
- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add ../../docs/superpowers/mobile-enhancement-status.md && git commit -m "docs(mobile): mark M3d-4 done; M3d-5 (auth) next (status handoff)"
```

---

## Self-Review notes (addressed)

- **Spec coverage:** checkout screen (Task 1), confirmation screen + confetti (Task 2), the four components (Task 3), gates incl. import guard (Task 4), status handoff (Task 5). All spec sections map to tasks.
- **No harness change** — `renderWithProviders` already wraps `ThemeProvider` (M3d-3) and there are no checkout tests, so unlike M3d-3 no Task-1 harness fix is needed.
- **All six files get `useThemeColors`** (each has inline color props) — no unused-`colors` risk.
- **No literals routed** — the only checkout hex literals are the three decorative confetti particles, kept by design (spec decision 3).
- **`PaymentMethodSelector` excluded** (orphaned dead code, spec decision 2) and is NOT in the import-guard list.
- **Token consistency:** all conversions are mechanical (existing `colors.*` keys unchanged); no new palette keys introduced.
