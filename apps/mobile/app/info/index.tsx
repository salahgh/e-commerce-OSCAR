import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Stack, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { makeThemedStyles, useThemeColors, spacing, typography } from '../../src/theme';
import { useAppFont } from '../../src/hooks/useAppFont';

const ENTRIES = [
  { key: 'shipping', icon: 'cube-outline', path: '/info/shipping' },
  { key: 'returns', icon: 'return-up-back-outline', path: '/info/returns' },
  { key: 'sizeGuide', icon: 'resize-outline', path: '/info/size-guide' },
  { key: 'faq', icon: 'help-circle-outline', path: '/info/faq' },
  { key: 'about', icon: 'information-circle-outline', path: '/info/about' },
  { key: 'careers', icon: 'briefcase-outline', path: '/info/careers' },
  { key: 'contact', icon: 'mail-outline', path: '/info/contact' },
  { key: 'terms', icon: 'document-text-outline', path: '/info/legal/terms' },
  { key: 'privacy', icon: 'shield-checkmark-outline', path: '/info/legal/privacy' },
] as const;

export default function InfoIndex() {
  const { t } = useTranslation();
  const router = useRouter();
  const styles = useStyles();
  const colors = useThemeColors();
  const { fontFamily } = useAppFont();

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: t('info.indexTitle'), headerBackTitle: '' }} />
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={[styles.intro, { fontFamily: fontFamily.regular }]}>
          {t('info.indexSubtitle')}
        </Text>
        {ENTRIES.map((entry) => (
          <TouchableOpacity
            key={entry.key}
            style={styles.row}
            onPress={() => router.push(entry.path as any)}
            activeOpacity={0.7}
          >
            <Ionicons name={entry.icon as any} size={22} color={colors.text.secondary} />
            <Text style={[styles.rowLabel, { fontFamily: fontFamily.medium }]}>
              {t(`info.${entry.key}`)}
            </Text>
            <Ionicons name="chevron-forward" size={18} color={colors.text.tertiary} />
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    content: { padding: spacing.lg, gap: spacing.sm },
    intro: {
      ...typography.styles.body,
      color: colors.text.secondary,
      marginBottom: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      gap: spacing.md,
      borderWidth: 1,
      borderColor: colors.border,
    },
    rowLabel: {
      flex: 1,
      ...typography.styles.body,
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
    },
  })
);
