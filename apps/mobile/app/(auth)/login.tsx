import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  TextInput,
  Keyboard,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../../src/contexts/AuthContext';
import { Button } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/theme';
import { useAppFont } from '../../src/hooks/useAppFont';
import { loginSchema } from '../../src/utils/validation';
import Logo from '../../assets/images/logooscarsvg1.svg';

interface LoginFormValues {
  email: string;
  password: string;
}

export default function LoginScreen() {
  const { t } = useTranslation();
  const { login } = useAuth();
  const insets = useSafeAreaInsets();
  const { fontFamily } = useAppFont();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (values: LoginFormValues) => {
    Keyboard.dismiss();
    try {
      setError(null);
      await login(values.email, values.password);
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || t('errors.invalidCredentials'));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + 20 }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <Logo width={120} height={92} />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={[styles.title, { fontFamily: fontFamily.bold }]}>
            {t('auth.welcomeBack')}
          </Text>
          <Text style={[styles.subtitle, { fontFamily: fontFamily.regular }]}>
            {t('auth.loginSubtitle')}
          </Text>
        </View>

        {/* Error */}
        {error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle" size={16} color={colors.error} />
            <Text style={[styles.errorText, { fontFamily: fontFamily.regular }]}>{error}</Text>
          </View>
        )}

        {/* Form */}
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={handleLogin}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
            <View style={styles.form}>
              {/* Email */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { fontFamily: fontFamily.medium }]}>
                  {t('auth.emailOrPhone')}
                </Text>
                <TextInput
                  style={[styles.input, { fontFamily: fontFamily.regular },
                    touched.email && errors.email && styles.inputError]}
                  placeholder={t('auth.enterEmail')}
                  placeholderTextColor={colors.text.tertiary}
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                />
                {touched.email && errors.email && (
                  <Text style={styles.fieldError}>{errors.email}</Text>
                )}
              </View>

              {/* Password */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { fontFamily: fontFamily.medium }]}>
                  {t('auth.password')}
                </Text>
                <View style={[styles.passwordContainer,
                  touched.password && errors.password && styles.inputError]}>
                  <TextInput
                    style={[styles.passwordInput, { fontFamily: fontFamily.regular }]}
                    placeholder={t('auth.enterPassword')}
                    placeholderTextColor={colors.text.tertiary}
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoComplete="password"
                    textContentType="password"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.text.tertiary}
                    />
                  </TouchableOpacity>
                </View>
                {touched.password && errors.password && (
                  <Text style={styles.fieldError}>{errors.password}</Text>
                )}
              </View>

              {/* Submit */}
              <View style={styles.actionContainer}>
                <TouchableOpacity
                  style={styles.submitButton}
                  onPress={() => handleSubmit()}
                  activeOpacity={0.8}
                  disabled={isSubmitting}
                >
                  <Text style={[styles.submitText, { fontFamily: fontFamily.medium }]}>
                    {isSubmitting ? t('auth.loggingIn') : t('auth.clickToContinue')}
                  </Text>
                </TouchableOpacity>

                {/* Forgot Password */}
                <TouchableOpacity
                  onPress={() => router.push('/(auth)/forgot-password')}
                  style={styles.forgotContainer}
                >
                  <Text style={[styles.forgotText, { fontFamily: fontFamily.medium }]}>
                    {t('auth.forgotPasswordQuestion')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Register Link */}
        <View style={[styles.registerContainer, { paddingBottom: insets.bottom + spacing.xl }]}>
          <Text style={[styles.registerText, { fontFamily: fontFamily.regular }]}>
            {t('auth.notRegistered')}{' '}
          </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={[styles.registerLink, { fontFamily: fontFamily.medium }]}>
                {t('auth.createAccount')}
              </Text>
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
    backgroundColor: colors.surface,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing.xl,
  },
  // Logo
  logoContainer: {
    alignItems: 'flex-start',
    marginTop: spacing['2xl'],
    marginBottom: spacing['3xl'],
  },
  // Header
  header: {
    marginBottom: 50,
  },
  title: {
    fontSize: 26,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: '#6A7282',
  },
  // Error
  errorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    backgroundColor: '#FFE5E5',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  errorText: {
    fontSize: 14,
    color: colors.error,
    flex: 1,
  },
  // Form
  form: {
    gap: spacing.lg,
  },
  fieldGroup: {
    gap: spacing.sm,
  },
  fieldLabel: {
    fontSize: 13,
    color: colors.text.primary,
  },
  input: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    fontSize: 14,
    color: colors.text.primary,
  },
  inputError: {
    borderColor: colors.error,
  },
  fieldError: {
    fontSize: 12,
    color: colors.error,
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
  },
  passwordInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    paddingVertical: 0,
  },
  // Actions
  actionContainer: {
    marginTop: 40,
    alignItems: 'center',
    gap: spacing.xl,
  },
  submitButton: {
    width: '100%',
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitText: {
    fontSize: 16,
    color: colors.text.inverse,
  },
  forgotContainer: {
    alignItems: 'center',
  },
  forgotText: {
    fontSize: 15,
    color: '#183DE5',
  },
  // Spacer
  spacer: {
    flex: 1,
    minHeight: 40,
  },
  // Register
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  registerText: {
    fontSize: 15,
    color: colors.text.primary,
  },
  registerLink: {
    fontSize: 15,
    color: '#183DE5',
  },
});
