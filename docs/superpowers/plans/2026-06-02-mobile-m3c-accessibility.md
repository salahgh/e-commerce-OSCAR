# M3c — Accessibility Pass Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add screen-reader semantics (role/label/state) to the most-reused shared components, plus a tested product-label helper.

**Architecture:** A pure `src/utils/a11y.ts` builds consistent product labels. The shared `Button`, `Input`, the three `BackButton.tsx` icon controls, and the product cards get `accessibilityRole`/`Label`/`State`. i18n adds `a11y.goBack` / `a11y.close`.

**Tech Stack:** React Native / Expo, react-i18next, Jest + jest-expo.

**Spec:** `docs/superpowers/specs/2026-06-02-mobile-m3c-accessibility-design.md`

**Working dir:** all commands from `apps/mobile`. Branch: `m3c-accessibility` (already created). Use `npm`, never `pnpm`. Zero new `tsc` errors (baseline **155**). Commit per task.

---

## Task 0: Baseline

- [ ] `cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Test Suites:"` → expect `Tests: 85 passed`, `Test Suites: 15 passed`.
- [ ] `cd /d/e-commerce-OSCAR/apps/mobile && npx tsc --noEmit 2>&1 | grep -cE "error TS"` → expect `155` (gate: final ≤ 155).
- [ ] `cd /d/e-commerce-OSCAR/apps/mobile && npm run lint 2>&1 | grep -E "problems" | tail -1` → expect `0 errors`.

No commit.

---

## Task 1: `productAccessibilityLabel` helper

**Files:** Create `src/utils/a11y.ts`; Test `src/utils/__tests__/a11y.test.ts`.

- [ ] **Step 1: Write the failing test** — create `src/utils/__tests__/a11y.test.ts`:

```ts
import { productAccessibilityLabel } from '../a11y';

describe('productAccessibilityLabel', () => {
  it('includes name and price when priced', () => {
    expect(productAccessibilityLabel({ name: 'T-Shirt', price: 2500, currencyCode: 'DZD' })).toBe('T-Shirt, 2500 DZD');
  });

  it('defaults currency to DZD', () => {
    expect(productAccessibilityLabel({ name: 'T-Shirt', price: 2500 })).toBe('T-Shirt, 2500 DZD');
  });

  it('uses a custom currency', () => {
    expect(productAccessibilityLabel({ name: 'Jeans', price: 100, currencyCode: 'EUR' })).toBe('Jeans, 100 EUR');
  });

  it('returns name only when price is 0, null, or missing', () => {
    expect(productAccessibilityLabel({ name: 'T-Shirt', price: 0 })).toBe('T-Shirt');
    expect(productAccessibilityLabel({ name: 'T-Shirt', price: null })).toBe('T-Shirt');
    expect(productAccessibilityLabel({ name: 'T-Shirt' })).toBe('T-Shirt');
  });
});
```

- [ ] **Step 2: Run it, expect FAIL** — `cd /d/e-commerce-OSCAR/apps/mobile && npm test -- a11y 2>&1 | tail -15` → `Cannot find module '../a11y'`.

- [ ] **Step 3: Implement** — create `src/utils/a11y.ts`:

```ts
/**
 * Accessibility label builders (pure). A product touch target should announce a
 * single consistent label to a screen reader instead of its raw child text nodes.
 */
export function productAccessibilityLabel(p: {
  name: string;
  price?: number | null;
  currencyCode?: string;
}): string {
  if (typeof p.price === 'number' && p.price > 0) {
    return `${p.name}, ${p.price} ${p.currencyCode ?? 'DZD'}`;
  }
  return p.name;
}
```

- [ ] **Step 4: Run it, expect PASS** — `cd /d/e-commerce-OSCAR/apps/mobile && npm test -- a11y 2>&1 | tail -15` → 4 passed.

- [ ] **Step 5: tsc-clean + commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && npx tsc --noEmit 2>&1 | grep -E "utils/a11y" || echo "clean"
cd /d/e-commerce-OSCAR/apps/mobile && git add src/utils/a11y.ts src/utils/__tests__/a11y.test.ts && git commit -m "feat(mobile): productAccessibilityLabel helper (M3c)"
```

---

## Task 2: i18n `a11y` strings

**Files:** Modify `src/i18n/locales/{en,fr,ar}.json`.

Each locale has a top-level `"products"` object. Insert a new top-level `"a11y"` object **immediately before** `"products": {` (2-space indentation, sibling key):

- [ ] **Step 1: en.json** — before `  "products": {`, insert:
```json
  "a11y": {
    "goBack": "Go back",
    "close": "Close"
  },
```

- [ ] **Step 2: fr.json** — before `  "products": {`, insert:
```json
  "a11y": {
    "goBack": "Retour",
    "close": "Fermer"
  },
```

- [ ] **Step 3: ar.json** — before `  "products": {`, insert:
```json
  "a11y": {
    "goBack": "رجوع",
    "close": "إغلاق"
  },
```

- [ ] **Step 4: Verify JSON parses**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && node -e "['en','fr','ar'].forEach(l=>{const a=require('./src/i18n/locales/'+l+'.json').a11y; if(!a||!a.goBack||!a.close) throw new Error(l); console.log(l,a.goBack,'/',a.close)})"
```

- [ ] **Step 5: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add src/i18n/locales/en.json src/i18n/locales/fr.json src/i18n/locales/ar.json && git commit -m "i18n(mobile): add a11y.goBack/close (M3c)"
```

---

## Task 3: `Button` + `Input` a11y

**Files:** Modify `src/components/ui/Button.tsx`; Modify `src/components/ui/Input.tsx`.

- [ ] **Step 1: Button** — in `src/components/ui/Button.tsx`, find the `TouchableOpacity` props (the `disabled={isDisabled}` / `activeOpacity={0.7}` / `{...props}` block) and add the three accessibility props immediately BEFORE `{...props}`:
```tsx
      disabled={isDisabled}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: isDisabled, busy: loading }}
      {...props}
```
(They sit before `{...props}` so a caller can still override any of them. `title`, `isDisabled`, `loading` are already in scope.)

- [ ] **Step 2: Input** — in `src/components/ui/Input.tsx`, find the `TextInput` and add `accessibilityLabel` immediately BEFORE its `{...props}`:
```tsx
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          accessibilityLabel={label ?? props.placeholder}
          {...props}
```
(`label` is destructured; `props.placeholder` is part of the inherited `TextInputProps`.)

- [ ] **Step 3: Verify + commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && npx tsc --noEmit 2>&1 | grep -cE "error TS"   # <=155
cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Suites:"       # all green
cd /d/e-commerce-OSCAR/apps/mobile && git add src/components/ui/Button.tsx src/components/ui/Input.tsx && git commit -m "feat(mobile): a11y role/label/state on Button + Input (M3c)"
```

---

## Task 4: `BackButton.tsx` icon controls a11y

**Files:** Modify `src/components/navigation/BackButton.tsx` (exports `BackButton`, `CloseButton`, `FloatingBackButton`).

- [ ] **Step 1: Import useTranslation** — after the line `import { colors, spacing } from '../../theme';`, add:
```ts
import { useTranslation } from 'react-i18next';
```

- [ ] **Step 2: `BackButton`** — add `const { t } = useTranslation();` at the top of the `BackButton` component body (e.g. right after `const router = useRouter();`). On its `TouchableOpacity` (the one with `hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}`), add before that `hitSlop` line:
```tsx
      accessibilityRole="button"
      accessibilityLabel={t('a11y.goBack', 'Go back')}
```

- [ ] **Step 3: `CloseButton`** — add `const { t } = useTranslation();` at the top of the `CloseButton` component body (right after the opening `{`, before `const getButtonStyle`). On its `TouchableOpacity`, add before its `hitSlop` line:
```tsx
      accessibilityRole="button"
      accessibilityLabel={t('a11y.close', 'Close')}
```

- [ ] **Step 4: `FloatingBackButton`** — add `const { t } = useTranslation();` at the top of the `FloatingBackButton` component body (after `const router = useRouter();`). On its `TouchableOpacity` (the one with `activeOpacity={0.8}`), add before that `activeOpacity` line:
```tsx
      accessibilityRole="button"
      accessibilityLabel={t('a11y.goBack', 'Go back')}
```

- [ ] **Step 5: Verify + commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && npx tsc --noEmit 2>&1 | grep -cE "error TS"   # <=155
cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Suites:"       # all green
cd /d/e-commerce-OSCAR/apps/mobile && git add src/components/navigation/BackButton.tsx && git commit -m "feat(mobile): a11y labels on back/close icon controls (M3c)"
```

---

## Task 5: Product cards a11y

**Files:** Modify `src/components/home/ProductCardFigma.tsx`; Modify `src/components/products/HorizontalProductRow.tsx`.

- [ ] **Step 1: ProductCardFigma import** — in `src/components/home/ProductCardFigma.tsx`, add (after the existing imports, alongside the other `../../` imports):
```ts
import { productAccessibilityLabel } from '../../utils/a11y';
```

- [ ] **Step 2: ProductCardFigma touchable** — find:
```tsx
    <TouchableOpacity
      style={[styles.card, { width }]}
      onPress={handlePress}
      activeOpacity={0.8}
    >
```
and replace with:
```tsx
    <TouchableOpacity
      style={[styles.card, { width }]}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={productAccessibilityLabel({ name: product.name, price: product.price, currencyCode: 'DZD' })}
    >
```

- [ ] **Step 3: HorizontalProductRow import** — in `src/components/products/HorizontalProductRow.tsx`, add (with the other imports):
```ts
import { productAccessibilityLabel } from '../../utils/a11y';
```

- [ ] **Step 4: HorizontalProductRow card** — find:
```tsx
          <Pressable style={styles.card} onPress={() => router.push(`/products/${item.slug}` as any)}>
```
and replace with:
```tsx
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/products/${item.slug}` as any)}
            accessibilityRole="button"
            accessibilityLabel={productAccessibilityLabel({ name: item.name, price: item.price, currencyCode: item.currencyCode })}
          >
```

- [ ] **Step 5: Verify + commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && npx tsc --noEmit 2>&1 | grep -cE "error TS"   # <=155
cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Suites:"       # all green
cd /d/e-commerce-OSCAR/apps/mobile && git add src/components/home/ProductCardFigma.tsx src/components/products/HorizontalProductRow.tsx && git commit -m "feat(mobile): accessible labels on product cards (M3c)"
```

---

## Task 6: Final verification + status doc

- [ ] **Step 1: Full gate**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Test Suites:"   # expect 89 tests / 16 suites (85 + 4 new)
cd /d/e-commerce-OSCAR/apps/mobile && npm run lint 2>&1 | grep -E "problems" | tail -1   # 0 errors
cd /d/e-commerce-OSCAR/apps/mobile && npx tsc --noEmit 2>&1 | grep -cE "error TS"   # <= 155
```

- [ ] **Step 2: Status doc** — in `docs/superpowers/mobile-enhancement-status.md`: add an **M3c** entry to the Done list (a11y: tested `productAccessibilityLabel`; role/label/state on Button, Input, back/close controls, product cards), bump the Health test count to 89, and in "Next up" mark M3c done (remaining M3: real dark mode). Match the existing entry style.

- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add ../../docs/superpowers/mobile-enhancement-status.md && git commit -m "docs(mobile): mark M3c accessibility done (M3c)"
```

---

## Self-review notes (for the executor)
- Button/Input a11y props go BEFORE `{...props}` so callers can override.
- `BackButton.tsx` has THREE components — each needs its own `const { t } = useTranslation();` and its own touchable labeled.
- Product cards label via the tested helper; `ProductCardFigma` has no `currencyCode` (default `'DZD'`), the `HorizontalProductRow` card has `item.currencyCode`.
- Zero new tsc errors (baseline 155). Components aren't render-tested; the spoken behavior is runtime-verified.
