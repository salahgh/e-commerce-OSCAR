import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Keyboard,
} from 'react-native';
import { router, useLocalSearchParams, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { Formik } from 'formik';
import * as Yup from 'yup';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { Input, Button, ErrorBanner } from '../../src/components/ui';
import { makeThemedStyles, useThemeColors, spacing, typography } from '../../src/theme';
import { useAppFont } from '../../src/hooks/useAppFont';

interface ResetFormValues {
  password: string;
  confirmPassword: string;
}

const resetSchema = Yup.object().shape({
  password: Yup.string().min(8, 'Password must be at least 8 characters').required('Required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password')], 'Passwords must match')
    .required('Required'),
});

/**
 * Consumes a `?token=` from a password-reset email link and lets the user
 * set a new password.
 */
export default function ResetPasswordScreen() {
  const styles = useStyles();
  const colors = useThemeColors();
  const { fontFamily } = useAppFont();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { resetPassword } = useAuth();
  const params = useLocalSearchParams<{ token?: string }>();
  const token = params?.token ?? '';

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!token) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.body}>
          <Ionicons name="alert-circle" size={64} color={colors.error} />
          <ErrorBanner message={t('auth.invalidToken', 'Invalid or expired link')} />
          <Button
            title={t('auth.login', 'Sign in')}
            onPress={() => router.replace('/(auth)/login' as any)}
          />
        </View>
      </View>
    );
  }

  if (success) {
    return (
      <View style={[styles.container, { paddingTop: insets.top + spacing.xl }]}>
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.body}>
          <Ionicons name="checkmark-circle" size={64} color={colors.success} />
          <Text style={[styles.title, { fontFamily: fontFamily.bold }]}>
            {t('auth.passwordChanged', 'Password changed')}
          </Text>
          <Button
            title={t('auth.login', 'Sign in')}
            onPress={() => router.replace('/(auth)/login' as any)}
          />
        </View>
      </View>
    );
  }

  const onSubmit = async ({ password }: ResetFormValues) => {
    Keyboard.dismiss();
    setError(null);
    const result = await resetPassword(token, password);
    if (result.success) {
      setSuccess(true);
    } else {
      setError(result.message ?? t('auth.invalidToken', 'Invalid or expired link'));
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={[styles.container, { paddingTop: insets.top + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
      >
        <Stack.Screen options={{ headerShown: false }} />
        <View style={styles.body}>
          <Text style={[styles.title, { fontFamily: fontFamily.bold }]}>
            {t('auth.resetPasswordTitle', 'New password')}
          </Text>
          <Text style={[styles.subtitle, { fontFamily: fontFamily.regular }]}>
            {t('auth.resetPasswordDesc', 'Enter your new password.')}
          </Text>

          {error && <ErrorBanner message={error} />}

          <Formik
            initialValues={{ password: '', confirmPassword: '' }}
            validationSchema={resetSchema}
            onSubmit={onSubmit}
          >
            {({
              values,
              errors,
              touched,
              handleChange,
              handleBlur,
              handleSubmit,
              isSubmitting,
            }) => (
              <View style={styles.form}>
                <Input
                  label={t('auth.password', 'Password')}
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  secureTextEntry
                  error={touched.password && errors.password ? errors.password : undefined}
                  autoCapitalize="none"
                />
                <Input
                  label={t('auth.confirmPassword', 'Confirm password')}
                  value={values.confirmPassword}
                  onChangeText={handleChange('confirmPassword')}
                  onBlur={handleBlur('confirmPassword')}
                  secureTextEntry
                  error={
                    touched.confirmPassword && errors.confirmPassword
                      ? errors.confirmPassword
                      : undefined
                  }
                  autoCapitalize="none"
                />
                <Button
                  title={t('auth.resetPassword', 'Reset password')}
                  onPress={() => handleSubmit()}
                  loading={isSubmitting}
                />
              </View>
            )}
          </Formik>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: { flexGrow: 1, paddingHorizontal: spacing.lg, backgroundColor: colors.background },
    body: { gap: spacing.md },
    title: {
      ...typography.styles.h2,
      color: colors.text.primary,
      fontWeight: typography.fontWeight.bold,
    },
    subtitle: {
      ...typography.styles.body,
      color: colors.text.secondary,
    },
    form: { gap: spacing.md, marginTop: spacing.md },
  })
);
