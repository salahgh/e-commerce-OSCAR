import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { SavedAddress } from '../../utils/address';
import { spacing, typography, makeThemedStyles, useThemeColors } from '../../theme';
import { useAppFont } from '../../hooks/useAppFont';

interface Props {
  addresses: SavedAddress[];
  selectedId: string | null;
  onSelect: (a: SavedAddress) => void;
}

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    wrap: { marginBottom: spacing.lg, gap: spacing.sm },
    title: {
      ...typography.styles.body,
      fontWeight: typography.fontWeight.semiBold,
      color: colors.text.primary,
    },
    row: { gap: spacing.sm, paddingRight: spacing.lg },
    chip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
      maxWidth: 220,
      backgroundColor: colors.surface,
      borderWidth: 2,
      borderColor: colors.border,
      borderRadius: 10,
      padding: spacing.md,
    },
    chipSelected: { borderColor: colors.primary },
    chipText: { flexShrink: 1 },
    chipName: {
      ...typography.styles.bodySmall,
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
    },
    chipLine: { ...typography.styles.caption, color: colors.text.secondary },
  })
);

export const SavedAddressPicker: React.FC<Props> = ({ addresses, selectedId, onSelect }) => {
  const { t } = useTranslation();
  const styles = useStyles();
  const colors = useThemeColors();
  const { fontFamily } = useAppFont();
  if (addresses.length === 0) return null;
  return (
    <View style={styles.wrap}>
      <Text style={[styles.title, { fontFamily: fontFamily.semiBold }]}>
        {t('address.useSaved', 'Use a saved address')}
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {addresses.map((a) => {
          const selected = a.id === selectedId;
          return (
            <TouchableOpacity
              key={a.id}
              style={[styles.chip, selected && styles.chipSelected]}
              onPress={() => onSelect(a)}
              activeOpacity={0.7}
            >
              {selected && <Ionicons name="checkmark-circle" size={16} color={colors.primary} />}
              <View style={styles.chipText}>
                <Text
                  style={[styles.chipName, { fontFamily: fontFamily.medium }]}
                  numberOfLines={1}
                >
                  {a.fullName}
                </Text>
                <Text
                  style={[styles.chipLine, { fontFamily: fontFamily.regular }]}
                  numberOfLines={1}
                >
                  {a.streetLine1}
                  {a.province ? ` · ${a.province}` : ''}
                </Text>
              </View>
            </TouchableOpacity>
          );
        })}
      </ScrollView>
    </View>
  );
};
