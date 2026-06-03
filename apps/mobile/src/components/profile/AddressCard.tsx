import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import type { SavedAddress } from '../../utils/address';
import { spacing, typography, makeThemedStyles } from '../../theme';
import { useAppFont } from '../../hooks/useAppFont';

interface Props {
  address: SavedAddress;
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}

export const AddressCard: React.FC<Props> = ({ address, onEdit, onDelete, onSetDefault }) => {
  const { t } = useTranslation();
  const styles = useStyles();
  const { fontFamily } = useAppFont();
  const isDefault = !!address.defaultShippingAddress;
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <Text style={[styles.name, { fontFamily: fontFamily.semiBold }]}>{address.fullName}</Text>
        {isDefault && (
          <View style={styles.badge}>
            <Text style={[styles.badgeText, { fontFamily: fontFamily.regular }]}>
              {t('address.default', 'Default')}
            </Text>
          </View>
        )}
      </View>
      <Text style={[styles.line, { fontFamily: fontFamily.regular }]}>
        {address.streetLine1}
        {address.streetLine2 ? `, ${address.streetLine2}` : ''}
      </Text>
      <Text style={[styles.line, { fontFamily: fontFamily.regular }]}>
        {address.city}
        {address.province ? ` · ${address.province}` : ''}
        {address.postalCode ? ` ${address.postalCode}` : ''}
      </Text>
      {address.phoneNumber ? (
        <Text style={[styles.muted, { fontFamily: fontFamily.regular }]}>
          {address.phoneNumber}
        </Text>
      ) : null}
      <View style={styles.actions}>
        {!isDefault && (
          <TouchableOpacity onPress={onSetDefault} accessibilityRole="button">
            <Text style={[styles.action, { fontFamily: fontFamily.medium }]}>
              {t('address.makeDefault', 'Set default')}
            </Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity onPress={onEdit} accessibilityRole="button">
          <Text style={[styles.action, { fontFamily: fontFamily.medium }]}>
            {t('common.edit', 'Edit')}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete} accessibilityRole="button">
          <Text style={[styles.action, styles.danger, { fontFamily: fontFamily.medium }]}>
            {t('common.delete', 'Delete')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    card: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: colors.border,
      padding: spacing.md,
      gap: spacing.xs,
    },
    headerRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
    name: {
      ...typography.styles.body,
      fontWeight: typography.fontWeight.semiBold,
      color: colors.text.primary,
    },
    badge: {
      backgroundColor: colors.primary,
      borderRadius: 6,
      paddingHorizontal: spacing.sm,
      paddingVertical: 2,
    },
    badgeText: { ...typography.styles.caption, color: colors.text.inverse },
    line: { ...typography.styles.bodySmall, color: colors.text.primary },
    muted: { ...typography.styles.caption, color: colors.text.secondary },
    actions: { flexDirection: 'row', gap: spacing.lg, marginTop: spacing.sm },
    action: {
      ...typography.styles.bodySmall,
      color: colors.primary,
      fontWeight: typography.fontWeight.medium,
    },
    danger: { color: colors.error },
  })
);
