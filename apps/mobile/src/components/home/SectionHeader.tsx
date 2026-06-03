import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { spacing, typography, makeThemedStyles } from '../../theme';
import { useAppFont } from '../../hooks/useAppFont';

interface SectionHeaderProps {
  title: string;
  onSeeAll?: () => void;
}

export const SectionHeader: React.FC<SectionHeaderProps> = ({ title, onSeeAll }) => {
  const { t } = useTranslation();
  const { fontFamily } = useAppFont();
  const styles = useStyles();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { fontFamily: fontFamily.bold }]}>{title}</Text>
      {onSeeAll && (
        <TouchableOpacity onPress={onSeeAll} activeOpacity={0.7}>
          <Text style={[styles.seeAll, { fontFamily: fontFamily.medium }]}>
            {t('common.viewAll')}
          </Text>
        </TouchableOpacity>
      )}
    </View>
  );
};

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.lg,
      marginBottom: spacing.md,
    },
    title: {
      fontSize: typography.fontSize.lg,
      color: colors.text.primary,
    },
    seeAll: {
      fontSize: typography.fontSize.sm,
      color: colors.text.secondary,
    },
  })
);
