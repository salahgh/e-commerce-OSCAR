import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Keyboard,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { Input, Button, ErrorBanner, Checkbox } from '../../src/components/ui';
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
  const insets = useSafeAreaInsets();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);

  const handleRegister = async (values: RegisterFormValues) => {
    if (!acceptTerms) {
      setError('Please accept the Terms & Conditions to continue.');
      return;
    }
    Keyboard.dismiss();
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
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.lg }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logo}>
            <Text style={styles.logoText}>O</Text>
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.brandName}>OSCAR</Text>
          <Text style={styles.brandTagline}>FASHION</Text>
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
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                textContentType="newPassword"
                helperText="Minimum 6 characters"
                rightIcon={
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.text.tertiary}
                  />
                }
                onRightIconPress={() => setShowPassword(!showPassword)}
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
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                textContentType="newPassword"
                rightIcon={
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={20}
                    color={colors.text.tertiary}
                  />
                }
                onRightIconPress={() => setShowConfirmPassword(!showConfirmPassword)}
              />

              {/* Terms and Conditions Checkbox */}
              <Checkbox
                checked={acceptTerms}
                onChange={setAcceptTerms}
                label="I accept the Terms & Conditions and Privacy Policy"
                containerStyle={styles.termsCheckbox}
              />

              {/* Register Button */}
              <Button
                title={t('auth.register')}
                onPress={handleSubmit}
                loading={isSubmitting}
                fullWidth
                style={styles.registerButton}
                disabled={!acceptTerms}
              />
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
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  logo: {
    width: 64,
    height: 64,
    borderRadius: 16,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: colors.surface,
  },
  header: {
    marginBottom: spacing['2xl'],
    alignItems: 'center',
  },
  brandName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: colors.primary,
    letterSpacing: 6,
  },
  brandTagline: {
    fontSize: 10,
    color: colors.text.tertiary,
    letterSpacing: 8,
    marginBottom: spacing.lg,
  },
  title: {
    ...typography.styles.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
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
  termsCheckbox: {
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  registerButton: {
    marginTop: spacing.md,
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
