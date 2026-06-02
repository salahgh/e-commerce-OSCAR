# Mobile M1b — Saved Address Book + Checkout Picker Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let signed-in customers manage saved addresses (CRUD + default) from the profile, and reuse them at checkout via a picker that prefills the address step.

**Architecture:** Isolate all mapping logic in pure, unit-tested helpers (`src/utils/address.ts`, reusing M1a's `resolveWilayaName`/`WilayaPicker`). The `profile/addresses` screen toggles list ↔ inline form and persists via the codegen'd `Create/Update/DeleteCustomerAddress` mutations with `refetchQueries: ['ActiveCustomer']`. The checkout `SavedAddressPicker` prefills the M1a `ShippingAddressForm` (forced remount via `key`). Mobile-only; no backend changes.

**Tech Stack:** Expo SDK 55, React Native 0.83, React 19, expo-router, Apollo Client 4, Formik + Yup, Jest (jest-expo) + RNTL.

**Working dir:** `apps/mobile`. Branch: `feat/mobile-m1b-addresses` (off `main`).

> **GraphQL facts (verified):** `createCustomerAddress`/`updateCustomerAddress` return an `Address` directly (NOT a union — no `errorCode` handling needed; just try/catch thrown errors). `deleteCustomerAddress` returns `{ success }`. `CreateAddressInput`: `streetLine1` + `countryCode` required, all else optional. `UpdateAddressInput`: same + required `id`, `countryCode` optional. `ActiveCustomer.addresses[]` has `{ id, fullName, streetLine1, streetLine2, city, province, postalCode, phoneNumber, defaultShippingAddress }`. Hooks: `useActiveCustomerQuery`, `useCreateCustomerAddressMutation`, `useUpdateCustomerAddressMutation`, `useDeleteCustomerAddressMutation`.

---

## File Map
**Created:** `src/utils/address.ts` (+test), `src/components/profile/AddressForm.tsx`, `src/components/profile/AddressCard.tsx`, `app/profile/addresses.tsx`, `src/components/checkout/SavedAddressPicker.tsx`.
**Modified:** `src/utils/validation.ts` (+`addressFormSchema`, +test), `app/(tabs)/profile.tsx` (Addresses menu item), `app/checkout/index.tsx` (picker wiring), `src/components/checkout/ShippingAddressForm.tsx` (forced reinit via key — see Task 5), `src/i18n/locales/{en,fr,ar}.json`.

---

## Task 1: Address mapping helpers (TDD)

**Files:** Create `src/utils/address.ts`, `src/utils/__tests__/address.test.ts`.

- [ ] **Step 1: Write the failing tests** — `src/utils/__tests__/address.test.ts`:
```ts
import {
  resolveWilayaCode,
  buildCreateAddressInput,
  buildUpdateAddressInput,
  addressToFormValues,
  addressToCheckoutValues,
} from '../address';
import type { Wilaya } from '../../data/wilayas';

const WILAYAS = [
  { code: '16', name: 'Alger', nameAr: '', shippingZone: 1, communes: [] },
  { code: '31', name: 'Oran', nameAr: '', shippingZone: 2, communes: [] },
] as unknown as Wilaya[];

const FORM = {
  fullName: 'Sara Ben Ali',
  phoneNumber: '0551234567',
  streetLine1: '12 Rue Didouche',
  streetLine2: 'Apt 4',
  city: 'Alger Centre',
  wilayaCode: '16',
  postalCode: '16000',
  defaultShippingAddress: true,
};

const SAVED = {
  id: 'addr1',
  fullName: 'Sara Ben Ali',
  streetLine1: '12 Rue Didouche',
  streetLine2: 'Apt 4',
  city: 'Alger Centre',
  province: 'Alger',
  postalCode: '16000',
  phoneNumber: '0551234567',
  defaultShippingAddress: true,
};

describe('resolveWilayaCode', () => {
  it('maps a province name back to its wilaya code', () => {
    expect(resolveWilayaCode('Alger', WILAYAS)).toBe('16');
  });
  it('returns empty string for an unknown province', () => {
    expect(resolveWilayaCode('Nowhere', WILAYAS)).toBe('');
  });
});

describe('buildCreateAddressInput', () => {
  it('builds a CreateAddressInput with province=name, countryCode DZ, default flag', () => {
    expect(buildCreateAddressInput(FORM, WILAYAS)).toEqual({
      fullName: 'Sara Ben Ali',
      streetLine1: '12 Rue Didouche',
      streetLine2: 'Apt 4',
      city: 'Alger Centre',
      province: 'Alger',
      postalCode: '16000',
      countryCode: 'DZ',
      phoneNumber: '0551234567',
      defaultShippingAddress: true,
    });
  });
  it('maps empty optional streetLine2/postalCode to undefined', () => {
    const out = buildCreateAddressInput({ ...FORM, streetLine2: '', postalCode: '' }, WILAYAS);
    expect(out.streetLine2).toBeUndefined();
    expect(out.postalCode).toBeUndefined();
  });
});

describe('buildUpdateAddressInput', () => {
  it('includes the id plus the same mapping', () => {
    const out = buildUpdateAddressInput('addr1', FORM, WILAYAS);
    expect(out.id).toBe('addr1');
    expect(out.province).toBe('Alger');
    expect(out.countryCode).toBe('DZ');
  });
});

describe('addressToFormValues', () => {
  it('round-trips a saved address into form values (province name -> code, default flag)', () => {
    expect(addressToFormValues(SAVED, WILAYAS)).toEqual({
      fullName: 'Sara Ben Ali',
      phoneNumber: '0551234567',
      streetLine1: '12 Rue Didouche',
      streetLine2: 'Apt 4',
      city: 'Alger Centre',
      wilayaCode: '16',
      postalCode: '16000',
      defaultShippingAddress: true,
    });
  });
});

describe('addressToCheckoutValues', () => {
  it('maps a saved address to checkout form fields (streetLine1->address, streetLine2->notes)', () => {
    expect(addressToCheckoutValues(SAVED, WILAYAS)).toEqual({
      fullName: 'Sara Ben Ali',
      phoneNumber: '0551234567',
      address: '12 Rue Didouche',
      notes: 'Apt 4',
      city: 'Alger Centre',
      wilayaCode: '16',
      postalCode: '16000',
    });
  });
});
```

- [ ] **Step 2: Run — verify fail.** `npm test -- address` → FAIL (module missing).

- [ ] **Step 3: Implement** — `src/utils/address.ts`:
```ts
import type { Wilaya } from '../data/wilayas';
import { resolveWilayaName } from './checkout';

export interface AddressFormValues {
  fullName: string;
  phoneNumber: string;
  streetLine1: string;
  streetLine2?: string;
  city: string;
  wilayaCode: string;
  postalCode?: string;
  defaultShippingAddress: boolean;
}

export interface CreateAddressInputShape {
  fullName: string;
  streetLine1: string;
  streetLine2?: string;
  city: string;
  province: string;
  postalCode?: string;
  countryCode: string;
  phoneNumber: string;
  defaultShippingAddress: boolean;
}

/** A saved address (subset of ActiveCustomer.addresses) the helpers consume. */
export interface SavedAddress {
  id: string;
  fullName?: string | null;
  streetLine1: string;
  streetLine2?: string | null;
  city?: string | null;
  province?: string | null;
  postalCode?: string | null;
  phoneNumber?: string | null;
  defaultShippingAddress?: boolean | null;
}

/** Reverse of resolveWilayaName: province display name -> wilaya code ('' if unknown). */
export function resolveWilayaCode(provinceName: string, wilayas: Wilaya[]): string {
  return wilayas.find((w) => w.name === provinceName)?.code ?? '';
}

export function buildCreateAddressInput(values: AddressFormValues, wilayas: Wilaya[]): CreateAddressInputShape {
  return {
    fullName: values.fullName,
    streetLine1: values.streetLine1,
    streetLine2: values.streetLine2 || undefined,
    city: values.city,
    province: resolveWilayaName(values.wilayaCode, wilayas),
    postalCode: values.postalCode || undefined,
    countryCode: 'DZ',
    phoneNumber: values.phoneNumber,
    defaultShippingAddress: values.defaultShippingAddress,
  };
}

export function buildUpdateAddressInput(id: string, values: AddressFormValues, wilayas: Wilaya[]) {
  return { id, ...buildCreateAddressInput(values, wilayas) };
}

export function addressToFormValues(a: SavedAddress, wilayas: Wilaya[]): AddressFormValues {
  return {
    fullName: a.fullName ?? '',
    phoneNumber: a.phoneNumber ?? '',
    streetLine1: a.streetLine1 ?? '',
    streetLine2: a.streetLine2 ?? '',
    city: a.city ?? '',
    wilayaCode: resolveWilayaCode(a.province ?? '', wilayas),
    postalCode: a.postalCode ?? '',
    defaultShippingAddress: !!a.defaultShippingAddress,
  };
}

/** Map a saved address to the checkout ShippingAddressForm field names (no email). */
export function addressToCheckoutValues(a: SavedAddress, wilayas: Wilaya[]) {
  return {
    fullName: a.fullName ?? '',
    phoneNumber: a.phoneNumber ?? '',
    address: a.streetLine1 ?? '',
    notes: a.streetLine2 ?? '',
    city: a.city ?? '',
    wilayaCode: resolveWilayaCode(a.province ?? '', wilayas),
    postalCode: a.postalCode ?? '',
  };
}
```

- [ ] **Step 4: Run — verify pass.** `npm test -- address` → PASS.
- [ ] **Step 5: Commit.** `git add src/utils/address.ts src/utils/__tests__/address.test.ts && git commit -m "feat(mobile): add address mapping helpers (M1b)"`

---

## Task 2: addressFormSchema (TDD)

**Files:** Modify `src/utils/validation.ts`, `src/utils/__tests__/validation.test.ts`.

- [ ] **Step 1: Append tests** to `src/utils/__tests__/validation.test.ts`:
```ts
import { addressFormSchema } from '../validation';

describe('addressFormSchema', () => {
  const base = {
    fullName: 'Sara Ben Ali',
    phoneNumber: '0551234567',
    streetLine1: '12 Rue Didouche',
    city: 'Alger',
    wilayaCode: '16',
    postalCode: '16000',
    defaultShippingAddress: false,
  };
  it('accepts a valid address', async () => {
    await expect(addressFormSchema.validate(base)).resolves.toBeTruthy();
  });
  it('requires wilayaCode', async () => {
    await expect(addressFormSchema.validate({ ...base, wilayaCode: '' })).rejects.toBeInstanceOf(Yup.ValidationError);
  });
  it('requires a 5-digit postalCode', async () => {
    await expect(addressFormSchema.validate({ ...base, postalCode: '1' })).rejects.toBeInstanceOf(Yup.ValidationError);
  });
});
```
(`Yup` is already imported in this file.)

- [ ] **Step 2: Run — verify fail.** `npm test -- validation` → FAIL (`addressFormSchema` not exported).

- [ ] **Step 3: Implement** — append to `src/utils/validation.ts`:
```ts
// Address-book form schema (profile/addresses)
export const addressFormSchema = Yup.object().shape({
  fullName: Yup.string().min(3, 'Full name must be at least 3 characters').required('Full name is required').trim(),
  phoneNumber: validationRules.phone,
  streetLine1: Yup.string().min(5, 'Address must be at least 5 characters').required('Address is required').trim(),
  streetLine2: Yup.string().optional(),
  city: Yup.string().min(2, 'City must be at least 2 characters').required('City is required').trim(),
  wilayaCode: Yup.string().required('Wilaya is required'),
  postalCode: Yup.string().matches(/^[0-9]{5}$/, 'Postal code must be 5 digits').required('Postal code is required'),
  defaultShippingAddress: Yup.boolean(),
});
```

- [ ] **Step 4: Run — verify pass.** `npm test -- validation` → PASS.
- [ ] **Step 5: Commit.** `git add src/utils/validation.ts src/utils/__tests__/validation.test.ts && git commit -m "feat(mobile): add address-book form schema (M1b)"`

---

## Task 3: AddressForm + AddressCard components

**Files:** Create `src/components/profile/AddressForm.tsx`, `src/components/profile/AddressCard.tsx`.

- [ ] **Step 1: Create `AddressForm.tsx`:**
```tsx
import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { Input, Button, Switch } from '../ui';
import { WilayaPicker } from '../checkout/WilayaPicker';
import { addressFormSchema } from '../../utils/validation';
import type { AddressFormValues } from '../../utils/address';
import { spacing } from '../../theme';

const EMPTY: AddressFormValues = {
  fullName: '', phoneNumber: '', streetLine1: '', streetLine2: '', city: '',
  wilayaCode: '', postalCode: '', defaultShippingAddress: false,
};

interface Props {
  initialValues?: Partial<AddressFormValues>;
  onSubmit: (values: AddressFormValues) => void;
  submitting?: boolean;
  submitLabel: string;
}

export const AddressForm: React.FC<Props> = ({ initialValues, onSubmit, submitting = false, submitLabel }) => {
  const { t } = useTranslation();
  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'} keyboardVerticalOffset={100}>
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.form}>
        <Formik initialValues={{ ...EMPTY, ...initialValues }} validationSchema={addressFormSchema} onSubmit={onSubmit}>
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue, isValid }) => (
            <View style={styles.fields}>
              <Input label={t('checkout.fullName', 'Full Name')} value={values.fullName} onChangeText={handleChange('fullName')} onBlur={handleBlur('fullName')} error={touched.fullName && errors.fullName ? errors.fullName : undefined} autoCapitalize="words" required />
              <Input label={t('checkout.phoneNumber', 'Phone Number')} value={values.phoneNumber} onChangeText={handleChange('phoneNumber')} onBlur={handleBlur('phoneNumber')} error={touched.phoneNumber && errors.phoneNumber ? errors.phoneNumber : undefined} keyboardType="phone-pad" required />
              <Input label={t('checkout.address', 'Address')} value={values.streetLine1} onChangeText={handleChange('streetLine1')} onBlur={handleBlur('streetLine1')} error={touched.streetLine1 && errors.streetLine1 ? errors.streetLine1 : undefined} required />
              <Input label={t('address.line2', 'Apartment / extra (optional)')} value={values.streetLine2} onChangeText={handleChange('streetLine2')} onBlur={handleBlur('streetLine2')} />
              <View style={styles.row}>
                <Input label={t('checkout.city', 'City')} value={values.city} onChangeText={handleChange('city')} onBlur={handleBlur('city')} error={touched.city && errors.city ? errors.city : undefined} containerStyle={styles.half} required />
                <Input label={t('checkout.postalCode', 'Postal Code')} value={values.postalCode} onChangeText={handleChange('postalCode')} onBlur={handleBlur('postalCode')} error={touched.postalCode && errors.postalCode ? errors.postalCode : undefined} keyboardType="number-pad" maxLength={5} containerStyle={styles.half} required />
              </View>
              <WilayaPicker value={values.wilayaCode} onSelect={(code) => setFieldValue('wilayaCode', code)} error={touched.wilayaCode && errors.wilayaCode ? errors.wilayaCode : undefined} />
              <Switch label={t('address.setDefault', 'Set as default address')} value={values.defaultShippingAddress} onValueChange={(v) => setFieldValue('defaultShippingAddress', v)} labelPosition="left" />
              <Button title={submitLabel} onPress={handleSubmit} loading={submitting} disabled={submitting || !isValid} fullWidth style={styles.submit} />
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  form: { padding: spacing.lg },
  fields: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
  submit: { marginTop: spacing.md },
});
```

- [ ] **Step 2: Create `AddressCard.tsx`:**
```tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { SavedAddress } from '../../utils/address';
import { colors, spacing, typography } from '../../theme';

interface Props {
  address: SavedAddress;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}

export const AddressCard: React.FC<Props> = ({ address, onEdit, onDelete, onSetDefault }) => {
  const { t } = useTranslation();
  const isDefault = !!address.defaultShippingAddress;
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={styles.name}>{address.fullName}</Text>
        {isDefault && (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{t('address.default', 'Default')}</Text>
          </View>
        )}
      </View>
      <Text style={styles.line}>{address.streetLine1}{address.streetLine2 ? `, ${address.streetLine2}` : ''}</Text>
      <Text style={styles.line}>{address.city}{address.province ? ` · ${address.province}` : ''}{address.postalCode ? ` ${address.postalCode}` : ''}</Text>
      {address.phoneNumber ? <Text style={styles.muted}>{address.phoneNumber}</Text> : null}
      <View style={styles.actions}>
        {!isDefault && (
          <TouchableOpacity onPress={onSetDefault} accessibilityRole="button"><Text style={styles.action}>{t('address.makeDefault', 'Set default')}</Text></TouchableOpacity>
        )}
        <TouchableOpacity onPress={onEdit} accessibilityRole="button"><Text style={styles.action}>{t('common.edit', 'Edit')}</Text></TouchableOpacity>
        <TouchableOpacity onPress={onDelete} accessibilityRole="button"><Text style={[styles.action, styles.danger]}>{t('common.delete', 'Delete')}</Text></TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: { backgroundColor: colors.surface, borderRadius: 12, borderWidth: 1, borderColor: colors.border, padding: spacing.md, gap: spacing.xs },
  headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  name: { ...typography.styles.body, fontWeight: typography.fontWeight.semiBold, color: colors.text.primary },
  badge: { backgroundColor: colors.primary, borderRadius: 6, paddingHorizontal: spacing.sm, paddingVertical: 2 },
  badgeText: { ...typography.styles.caption, color: colors.text.inverse },
  line: { ...typography.styles.bodySmall, color: colors.text.primary },
  muted: { ...typography.styles.caption, color: colors.text.secondary },
  actions: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm },
  action: { ...typography.styles.bodySmall, color: colors.primary, fontWeight: typography.fontWeight.medium },
  danger: { color: colors.error },
});
```

- [ ] **Step 3: Type-check.** `npx tsc --noEmit 2>&1 | grep -E "AddressForm|AddressCard" || echo "clean"` → `clean`. (If `Input` lacks a `containerStyle` prop, it does — confirmed used in `ShippingAddressForm`. If `Switch`/`Input`/`Button` aren't all exported from `../ui`, confirm `src/components/ui/index.ts` exports them — it exports `* from './Switch'` and Button/Input.)
- [ ] **Step 4: Commit.** `git add src/components/profile/AddressForm.tsx src/components/profile/AddressCard.tsx && git commit -m "feat(mobile): add AddressForm + AddressCard (M1b)"`

---

## Task 4: Address book screen + profile entry

**Files:** Create `app/profile/addresses.tsx`; Modify `app/(tabs)/profile.tsx`.

- [ ] **Step 1: Create `app/profile/addresses.tsx`:**
```tsx
import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import {
  useActiveCustomerQuery,
  useCreateCustomerAddressMutation,
  useUpdateCustomerAddressMutation,
  useDeleteCustomerAddressMutation,
} from '../../src/graphql/generated/graphql';
import { AddressForm } from '../../src/components/profile/AddressForm';
import { AddressCard } from '../../src/components/profile/AddressCard';
import { Button, LoadingSpinner, EmptyState, useToast } from '../../src/components/ui';
import {
  AddressFormValues,
  SavedAddress,
  buildCreateAddressInput,
  buildUpdateAddressInput,
  addressToFormValues,
} from '../../src/utils/address';
import { wilayas } from '../../src/data/wilayas';
import { colors, spacing, typography } from '../../src/theme';

type Mode = { kind: 'list' } | { kind: 'create' } | { kind: 'edit'; address: SavedAddress };

export default function AddressesScreen() {
  const { t } = useTranslation();
  const toast = useToast();
  const [mode, setMode] = useState<Mode>({ kind: 'list' });

  const { data, loading } = useActiveCustomerQuery({ fetchPolicy: 'cache-and-network' });
  const [createAddress, { loading: creating }] = useCreateCustomerAddressMutation();
  const [updateAddress, { loading: updating }] = useUpdateCustomerAddressMutation();
  const [deleteAddress] = useDeleteCustomerAddressMutation();

  const addresses = (data?.activeCustomer?.addresses ?? []) as SavedAddress[];

  const handleSubmit = async (values: AddressFormValues) => {
    try {
      if (mode.kind === 'edit') {
        await updateAddress({ variables: { input: buildUpdateAddressInput(mode.address.id, values, wilayas) }, refetchQueries: ['ActiveCustomer'] });
        toast.success(t('address.updated', 'Address updated'));
      } else {
        await createAddress({ variables: { input: buildCreateAddressInput(values, wilayas) }, refetchQueries: ['ActiveCustomer'] });
        toast.success(t('address.added', 'Address added'));
      }
      setMode({ kind: 'list' });
    } catch (e: any) {
      toast.error(e?.message || t('address.saveError', 'Could not save the address'));
    }
  };

  const handleDelete = (a: SavedAddress) => {
    Alert.alert(t('address.deleteTitle', 'Delete address'), t('address.deleteMessage', 'Remove this saved address?'), [
      { text: t('common.cancel', 'Cancel'), style: 'cancel' },
      {
        text: t('common.delete', 'Delete'),
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteAddress({ variables: { id: a.id }, refetchQueries: ['ActiveCustomer'] });
            toast.success(t('address.deleted', 'Address removed'));
          } catch (e: any) {
            toast.error(e?.message || t('address.deleteError', 'Could not delete the address'));
          }
        },
      },
    ]);
  };

  const handleSetDefault = async (a: SavedAddress) => {
    try {
      await updateAddress({ variables: { input: { id: a.id, defaultShippingAddress: true } }, refetchQueries: ['ActiveCustomer'] });
    } catch (e: any) {
      toast.error(e?.message || t('address.saveError', 'Could not update the address'));
    }
  };

  const title =
    mode.kind === 'create' ? t('address.addTitle', 'Add address')
    : mode.kind === 'edit' ? t('address.editTitle', 'Edit address')
    : t('address.title', 'My Addresses');

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title,
          headerBackVisible: mode.kind === 'list',
          headerLeft: mode.kind === 'list' ? undefined : () => (
            <TouchableOpacity onPress={() => setMode({ kind: 'list' })} accessibilityLabel={t('common.back', 'Back')}>
              <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          ),
        }}
      />

      {mode.kind !== 'list' ? (
        <AddressForm
          initialValues={mode.kind === 'edit' ? addressToFormValues(mode.address, wilayas) : undefined}
          onSubmit={handleSubmit}
          submitting={creating || updating}
          submitLabel={mode.kind === 'edit' ? t('common.save', 'Save') : t('address.add', 'Add address')}
        />
      ) : loading && addresses.length === 0 ? (
        <LoadingSpinner />
      ) : addresses.length === 0 ? (
        <View style={styles.emptyWrap}>
          <EmptyState icon="location-outline" title={t('address.emptyTitle', 'No saved addresses')} message={t('address.emptyMessage', 'Add an address to speed up checkout.')} />
          <Button title={t('address.add', 'Add address')} onPress={() => setMode({ kind: 'create' })} style={styles.addBtn} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {addresses.map((a) => (
            <AddressCard key={a.id} address={a} onEdit={() => setMode({ kind: 'edit', address: a })} onDelete={() => handleDelete(a)} onSetDefault={() => handleSetDefault(a)} />
          ))}
          <Button title={t('address.add', 'Add address')} onPress={() => setMode({ kind: 'create' })} variant="outline" fullWidth style={styles.addBtn} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.lg, gap: spacing.md },
  emptyWrap: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl, gap: spacing.lg },
  addBtn: { marginTop: spacing.md, minWidth: 200 },
});
```
> Note: confirm `EmptyState` accepts `icon`/`title`/`message` props (it's used elsewhere); if its prop names differ, match them. Confirm `Button` has a `variant="outline"` (used in `orders/[id].tsx`).

- [ ] **Step 2:** Add the menu entry in `app/(tabs)/profile.tsx`. After the `t('profile.personalInfo')` menu item object (the one with `onPress: () => router.push('/profile/edit')`), insert:
```tsx
    {
      icon: 'location-outline',
      label: t('profile.addresses', 'My Addresses'),
      onPress: () => router.push('/profile/addresses' as any),
    },
```

- [ ] **Step 3: Type-check + tests.** `npx tsc --noEmit 2>&1 | grep -E "profile/addresses|\(tabs\)/profile" || echo "clean"` and `npm test -- --ci | tail -4`. Expected: clean; tests still pass.
- [ ] **Step 4: Commit.** `git add app/profile/addresses.tsx 'app/(tabs)/profile.tsx' && git commit -m "feat(mobile): add saved-address book screen + profile entry (M1b)"`

---

## Task 5: Checkout saved-address picker

**Files:** Create `src/components/checkout/SavedAddressPicker.tsx`; Modify `app/checkout/index.tsx`, `src/components/checkout/ShippingAddressForm.tsx`.

- [ ] **Step 1: Enable Formik reinitialize** in `ShippingAddressForm.tsx` so a picker selection re-seeds the form. Change the `<Formik` opening to add `enableReinitialize`:
```tsx
        <Formik
          initialValues={{ ...defaultInitialValues, ...initialValues }}
          enableReinitialize
          validationSchema={validationSchema ?? shippingAddressSchema}
          onSubmit={onSubmit}
        >
```

- [ ] **Step 2: Create `SavedAddressPicker.tsx`:**
```tsx
import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { SavedAddress } from '../../utils/address';
import { colors, spacing, typography } from '../../theme';

interface Props {
  addresses: SavedAddress[];
  selectedId: string | null;
  onSelect: (a: SavedAddress) => void;
}

export const SavedAddressPicker: React.FC<Props> = ({ addresses, selectedId, onSelect }) => {
  const { t } = useTranslation();
  if (addresses.length === 0) return null;
  return (
    <View style={styles.wrap}>
      <Text style={styles.title}>{t('address.useSaved', 'Use a saved address')}</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {addresses.map((a) => {
          const selected = a.id === selectedId;
          return (
            <TouchableOpacity key={a.id} style={[styles.chip, selected && styles.chipSelected]} onPress={() => onSelect(a)} activeOpacity={0.7}>
              {selected && <Ionicons name="checkmark-circle" size={16} color={colors.primary} />}
              <View>
                <Text style={styles.chipName} numberOfLines={1}>{a.fullName}</Text>
                <Text style={styles.chipLine} numberOfLines={1}>{a.streetLine1}{a.province ? ` · ${a.province}` : ''}</Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  wrap: { marginBottom: spacing.lg, gap: spacing.sm },
  title: { ...typography.styles.body, fontWeight: typography.fontWeight.semiBold, color: colors.text.primary },
  row: { gap: spacing.sm, paddingRight: spacing.lg },
  chip: { flexDirection: 'row', alignItems: 'center', gap: spacing.xs, maxWidth: 220, backgroundColor: colors.surface, borderWidth: 2, borderColor: colors.border, borderRadius: 10, padding: spacing.md },
  chipSelected: { borderColor: colors.primary },
  chipName: { ...typography.styles.bodySmall, fontWeight: typography.fontWeight.medium, color: colors.text.primary },
  chipLine: { ...typography.styles.caption, color: colors.text.secondary },
});
```

- [ ] **Step 3: Wire into `app/checkout/index.tsx`.**

(a) Add these two imports, and add `useActiveCustomerQuery` to the **existing** `from '../../src/graphql/generated/graphql'` import block (do NOT add a second import line from that module — `import/no-duplicates` would flag it):
```tsx
import { addressToCheckoutValues, SavedAddress } from '../../src/utils/address';
import { SavedAddressPicker } from '../../src/components/checkout/SavedAddressPicker';
```
Then add `useActiveCustomerQuery,` to the existing destructured import list from `'../../src/graphql/generated/graphql'` (alongside `useSetCustomerForOrderMutation` etc.).

(b) Inside the component, after the `prefill` declaration (added in M1a), add saved-address state + query:
```tsx
  const { data: customerData } = useActiveCustomerQuery({ skip: !isAuthenticated, fetchPolicy: 'cache-and-network' });
  const savedAddresses = (customerData?.activeCustomer?.addresses ?? []) as SavedAddress[];
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);

  // Default the selection to the customer's default shipping address (once loaded).
  useEffect(() => {
    if (!selectedAddressId && savedAddresses.length > 0) {
      const def = savedAddresses.find((a) => a.defaultShippingAddress) ?? savedAddresses[0];
      setSelectedAddressId(def.id);
    }
  }, [savedAddresses, selectedAddressId]);

  const selectedAddress = savedAddresses.find((a) => a.id === selectedAddressId) ?? null;
  const formInitialValues =
    shippingAddress ??
    (selectedAddress ? addressToCheckoutValues(selectedAddress, wilayas) : prefill);
```
(`useState`/`useEffect` are already imported in this file.)

(c) In the `currentStep === 'shipping'` block, render the picker above the form and drive the form off `formInitialValues` with a `key` that changes on selection so it re-seeds:
```tsx
        {currentStep === 'shipping' && (
          <>
            {isAuthenticated && (
              <SavedAddressPicker
                addresses={savedAddresses}
                selectedId={selectedAddressId}
                onSelect={(a) => setSelectedAddressId(a.id)}
              />
            )}
            <ShippingAddressForm
              key={selectedAddressId ?? 'new'}
              initialValues={formInitialValues}
              showEmail={!isAuthenticated}
              validationSchema={makeShippingAddressSchema(!isAuthenticated)}
              onSubmit={handleShippingSubmit}
              submitButtonText={t('checkout.continueToDelivery', 'Continue to Delivery')}
            />
          </>
        )}
```
(Replace the existing single `<ShippingAddressForm .../>` block from M1a.)

- [ ] **Step 4: Type-check + tests.** `npx tsc --noEmit 2>&1 | grep -E "checkout/index|SavedAddressPicker" || echo "clean"`; `npm test -- --ci | tail -4`. Expected clean; tests pass.
- [ ] **Step 5: Commit.** `git add src/components/checkout/SavedAddressPicker.tsx src/components/checkout/ShippingAddressForm.tsx app/checkout/index.tsx && git commit -m "feat(mobile): prefill checkout from saved addresses (M1b)"`

---

## Task 6: i18n keys + final verification

**Files:** Modify `src/i18n/locales/{en,fr,ar}.json`.

- [ ] **Step 1: Add an `address` namespace + `profile.addresses` key** to each locale. In `en.json`, after the `common` block's closing (or anywhere top-level), add an `"address"` object and add `"addresses": "My Addresses"` to the existing `profile` namespace:

en (address namespace):
```json
  "address": {
    "title": "My Addresses",
    "addTitle": "Add address",
    "editTitle": "Edit address",
    "add": "Add address",
    "line2": "Apartment / extra (optional)",
    "setDefault": "Set as default address",
    "default": "Default",
    "makeDefault": "Set default",
    "useSaved": "Use a saved address",
    "emptyTitle": "No saved addresses",
    "emptyMessage": "Add an address to speed up checkout.",
    "added": "Address added",
    "updated": "Address updated",
    "deleted": "Address removed",
    "deleteTitle": "Delete address",
    "deleteMessage": "Remove this saved address?",
    "saveError": "Could not save the address",
    "deleteError": "Could not delete the address"
  },
```
fr (address namespace): translate values — title "Mes adresses", addTitle "Ajouter une adresse", editTitle "Modifier l'adresse", add "Ajouter une adresse", line2 "Appartement / complément (facultatif)", setDefault "Définir comme adresse par défaut", default "Par défaut", makeDefault "Définir par défaut", useSaved "Utiliser une adresse enregistrée", emptyTitle "Aucune adresse enregistrée", emptyMessage "Ajoutez une adresse pour accélérer le paiement.", added "Adresse ajoutée", updated "Adresse mise à jour", deleted "Adresse supprimée", deleteTitle "Supprimer l'adresse", deleteMessage "Supprimer cette adresse enregistrée ?", saveError "Impossible d'enregistrer l'adresse", deleteError "Impossible de supprimer l'adresse".
ar (address namespace): title "عناويني", addTitle "إضافة عنوان", editTitle "تعديل العنوان", add "إضافة عنوان", line2 "شقة / تفاصيل إضافية (اختياري)", setDefault "تعيين كعنوان افتراضي", default "افتراضي", makeDefault "تعيين كافتراضي", useSaved "استخدام عنوان محفوظ", emptyTitle "لا توجد عناوين محفوظة", emptyMessage "أضف عنواناً لتسريع الدفع.", added "تمت إضافة العنوان", updated "تم تحديث العنوان", deleted "تم حذف العنوان", deleteTitle "حذف العنوان", deleteMessage "إزالة هذا العنوان المحفوظ؟", saveError "تعذّر حفظ العنوان", deleteError "تعذّر حذف العنوان".

Add to the existing `profile` namespace in each: en `"addresses": "My Addresses"`, fr `"addresses": "Mes adresses"`, ar `"addresses": "عناويني"`.

- [ ] **Step 2: Validate JSON + full verification.**
```bash
node -e "require('./src/i18n/locales/en.json');require('./src/i18n/locales/fr.json');require('./src/i18n/locales/ar.json');console.log('JSON OK')"
npm test -- --ci
npm run lint
npx tsc --noEmit 2>&1 | grep -oE "^[^(]+\.tsx?" | sort | uniq -c | sort -rn
```
Expected: JSON OK; all tests pass; lint 0 errors; tsc per-file breakdown shows **no new files** vs the post-M1a baseline (the new `address.ts`, components, screen, picker must NOT appear).

- [ ] **Step 3: Manual smoke (human).** Sign in → Profile → My Addresses: add, edit, set-default, delete an address (each persists across a refetch). Then open checkout as that user → saved-address picker appears, default pre-selected, the address fields are prefilled; selecting another address re-seeds the form. Guests: no picker.

- [ ] **Step 4: Commit.** `git add src/i18n/locales/en.json src/i18n/locales/fr.json src/i18n/locales/ar.json && git commit -m "i18n(mobile): add address-book strings (M1b)"`

---

## Self-review (plan author)
**Spec coverage:** §2 helpers→Task 1; §3 schema→Task 2; §4 screen+AddressCard/AddressForm+profile entry→Tasks 3-4; §5 checkout picker→Task 5; §6 testing→Tasks 1-2 (+manual in 6) and i18n→Task 6. All covered.
**Placeholder scan:** complete code in every code step; the only notes are concrete prop-name confirmations (EmptyState/Button variant/ui exports) pointing at existing usages.
**Type consistency:** `AddressFormValues`/`SavedAddress`/`CreateAddressInputShape` defined in Task 1 and reused verbatim in Tasks 3-5; `buildCreateAddressInput`/`buildUpdateAddressInput`/`addressToFormValues`/`addressToCheckoutValues`/`resolveWilayaCode` signatures match across tasks; `SavedAddressPicker`/`AddressForm`/`AddressCard` prop shapes match their call sites.
