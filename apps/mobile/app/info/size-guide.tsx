import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { InfoScreen, Section, Paragraph, Bullets } from '../../src/components/info';
import { makeThemedStyles, spacing, typography } from '../../src/theme';

const SIZE_CHART = [
  { size: 'XS', chest: '82-86', waist: '64-68', hip: '90-94' },
  { size: 'S', chest: '86-90', waist: '68-72', hip: '94-98' },
  { size: 'M', chest: '90-94', waist: '72-76', hip: '98-102' },
  { size: 'L', chest: '94-98', waist: '76-80', hip: '102-106' },
  { size: 'XL', chest: '98-102', waist: '80-84', hip: '106-110' },
  { size: 'XXL', chest: '102-106', waist: '84-88', hip: '110-114' },
] as const;

export default function SizeGuideScreen() {
  const { t } = useTranslation();
  const styles = useStyles();
  return (
    <InfoScreen title={t('info.sizeGuide')} intro={t('sizeGuidePage.intro')}>
      <Section title={t('sizeGuidePage.howTitle')}>
        <Bullets
          items={[t('sizeGuidePage.how1'), t('sizeGuidePage.how2'), t('sizeGuidePage.how3')]}
        />
      </Section>
      <Section>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
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
        <Paragraph>{t('sizeGuidePage.footnote')}</Paragraph>
      </Section>
    </InfoScreen>
  );
}

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    table: {
      borderWidth: 1,
      borderColor: colors.border,
      borderRadius: 8,
    },
    row: { flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: colors.border },
    headRow: { backgroundColor: colors.surface },
    cell: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      minWidth: 90,
      ...typography.styles.body,
      color: colors.text.secondary,
    },
    headCell: { color: colors.text.secondary, fontWeight: typography.fontWeight.medium },
    sizeCell: { color: colors.text.primary, fontWeight: typography.fontWeight.bold },
  })
);
