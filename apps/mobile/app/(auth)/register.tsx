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
import { colors, spacing, typography } from '../../src/theme';
import { useAppFont } from '../../src/hooks/useAppFont';
import { registerSchema } from '../../src/utils/validation';
import Logo from '../../assets/images/logooscarsvg1.svg';

interface RegisterFormValues {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
}

export default function RegisterScreen() {
  const { t } = useTranslation();
  const { register, login } = useAuth();
  const insets = useSafeAreaInsets();
  const { fontFamily } = useAppFont();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleRegister = async (values: RegisterFormValues) => {
    Keyboard.dismiss();
    try {
      setError(null);
      const [firstName, ...rest] = values.fullName.trim().split(' ');
      const lastName = rest.join(' ') || firstName;
      const result = await register({
        emailAddress: values.email,
        password: values.password,
        firstName,
        lastName,
      });
      if (!result.success) {
        setError(result.message || t('errors.genericError'));
        return;
      }
      // Auto-login after registration (requireVerification is false in dev)
      try {
        await login(values.email, values.password);
        router.replace('/(auth)/register-success');
      } catch {
        // If auto-login fails (e.g., verification required), go to success screen anyway
        router.replace('/(auth)/register-success');
      }
    } catch (err: any) {
      setError(err.message || t('errors.genericError'));
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
        <Text style={[styles.title, { fontFamily: fontFamily.bold }]}>
          {t('auth.createNewAccount')}
        </Text>
        <Text style={[styles.subtitle, { fontFamily: fontFamily.regular }]}>
          {t('auth.registerSubtitle')}
        </Text>

        {/* Error */}
        {error && (
          <View style={styles.errorBanner}>
            <Ionicons name="alert-circle" size={16} color={colors.error} />
            <Text style={[styles.errorText, { fontFamily: fontFamily.regular }]}>{error}</Text>
          </View>
        )}

        {/* Form */}
        <Formik
          initialValues={{ fullName: '', email: '', phone: '', password: '', confirmPassword: '' }}
          onSubmit={handleRegister}
        >
          {({ values, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
            <View style={styles.form}>
              {/* Full Name */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { fontFamily: fontFamily.medium }]}>{t('auth.fullName')}</Text>
                <TextInput
                  style={[styles.input, { fontFamily: fontFamily.regular }]}
                  placeholder={t('auth.enterFullName')}
                  placeholderTextColor={colors.text.tertiary}
                  value={values.fullName}
                  onChangeText={handleChange('fullName')}
                  onBlur={handleBlur('fullName')}
                  autoCapitalize="words"
                />
              </View>

              {/* Email */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { fontFamily: fontFamily.medium }]}>{t('auth.addressEmail')}</Text>
                <TextInput
                  style={[styles.input, { fontFamily: fontFamily.regular }]}
                  placeholder={t('auth.enterAddressEmail')}
                  placeholderTextColor={colors.text.tertiary}
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                />
              </View>

              {/* Phone */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { fontFamily: fontFamily.medium }]}>{t('auth.phoneNumber')}</Text>
                <View style={styles.phoneContainer}>
                  <View style={styles.phonePrefix}>
                    <Text style={[styles.phonePrefixFlag]}>🇩🇿</Text>
                    <Text style={[styles.phonePrefixText, { fontFamily: fontFamily.medium }]}>+213</Text>
                  </View>
                  <View style={styles.phoneDivider} />
                  <TextInput
                    style={[styles.phoneInput, { fontFamily: fontFamily.regular }]}
                    placeholder="XXX XX XX XX"
                    placeholderTextColor={colors.text.tertiary}
                    value={values.phone}
                    onChangeText={(text) => {
                      // Only allow digits and spaces, auto-format
                      const digits = text.replace(/[^\d]/g, '').slice(0, 9);
                      let formatted = '';
                      for (let i = 0; i < digits.length; i++) {
                        if (i === 3 || i === 5 || i === 7) formatted += ' ';
                        formatted += digits[i];
                      }
                      handleChange('phone')(formatted);
                    }}
                    onBlur={handleBlur('phone')}
                    keyboardType="phone-pad"
                    maxLength={12}
                  />
                </View>
              </View>

              {/* Password */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { fontFamily: fontFamily.medium }]}>{t('auth.password')}</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.passwordInput, { fontFamily: fontFamily.regular }]}
                    placeholder={t('auth.enterPasswordPlaceholder')}
                    placeholderTextColor={colors.text.tertiary}
                    value={values.password}
                    onChangeText={handleChange('password')}
                    onBlur={handleBlur('password')}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                    <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.text.tertiary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Confirm Password */}
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { fontFamily: fontFamily.medium }]}>{t('auth.confirmYourPassword')}</Text>
                <View style={styles.passwordContainer}>
                  <TextInput
                    style={[styles.passwordInput, { fontFamily: fontFamily.regular }]}
                    placeholder={t('auth.confirmYourPassword')}
                    placeholderTextColor={colors.text.tertiary}
                    value={values.confirmPassword}
                    onChangeText={handleChange('confirmPassword')}
                    onBlur={handleBlur('confirmPassword')}
                    secureTextEntry={!showConfirm}
                    autoCapitalize="none"
                  />
                  <TouchableOpacity onPress={() => setShowConfirm(!showConfirm)}>
                    <Ionicons name={showConfirm ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.text.tertiary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Submit */}
              <TouchableOpacity
                style={styles.submitButton}
                onPress={() => handleSubmit()}
                activeOpacity={0.8}
                disabled={isSubmitting}
              >
                <Text style={[styles.submitText, { fontFamily: fontFamily.medium }]}>
                  {isSubmitting ? t('auth.creatingAccount') : t('auth.createAccountButton')}
                </Text>
              </TouchableOpacity>
            </View>
          )}
        </Formik>

        {/* Login Link */}
        <View style={[styles.loginContainer, { paddingBottom: insets.bottom + spacing.xl }]}>
          <Text style={[styles.loginText, { fontFamily: fontFamily.regular }]}>
            {t('auth.haveAccount')}{' '}
          </Text>
          <Link href="/(auth)/login" asChild>
            <TouchableOpacity>
              <Text style={[styles.loginLink, { fontFamily: fontFamily.medium }]}>{t('auth.signIn')}</Text>
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
  logoContainer: {
    alignItems: 'flex-start',
    marginTop: spacing.xl,
    marginBottom: spacing['3xl'],
  },
  title: {
    fontSize: 26,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 15,
    color: '#6A7282',
    marginBottom: spacing['2xl'],
    lineHeight: 22,
  },
  errorBanner: {
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
  form: {
    gap: spacing.md,
  },
  fieldGroup: {
    gap: spacing.xs,
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
  phoneContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    overflow: 'hidden',
  },
  phonePrefix: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: spacing.md,
    backgroundColor: '#F9FAFB',
    height: '100%',
    justifyContent: 'center',
  },
  phonePrefixFlag: {
    fontSize: 18,
  },
  phonePrefixText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  phoneDivider: {
    width: 1,
    height: 24,
    backgroundColor: colors.border,
  },
  phoneInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    paddingHorizontal: spacing.md,
    paddingVertical: 0,
    height: '100%',
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
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  submitText: {
    fontSize: 16,
    color: colors.text.inverse,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  loginText: {
    fontSize: 15,
    color: colors.text.primary,
  },
  loginLink: {
    fontSize: 15,
    color: '#183DE5',
  },
});
