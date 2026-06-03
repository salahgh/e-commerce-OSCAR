import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import { useTranslation } from 'react-i18next';
import { FilterSheet } from './FilterSheet';
import { spacing, typography, makeThemedStyles, useThemeColors } from '../../theme';
import { useAppFont } from '../../hooks/useAppFont';

export interface PriceRange {
  min: number;
  max: number;
}

interface PriceSheetProps {
  visible: boolean;
  onClose: () => void;
  value: PriceRange | null;
  onApply: (value: PriceRange | null) => void;
  resultCount?: number;
}

export const PriceSheet: React.FC<PriceSheetProps> = ({
  visible,
  onClose,
  value,
  onApply,
  resultCount,
}) => {
  const { fontFamily } = useAppFont();
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useStyles();
  const [min, setMin] = useState('');
  const [max, setMax] = useState('');

  useEffect(() => {
    if (visible) {
      setMin(value?.min ? String(value.min) : '');
      setMax(value?.max ? String(value.max) : '');
    }
  }, [visible, value]);

  const handleSave = () => {
    const minVal = parseInt(min) || 0;
    const maxVal = parseInt(max) || 0;
    if (minVal > 0 || maxVal > 0) {
      onApply({ min: minVal, max: maxVal || 999999 });
    } else {
      onApply(null);
    }
    onClose();
  };

  return (
    <FilterSheet
      visible={visible}
      onClose={onClose}
      title={t('filters.priceRange')}
      clearLabel={t('filters.reset')}
      onClear={() => {
        setMin('');
        setMax('');
      }}
      onSave={handleSave}
      resultCount={resultCount}
    >
      <View style={styles.row}>
        <View style={styles.inputGroup}>
          <Text style={[styles.label, { fontFamily: fontFamily.regular }]}>
            {t('filters.from')}
          </Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, { fontFamily: fontFamily.regular }]}
              value={min}
              onChangeText={setMin}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.text.tertiary}
            />
            <Text style={[styles.suffix, { fontFamily: fontFamily.regular }]}>DZD</Text>
          </View>
        </View>

        <Text style={[styles.separator, { fontFamily: fontFamily.regular }]}>
          {t('filters.to')}
        </Text>

        <View style={styles.inputGroup}>
          <Text style={[styles.label, { fontFamily: fontFamily.regular }]}> </Text>
          <View style={styles.inputWrapper}>
            <TextInput
              style={[styles.input, { fontFamily: fontFamily.regular }]}
              value={max}
              onChangeText={setMax}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor={colors.text.tertiary}
            />
            <Text style={[styles.suffix, { fontFamily: fontFamily.regular }]}>DZD</Text>
          </View>
        </View>
      </View>
    </FilterSheet>
  );
};

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      alignItems: 'flex-end',
      gap: spacing.md,
    },
    inputGroup: {
      flex: 1,
    },
    label: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: spacing.borderRadius.md,
      paddingHorizontal: spacing.md,
      height: 44,
    },
    input: {
      flex: 1,
      fontSize: typography.fontSize.md,
      color: colors.text.primary,
      paddingVertical: 0,
    },
    suffix: {
      fontSize: typography.fontSize.sm,
      color: colors.text.tertiary,
      marginLeft: spacing.xs,
    },
    separator: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
      marginBottom: spacing.md,
    },
  })
);
