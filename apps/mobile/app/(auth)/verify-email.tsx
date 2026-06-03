import React, { useEffect, useRef, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { Button, ErrorBanner } from '../../src/components/ui';
import { makeThemedStyles, useThemeColors, spacing, typography } from '../../src/theme';

type State = 'verifying' | 'success' | 'error';

/**
 * Consumes a verification token from a deep link (oscar-fashion://verify-email?token=…).
 * Calls AuthContext.verifyEmail on mount, then redirects on success.
 */
export default function VerifyEmailScreen() {
  const styles = useStyles();
  const colors = useThemeColors();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { verifyEmail } = useAuth();
  const params = useLocalSearchParams<{ token?: string }>();
  const token = params?.token ?? '';

  const [state, setState] = useState<State>('verifying');
  const [error, setError] = useState<string | null>(null);
  // Guard so we only fire once even under React strict-mode double-effects.
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current) return;
    ran.current = true;
    if (!token) {
      setState('error');
      setError(t('auth.invalidToken', 'Invalid or expired link'));
      return;
    }
    (async () => {
      const result = await verifyEmail(token);
      if (result.success) {
        setState('success');
        setTimeout(() => router.replace('/(tabs)' as any), 1500);
      } else {
        setState('error');
        setError(result.message ?? t('auth.invalidToken', 'Invalid or expired link'));
      }
    })();
  }, [token, verifyEmail, t]);

  return (
    <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
      <Stack.Screen options={{ headerShown: false }} />
      <View style={styles.body}>
        {state === 'verifying' && (
          <>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.title}>{t('auth.verifying', 'Verifying...')}</Text>
          </>
        )}
        {state === 'success' && (
          <>
            <Ionicons name="checkmark-circle" size={64} color={colors.success} />
            <Text style={styles.title}>{t('auth.verifySuccess', 'Email verified')}</Text>
            <Text style={styles.subtitle}>{t('auth.redirecting', 'Redirecting...')}</Text>
          </>
        )}
        {state === 'error' && (
          <>
            <Ionicons name="alert-circle" size={64} color={colors.error} />
            <ErrorBanner message={error ?? ''} />
            <Button
              title={t('auth.login', 'Sign in')}
              onPress={() => router.replace('/(auth)/login' as any)}
            />
          </>
        )}
      </View>
    </View>
  );
}

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background, paddingHorizontal: spacing.lg },
    body: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: spacing.md },
    title: {
      ...typography.styles.h3,
      color: colors.text.primary,
      fontWeight: typography.fontWeight.bold,
      textAlign: 'center',
    },
    subtitle: {
      ...typography.styles.body,
      color: colors.text.secondary,
      textAlign: 'center',
    },
  })
);
