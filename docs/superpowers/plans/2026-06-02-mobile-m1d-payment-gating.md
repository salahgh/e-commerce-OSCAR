# M1d — Payment Availability Gating Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Keep COD checkout working; show CIB & BaridiMob as non-selectable "coming soon" so the backend-blocked gateway is never invoked.

**Architecture:** A pure, tested helper (`src/utils/payment.ts`) classifies payment-method codes into available vs coming-soon and exposes a local coming-soon catalog (CIB, BaridiMob). The checkout payment step partitions the backend's `eligiblePaymentMethods` through it: available methods render selectable as today; CIB/BaridiMob always render in a disabled "Coming soon" section. No gateway flow, no backend change.

**Tech Stack:** React Native / Expo Router, TypeScript, react-i18next, Jest + jest-expo + RNTL.

**Spec:** `docs/superpowers/specs/2026-06-02-mobile-m1d-payment-gating-design.md`

**Working dir:** all commands run from `apps/mobile`. Branch: `m1d-payment-gating` (already created).

**House rules:** standalone npm project — use `npm`, never `pnpm`. Zero new `tsc` errors (baseline **155**). Mobile cannot import `@oscar/shared`. Commit per task.

---

## Task 0: Capture the baseline

**Files:** none (measurement only).

- [ ] **Step 1: Tests, tsc, lint**

Run: `cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Test Suites:"`
Expected: `Tests: 69 passed`, `Test Suites: 12 passed`.

Run: `cd /d/e-commerce-OSCAR/apps/mobile && npx tsc --noEmit 2>&1 | grep -cE "error TS"`
Expected: `155` (known-red baseline; call it `BASELINE_TSC`). Task 4 asserts the final count is `<= 155`.

Run: `cd /d/e-commerce-OSCAR/apps/mobile && npm run lint 2>&1 | grep -E "problems|error" | tail -2`
Expected: `0 errors` (warnings pre-existing).

No commit.

---

## Task 1: Pure payment-availability helper

**Files:**
- Create: `src/utils/payment.ts`
- Test: `src/utils/__tests__/payment.test.ts`

- [ ] **Step 1: Write the failing test**

Create `src/utils/__tests__/payment.test.ts`:

```ts
import {
  getPaymentAvailability,
  isSelectableMethod,
  partitionPaymentMethods,
  COMING_SOON_PAYMENTS,
} from '../payment';

describe('getPaymentAvailability', () => {
  it('marks cash-on-delivery and unknown codes as available', () => {
    expect(getPaymentAvailability('cash-on-delivery')).toBe('available');
    expect(getPaymentAvailability('stripe')).toBe('available');
  });

  it('marks cib and baridimob as coming-soon (case-insensitive)', () => {
    expect(getPaymentAvailability('cib')).toBe('coming-soon');
    expect(getPaymentAvailability('CIB')).toBe('coming-soon');
    expect(getPaymentAvailability('baridimob')).toBe('coming-soon');
  });
});

describe('isSelectableMethod', () => {
  it('is true only for an eligible, available method', () => {
    expect(isSelectableMethod({ code: 'cash-on-delivery', isEligible: true })).toBe(true);
    expect(isSelectableMethod({ code: 'cash-on-delivery', isEligible: false })).toBe(false);
    expect(isSelectableMethod({ code: 'cib', isEligible: true })).toBe(false);
  });
});

describe('partitionPaymentMethods', () => {
  const cod = { code: 'cash-on-delivery', isEligible: true };
  const cib = { code: 'cib', isEligible: true };
  const baridimob = { code: 'baridimob', isEligible: true };

  it('keeps available methods and always lists the 2-entry coming-soon catalog', () => {
    const { available, comingSoon } = partitionPaymentMethods([cod, cib, baridimob]);
    expect(available).toEqual([cod]);
    expect(comingSoon).toBe(COMING_SOON_PAYMENTS);
    expect(comingSoon.map((c) => c.code)).toEqual(['cib', 'baridimob']);
  });

  it('still shows the coming-soon catalog when the backend returns only COD', () => {
    const { available, comingSoon } = partitionPaymentMethods([cod]);
    expect(available).toEqual([cod]);
    expect(comingSoon.map((c) => c.code)).toEqual(['cib', 'baridimob']);
  });

  it('returns no available methods (but still the catalog) for an empty list', () => {
    const { available, comingSoon } = partitionPaymentMethods([]);
    expect(available).toEqual([]);
    expect(comingSoon).toHaveLength(2);
  });
});
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `cd /d/e-commerce-OSCAR/apps/mobile && npm test -- payment 2>&1 | tail -15`
Expected: FAIL — `Cannot find module '../payment'`.

- [ ] **Step 3: Write the implementation**

Create `src/utils/payment.ts`:

```ts
/**
 * Payment-method availability gating (mobile-only).
 *
 * The CIB/BaridiMob online gateway is backend-blocked, so those methods are
 * surfaced as "coming soon" (non-selectable) while COD stays the working path.
 * Pure + UI-free: `icon` is a plain Ionicons glyph name (cast at the UI boundary).
 * Mobile is standalone and cannot import `@oscar/shared`, so the labels are
 * mirrored here (same pattern as `src/data/wilayas.ts`).
 */
export type PaymentAvailability = 'available' | 'coming-soon';

export interface ComingSoonPayment {
  code: string;
  labelKey: string;
  labelFallback: string;
  icon: string; // Ionicons glyph name
}

export const COMING_SOON_PAYMENTS: ComingSoonPayment[] = [
  { code: 'cib', labelKey: 'checkout.cibCard', labelFallback: 'CIB (Carte bancaire)', icon: 'card-outline' },
  { code: 'baridimob', labelKey: 'checkout.baridimob', labelFallback: 'BaridiMob', icon: 'phone-portrait-outline' },
];

const COMING_SOON_CODES = new Set(['cib', 'baridimob']);

export function getPaymentAvailability(code: string): PaymentAvailability {
  return COMING_SOON_CODES.has(code.toLowerCase()) ? 'coming-soon' : 'available';
}

export function isSelectableMethod(method: { code: string; isEligible: boolean }): boolean {
  return method.isEligible && getPaymentAvailability(method.code) === 'available';
}

export function partitionPaymentMethods<T extends { code: string }>(
  eligible: T[],
): { available: T[]; comingSoon: ComingSoonPayment[] } {
  return {
    available: eligible.filter((m) => getPaymentAvailability(m.code) === 'available'),
    comingSoon: COMING_SOON_PAYMENTS,
  };
}
```

- [ ] **Step 4: Run the test to verify it passes**

Run: `cd /d/e-commerce-OSCAR/apps/mobile && npm test -- payment 2>&1 | tail -15`
Expected: PASS — all describe blocks green.

- [ ] **Step 5: Verify tsc-clean, then commit**

Run: `cd /d/e-commerce-OSCAR/apps/mobile && npx tsc --noEmit 2>&1 | grep -E "utils/payment" || echo "payment is tsc-clean"`
Expected: `payment is tsc-clean`.

```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add src/utils/payment.ts src/utils/__tests__/payment.test.ts && git commit -m "feat(mobile): payment availability gating helper (M1d)"
```

---

## Task 2: i18n strings (en / fr / ar)

**Files:**
- Modify: `src/i18n/locales/en.json`
- Modify: `src/i18n/locales/fr.json`
- Modify: `src/i18n/locales/ar.json`

Each file has a top-level `"checkout"` object. Add the five keys below **inside that object** (key order is irrelevant; ensure commas/JSON validity).

- [ ] **Step 1: en.json** — add to `checkout`:

```json
      "cibCard": "CIB Card",
      "baridimob": "BaridiMob",
      "comingSoon": "Coming soon",
      "comingSoonPayments": "Online payment — coming soon",
      "onlinePaymentSoonNote": "CIB and BaridiMob online payment will be available soon. For now, pay cash on delivery."
```

- [ ] **Step 2: fr.json** — add to `checkout`:

```json
      "cibCard": "Carte CIB",
      "baridimob": "BaridiMob",
      "comingSoon": "Bientôt disponible",
      "comingSoonPayments": "Paiement en ligne — bientôt",
      "onlinePaymentSoonNote": "Le paiement en ligne CIB et BaridiMob sera bientôt disponible. Pour l'instant, payez à la livraison."
```

- [ ] **Step 3: ar.json** — add to `checkout`:

```json
      "cibCard": "بطاقة CIB",
      "baridimob": "بريدي موب",
      "comingSoon": "قريبًا",
      "comingSoonPayments": "الدفع عبر الإنترنت — قريبًا",
      "onlinePaymentSoonNote": "سيتوفر الدفع عبر الإنترنت عبر CIB وبريدي موب قريبًا. في الوقت الحالي، ادفع عند الاستلام."
```

- [ ] **Step 4: Verify all three files still parse as JSON**

Run: `cd /d/e-commerce-OSCAR/apps/mobile && node -e "['en','fr','ar'].forEach(l=>{const c=require('./src/i18n/locales/'+l+'.json').checkout; if(!c.comingSoon||!c.onlinePaymentSoonNote) throw new Error(l+' missing keys'); console.log(l,'ok')})"`
Expected: `en ok`, `fr ok`, `ar ok`.

- [ ] **Step 5: Commit**

```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add src/i18n/locales/en.json src/i18n/locales/fr.json src/i18n/locales/ar.json && git commit -m "i18n(mobile): add payment coming-soon strings (M1d)"
```

---

## Task 3: Gate the checkout payment step

**Files:**
- Modify: `app/checkout/index.tsx`

- [ ] **Step 1: Import the helper**

After the existing import of `SavedAddressPicker` (near line 30), add:

```ts
import { partitionPaymentMethods } from '../../src/utils/payment';
```

(`isSelectableMethod` is exported and unit-tested but not needed in checkout — for an available method it equals `method.isEligible`, which the card body already uses.)

- [ ] **Step 2: Partition the eligible methods**

Find:
```ts
  const paymentMethods = paymentMethodsData?.eligiblePaymentMethods || [];
```
Add the following line immediately after it:
```ts
  const { available: availablePaymentMethods, comingSoon: comingSoonPayments } =
    partitionPaymentMethods(paymentMethods);
```

- [ ] **Step 3: Default the selection to COD among available methods**

Replace the entire auto-select payment effect:
```ts
  // Auto-select first payment method if only one
  useEffect(() => {
    if (paymentMethods.length === 1 && !selectedPaymentMethod) {
      setSelectedPaymentMethod(paymentMethods[0].id);
    }
  }, [paymentMethods]);
```
with:
```ts
  // Default the payment selection to COD (or the first available method).
  useEffect(() => {
    if (!selectedPaymentMethod && availablePaymentMethods.length > 0) {
      const cod = availablePaymentMethods.find((m) => m.code === 'cash-on-delivery');
      setSelectedPaymentMethod((cod ?? availablePaymentMethods[0]).id);
    }
  }, [availablePaymentMethods, selectedPaymentMethod]);
```

- [ ] **Step 4: Render available methods from `availablePaymentMethods` + the eligible/disabled check via the helper**

In the payment step, find:
```ts
            ) : paymentMethods.length === 0 ? (
              <Text style={styles.noMethodsText}>
                {t('checkout.noPaymentMethods', 'No payment methods available')}
              </Text>
            ) : (
              paymentMethods.map((method) => (
```
and replace those lines with:
```ts
            ) : availablePaymentMethods.length === 0 ? (
              <Text style={styles.noMethodsText}>
                {t('checkout.noPaymentMethods', 'No payment methods available')}
              </Text>
            ) : (
              availablePaymentMethods.map((method) => (
```

(The card body still uses `method.isEligible`; since every entry here is availability `'available'`, `isSelectableMethod(method) === method.isEligible`, so behavior is unchanged. Leave the card body as-is.)

- [ ] **Step 5: Add the "Coming soon" section before the Continue button**

In the payment step, find the Continue-to-Review button:
```ts
            <Button
              title={t('checkout.continueToReview', 'Continue to Review')}
              onPress={handlePaymentMethodSelect}
              disabled={!selectedPaymentMethod || isLoading}
              fullWidth
              style={styles.continueButton}
            />
```
and insert the following block **immediately before** it:
```tsx
            {comingSoonPayments.length > 0 && (
              <View style={styles.comingSoonSection}>
                <Text style={styles.comingSoonSectionTitle}>
                  {t('checkout.comingSoonPayments', 'Online payment — coming soon')}
                </Text>
                {comingSoonPayments.map((entry) => (
                  <View key={entry.code} style={[styles.methodCard, styles.methodCardDisabled]}>
                    <Ionicons
                      name={entry.icon as keyof typeof Ionicons.glyphMap}
                      size={22}
                      color={colors.text.tertiary}
                      style={styles.comingSoonIcon}
                    />
                    <View style={styles.methodInfo}>
                      <Text style={[styles.methodName, styles.methodNameDisabled]}>
                        {t(entry.labelKey, entry.labelFallback)}
                      </Text>
                    </View>
                    <View style={styles.comingSoonBadge}>
                      <Text style={styles.comingSoonBadgeText}>
                        {t('checkout.comingSoon', 'Coming soon')}
                      </Text>
                    </View>
                  </View>
                ))}
                <Text style={styles.comingSoonNote}>
                  {t(
                    'checkout.onlinePaymentSoonNote',
                    'CIB and BaridiMob online payment will be available soon. For now, pay cash on delivery.',
                  )}
                </Text>
              </View>
            )}
```

- [ ] **Step 6: Add the new styles**

In the `StyleSheet.create({ ... })` at the bottom, add these entries (e.g. after the `continueButton` style):

```ts
  comingSoonSection: {
    marginTop: spacing.xl,
  },
  comingSoonSectionTitle: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.semiBold,
    marginBottom: spacing.sm,
  },
  comingSoonIcon: {
    marginRight: spacing.md,
  },
  comingSoonBadge: {
    backgroundColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
  },
  comingSoonBadgeText: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  comingSoonNote: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
    marginTop: spacing.sm,
  },
```

- [ ] **Step 7: Verify tsc + tests**

Run: `cd /d/e-commerce-OSCAR/apps/mobile && npx tsc --noEmit 2>&1 | grep -cE "error TS"`
Expected: `<= 155`. (If it increased, the cause is the `Ionicons` icon cast or a style name typo — fix only in `checkout/index.tsx`.)

Run: `cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Suites:"`
Expected: all green (the `product-detail`/other suites unaffected; no new test here — checkout is not render-tested).

- [ ] **Step 8: Commit**

```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add app/checkout/index.tsx && git commit -m "feat(mobile): gate CIB/BaridiMob as coming-soon in checkout, COD selectable (M1d)"
```

---

## Task 4: Final verification + status doc

**Files:**
- Modify: `docs/superpowers/mobile-enhancement-status.md`

- [ ] **Step 1: Full suite**

Run: `cd /d/e-commerce-OSCAR/apps/mobile && npm test 2>&1 | grep -E "Tests:|Test Suites:"`
Expected: all green; +3 new tests from `payment.test.ts` (72 total).

- [ ] **Step 2: Lint + tsc gate**

Run: `cd /d/e-commerce-OSCAR/apps/mobile && npm run lint 2>&1 | grep -E "problems|error" | tail -2`
Expected: `0 errors`.

Run: `cd /d/e-commerce-OSCAR/apps/mobile && npx tsc --noEmit 2>&1 | grep -cE "error TS"`
Expected: `<= 155` (zero new). If higher, run `npx tsc --noEmit 2>&1 | grep -E "error TS"` and fix only errors in `src/utils/payment.ts` or `app/checkout/index.tsx`.

- [ ] **Step 3: Update the status doc**

In `docs/superpowers/mobile-enhancement-status.md`: add an **M1d** entry to the Done list (COD live, CIB/BaridiMob coming-soon; tested `src/utils/payment.ts`; gateway screens deferred), bump the Health test count, and remove "Reachable CIB/Baridimob payment screens" from "Next up" (replace with a note that the real gateway is deferred pending backend). Match the M1a/M1b/M1c entry style.

- [ ] **Step 4: Commit**

```bash
cd /d/e-commerce-OSCAR/apps/mobile && git add ../../docs/superpowers/mobile-enhancement-status.md && git commit -m "docs(mobile): mark M1d payment gating done (M1d)"
```

---

## Self-review notes (for the executor)
- **Mobile is standalone** — do not import `@oscar/shared`; the coming-soon labels are defined locally in `payment.ts`.
- **`payment.ts` stays UI-free** — `icon` is a plain string; the only `Ionicons` cast lives at the checkout's `<Ionicons name=...>` boundary.
- **Do not touch the deferred gateway code** (`app/payment/*`, `PaymentWebView`, `PaymentMethodSelector`) — out of scope.
- **Zero new tsc errors** is the gate (baseline 155). Never "fix" pre-existing baseline errors as part of M1d.
- `handlePlaceOrder` and the review step intentionally keep reading `paymentMethods.find(...)` — the selected id is always an available method (a subset), so it resolves correctly; no change needed there.
