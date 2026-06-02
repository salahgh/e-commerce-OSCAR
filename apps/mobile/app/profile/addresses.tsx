import React, { useState } from 'react';
import { View, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
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
import { colors, spacing } from '../../src/theme';

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
        await updateAddress({
          variables: { input: buildUpdateAddressInput(mode.address.id, values, wilayas) },
          refetchQueries: ['ActiveCustomer'],
        });
        toast.success(t('address.updated', 'Address updated'));
      } else {
        await createAddress({
          variables: { input: buildCreateAddressInput(values, wilayas) },
          refetchQueries: ['ActiveCustomer'],
        });
        toast.success(t('address.added', 'Address added'));
      }
      setMode({ kind: 'list' });
    } catch (e: any) {
      toast.error(e?.message || t('address.saveError', 'Could not save the address'));
    }
  };

  const handleDelete = (a: SavedAddress) => {
    Alert.alert(
      t('address.deleteTitle', 'Delete address'),
      t('address.deleteMessage', 'Remove this saved address?'),
      [
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
      ]
    );
  };

  const handleSetDefault = async (a: SavedAddress) => {
    try {
      await updateAddress({
        variables: { input: { id: a.id, defaultShippingAddress: true } },
        refetchQueries: ['ActiveCustomer'],
      });
    } catch (e: any) {
      toast.error(e?.message || t('address.saveError', 'Could not update the address'));
    }
  };

  const title =
    mode.kind === 'create'
      ? t('address.addTitle', 'Add address')
      : mode.kind === 'edit'
      ? t('address.editTitle', 'Edit address')
      : t('address.title', 'My Addresses');

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title,
          headerBackVisible: mode.kind === 'list',
          headerLeft:
            mode.kind === 'list'
              ? undefined
              : () => (
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
          <EmptyState
            icon="location-outline"
            title={t('address.emptyTitle', 'No saved addresses')}
            message={t('address.emptyMessage', 'Add an address to speed up checkout.')}
          />
          <Button title={t('address.add', 'Add address')} onPress={() => setMode({ kind: 'create' })} style={styles.addBtn} />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.list}>
          {addresses.map((a) => (
            <AddressCard
              key={a.id}
              address={a}
              onEdit={() => setMode({ kind: 'edit', address: a })}
              onDelete={() => handleDelete(a)}
              onSetDefault={() => handleSetDefault(a)}
            />
          ))}
          <Button
            title={t('address.add', 'Add address')}
            onPress={() => setMode({ kind: 'create' })}
            variant="outline"
            fullWidth
            style={styles.addBtn}
          />
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
