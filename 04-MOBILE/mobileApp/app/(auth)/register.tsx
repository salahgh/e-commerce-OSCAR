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
import { registerSchema } from '../../src/utils/validation';

interface RegisterFormValues {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleRegister = async (values: RegisterFormValues) => {
    try {
      setError(null);
      await register({
        email: values.email,
        password: values.password,
        firstName: values.firstName,
        lastName: values.lastName,
      });
      // Navigation will be handled by auth state change
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('Registration failed:', err);
      setError(err.message || 'Registration failed. Please try again.');
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
          <Text style={styles.title}>{t('auth.register')}</Text>
          <Text style={styles.subtitle}>Create your OSCAR Fashion account</Text>
        </View>

        {/* Error Banner */}
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        {/* Register Form */}
        <Formik
          initialValues={{
            firstName: '',
            lastName: '',
            email: '',
            password: '',
            confirmPassword: '',
          }}
          validationSchema={registerSchema}
          onSubmit={handleRegister}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
            <View style={styles.form}>
              {/* Name Fields */}
              <View style={styles.nameRow}>
                <Input
                  label={t('auth.firstName')}
                  placeholder="John"
                  value={values.firstName}
                  onChangeText={handleChange('firstName')}
                  onBlur={handleBlur('firstName')}
                  error={touched.firstName && errors.firstName ? errors.firstName : undefined}
                  autoCapitalize="words"
                  textContentType="givenName"
                  containerStyle={styles.nameInput}
                />

                <Input
                  label={t('auth.lastName')}
                  placeholder="Doe"
                  value={values.lastName}
                  onChangeText={handleChange('lastName')}
                  onBlur={handleBlur('lastName')}
                  error={touched.lastName && errors.lastName ? errors.lastName : undefined}
                  autoCapitalize="words"
                  textContentType="familyName"
                  containerStyle={styles.nameInput}
                />
              </View>

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
                textContentType="newPassword"
                helperText="Minimum 6 characters"
              />

              <Input
                label={t('auth.confirmPassword')}
                placeholder="••••••••"
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                error={
                  touched.confirmPassword && errors.confirmPassword
                    ? errors.confirmPassword
                    : undefined
                }
                secureTextEntry
                autoCapitalize="none"
                textContentType="newPassword"
              />

              {/* Register Button */}
              <Button
                title={t('auth.register')}
                onPress={handleSubmit}
                loading={isSubmitting}
                fullWidth
                style={styles.registerButton}
              />

              {/* Terms and Conditions */}
              <Text style={styles.termsText}>
                By registering, you agree to our{' '}
                <Text style={styles.termsLink}>Terms & Conditions</Text> and{' '}
                <Text style={styles.termsLink}>Privacy Policy</Text>
              </Text>
            </View>
          )}
        </Formik>

        {/* Login Link */}
        <View style={styles.loginContainer}>
          <Text style={styles.loginText}>{t('auth.alreadyHaveAccount')} </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={styles.loginLink}>{t('auth.login')}</Text>
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
    paddingTop: spacing['4xl'],
  },
  header: {
    marginBottom: spacing['3xl'],
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
    marginBottom: spacing.xl,
  },
  nameRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  nameInput: {
    flex: 1,
  },
  registerButton: {
    marginTop: spacing.lg,
  },
  termsText: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.lg,
  },
  termsLink: {
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  loginText: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  loginLink: {
    ...typography.styles.body,
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
});
