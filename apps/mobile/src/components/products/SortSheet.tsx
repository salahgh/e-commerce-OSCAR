import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { FilterSheet } from './FilterSheet';
import { colors, spacing, typography } from '../../theme';
import { useAppFont } from '../../hooks/useAppFont';

export type SortValue = 'popular' | 'recent' | 'rated' | 'price_asc' | 'price_desc';

const SORT_KEYS: Array<{ value: SortValue; key: string }> = [
  { value: 'popular', key: 'filters.mostPopular' },
  { value: 'recent', key: 'filters.mostRecent' },
  { value: 'rated', key: 'filters.topRated' },
  { value: 'price_asc', key: 'filters.priceLowHigh' },
  { value: 'price_desc', key: 'filters.priceHighLow' },
];

interface SortSheetProps {
  visible: boolean;
  onClose: () => void;
  value: SortValue | null;
  onApply: (value: SortValue | null) => void;
  resultCount?: number;
}

export const SortSheet: React.FC<SortSheetProps> = ({
  visible,
  onClose,
  value,
  onApply,
  resultCount,
}) => {
  const { fontFamily } = useAppFont();
  const { t } = useTranslation();
  const [selected, setSelected] = useState<SortValue | null>(value);

  useEffect(() => {
    if (visible) setSelected(value);
  }, [visible, value]);

  return (
    <FilterSheet
      visible={visible}
      onClose={onClose}
      title={t('filters.classement')}
      onClear={() => setSelected(null)}
      onSave={() => { onApply(selected); onClose(); }}
      resultCount={resultCount}
    >
      {SORT_KEYS.map((option) => (
        <TouchableOpacity
          key={option.value}
          style={styles.option}
          onPress={() => setSelected(option.value)}
          activeOpacity={0.7}
        >
          <Text style={[styles.optionLabel, { fontFamily: fontFamily.regular }]}>
            {t(option.key)}
          </Text>
          <Ionicons
            name={selected === option.value ? 'radio-button-on' : 'radio-button-off'}
            size={22}
            color={selected === option.value ? colors.primary : colors.border}
          />
        </TouchableOpacity>
      ))}
    </FilterSheet>
  );
};

const styles = StyleSheet.create({
  option: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
  },
  optionLabel: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
});
