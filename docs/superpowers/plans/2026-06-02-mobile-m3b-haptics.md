# M3b — Haptic Feedback Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add tactile feedback to the shared Button and centralized Toast using a small tested `expo-haptics` wrapper.

**Architecture:** A pure-ish util (`src/utils/haptics.ts`) maps intent → the right `expo-haptics` call, no-ops on web, never throws. The shared `Button` fires a light impact on press; the Toast `show()` fires a matching notification haptic by type.

**Tech Stack:** React Native / Expo, `expo-haptics` (~55.0.9, already installed), Jest + jest-expo.

**Spec:** `docs/superpowers/specs/2026-06-02-mobile-m3b-haptics-design.md`

**Working dir:** all commands from `apps/mobile`. Branch: `m3b-haptics` (already created). Use `npm`, never `pnpm`. Zero new `tsc` errors (baseline **155**). Commit per task.

---

## Task 0: Baseline

- [ ] `cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Test Suites:"` → expect `Tests: 80 passed`, `Test Suites: 14 passed`.
- [ ] `cd /d/e-commerce-OSCAR/apps/mobile && npx tsc --noEmit 2>&1 | grep -cE "error TS"` → expect `155` (gate: final ≤ 155).
- [ ] `cd /d/e-commerce-OSCAR/apps/mobile && npm run lint 2>&1 | grep -E "problems" | tail -1` → expect `0 errors`.

No commit.

---

## Task 1: `haptics` util

**Files:** Create `src/utils/haptics.ts`; Test `src/utils/__tests__/haptics.test.ts`.

- [ ] **Step 1: Write the failing test** — create `src/utils/__tests__/haptics.test.ts`:

```ts
import { haptics } from '../haptics';
import * as Haptics from 'expo-haptics';

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn().mockResolvedValue(undefined),
  impactAsync: jest.fn().mockResolvedValue(undefined),
  notificationAsync: jest.fn().mockResolvedValue(undefined),
  ImpactFeedbackStyle: { Light: 'light', Medium: 'medium', Heavy: 'heavy' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning', Error: 'error' },
}));

describe('haptics', () => {
  beforeEach(() => jest.clearAllMocks());

  it('light() calls impactAsync(Light)', () => {
    haptics.light();
    expect(Haptics.impactAsync).toHaveBeenCalledWith('light');
  });

  it('medium() calls impactAsync(Medium)', () => {
    haptics.medium();
    expect(Haptics.impactAsync).toHaveBeenCalledWith('medium');
  });

  it('selection() calls selectionAsync', () => {
    haptics.selection();
    expect(Haptics.selectionAsync).toHaveBeenCalledTimes(1);
  });

  it('success/warning/error map to notificationAsync types', () => {
    haptics.success();
    haptics.warning();
    haptics.error();
    expect(Haptics.notificationAsync).toHaveBeenNthCalledWith(1, 'success');
    expect(Haptics.notificationAsync).toHaveBeenNthCalledWith(2, 'warning');
    expect(Haptics.notificationAsync).toHaveBeenNthCalledWith(3, 'error');
  });

  it('swallows a rejecting call without throwing', () => {
    (Haptics.impactAsync as jest.Mock).mockRejectedValueOnce(new Error('no haptics'));
    expect(() => haptics.light()).not.toThrow();
  });
});
```

- [ ] **Step 2: Run it, expect FAIL** — `cd /d/e-commerce-OSCAR/apps/mobile && npm test -- haptics 2>&1 | tail -15` → `Cannot find module '../haptics'`.

- [ ] **Step 3: Implement** — create `src/utils/haptics.ts`:

```ts
/**
 * Tactile feedback helpers over expo-haptics.
 * Fire-and-forget: never throws, returns void, and no-ops on web.
 */
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

function run(fn: () => Promise<unknown>): void {
  if (Platform.OS === 'web') return;
  try {
    void fn().catch(() => {});
  } catch {
    // swallow — haptics must never break a user interaction
  }
}

export const haptics = {
  selection: () => run(() => Haptics.selectionAsync()),
  light: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  medium: () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  success: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  error: () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
```

- [ ] **Step 4: Run it, expect PASS** — `cd /d/e-commerce-OSCAR/apps/mobile && npm test -- haptics 2>&1 | tail -15` → 5 passed.

- [ ] **Step 5: tsc-clean + commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && npx tsc --noEmit 2>&1 | grep -E "utils/haptics" || echo "clean"
cd /d/e-commerce-OSCAR/apps/mobile && git add src/utils/haptics.ts src/utils/__tests__/haptics.test.ts && git commit -m "feat(mobile): haptics util over expo-haptics (M3b)"
```

---

## Task 2: Wire `Button` + `Toast`

**Files:** Modify `src/components/ui/Button.tsx`; Modify `src/components/ui/Toast.tsx`.

- [ ] **Step 1: Button import** — in `src/components/ui/Button.tsx`, after the line `import { colors, spacing, typography } from '../../theme';`, add:
```ts
import { haptics } from '../../utils/haptics';
```

- [ ] **Step 2: Button onPress** — find the `TouchableOpacity` opening, specifically the line `onPress={onPress}`, and replace it with:
```tsx
      onPress={() => {
        haptics.light();
        onPress();
      }}
```
(The `TouchableOpacity` keeps `disabled={isDisabled}`, so this wrapper never runs when the button is disabled/loading — no buzz then.)

- [ ] **Step 3: Toast import** — in `src/components/ui/Toast.tsx`, after the line `import { colors, spacing, typography } from '../../theme';`, add:
```ts
import { haptics } from '../../utils/haptics';
```

- [ ] **Step 4: Toast haptic** — in the `show` `useCallback`, find:
```ts
    setToasts((prev) => [...prev, newToast]);
```
and insert immediately BEFORE it:
```ts
    if (newToast.type === 'success') haptics.success();
    else if (newToast.type === 'error') haptics.error();
    else if (newToast.type === 'warning') haptics.warning();

```
(`info` toasts intentionally get no haptic.)

- [ ] **Step 5: Verify + commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && npx tsc --noEmit 2>&1 | grep -cE "error TS"   # expect <=155
cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Suites:"       # all green (unchanged count)
cd /d/e-commerce-OSCAR/apps/mobile && npm run lint 2>&1 | grep -E "problems" | tail -1   # 0 errors
cd /d/e-commerce-OSCAR/apps/mobile && git add src/components/ui/Button.tsx src/components/ui/Toast.tsx && git commit -m "feat(mobile): haptic feedback on Button tap + Toast notifications (M3b)"
```

---

## Task 3: Final verification + status doc

- [ ] **Step 1: Full gate**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Test Suites:"   # expect 85 tests / 15 suites (80 + 5 new)
cd /d/e-commerce-OSCAR/apps/mobile && npm run lint 2>&1 | grep -E "problems" | tail -1   # 0 errors
cd /d/e-commerce-OSCAR/apps/mobile && npx tsc --noEmit 2>&1 | grep -cE "error TS"   # <= 155
```

- [ ] **Step 2: Status doc** — in `docs/superpowers/mobile-enhancement-status.md`: add an **M3b** entry to the Done list (haptics: tested `src/utils/haptics.ts`, wired to Button + Toast), bump the Health test count to 85, and in "Next up" mark M3b done (remaining M3: accessibility, dark mode). Match the existing entry style.

- [ ] **Step 3: Commit**
```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add ../../docs/superpowers/mobile-enhancement-status.md && git commit -m "docs(mobile): mark M3b haptics done (M3b)"
```

---

## Self-review notes (for the executor)
- `haptics.*` calls are fire-and-forget (`void` return) — never `await` them; they must never block or break an interaction.
- The Button wrapper fires `haptics.light()` BEFORE `onPress()` so the tap feels immediate.
- Wire the Toast haptic at the single `show` site (not the per-type helpers) — `success`/`error`/`warning`/`info` all funnel through `show`.
- Zero new tsc errors (baseline 155). Never "fix" pre-existing baseline errors.
