# M3d-8 — Profile + Info Screens Dark Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the 12 remaining `app/profile/*` + `app/info/*` files (screens + components) to the M3d-1 dynamic palette, routing 2 hex literals.

**Architecture:** The proven M3d recipe — wrap `StyleSheet.create` in `makeThemedStyles((colors) => …)`, add `useStyles()` (+ `useThemeColors()` where inline color props exist), drop the static `colors` import — plus route `#F0F0F0`→`gray[2]` and `#6A7282`→`text.secondary`. Gates-only; no harness change (`settings.test` already has a passthrough `ThemeProvider`).

**Reference spec:** `docs/superpowers/specs/2026-06-03-mobile-m3d8-profile-info-dark-conversion-design.md`

**Working directory:** all paths relative to `apps/mobile/`. Run gates from inside `apps/mobile` (`npm`, never `pnpm`).

---

## Shared conversion procedure

For each file:
1. **Theme import** — remove `colors`; add `makeThemedStyles` and (only if the file has inline `color=`/`tintColor=`/`placeholderTextColor=` props) `useThemeColors`. Keep `spacing`/`typography` as used. Screens import from `'../../src/theme'`; components from `'../../theme'`.
2. **Hooks** — `const styles = useStyles();` always; `const colors = useThemeColors();` only where inline color props exist.
3. **Wrap the StyleSheet** — `const styles = StyleSheet.create({` → `const useStyles = makeThemedStyles((colors) =>\n  StyleSheet.create({`, trailing `});` → `}),\n);`.
4. **Route literals** where noted (`#F0F0F0`→`colors.gray[2]`, `#6A7282`→`colors.text.secondary`).
5. `npx prettier --write <file>`.

**`useThemeColors` per file:** YES for all EXCEPT `info/size-guide.tsx`, `components/profile/AddressCard.tsx`, `components/info/InfoScreen.tsx` (0 inline props → `useStyles()` only; do NOT import `useThemeColors`).

### Guards (per task + final)
- Import guard (screens): `grep -nE "import \{[^}]*\bcolors\b[^}]*\} from '\.\./\.\./src/theme'" <file>` → empty.
- Import guard (components): `grep -nE "import \{[^}]*\bcolors\b[^}]*\} from '\.\./\.\./theme'" <file>` → empty.
- Literal guard: `grep -nE "#F0F0F0|#6A7282" <files>` → empty.

---

## Task 1: Profile screens — change-password, edit, support, wishlist

**Files:** `app/profile/change-password.tsx`, `app/profile/edit.tsx`, `app/profile/support.tsx`, `app/profile/wishlist.tsx`

- [ ] **Step 1:** Apply the procedure to each (all four have inline props → include `useThemeColors`). Route literals: `edit.tsx` `#F0F0F0`→`colors.gray[2]`; `support.tsx` `#6A7282`→`colors.text.secondary`. `npx prettier --write` each.
- [ ] **Step 2: Gates** — `cd /d/e-commerce-OSCAR/apps/mobile && npm run type-check 2>&1 | grep -c "error TS"` → `155`; import + literal guards on the four (expect empty):
```bash
cd /d/e-commerce-OSCAR/apps/mobile && grep -rnE "import \{[^}]*\bcolors\b[^}]*\} from '\.\./\.\./src/theme'|#F0F0F0|#6A7282" "app/profile/change-password.tsx" "app/profile/edit.tsx" "app/profile/support.tsx" "app/profile/wishlist.tsx"
```
- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add "app/profile/change-password.tsx" "app/profile/edit.tsx" "app/profile/support.tsx" "app/profile/wishlist.tsx" && git commit -m "feat(mobile): theme profile screens for dark mode incl. literals (M3d-8)"
```

## Task 2: Info screens — contact, index, size-guide, faq

**Files:** `app/info/contact.tsx`, `app/info/index.tsx`, `app/info/size-guide.tsx`, `app/info/faq.tsx`

- [ ] **Step 1:** Apply the procedure. `contact`/`index`/`faq` have inline props → include `useThemeColors`; **`size-guide.tsx` has 0 inline props → `useStyles()` only, no `useThemeColors`**. No literals. `npx prettier --write` each.
- [ ] **Step 2: Gates** — `cd /d/e-commerce-OSCAR/apps/mobile && npm run type-check 2>&1 | grep -c "error TS"` → `155`; import guard on the four (expect empty):
```bash
cd /d/e-commerce-OSCAR/apps/mobile && grep -rnE "import \{[^}]*\bcolors\b[^}]*\} from '\.\./\.\./src/theme'" "app/info/contact.tsx" "app/info/index.tsx" "app/info/size-guide.tsx" "app/info/faq.tsx"
```
- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add "app/info/contact.tsx" "app/info/index.tsx" "app/info/size-guide.tsx" "app/info/faq.tsx" && git commit -m "feat(mobile): theme info screens for dark mode (M3d-8)"
```

## Task 3: Components — ProfileHeader, SettingsItem, AddressCard, InfoScreen

**Files:** `src/components/profile/ProfileHeader.tsx`, `src/components/profile/SettingsItem.tsx`, `src/components/profile/AddressCard.tsx`, `src/components/info/InfoScreen.tsx`

- [ ] **Step 1:** Apply the procedure (import from `'../../theme'`). `ProfileHeader` (3 inline) + `SettingsItem` (1 inline) → include `useThemeColors`; **`AddressCard` (0 inline) + `InfoScreen` (0 inline) → `useStyles()` only, no `useThemeColors`**. No literals. `npx prettier --write` each.
- [ ] **Step 2: Gates**
  - `cd /d/e-commerce-OSCAR/apps/mobile && npm run type-check 2>&1 | grep -c "error TS"` → `155`; import guard (components path) on the four (expect empty):
    ```bash
    cd /d/e-commerce-OSCAR/apps/mobile && grep -rnE "import \{[^}]*\bcolors\b[^}]*\} from '\.\./\.\./theme'" src/components/profile/ProfileHeader.tsx src/components/profile/SettingsItem.tsx src/components/profile/AddressCard.tsx src/components/info/InfoScreen.tsx
    ```
  - **Full suite** (this is where `settings.test` exercises `SettingsItem`/`ProfileHeader`): `cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Suites:"` → 104/21 green. If `settings.test` fails with a missing `ThemeProvider`, add the established passthrough to its `ThemeContext` mock and re-run.
- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add src/components/profile/ProfileHeader.tsx src/components/profile/SettingsItem.tsx src/components/profile/AddressCard.tsx src/components/info/InfoScreen.tsx && git commit -m "feat(mobile): theme profile/info components for dark mode (M3d-8)"
```

## Task 4: Final verification gates

**Files:** none (verification only).

- [ ] **Step 1: Global import guard** (expect empty):
```bash
cd /d/e-commerce-OSCAR/apps/mobile && grep -rnE "import \{[^}]*\bcolors\b[^}]*\} from '(\.\./\.\./src/theme|\.\./\.\./theme)'" "app/profile/change-password.tsx" "app/profile/edit.tsx" "app/profile/support.tsx" "app/profile/wishlist.tsx" "app/info/contact.tsx" "app/info/index.tsx" "app/info/size-guide.tsx" "app/info/faq.tsx" src/components/profile/ProfileHeader.tsx src/components/profile/SettingsItem.tsx src/components/profile/AddressCard.tsx src/components/info/InfoScreen.tsx
```
- [ ] **Step 2: Global literal guard** (expect empty): `cd /d/e-commerce-OSCAR/apps/mobile && grep -rnE "#F0F0F0|#6A7282" app/profile app/info src/components/profile src/components/info`
- [ ] **Step 3: Type-check** — `cd /d/e-commerce-OSCAR/apps/mobile && npm run type-check 2>&1 | grep -c "error TS"` → exactly `155`.
- [ ] **Step 4: Lint** — `cd /d/e-commerce-OSCAR/apps/mobile && npm run lint 2>&1 | grep -E "problems" | tail -1` → `0 errors` (no new unused-var on the 3 zero-inline files).
- [ ] **Step 5: Full suite** — `cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Test Suites:"` → **104 / 21** green.
- [ ] **Step 6: Manual (if a device)** — toggle dark; walk profile (edit/change-password/wishlist/support), info hub (index/faq/contact/size-guide). Confirm flips. No commit — gate.

## Task 5: Update the program status doc

**Files:** Modify `docs/superpowers/mobile-enhancement-status.md`

- [ ] **Step 1:** Under **Done**, add an M3d-8 entry (12 profile/info files; 2 routed literals; gates-only). Match the M3d-7 entry style.
- [ ] **Step 2:** Update the **M3d** section: add an M3d-8 ✅ DONE sub-bullet, and set **M3d-9 (`onboarding.tsx`/`splash` + `AppErrorBoundary`, then the shared `components/ui` batch)** as the new RESUME HERE.
- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add ../../docs/superpowers/mobile-enhancement-status.md && git commit -m "docs(mobile): mark M3d-8 done; M3d-9 (onboarding/ui) next (status handoff)"
```

---

## Self-Review notes (addressed)

- **Spec coverage:** profile screens (Task 1), info screens (Task 2), components (Task 3), gates incl. import + literal guards (Task 4), status handoff (Task 5). All map to tasks.
- **3 zero-inline files** (`size-guide`, `AddressCard`, `InfoScreen`) get `useStyles()` only — explicitly called out to avoid the unused-`useThemeColors` warning.
- **2 literals** both have precedents (`#F0F0F0`→`gray[2]` M3d-2; `#6A7282`→`text.secondary` M3d-5).
- **`settings.test`** exercises `SettingsItem`/`ProfileHeader` — Task 3 Step 2 runs the full suite specifically to catch any provider gap (already covered by the M3d-3 passthrough).
