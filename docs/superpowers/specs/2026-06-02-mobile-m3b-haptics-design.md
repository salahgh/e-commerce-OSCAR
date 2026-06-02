# M3b — Haptic Feedback (Design Spec)

**Date:** 2026-06-02
**App:** `apps/mobile` (standalone npm Expo project)
**Milestone:** M3b — second slice of M3 ("UX polish"), mobile-only scope
**Status:** Approved design — ready for implementation planning

---

## 1. Goal & background

Add tactile feedback to key interactions using `expo-haptics` (already a dependency, `~55.0.9`, currently **unused**). Two broad wiring points cover most primary actions with minimal, low-risk changes: the shared `Button` and the centralized `Toast`. Mobile-only; no backend.

**Verified:** `src/components/ui/Button.tsx` is a shared `TouchableOpacity`-based button (`onPress`, `loading`, `disabled`; `isDisabled = disabled || loading`) used for primary actions app-wide. `src/components/ui/Toast.tsx` is the centralized notification system (`useToast` with success/error/warning/show). `expo-haptics` is installed but referenced nowhere.

## 2. Tested util — `src/utils/haptics.ts` (the testable core)

A thin, fire-and-forget wrapper that **never throws** and **no-ops on web**:

```
import * as Haptics from 'expo-haptics';
import { Platform } from 'react-native';

function run(fn: () => Promise<unknown>): void {
  if (Platform.OS === 'web') return;     // checked per-call so it is unit-testable
  try {
    void fn().catch(() => {});           // swallow async rejection
  } catch {
    // swallow sync throw
  }
}

export const haptics = {
  selection: () => run(() => Haptics.selectionAsync()),
  light:     () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)),
  medium:    () => run(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)),
  success:   () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)),
  warning:   () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning)),
  error:     () => run(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)),
};
```

- Single responsibility: map intent → the right `expo-haptics` call, safely. Synchronous, returns `void` (callers never await).
- The `Platform.OS === 'web'` guard is evaluated **inside `run`** (per call) so a test can flip `Platform.OS` and assert the no-op.

## 3. Wiring

**3.1 `Button` (`src/components/ui/Button.tsx`)** — wrap the `onPress` passed to `TouchableOpacity` so a `haptics.light()` fires immediately before the consumer's handler:
- The `TouchableOpacity` already receives `disabled={isDisabled}` and so will not invoke `onPress` when disabled/loading — therefore the wrapper (which *is* that `onPress`) does not run, and no buzz occurs on a disabled/loading button. No extra guard needed.
- Implementation: pass `onPress={() => { haptics.light(); onPress(); }}` (replacing the bare `onPress={onPress}`), preserving all other props.

**3.2 `Toast` (`src/components/ui/Toast.tsx`)** — every toast (the typed `success`/`error`/`warning`/`info` helpers and bare `show`) funnels through the single `show` `useCallback` (line ~175), which resolves `newToast.type`. Wire there, once: right before `setToasts(...)`, fire a notification haptic matched to `newToast.type` — `success → haptics.success()`, `error → haptics.error()`, `warning → haptics.warning()`, `info → no haptic`. This covers every existing success/error toast (checkout, address book, reorder, etc.) for free, from one site.

## 4. Testing

`src/utils/__tests__/haptics.test.ts` (mock `expo-haptics`):
- `haptics.light()` → `impactAsync` called once with `ImpactFeedbackStyle.Light`; `medium()` → `Medium`.
- `haptics.selection()` → `selectionAsync` called once.
- `haptics.success()` / `warning()` / `error()` → `notificationAsync` with `Success` / `Warning` / `Error`.
- A rejecting mock (`impactAsync` rejects) does **not** throw out of `haptics.light()` (failure is swallowed).
- (If feasible with the jest-expo `Platform` mock) on `Platform.OS === 'web'`, no `expo-haptics` method is called.

`Button`/`Toast` are not render-tested (consistent with M1–M3a; the testable logic is the util). The actual buzz is runtime-verified on a device.

## 5. Out of scope (deferred)
- Haptics on raw `TouchableOpacity` option cards (checkout payment/shipping method, size/color pickers), tab-bar switches, pull-to-refresh.
- A user setting to disable haptics.
- Android-specific vibration tuning beyond what `expo-haptics` provides.

## 6. Success criteria
1. `haptics.ts` exists with the six helpers; each maps to the correct `expo-haptics` call; failures are swallowed; web is a no-op.
2. Tapping any shared `Button` produces a light impact (on a real device); disabled/loading buttons do not.
3. Success / error / warning toasts fire the matching notification haptic; info toasts do not.
4. New `haptics` tests pass; full `npm test` green; `npm run lint` 0 errors; **zero new `tsc` errors** (baseline 155).
