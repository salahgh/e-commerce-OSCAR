# M3d-5 — Auth Screens Dark Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the 8 `app/(auth)/*` files to the M3d-1 dynamic palette, routing 6 hardcoded hex literals to palette tokens.

**Architecture:** Apply the proven M3d-1..4 recipe per file — wrap `StyleSheet.create({…})` in `makeThemedStyles((colors) => …)`, add `useStyles()` + `useThemeColors()` (where inline color props exist), drop the static `colors` import — plus route the literals per the mapping table. Verification is **gates-only** + an import guard + a literal guard. No harness change (no auth tests; `renderWithProviders` already wraps `ThemeProvider`).

**Tech Stack:** React Native / Expo SDK 55, TypeScript, the M3d-1 theme foundation, Jest + RNTL.

**Reference spec:** `docs/superpowers/specs/2026-06-03-mobile-m3d5-auth-dark-conversion-design.md`

**Working directory:** all paths relative to `apps/mobile/`. Run gates from inside `apps/mobile` (`npm`, never `pnpm`).

---

## Shared conversion procedure (every conversion task)

For each target file (all in `app/(auth)/`, importing the theme from `../../src/theme`):
1. **Theme import** — remove `colors`; add `makeThemedStyles` and (if the file has inline `color=`/`tintColor=`/`placeholderTextColor=` props) `useThemeColors`. Keep `spacing`/`typography` as the file uses them.
2. **Add hooks** in each component (and any sub-component) that uses `styles.*` / inline `colors.*`: `const styles = useStyles();` and `const colors = useThemeColors();`.
3. **Wrap the StyleSheet** — `const styles = StyleSheet.create({` → `const useStyles = makeThemedStyles((colors) =>\n  StyleSheet.create({`, trailing `});` → `}),\n);`.
4. **Route the literals** per the table below (each becomes `colors.<token>` — already in `colors` scope inside the factory/component).
5. `npx prettier --write <file>`.

### Literal → token mapping (apply to every occurrence)

| literal | replace with |
|---|---|
| `'#183DE5'` | `colors.info` |
| `'#6A7282'` | `colors.text.secondary` |
| `'#FFE5E5'` | `colors.errorLight` |
| `'#FFCCCC'` | `colors.errorLight` |
| `'#F0F0F0'` | `colors.gray[2]` |
| `'#F9FAFB'` | `colors.gray[1]` |

Leave any `'#000'` shadows / `'#fff'` fixed.

### Guards (per task + final)

- **Import guard** (expect NO output): `grep -nE "import \{[^}]*\bcolors\b[^}]*\} from '\.\./\.\./src/theme'" <file>`
- **Literal guard** (expect NO output): `grep -nE "#183DE5|#6A7282|#FFE5E5|#FFCCCC|#F0F0F0|#F9FAFB" <file>`

---

## Task 1: Literal-routing screens — login, register, verify-phone, register-success

**Files:** `app/(auth)/login.tsx`, `app/(auth)/register.tsx`, `app/(auth)/verify-phone.tsx`, `app/(auth)/register-success.tsx`

- [ ] **Step 1:** Apply the Shared procedure to each, **including the literal mapping** (these four contain the hex literals). New import per file: `import { spacing, typography, makeThemedStyles, useThemeColors } from '../../src/theme';` (keep only the non-`colors` tokens the file uses; all four have inline color props → include `useThemeColors`). `npx prettier --write` each.
- [ ] **Step 2: Gates**
  - `cd /d/e-commerce-OSCAR/apps/mobile && npm run type-check 2>&1 | grep -c "error TS"` → `155`.
  - Import + literal guards on all four (expect no output):
    ```bash
    cd /d/e-commerce-OSCAR/apps/mobile && grep -rnE "import \{[^}]*\bcolors\b[^}]*\} from '\.\./\.\./src/theme'|#183DE5|#6A7282|#FFE5E5|#FFCCCC|#F0F0F0|#F9FAFB" "app/(auth)/login.tsx" "app/(auth)/register.tsx" "app/(auth)/verify-phone.tsx" "app/(auth)/register-success.tsx"
    ```
- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add "app/(auth)/login.tsx" "app/(auth)/register.tsx" "app/(auth)/verify-phone.tsx" "app/(auth)/register-success.tsx" && git commit -m "feat(mobile): theme auth login/register/verify screens for dark mode incl. literals (M3d-5)"
```

## Task 2: Clean screens — forgot-password, verify-email, reset-password, _layout

**Files:** `app/(auth)/forgot-password.tsx`, `app/(auth)/verify-email.tsx`, `app/(auth)/reset-password.tsx`, `app/(auth)/_layout.tsx`

- [ ] **Step 1:** Apply the Shared procedure to each (no literals in these). New import: `import { <spacing/typography as used>, makeThemedStyles, useThemeColors } from '../../src/theme';`. `forgot-password`/`verify-email`/`reset-password` have inline color props → include `useThemeColors`; `_layout.tsx` has 0 inline props → `useStyles()` only, **do not import `useThemeColors`** (avoids an unused-var lint warning). `npx prettier --write` each.
- [ ] **Step 2: Gates**
  - `cd /d/e-commerce-OSCAR/apps/mobile && npm run type-check 2>&1 | grep -c "error TS"` → `155`.
  - Import guard on all four (expect no output):
    ```bash
    cd /d/e-commerce-OSCAR/apps/mobile && grep -rnE "import \{[^}]*\bcolors\b[^}]*\} from '\.\./\.\./src/theme'" "app/(auth)/forgot-password.tsx" "app/(auth)/verify-email.tsx" "app/(auth)/reset-password.tsx" "app/(auth)/_layout.tsx"
    ```
  - `cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Suites:"` → 104/21 green.
- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add "app/(auth)/forgot-password.tsx" "app/(auth)/verify-email.tsx" "app/(auth)/reset-password.tsx" "app/(auth)/_layout.tsx" && git commit -m "feat(mobile): theme remaining auth screens for dark mode (M3d-5)"
```

## Task 3: Final verification gates

**Files:** none (verification only).

- [ ] **Step 1: Global import guard** (expect NO output):
```bash
cd /d/e-commerce-OSCAR/apps/mobile && grep -rnE "import \{[^}]*\bcolors\b[^}]*\} from '\.\./\.\./src/theme'" "app/(auth)/login.tsx" "app/(auth)/register.tsx" "app/(auth)/verify-phone.tsx" "app/(auth)/register-success.tsx" "app/(auth)/forgot-password.tsx" "app/(auth)/verify-email.tsx" "app/(auth)/reset-password.tsx" "app/(auth)/_layout.tsx"
```
- [ ] **Step 2: Global literal guard** (expect NO output):
```bash
cd /d/e-commerce-OSCAR/apps/mobile && grep -rnE "#183DE5|#6A7282|#FFE5E5|#FFCCCC|#F0F0F0|#F9FAFB" "app/(auth)/"
```
- [ ] **Step 3: Type-check** — `cd /d/e-commerce-OSCAR/apps/mobile && npm run type-check 2>&1 | grep -c "error TS"` → exactly `155`.
- [ ] **Step 4: Lint** — `cd /d/e-commerce-OSCAR/apps/mobile && npm run lint 2>&1 | grep -E "problems" | tail -1` → `0 errors`. (Also confirm none of the 8 files added an unused-var/import warning.)
- [ ] **Step 5: Full suite** — `cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Test Suites:"` → **104 / 21** green.
- [ ] **Step 6: Manual walkthrough (if a device is available)** — toggle dark; walk login → register → verify-email → verify-phone → forgot-password → reset-password. Confirm everything flips, the link accent + error tints read on dark, inputs/placeholders are legible, and no light blocks remain. No commit — gate.

## Task 4: Update the program status doc

**Files:** Modify `docs/superpowers/mobile-enhancement-status.md`

- [ ] **Step 1:** Under **Done**, add an M3d-5 entry (8 auth files; the 6 routed literals incl. `#183DE5`→`info`; gates-only, import + literal guards). Match the M3d-4 entry style.
- [ ] **Step 2:** Update the **M3d** section: add an M3d-5 ✅ DONE sub-bullet, and set **M3d-6 (orders/address detail — `app/orders/*`, `app/profile/addresses*`)** as the new RESUME HERE (both the `### M3d` header and the "Recommended next action").
- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add ../../docs/superpowers/mobile-enhancement-status.md && git commit -m "docs(mobile): mark M3d-5 done; M3d-6 (orders/address) next (status handoff)"
```

---

## Self-Review notes (addressed)

- **Spec coverage:** literal-routing screens (Task 1), clean screens + `_layout` (Task 2), gates incl. import + literal guards (Task 3), status handoff (Task 4). All spec sections map to tasks.
- **`_layout.tsx`** has 0 inline color props → `useStyles()` only, no `useThemeColors` import (avoids the M3d-4 ShippingAddressForm unused-import warning).
- **Literal mapping is deterministic** (the table) — every occurrence of each literal maps to the same token; the literal guard proves none remain.
- **All routed tokens are valid `ColorPalette` keys** (`info`, `text.secondary`, `errorLight`, `gray[2]`, `gray[1]`) present in both light and dark palettes.
- **No harness change** — unlike M3d-3, no `renderWithProviders` edit (already done) and no auth tests.
