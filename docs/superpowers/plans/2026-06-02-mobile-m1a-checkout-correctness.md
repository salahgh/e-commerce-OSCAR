# Mobile M1a — Checkout Correctness Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make the mobile checkout submit a *correct* order — real customer email + real `province` — by mirroring the canonical frontend checkout (`apps/frontend/.../(shop)/checkout/page.tsx`).

**Architecture:** Add the two missing fields (guest-only `email`, `wilayaCode`) to the checkout address step; move the order-input mapping into pure, unit-tested helpers; resolve `province` from the wilaya **name**; prefill for logged-in users; retire the orphaned `delivery.tsx`. Mobile-only; no backend changes.

**Tech Stack:** Expo SDK 55, React Native 0.83, React 19, expo-router, Apollo Client 4, Formik + Yup, Jest (jest-expo) + RNTL (from M0).

**Working directory for ALL commands:** `apps/mobile` (the standalone npm project). Branch: `feat/mobile-m1a-checkout` (off `feat/mobile-m0-stabilize`, so the M0 test harness is present).

---

## File Map

**Created:**
- `apps/mobile/src/utils/checkout.ts` — pure helpers: `resolveWilayaName`, `buildShippingAddressInput`, `buildGuestCustomerInput`
- `apps/mobile/src/utils/__tests__/checkout.test.ts`
- `apps/mobile/src/components/checkout/WilayaPicker.tsx` — wilaya select field (salvaged from `delivery.tsx`)

**Modified:**
- `apps/mobile/src/utils/validation.ts` — `makeShippingAddressSchema(includeEmail)` factory + `wilayaCode`
- `apps/mobile/src/utils/__tests__/validation.test.ts` — schema-factory tests
- `apps/mobile/src/components/checkout/ShippingAddressForm.tsx` — `email` (guest-only) + wilaya field, schema/showEmail props, `email`+`wilayaCode` on values
- `apps/mobile/src/components/checkout/index.ts` — export `WilayaPicker` (if barrel exports components)
- `apps/mobile/app/checkout/index.tsx` — use helpers, prefill, stale-session handling, pass `showEmail`/`validationSchema`

**Deleted:**
- `apps/mobile/app/checkout/delivery.tsx` — orphaned, non-canonical (commune/bureau-domicile)

---

## Task 1: Pure checkout helpers (TDD)

**Files:**
- Create: `apps/mobile/src/utils/checkout.ts`
- Create: `apps/mobile/src/utils/__tests__/checkout.test.ts`

- [ ] **Step 1: Write the failing tests**

Create `apps/mobile/src/utils/__tests__/checkout.test.ts`:
```ts
import { resolveWilayaName, buildShippingAddressInput, buildGuestCustomerInput } from '../checkout';
import type { Wilaya } from '../../data/wilayas';

const WILAYAS = [
  { code: '16', name: 'Alger', nameAr: '', shippingZone: 1, communes: [] },
  { code: '31', name: 'Oran', nameAr: '', shippingZone: 2, communes: [] },
] as unknown as Wilaya[];

const VALUES = {
  fullName: 'Sara Ben Ali',
  phoneNumber: '0551234567',
  address: '12 Rue Didouche',
  city: 'Alger Centre',
  postalCode: '16000',
  notes: 'Ring twice',
  wilayaCode: '16',
  email: 'sara@example.com',
};

describe('resolveWilayaName', () => {
  it('resolves a wilaya code to its name', () => {
    expect(resolveWilayaName('16', WILAYAS)).toBe('Alger');
  });
  it('falls back to the code when not found', () => {
    expect(resolveWilayaName('99', WILAYAS)).toBe('99');
  });
});

describe('buildShippingAddressInput', () => {
  it('maps form values to a Vendure shipping address with province = wilaya name', () => {
    expect(buildShippingAddressInput(VALUES, WILAYAS)).toEqual({
      fullName: 'Sara Ben Ali',
      streetLine1: '12 Rue Didouche',
      streetLine2: 'Ring twice',
      city: 'Alger Centre',
      province: 'Alger',
      postalCode: '16000',
      countryCode: 'DZ',
      phoneNumber: '0551234567',
    });
  });
  it('never emits an empty province for a known wilaya', () => {
    expect(buildShippingAddressInput(VALUES, WILAYAS).province).not.toBe('');
  });
  it('defaults optional streetLine2/postalCode to empty strings', () => {
    const v = { ...VALUES, notes: undefined, postalCode: undefined };
    const out = buildShippingAddressInput(v, WILAYAS);
    expect(out.streetLine2).toBe('');
    expect(out.postalCode).toBe('');
  });
});

describe('buildGuestCustomerInput', () => {
  it('splits the name on the first space', () => {
    const out = buildGuestCustomerInput(VALUES);
    expect(out.firstName).toBe('Sara');
    expect(out.lastName).toBe('Ben Ali');
  });
  it('uses the whole name for both parts when there is no space', () => {
    const out = buildGuestCustomerInput({ ...VALUES, fullName: 'Sara' });
    expect(out.firstName).toBe('Sara');
    expect(out.lastName).toBe('Sara');
  });
  it('uses the real email verbatim and never fabricates a guest address', () => {
    const out = buildGuestCustomerInput(VALUES);
    expect(out.emailAddress).toBe('sara@example.com');
    expect(out.emailAddress).not.toMatch(/guest_/);
  });
});
```

- [ ] **Step 2: Run to verify it fails**

Run (in `apps/mobile`): `npm test -- checkout`
Expected: FAIL — `Cannot find module '../checkout'`.

- [ ] **Step 3: Implement the helpers**

Create `apps/mobile/src/utils/checkout.ts`:
```ts
import type { Wilaya } from '../data/wilayas';

/** Form values the checkout address step collects (superset used by the helpers). */
export interface CheckoutAddressValues {
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode?: string;
  notes?: string;
  wilayaCode: string;
  email?: string;
}

export interface ShippingAddressInput {
  fullName: string;
  streetLine1: string;
  streetLine2: string;
  city: string;
  province: string;
  postalCode: string;
  countryCode: string;
  phoneNumber: string;
}

export interface GuestCustomerInput {
  firstName: string;
  lastName: string;
  emailAddress: string;
  phoneNumber: string;
}

/** Resolve a wilaya code to its display name; fall back to the code if unknown. */
export function resolveWilayaName(wilayaCode: string, wilayas: Wilaya[]): string {
  return wilayas.find((w) => w.code === wilayaCode)?.name ?? wilayaCode;
}

/** Build the Vendure shipping-address input, setting province to the wilaya name. */
export function buildShippingAddressInput(
  values: CheckoutAddressValues,
  wilayas: Wilaya[]
): ShippingAddressInput {
  return {
    fullName: values.fullName,
    streetLine1: values.address,
    streetLine2: values.notes || '',
    city: values.city,
    province: resolveWilayaName(values.wilayaCode, wilayas),
    postalCode: values.postalCode || '',
    countryCode: 'DZ',
    phoneNumber: values.phoneNumber,
  };
}

/** Build the guest setCustomerForOrder input from the real (never fabricated) email. */
export function buildGuestCustomerInput(values: CheckoutAddressValues): GuestCustomerInput {
  const trimmed = values.fullName.trim();
  const spaceIdx = trimmed.indexOf(' ');
  const firstName = spaceIdx === -1 ? trimmed : trimmed.slice(0, spaceIdx);
  const lastName = spaceIdx === -1 ? trimmed : trimmed.slice(spaceIdx + 1);
  return {
    firstName,
    lastName,
    emailAddress: values.email ?? '',
    phoneNumber: values.phoneNumber,
  };
}
```

- [ ] **Step 4: Run to verify it passes**

Run (in `apps/mobile`): `npm test -- checkout`
Expected: PASS — all helper tests green.

- [ ] **Step 5: Commit**

```bash
git add src/utils/checkout.ts src/utils/__tests__/checkout.test.ts
git commit -m "feat(mobile): add pure checkout address/customer input helpers (M1a)"
```

---

## Task 2: Validation schema factory (TDD)

**Files:**
- Modify: `apps/mobile/src/utils/validation.ts`
- Modify: `apps/mobile/src/utils/__tests__/validation.test.ts`

- [ ] **Step 1: Write the failing tests** — append to `src/utils/__tests__/validation.test.ts`:
```ts
import { makeShippingAddressSchema } from '../validation';

describe('makeShippingAddressSchema', () => {
  const base = {
    fullName: 'Sara Ben Ali',
    phoneNumber: '0551234567',
    address: '12 Rue Didouche',
    city: 'Alger',
    postalCode: '16000',
    wilayaCode: '16',
  };

  it('requires wilayaCode', async () => {
    await expect(
      makeShippingAddressSchema(false).validate({ ...base, wilayaCode: '' })
    ).rejects.toBeInstanceOf(Yup.ValidationError);
  });

  it('accepts a valid guest payload (with email) when includeEmail=true', async () => {
    await expect(
      makeShippingAddressSchema(true).validate({ ...base, email: 'sara@example.com' })
    ).resolves.toBeTruthy();
  });

  it('rejects a missing/invalid email when includeEmail=true', async () => {
    await expect(
      makeShippingAddressSchema(true).validate({ ...base, email: 'nope' })
    ).rejects.toBeInstanceOf(Yup.ValidationError);
  });

  it('does not require email when includeEmail=false', async () => {
    await expect(makeShippingAddressSchema(false).validate(base)).resolves.toBeTruthy();
  });
});
```
(The file already imports `* as Yup from 'yup'` from Task 4 of M0.)

- [ ] **Step 2: Run to verify it fails**

Run (in `apps/mobile`): `npm test -- validation`
Expected: FAIL — `makeShippingAddressSchema is not a function` / not exported.

- [ ] **Step 3: Implement the factory** — in `src/utils/validation.ts`, replace the existing `shippingAddressSchema` block (the `export const shippingAddressSchema = Yup.object().shape({...})`) with:
```ts
// Shipping Address Schema (factory — email required only for guest checkout)
export const makeShippingAddressSchema = (includeEmail: boolean) =>
  Yup.object().shape({
    fullName: Yup.string()
      .min(3, 'Full name must be at least 3 characters')
      .required('Full name is required')
      .trim(),
    phoneNumber: validationRules.phone,
    address: Yup.string()
      .min(10, 'Address must be at least 10 characters')
      .required('Address is required')
      .trim(),
    city: Yup.string()
      .min(2, 'City must be at least 2 characters')
      .required('City is required')
      .trim(),
    wilayaCode: Yup.string().required('Wilaya is required'),
    postalCode: Yup.string()
      .matches(/^[0-9]{5}$/, 'Postal code must be 5 digits')
      .required('Postal code is required'),
    notes: Yup.string().max(500, 'Notes must be less than 500 characters').optional(),
    ...(includeEmail
      ? { email: Yup.string().email('Invalid email address').required('Email is required').trim() }
      : {}),
  });

/** Default (guest email NOT required) — kept for back-compat with existing importers. */
export const shippingAddressSchema = makeShippingAddressSchema(false);
```

- [ ] **Step 4: Run to verify it passes**

Run (in `apps/mobile`): `npm test -- validation`
Expected: PASS — including the existing login/phone tests and the new schema tests.

- [ ] **Step 5: Commit**

```bash
git add src/utils/validation.ts src/utils/__tests__/validation.test.ts
git commit -m "feat(mobile): make shipping-address schema a factory with wilaya + guest email (M1a)"
```

---

## Task 3: WilayaPicker component

**Files:**
- Create: `apps/mobile/src/components/checkout/WilayaPicker.tsx`

- [ ] **Step 1: Create the component**

Create `apps/mobile/src/components/checkout/WilayaPicker.tsx`:
```tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { wilayas } from '../../data/wilayas';
import { FilterSheet } from '../products/FilterSheet';
import { colors, spacing, typography } from '../../theme';

interface WilayaPickerProps {
  value: string; // wilaya code
  onSelect: (code: string) => void;
  error?: string;
}

export const WilayaPicker: React.FC<WilayaPickerProps> = ({ value, onSelect, error }) => {
  const { t } = useTranslation();
  const [open, setOpen] = useState(false);
  const selectedName = wilayas.find((w) => w.code === value)?.name ?? '';

  return (
    <View style={styles.group}>
      <Text style={styles.label}>
        {t('checkout.wilaya', 'Wilaya')}
        <Text style={styles.required}> *</Text>
      </Text>
      <TouchableOpacity
        style={[styles.select, !!error && styles.selectError]}
        onPress={() => setOpen(true)}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t('checkout.chooseWilaya', 'Choose wilaya')}
      >
        <Text style={[styles.selectText, !value && styles.placeholder]}>
          {selectedName || t('checkout.chooseWilaya', 'Choose wilaya')}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.text.tertiary} />
      </TouchableOpacity>
      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <FilterSheet
        visible={open}
        onClose={() => setOpen(false)}
        title={t('checkout.wilaya', 'Wilaya')}
        onClear={() => onSelect('')}
        onSave={() => setOpen(false)}
      >
        {wilayas.map((w) => (
          <TouchableOpacity
            key={w.code}
            style={styles.option}
            onPress={() => {
              onSelect(w.code);
              setOpen(false);
            }}
            activeOpacity={0.7}
          >
            <Text style={[styles.optionText, value === w.code && styles.optionTextActive]}>
              {w.code} - {w.name}
            </Text>
            {value === w.code && <Ionicons name="checkmark" size={20} color={colors.primary} />}
          </TouchableOpacity>
        ))}
      </FilterSheet>
    </View>
  );
};

const styles = StyleSheet.create({
  group: { gap: spacing.xs },
  label: {
    ...typography.styles.bodySmall,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  required: { color: colors.error },
  select: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectError: { borderColor: colors.error },
  selectText: { ...typography.styles.body, color: colors.text.primary, flex: 1 },
  placeholder: { color: colors.text.tertiary },
  errorText: { ...typography.styles.caption, color: colors.error },
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  optionText: { ...typography.styles.body, color: colors.text.primary },
  optionTextActive: { color: colors.primary, fontWeight: typography.fontWeight.semiBold },
});
```

- [ ] **Step 2: Type-check the new component**

Run (in `apps/mobile`): `npx tsc --noEmit 2>&1 | grep WilayaPicker || echo "WilayaPicker clean"`
Expected: `WilayaPicker clean`. (If `FilterSheet` prop names differ, open `src/components/products/FilterSheet.tsx` and match its actual `visible/onClose/title/onClear/onSave/children` prop names — they are used identically in the now-removed `delivery.tsx`.)

- [ ] **Step 3: Commit**

```bash
git add src/components/checkout/WilayaPicker.tsx
git commit -m "feat(mobile): add reusable WilayaPicker checkout field (M1a)"
```

---

## Task 4: Add email + wilaya to ShippingAddressForm

**Files:**
- Modify: `apps/mobile/src/components/checkout/ShippingAddressForm.tsx`

- [ ] **Step 1: Extend the values type + defaults**

In `ShippingAddressForm.tsx`, change the `ShippingAddressFormValues` interface to add `email` and `wilayaCode`:
```tsx
export interface ShippingAddressFormValues {
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode: string;
  notes?: string;
  email: string;
  wilayaCode: string;
}
```
And add them to `defaultInitialValues`:
```tsx
const defaultInitialValues: ShippingAddressFormValues = {
  fullName: '',
  phoneNumber: '',
  address: '',
  city: '',
  postalCode: '',
  notes: '',
  email: '',
  wilayaCode: '',
};
```

- [ ] **Step 2: Add the new props**

Change the imports to add the schema + WilayaPicker, and update the props interface:
```tsx
import { Input, Button } from '../ui';
import { WilayaPicker } from './WilayaPicker';
import { makeShippingAddressSchema, shippingAddressSchema } from '../../utils/validation';
```
```tsx
interface ShippingAddressFormProps {
  initialValues?: Partial<ShippingAddressFormValues>;
  onSubmit: (values: ShippingAddressFormValues) => void;
  loading?: boolean;
  submitButtonText?: string;
  showEmail?: boolean;
  validationSchema?: ReturnType<typeof makeShippingAddressSchema>;
}
```
And destructure them in the component signature (add `showEmail = false, validationSchema`):
```tsx
export const ShippingAddressForm: React.FC<ShippingAddressFormProps> = ({
  initialValues,
  onSubmit,
  loading = false,
  submitButtonText,
  showEmail = false,
  validationSchema,
}) => {
```

- [ ] **Step 3: Use the schema prop + add `setFieldValue`**

Change the Formik element's `validationSchema` and render-prop destructure:
```tsx
        <Formik
          initialValues={{ ...defaultInitialValues, ...initialValues }}
          validationSchema={validationSchema ?? shippingAddressSchema}
          onSubmit={onSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue, isValid }) => (
```

- [ ] **Step 4: Render the email field (guest-only) + the wilaya field**

Immediately after the opening `<View style={styles.form}>` (before the Full Name `Input`), add the email field:
```tsx
              {showEmail && (
                <Input
                  label={t('checkout.email', 'Email')}
                  placeholder="you@example.com"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={touched.email && errors.email ? errors.email : undefined}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  required
                />
              )}
```
And immediately after the `<View style={styles.row}>...</View>` block that holds City + Postal Code, add the wilaya picker:
```tsx
              <WilayaPicker
                value={values.wilayaCode}
                onSelect={(code) => setFieldValue('wilayaCode', code)}
                error={touched.wilayaCode && errors.wilayaCode ? errors.wilayaCode : undefined}
              />
```

- [ ] **Step 5: Type-check**

Run (in `apps/mobile`): `npx tsc --noEmit 2>&1 | grep "ShippingAddressForm" || echo "ShippingAddressForm clean"`
Expected: `ShippingAddressForm clean`.

- [ ] **Step 6: Commit**

```bash
git add src/components/checkout/ShippingAddressForm.tsx
git commit -m "feat(mobile): add guest email + wilaya fields to ShippingAddressForm (M1a)"
```

---

## Task 5: Wire checkout to the helpers + prefill + stale-session

**Files:**
- Modify: `apps/mobile/app/checkout/index.tsx`

- [ ] **Step 1: Add imports**

After the existing `import { formatPrice } from '../../src/utils/vendureAdapters';` line, add:
```tsx
import { buildShippingAddressInput, buildGuestCustomerInput } from '../../src/utils/checkout';
import { makeShippingAddressSchema } from '../../src/utils/validation';
import { wilayas } from '../../src/data/wilayas';
```

- [ ] **Step 2: Replace `handleShippingSubmit`**

Replace the entire `handleShippingSubmit` function (currently lines ~72-127) with:
```tsx
  const handleShippingSubmit = async (values: ShippingAddressFormValues) => {
    try {
      // Guest checkout: attach a customer (with a REAL email) to the order first.
      if (!isAuthenticated) {
        const customerResult = await setCustomerMutation({
          variables: { input: buildGuestCustomerInput(values) },
        });
        const customerResp = customerResult.data?.setCustomerForOrder;
        if (customerResp && 'errorCode' in customerResp) {
          if (customerResp.__typename === 'AlreadyLoggedInError') {
            throw new Error(
              t(
                'checkout.staleSession',
                'Your session is out of sync — please sign in again to continue.'
              )
            );
          }
          throw new Error((customerResp as { message: string }).message);
        }
      }

      const { data } = await setShippingAddressMutation({
        variables: { input: buildShippingAddressInput(values, wilayas) },
      });
      if (data?.setOrderShippingAddress && 'errorCode' in data.setOrderShippingAddress) {
        throw new Error((data.setOrderShippingAddress as { message: string }).message);
      }

      setShippingAddress(values);
      setCurrentStep('shippingMethod');
      refetchCart();
    } catch (error: any) {
      console.error('Set shipping address error:', error);
      Alert.alert(
        t('common.error', 'Error'),
        error.message || t('checkout.addressError', 'Failed to set shipping address')
      );
    }
  };
```

- [ ] **Step 3: Add the prefill value**

Immediately after the GraphQL hooks block (after the `useGetEligiblePaymentMethodsQuery` declaration, before `const shippingMethods = ...`), add:
```tsx
  // Prefill the address form for logged-in customers (mirrors the frontend checkout).
  const prefill: Partial<ShippingAddressFormValues> | undefined =
    isAuthenticated && user
      ? {
          email: user.email,
          fullName: `${user.firstName} ${user.lastName}`.trim(),
          phoneNumber: user.phoneNumber ?? '',
        }
      : undefined;
```

- [ ] **Step 4: Pass the new props to the form**

Replace the `<ShippingAddressForm .../>` usage in the `currentStep === 'shipping'` block with:
```tsx
          <ShippingAddressForm
            initialValues={shippingAddress || prefill}
            showEmail={!isAuthenticated}
            validationSchema={makeShippingAddressSchema(!isAuthenticated)}
            onSubmit={handleShippingSubmit}
            submitButtonText={t('checkout.continueToDelivery', 'Continue to Delivery')}
          />
```

- [ ] **Step 5: Type-check the file (expect the 2 pre-existing errors GONE)**

Run (in `apps/mobile`): `npx tsc --noEmit 2>&1 | grep "checkout/index" || echo "checkout/index clean"`
Expected: `checkout/index clean` — the prior `values.wilaya`/`values.email` errors are resolved and no new ones introduced. (If `__typename` narrowing complains, the `SetCustomerForOrder` result union includes `{ __typename?: 'AlreadyLoggedInError'; errorCode; message }`, so guard with `'errorCode' in customerResp` first as written.)

- [ ] **Step 6: Run the full test suite + lint**

Run (in `apps/mobile`):
```bash
npm test -- --ci
npm run lint
```
Expected: all tests pass; lint 0 errors.

- [ ] **Step 7: Commit**

```bash
git add app/checkout/index.tsx
git commit -m "fix(mobile): capture real email + real province in checkout (M1a)"
```

---

## Task 6: Retire the orphaned delivery.tsx

**Files:**
- Delete: `apps/mobile/app/checkout/delivery.tsx`
- Possibly modify: `apps/mobile/app/checkout/_layout.tsx` (if it registers `delivery`)

- [ ] **Step 1: Confirm it is unreferenced**

Run (in `apps/mobile`):
```bash
grep -rn "checkout/delivery\|'delivery'\|\"delivery\"" app src || echo "no references"
```
Expected: no `router.push`/navigation references to `/checkout/delivery`. (A `Stack.Screen name="delivery"` registration in `app/checkout/_layout.tsx` is OK to find — remove it in Step 2.)

- [ ] **Step 2: Delete the file (and any registration)**

```bash
git rm app/checkout/delivery.tsx
```
Then open `app/checkout/_layout.tsx`; if it contains a `<Stack.Screen name="delivery" ... />`, delete that line. (If the layout uses implicit registration, no change needed.)

- [ ] **Step 3: Verify nothing broke**

Run (in `apps/mobile`):
```bash
npx tsc --noEmit 2>&1 | grep -E "checkout/delivery|_layout" || echo "no delivery/layout errors"
npm test -- --ci
```
Expected: no errors referencing the deleted file; tests still pass.

- [ ] **Step 4: Commit**

```bash
git add -A app/checkout
git commit -m "chore(mobile): remove orphaned non-canonical checkout/delivery screen (M1a)"
```

---

## Task 7: Final verification

**Files:** none (verification only)

- [ ] **Step 1: Full suite + lint + scoped tsc**

Run (in `apps/mobile`):
```bash
npm test -- --ci
npm run lint
echo "=== tsc per-file (compare to baseline) ==="
npx tsc --noEmit 2>&1 | grep -oE "^[^(]+\.tsx?" | sort | uniq -c | sort -rn
```
Expected: tests pass; lint 0 errors; the tsc per-file list shows **`app/checkout/index.tsx` no longer present** (its 2 errors are fixed) and **no new files** added versus the M0 baseline.

- [ ] **Step 2: Manual smoke (human step)**

Start the app (`npm run start`). Verify:
1. As a **guest**, the checkout address step shows an **Email** field and a **Wilaya** picker; submitting proceeds to delivery method (no fabricated email; province set).
2. As a **logged-in** user, the email field is hidden and name/phone are prefilled; submitting proceeds.
3. There is no route to `/checkout/delivery` anymore.

---

## Self-review (completed by plan author)

**Spec coverage:** §3.1 form/schema → Tasks 2+4; §3.1 WilayaPicker → Task 3; §3.2 checkout fix + prefill + stale-session → Task 5; §3.3 retire delivery.tsx → Task 6; §3.4 pure helpers → Task 1; §4 testing → Tasks 1,2 (+ manual in 7); §6 success criteria → Task 7. All covered.

**Placeholder scan:** Every code step has complete code. The two `tsc`-guard notes (Task 3 Step 2, Task 5 Step 5) point at concrete fallbacks, not open work.

**Type consistency:** `CheckoutAddressValues` (helpers) is a structural superset satisfied by `ShippingAddressFormValues` (Task 4 adds `email`+`wilayaCode`). `buildShippingAddressInput(values, wilayas)`, `buildGuestCustomerInput(values)`, `makeShippingAddressSchema(includeEmail)`, and `WilayaPicker({ value, onSelect, error })` signatures match across Tasks 1–5.
