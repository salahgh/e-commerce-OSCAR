import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { spacing, typography, makeThemedStyles } from '../theme';
import { useAppFont } from '../hooks/useAppFont';

interface AppErrorBoundaryProps {
  error: Error;
  retry: () => void;
}

/**
 * Fallback UI rendered by expo-router when a render error escapes the route tree.
 * Re-exported as `ErrorBoundary` from app/_layout.tsx.
 */
export function AppErrorBoundary({ error, retry }: AppErrorBoundaryProps) {
  const { t } = useTranslation();
  const router = useRouter();
  const styles = useStyles();
  const { fontFamily } = useAppFont();

  React.useEffect(() => {
    console.error('[AppErrorBoundary]', error);
  }, [error]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={[styles.eyebrow, { fontFamily: fontFamily.regular }]}>
        {t('common.errorEyebrow', 'Something went wrong')}
      </Text>
      <Text style={[styles.title, { fontFamily: fontFamily.bold }]}>
        {t('common.errorBoundaryTitle', 'Unexpected error')}
      </Text>
      <Text style={[styles.message, { fontFamily: fontFamily.regular }]}>{error?.message}</Text>
      <Text style={[styles.hint, { fontFamily: fontFamily.regular }]}>
        {t(
          'common.errorBoundaryMessage',
          'The app ran into a problem. You can try again or go back home.'
        )}
      </Text>

      <TouchableOpacity style={styles.primaryButton} onPress={retry} activeOpacity={0.8}>
        <Text style={[styles.primaryButtonText, { fontFamily: fontFamily.semiBold }]}>
          {t('common.retry', 'Retry')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.secondaryButton}
        onPress={() => router.replace('/(tabs)')}
        activeOpacity={0.8}
      >
        <Text style={[styles.secondaryButtonText, { fontFamily: fontFamily.medium }]}>
          {t('common.goHome', 'Go home')}
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
      backgroundColor: colors.background,
      gap: spacing.sm,
    },
    eyebrow: {
      ...typography.styles.caption,
      color: colors.error,
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    title: {
      ...typography.styles.h2,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
      textAlign: 'center',
    },
    message: {
      ...typography.styles.body,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    hint: {
      ...typography.styles.bodySmall,
      color: colors.text.tertiary,
      textAlign: 'center',
      marginBottom: spacing.lg,
    },
    primaryButton: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: spacing.borderRadius.md,
      minWidth: 200,
      alignItems: 'center',
    },
    primaryButtonText: {
      ...typography.styles.body,
      color: colors.text.inverse,
      fontWeight: typography.fontWeight.semiBold,
    },
    secondaryButton: {
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      minWidth: 200,
      alignItems: 'center',
    },
    secondaryButtonText: {
      ...typography.styles.body,
      color: colors.text.secondary,
      fontWeight: typography.fontWeight.medium,
    },
  })
);
