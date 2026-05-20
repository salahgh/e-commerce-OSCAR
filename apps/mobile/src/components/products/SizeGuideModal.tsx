import React from 'react';
import { Modal, View, Text, StyleSheet, TouchableOpacity, ScrollView, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../theme';

interface SizeGuideModalProps {
  visible: boolean;
  onClose: () => void;
}

const SIZE_CHART = [
  { size: 'XS', chest: '82-86', waist: '64-68', hip: '90-94' },
  { size: 'S', chest: '86-90', waist: '68-72', hip: '94-98' },
  { size: 'M', chest: '90-94', waist: '72-76', hip: '98-102' },
  { size: 'L', chest: '94-98', waist: '76-80', hip: '102-106' },
  { size: 'XL', chest: '98-102', waist: '80-84', hip: '106-110' },
  { size: 'XXL', chest: '102-106', waist: '84-88', hip: '110-114' },
] as const;

export function SizeGuideModal({ visible, onClose }: SizeGuideModalProps) {
  const { t } = useTranslation();

  return (
    <Modal visible={visible} onRequestClose={onClose} transparent animationType="slide">
      <Pressable style={styles.backdrop} onPress={onClose}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>{t('sizeGuide.title')}</Text>
            <TouchableOpacity onPress={onClose} accessibilityLabel={t('common.close')}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>
          <Text style={styles.intro}>{t('sizeGuide.intro')}</Text>

          <ScrollView style={styles.tableScroll} horizontal showsHorizontalScrollIndicator={false}>
            <View style={styles.table}>
              <View style={[styles.row, styles.headRow]}>
                <Text style={[styles.cell, styles.headCell]}>{t('sizeGuide.headerSize')}</Text>
                <Text style={[styles.cell, styles.headCell]}>{t('sizeGuide.headerChest')}</Text>
                <Text style={[styles.cell, styles.headCell]}>{t('sizeGuide.headerWaist')}</Text>
                <Text style={[styles.cell, styles.headCell]}>{t('sizeGuide.headerHip')}</Text>
              </View>
              {SIZE_CHART.map((row) => (
                <View key={row.size} style={styles.row}>
                  <Text style={[styles.cell, styles.sizeCell]}>{row.size}</Text>
                  <Text style={styles.cell}>{row.chest}</Text>
                  <Text style={styles.cell}>{row.waist}</Text>
                  <Text style={styles.cell}>{row.hip}</Text>
                </View>
              ))}
            </View>
          </ScrollView>

          <Text style={styles.footnote}>{t('sizeGuide.footnote')}</Text>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: colors.background,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: spacing.lg,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xl,
    maxHeight: '85%',
  },
  handle: {
    alignSelf: 'center',
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    marginBottom: spacing.md,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  title: {
    ...typography.styles.h3,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
  intro: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginBottom: spacing.md,
  },
  tableScroll: {
    marginBottom: spacing.md,
  },
  table: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    minWidth: '100%',
  },
  row: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headRow: {
    backgroundColor: colors.surface,
  },
  cell: {
    flex: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    ...typography.styles.body,
    color: colors.text.secondary,
    minWidth: 80,
  },
  headCell: {
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.medium,
  },
  sizeCell: {
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
  footnote: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
});
