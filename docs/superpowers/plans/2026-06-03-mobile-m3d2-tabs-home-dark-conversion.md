# M3d-2 — Tabs + Home Dark Conversion Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Convert the five bottom-tab screens + the shared tab bar + the four home components the home screen renders to the M3d-1 dynamic palette, including routing hardcoded hex literals through the palette, so toggling dark mode darkens the app's primary surface.

**Architecture:** Apply the proven M3d-1 recipe per file — wrap the module-level `StyleSheet.create({…})` in `makeThemedStyles((colors) => …)`, add `const styles = useStyles()` (+ `const colors = useThemeColors()` where the JSX has inline color props), and drop the static `colors` import. Additionally route themeable hardcoded literals (`#1E1E1E`, `#EB3E3E`, `#F9FAFB`, `#999`, …) to palette tokens. Verification is **gates-only** (no new render tests): `tsc` zero-new, `lint` 0, the existing 104 tests stay green, plus an automated "no static `colors` import remains" guard.

**Tech Stack:** React Native 0.83 / Expo SDK 55, TypeScript, the M3d-1 theme foundation (`makeThemedStyles`, `useThemeColors` from `@/src/theme`).

**Reference spec:** `docs/superpowers/specs/2026-06-03-mobile-m3d2-tabs-home-dark-conversion-design.md`

**Working directory:** all paths are relative to `apps/mobile/`. Run gates from inside `apps/mobile` (standalone npm project — `npm`, never `pnpm --filter`).

---

## Shared conversion procedure (applied by every conversion task)

For each target file:

1. **Edit the theme import** — remove `colors`, add `makeThemedStyles` and (only if the file has inline JSX color props) `useThemeColors`. Keep `spacing`/`typography` if present.
2. **Add hooks in the component body** — `const styles = useStyles();`, and `const colors = useThemeColors();` if there are inline `color=` / `tintColor=` / `screenOptions` color props.
3. **Wrap the StyleSheet** — change `const styles = StyleSheet.create({` → `const useStyles = makeThemedStyles((colors) =>\n  StyleSheet.create({` and the trailing `});` → `}),\n);`. (Run `npx prettier --write <file>` after to fix indentation.)
4. **Route literals** — replace themeable hardcoded hex literals per the file's table. Leave `shadowColor: '#000'` and deliberate fixed accents.

### Worked example — `app/(tabs)/_layout.tsx` (this IS Task 1)

Inline `screenOptions` colors and a badge StyleSheet. Before:
```tsx
import { colors, typography } from '@/src/theme';
// …
export default function TabLayout() {
  const { t } = useTranslation();
  const { itemCount } = useCart();
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.text.tertiary,
      headerShown: false,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
    }}>
```
After:
```tsx
import { typography, makeThemedStyles, useThemeColors } from '@/src/theme';
// …
export default function TabLayout() {
  const { t } = useTranslation();
  const { itemCount } = useCart();
  const colors = useThemeColors();
  const styles = useStyles();
  return (
    <Tabs screenOptions={{
      tabBarActiveTintColor: colors.primary,
      tabBarInactiveTintColor: colors.text.tertiary,
      headerShown: false,
      tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
    }}>
```
And the badge StyleSheet at the bottom:
```tsx
const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    badge: { /* …unchanged… backgroundColor: colors.error… */ },
    badgeText: { /* …unchanged… color: colors.white… */ },
  }),
);
```

### The import guard (used in every task + the final gate)

```bash
grep -nE "import \{[^}]*\bcolors\b[^}]*\} from '(@/src/theme|\.\./\.\./src/theme|\.\./\.\./theme)'" <file>
```
Expected: **no output** (the static `colors` import is gone; `colors` now only appears as the `makeThemedStyles` factory parameter / the `useThemeColors()` local).

---

## Task 1: Tab bar — `app/(tabs)/_layout.tsx`

**Files:** Modify `app/(tabs)/_layout.tsx`

- [ ] **Step 1:** Apply the Shared conversion procedure as shown in the worked example above. Import becomes `import { typography, makeThemedStyles, useThemeColors } from '@/src/theme';`. Add `const colors = useThemeColors();` and `const styles = useStyles();`. Wrap the `badge`/`badgeText` StyleSheet in `makeThemedStyles`. No hardcoded literals in this file. `npx prettier --write "app/(tabs)/_layout.tsx"`.
- [ ] **Step 2:** Run `npm run type-check 2>&1 | grep -c "error TS"` → expect `155`. Run the import guard on the file → expect no output.
- [ ] **Step 3:** Commit.
```bash
git add "apps/mobile/app/(tabs)/_layout.tsx"
git commit -m "feat(mobile): theme tab bar for dark mode (M3d-2)"
```

## Task 2: Home screen — `app/(tabs)/index.tsx`

**Files:** Modify `app/(tabs)/index.tsx`

- [ ] **Step 1:** Apply the procedure. Import becomes `import { spacing, makeThemedStyles, useThemeColors } from '@/src/theme';`. Add `const colors = useThemeColors();` (for the inline `RefreshControl` `colors={[colors.primary]}` at ~L195 and `tintColor={colors.primary}` at ~L196) and `const styles = useStyles();` near the top of `HomeScreen`. Wrap the bottom StyleSheet in `makeThemedStyles`. No hardcoded literals. `npx prettier --write "app/(tabs)/index.tsx"`.
- [ ] **Step 2:** `npm run type-check 2>&1 | grep -c "error TS"` → `155`. Import guard → no output.
- [ ] **Step 3:** Commit.
```bash
git add "apps/mobile/app/(tabs)/index.tsx"
git commit -m "feat(mobile): theme home screen for dark mode (M3d-2)"
```

## Task 3: Home leaf components — CategoryTabs, SearchHeader, SectionHeader

**Files:** Modify `src/components/home/CategoryTabs.tsx`, `src/components/home/SearchHeader.tsx`, `src/components/home/SectionHeader.tsx`

- [ ] **Step 1:** For each, import becomes `import { spacing, typography, makeThemedStyles, useThemeColors } from '../../theme';` (all three use `spacing` + `typography`). Add `const styles = useStyles();` in each component. Add `const colors = useThemeColors();` in **CategoryTabs** (inline `ActivityIndicator color={colors.primary}` ~L31) and **SearchHeader** (inline icon `color={colors.text.tertiary}` ~L21); **SectionHeader has no inline color props** → `useThemeColors` import not needed there, so its import is `import { spacing, typography, makeThemedStyles } from '../../theme';`. Wrap each StyleSheet in `makeThemedStyles`. No hardcoded literals in these three. Run `npx prettier --write` on all three.
- [ ] **Step 2:** `npm run type-check 2>&1 | grep -c "error TS"` → `155`. Run the import guard on all three → no output.
- [ ] **Step 3:** Commit.
```bash
git add apps/mobile/src/components/home/CategoryTabs.tsx apps/mobile/src/components/home/SearchHeader.tsx apps/mobile/src/components/home/SectionHeader.tsx
git commit -m "feat(mobile): theme home leaf components for dark mode (M3d-2)"
```

## Task 4: Product card — `src/components/home/ProductCardFigma.tsx`

**Files:** Modify `src/components/home/ProductCardFigma.tsx`

This file has module-level color constants and several hardcoded literals.

- [ ] **Step 1:** Edit the import to `import { spacing, typography, makeThemedStyles, useThemeColors } from '../../theme';`.
- [ ] **Step 2:** Constants: **keep** `const STAR_COLOR = '#F2C94C';` (deliberate gold). **Delete** `STAR_EMPTY_COLOR` and `BORDER_COLOR` (they move into the themed factory / hook).
- [ ] **Step 3:** In the component body add `const styles = useStyles();` and `const colors = useThemeColors();` (the heart icon already uses `colors.text.primary`; the empty star will use the hook). At the star map (~L116) replace `STAR_EMPTY_COLOR` with `colors.gray[5]`:
```tsx
color={star <= Math.round(rating) ? STAR_COLOR : colors.gray[5]}
```
- [ ] **Step 4:** Wrap the StyleSheet in `makeThemedStyles((colors) => StyleSheet.create({ … }))` and route literals:

| Style key | old | new |
|---|---|---|
| `card.borderColor` | `BORDER_COLOR` | `colors.border` |
| `discountBadge.backgroundColor` | `'#FFE5E5'` | `colors.errorLight` |
| `discountBadge.borderColor` | `'#EB3E3E'` | `colors.error` |
| `discountText.color` | `'#B22F2F'` | `colors.errorScale[6]` |
| `heartButton.shadowColor` | `'#000'` | *(leave)* |
| `name.color` | `'#1E1E1E'` | `colors.primary` |
| `reviewCount.color` | `'#1E1E1E'` | `colors.primary` |
| `price.color` | `'#1E1E1E'` | `colors.primary` |
| `originalPrice.color` | `'#999'` | `colors.text.tertiary` |

(`card.backgroundColor` and `heartButton.backgroundColor` are already `colors.surface`.) Run `npx prettier --write "src/components/home/ProductCardFigma.tsx"`.
- [ ] **Step 5:** `npm run type-check 2>&1 | grep -c "error TS"` → `155`. Import guard → no output. Run the M3c accessibility test that renders this card to confirm no regression: `npm test -- ProductCardFigma` → if no dedicated suite matches, run `npm test -- a11y` (the `productAccessibilityLabel` path) → green.
- [ ] **Step 6:** Commit.
```bash
git add apps/mobile/src/components/home/ProductCardFigma.tsx
git commit -m "feat(mobile): theme product card for dark mode incl. literals (M3d-2)"
```

## Task 5: Explore tab — `app/(tabs)/explore.tsx`

**Files:** Modify `app/(tabs)/explore.tsx`

- [ ] **Step 1:** Apply the procedure. Import becomes `import { spacing, typography, makeThemedStyles, useThemeColors } from '../../src/theme';`. Add `const styles = useStyles();` and `const colors = useThemeColors();` (inline `ActivityIndicator`/icon color props at ~L62/L73/L85/L125/L151/L166). Wrap the StyleSheet. Route literals:

| ~Line | old | new |
|---|---|---|
| L202 `backgroundColor` | `'#F9FAFB'` | `colors.gray[1]` |
| L205 `borderColor` | `'#F9FAFB'` | `colors.gray[1]` |
| L230 `backgroundColor` | `'#EFEFEF'` | `colors.gray[2]` |
| L240 `borderLeftColor` | `'#1E1E1E'` | `colors.primary` |
| L244 `color` | `'#999DAF'` | `colors.text.tertiary` |
| L248 `color` | `'#1E1E1E'` | `colors.primary` |
| L262 `borderColor` | `'#F9FAFB'` | `colors.gray[1]` |
| L296 `backgroundColor` | `'#F0F0F0'` | `colors.gray[2]` |

`npx prettier --write "app/(tabs)/explore.tsx"`.
- [ ] **Step 2:** `npm run type-check 2>&1 | grep -c "error TS"` → `155`. Import guard → no output.
- [ ] **Step 3:** Commit.
```bash
git add "apps/mobile/app/(tabs)/explore.tsx"
git commit -m "feat(mobile): theme explore tab for dark mode incl. literals (M3d-2)"
```

## Task 6: Orders tab — `app/(tabs)/orders.tsx`

**Files:** Modify `app/(tabs)/orders.tsx`

- [ ] **Step 1:** Apply the procedure. Import becomes `import { spacing, typography, makeThemedStyles, useThemeColors } from '../../src/theme';`. Add `const styles = useStyles();` and `const colors = useThemeColors();` (inline icon/tintColor props ~L108/L125/L171/L269). Wrap the StyleSheet. The only literal is `shadowColor: '#000'` (~L307) → **leave it**. `npx prettier --write "app/(tabs)/orders.tsx"`.
- [ ] **Step 2:** `npm run type-check 2>&1 | grep -c "error TS"` → `155`. Import guard → no output.
- [ ] **Step 3:** Commit.
```bash
git add "apps/mobile/app/(tabs)/orders.tsx"
git commit -m "feat(mobile): theme orders tab for dark mode (M3d-2)"
```

## Task 7: Cart tab — `app/(tabs)/cart.tsx`

**Files:** Modify `app/(tabs)/cart.tsx`

- [ ] **Step 1:** Apply the procedure. Import becomes `import { spacing, typography, makeThemedStyles, useThemeColors } from '../../src/theme';`. Add `const styles = useStyles();` and `const colors = useThemeColors();` (many inline icon color props ~L94–L249). Wrap the StyleSheet. Route literals:

| ~Line | old | new |
|---|---|---|
| L300 `backgroundColor` | `'#F0F0F0'` | `colors.gray[2]` |
| L388 `backgroundColor` | `'#F9FAFB'` | `colors.gray[1]` |

`npx prettier --write "app/(tabs)/cart.tsx"`.
- [ ] **Step 2:** `npm run type-check 2>&1 | grep -c "error TS"` → `155`. Import guard → no output.
- [ ] **Step 3:** Commit.
```bash
git add "apps/mobile/app/(tabs)/cart.tsx"
git commit -m "feat(mobile): theme cart tab for dark mode incl. literals (M3d-2)"
```

## Task 8: Profile tab — `app/(tabs)/profile.tsx`

**Files:** Modify `app/(tabs)/profile.tsx`

- [ ] **Step 1:** Apply the procedure. Import becomes `import { spacing, typography, makeThemedStyles, useThemeColors } from '../../src/theme';`. Add `const styles = useStyles();` and `const colors = useThemeColors();` (inline icon color props ~L148/L172/L177). Route the inline logout-icon literal at ~L189 `color="#EB3E3E"` → `color={colors.error}`. Wrap the StyleSheet and route its literals:

| ~Line | old | new |
|---|---|---|
| L233 `backgroundColor` | `'#F0F0F0'` | `colors.gray[2]` |
| L283 `color` | `'#EB3E3E'` | `colors.error` |

`npx prettier --write "app/(tabs)/profile.tsx"`.
- [ ] **Step 2:** `npm run type-check 2>&1 | grep -c "error TS"` → `155`. Import guard → no output.
- [ ] **Step 3:** Commit.
```bash
git add "apps/mobile/app/(tabs)/profile.tsx"
git commit -m "feat(mobile): theme profile tab for dark mode incl. literals (M3d-2)"
```

## Task 9: Final verification gates

**Files:** none (verification only).

- [ ] **Step 1: Global import guard** — confirm none of the 10 converted files still statically import `colors`:
```bash
cd apps/mobile && grep -rnE "import \{[^}]*\bcolors\b[^}]*\} from '(@/src/theme|\.\./\.\./src/theme|\.\./\.\./theme)'" "app/(tabs)" src/components/home/CategoryTabs.tsx src/components/home/SearchHeader.tsx src/components/home/SectionHeader.tsx src/components/home/ProductCardFigma.tsx
```
Expected: **no output**. The guard scans exactly the 10 targets: the `app/(tabs)` dir (only the 6 tab files live there, all in scope) plus the 4 home files listed by name. The deferred dead components (`CategoryScroll`/`HeroBanner`/`ProductSection`) and `PromoBanner` are intentionally **not** listed, so their remaining static `colors` imports don't trip the guard.
- [ ] **Step 2: Type-check** — `npm run type-check 2>&1 | grep -c "error TS"` → exactly `155` (zero new).
- [ ] **Step 3: Lint** — `npm run lint` → `0 errors` (pre-existing warnings only).
- [ ] **Step 4: Full suite** — `npm test` → **104 tests / 21 suites** green (no regressions; the `ProductCardFigma`/a11y path stays green).
- [ ] **Step 5: Manual walkthrough (if a device/simulator is available)** — per `docs/superpowers/plans/RUNTIME-VERIFICATION-runbook.md`: toggle dark mode, then visit each tab (Home, Explore, Orders, Cart, Profile). Confirm: page backgrounds → `#121212`, cards/surfaces → `#1E1E1E`, text → off-white, borders → dark grey, the bottom tab bar is dark with the neutral active tint, and no hardcoded light blocks remain (e.g. the explore filter rows, cart summary panel, profile avatar circle, product-card name/price). No commit — this is a gate.

## Task 10: Update the program status doc

**Files:** Modify `docs/superpowers/mobile-enhancement-status.md`

- [ ] **Step 1:** Under **Done**, add:
```markdown
- **M3d-2 — Tabs + Home dark conversion** (branch `m3d2-tabs-home-dark`): converted the 5 bottom-tab screens (`app/(tabs)/index|explore|orders|cart|profile.tsx`), the shared tab bar (`_layout.tsx`), and the 4 rendered home components (`CategoryTabs`, `SearchHeader`, `SectionHeader`, `ProductCardFigma`) to `makeThemedStyles`/`useThemeColors`, **and routed hardcoded hex literals** (`#1E1E1E`→`primary`, `#EB3E3E`→`error`, `#F9FAFB`/`#F0F0F0`/`#EFEFEF`→`gray`, `#999`→`text.tertiary`, error tints→`errorLight`/`errorScale`) to palette tokens; shadow `#000` and the gold star `#F2C94C` kept fixed. Gates-only (no new render tests): zero new tsc errors, lint 0, 104 tests green, plus a "no static `colors` import remains" guard. Dead home components (`CategoryScroll`/`HeroBanner`/`ProductSection`) and `PromoBanner` excluded. See `specs/2026-06-03-mobile-m3d2-*` + `plans/2026-06-03-mobile-m3d2-*`.
```
- [ ] **Step 2:** Update the **M3d** "Next up" section: mark M3d-2 done; set **M3d-3 (next screen batch — PDP / cart-detail / checkout, or auth)** as the new RESUME HERE, following the same recipe.
- [ ] **Step 3:** Commit.
```bash
git add docs/superpowers/mobile-enhancement-status.md
git commit -m "docs(mobile): mark M3d-2 done; M3d-3 next (status handoff)"
```

---

## Self-Review notes (addressed)

- **Spec coverage:** scope (Tasks 1–8 = the 10 live files), Tier-1 mechanical recipe (shared procedure), Tier-2 literal routing (per-file tables, Tasks 4/5/7/8), gates-only verification incl. import guard (Task 9), status handoff (Task 10). All spec sections map to tasks.
- **No new tests** is intentional (spec decision 2); each task's gate is `tsc` + the import guard, with the full suite + lint at the end.
- **Token consistency:** all replacements use real `ColorPalette` keys (`colors.primary`, `colors.error`, `colors.errorLight`, `colors.errorScale[6]`, `colors.gray[1|2|5]`, `colors.text.tertiary`, `colors.border`, `colors.surface`) — verified against `darkColors.ts` from M3d-1.
- **Line numbers are approximate** (prefixed `~L`) because earlier edits in the same file shift them; each task identifies the literal by its style key / JSX context, not the line alone.
