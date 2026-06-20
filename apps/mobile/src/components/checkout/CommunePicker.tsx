import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { wilayas } from '../../data/wilayas';
import { FilterSheet } from '../products/FilterSheet';
import { spacing, typography, makeThemedStyles, useThemeColors } from '../../theme';
import { useAppFont } from '../../hooks/useAppFont';

interface CommunePickerProps {
  wilayaCode: string;
  value: string; // commune code
  onSelect: (communeCode: string) => void;
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
    selectDisabled: { backgroundColor: colors.border, opacity: 0.6 },
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

export const CommunePicker: React.FC<CommunePickerProps> = ({
  wilayaCode,
  value,
  onSelect,
  error,
}) => {
  const { t } = useTranslation();
  const styles = useStyles();
  const colors = useThemeColors();
  const { fontFamily } = useAppFont();
  const [open, setOpen] = useState(false);

  const wilaya = wilayas.find((w) => w.code === wilayaCode);
  const communes = wilaya?.communes ?? [];
  const disabled = !wilayaCode;
  const selectedName = communes.find((c) => c.code === value)?.name ?? '';

  return (
    <View style={styles.group}>
      <Text style={[styles.label, { fontFamily: fontFamily.medium }]}>
        {t('checkout.commune', 'Commune')}
        <Text style={styles.required}> *</Text>
      </Text>
      <TouchableOpacity
        style={[styles.select, !!error && styles.selectError, disabled && styles.selectDisabled]}
        onPress={() => !disabled && setOpen(true)}
        disabled={disabled}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={t('checkout.chooseCommune', 'Choose your commune')}
      >
        <Text
          style={[
            styles.selectText,
            !value && styles.placeholder,
            { fontFamily: fontFamily.regular },
          ]}
        >
          {disabled
            ? t('checkout.chooseWilaya', 'Choose your wilaya')
            : selectedName || t('checkout.chooseCommune', 'Choose your commune')}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.text.tertiary} />
      </TouchableOpacity>
      {error ? (
        <Text style={[styles.errorText, { fontFamily: fontFamily.regular }]}>{error}</Text>
      ) : null}

      <FilterSheet
        visible={open}
        onClose={() => setOpen(false)}
        title={t('checkout.commune', 'Commune')}
        onClear={() => onSelect('')}
        onSave={() => setOpen(false)}
      >
        {communes.map((c) => (
          <TouchableOpacity
            key={c.code}
            style={styles.option}
            onPress={() => {
              onSelect(c.code);
              setOpen(false);
            }}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.optionText,
                value === c.code && styles.optionTextActive,
                { fontFamily: value === c.code ? fontFamily.semiBold : fontFamily.regular },
              ]}
            >
              {c.name}
            </Text>
            {value === c.code && <Ionicons name="checkmark" size={20} color={colors.primary} />}
          </TouchableOpacity>
        ))}
      </FilterSheet>
    </View>
  );
};
