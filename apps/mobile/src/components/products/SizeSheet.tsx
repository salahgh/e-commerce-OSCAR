import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { FilterSheet } from './FilterSheet';
import { spacing, typography, makeThemedStyles, useThemeColors } from '../../theme';
import { useAppFont } from '../../hooks/useAppFont';

const DEFAULT_SIZES = ['S', 'M', 'L', 'XL', 'XXL', 'XXXL'];

interface SizeSheetProps {
  visible: boolean;
  onClose: () => void;
  value: string[];
  onApply: (sizes: string[]) => void;
  availableSizes?: string[];
  resultCount?: number;
}

export const SizeSheet: React.FC<SizeSheetProps> = ({
  visible,
  onClose,
  value,
  onApply,
  availableSizes = DEFAULT_SIZES,
  resultCount,
}) => {
  const { fontFamily } = useAppFont();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useStyles();
  const [selected, setSelected] = useState<string[]>(value);

  useEffect(() => {
    if (visible) setSelected(value);
  }, [visible, value]);

  const toggle = (size: string) => {
    setSelected((prev) => (prev.includes(size) ? prev.filter((s) => s !== size) : [...prev, size]));
  };

  return (
    <FilterSheet
      visible={visible}
      onClose={onClose}
      title={t('filters.taille')}
      onClear={() => setSelected([])}
      onSave={() => {
        onApply(selected);
        onClose();
      }}
      resultCount={resultCount}
    >
      {availableSizes.map((size) => {
        const isChecked = selected.includes(size);
        return (
          <TouchableOpacity
            key={size}
            style={styles.row}
            onPress={() => toggle(size)}
            activeOpacity={0.7}
          >
            <Text style={[styles.label, { fontFamily: fontFamily.medium }]}>{size}</Text>
            <View style={[styles.checkbox, isChecked && styles.checkboxChecked]}>
              {isChecked && <Ionicons name="checkmark" size={16} color={colors.text.inverse} />}
            </View>
          </TouchableOpacity>
        );
      })}
    </FilterSheet>
  );
};

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    label: {
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
    },
    checkbox: {
      width: 22,
      height: 22,
      borderRadius: spacing.borderRadius.sm,
      borderWidth: 2,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    checkboxChecked: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
  })
);
