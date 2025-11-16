import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../src/contexts/AuthContext';
import { Input, Button, ErrorBanner } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/theme';
import { loginSchema } from '../../src/utils/validation';

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleLogin = async (values: LoginFormValues) => {
    try {
      setError(null);
      await login(values.email, values.password);
      // Navigation will be handled by auth state change
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || 'Login failed. Please check your credentials.');
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('auth.login')}</Text>
          <Text style={styles.subtitle}>Welcome back to OSCAR Fashion</Text>
        </View>

        {/* Error Banner */}
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        {/* Login Form */}
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={handleLogin}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
            <View style={styles.form}>
              <Input
                label={t('auth.email')}
                placeholder="example@email.com"
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                error={touched.email && errors.email ? errors.email : undefined}
                keyboardType="email-address"
                autoCapitalize="none"
                autoComplete="email"
                textContentType="emailAddress"
              />

              <Input
                label={t('auth.password')}
                placeholder="••••••••"
                value={values.password}
                onChangeText={handleChange('password')}
                onBlur={handleBlur('password')}
                error={touched.password && errors.password ? errors.password : undefined}
                secureTextEntry
                autoCapitalize="none"
                autoComplete="password"
                textContentType="password"
              />

              {/* Forgot Password Link */}
              <TouchableOpacity
                style={styles.forgotPasswordContainer}
                onPress={() => router.push('/(auth)/forgot-password')}
              >
                <Text style={styles.forgotPasswordText}>{t('auth.forgotPassword')}</Text>
              </TouchableOpacity>

              {/* Login Button */}
              <Button
                title={t('auth.login')}
                onPress={handleSubmit}
                loading={isSubmitting}
                fullWidth
                style={styles.loginButton}
              />
            </View>
          )}
        </Formik>

        {/* Register Link */}
        <View style={styles.registerContainer}>
          <Text style={styles.registerText}>{t('auth.dontHaveAccount')} </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.registerLink}>{t('auth.register')}</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    flexGrow: 1,
    padding: spacing['2xl'],
    justifyContent: 'center',
  },
  header: {
    marginBottom: spacing['4xl'],
    alignItems: 'center',
  },
  title: {
    ...typography.styles.h1,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    marginBottom: spacing['2xl'],
  },
  forgotPasswordContainer: {
    alignSelf: 'flex-end',
    marginBottom: spacing.xl,
  },
  forgotPasswordText: {
    ...typography.styles.bodySmall,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  loginButton: {
    marginTop: spacing.md,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  registerLink: {
    ...typography.styles.body,
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
});
