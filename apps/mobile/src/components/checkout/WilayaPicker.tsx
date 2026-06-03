import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { wilayas } from '../../data/wilayas';
import { FilterSheet } from '../products/FilterSheet';
import { spacing, typography, makeThemedStyles, useThemeColors } from '../../theme';
import { useAppFont } from '../../hooks/useAppFont';

interface WilayaPickerProps {
  value: string; // wilaya code
  onSelect: (code: string) => void;
  error?: string;
}

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
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
  })
);

export const WilayaPicker: React.FC<WilayaPickerProps> = ({ value, onSelect, error }) => {
  const { t } = useTranslation();
  const styles = useStyles();
  const colors = useThemeColors();
  const { fontFamily } = useAppFont();
  const [open, setOpen] = useState(false);
  const selectedName = wilayas.find((w) => w.code === value)?.name ?? '';

  return (
    <View style={styles.group}>
      <Text style={[styles.label, { fontFamily: fontFamily.medium }]}>
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
        <Text
          style={[
            styles.selectText,
            !value && styles.placeholder,
            { fontFamily: fontFamily.regular },
          ]}
        >
          {selectedName || t('checkout.chooseWilaya', 'Choose wilaya')}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.text.tertiary} />
      </TouchableOpacity>
      {error ? (
        <Text style={[styles.errorText, { fontFamily: fontFamily.regular }]}>{error}</Text>
      ) : null}

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
            <Text
              style={[
                styles.optionText,
                value === w.code && styles.optionTextActive,
                { fontFamily: value === w.code ? fontFamily.semiBold : fontFamily.regular },
              ]}
            >
              {w.code} - {w.name}
            </Text>
            {value === w.code && <Ionicons name="checkmark" size={20} color={colors.primary} />}
          </TouchableOpacity>
        ))}
      </FilterSheet>
    </View>
  );
};
