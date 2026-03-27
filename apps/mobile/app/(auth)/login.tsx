import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Image,
  Keyboard,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
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
  const insets = useSafeAreaInsets();
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (values: LoginFormValues) => {
    Keyboard.dismiss();
    try {
      setError(null);
      await login(values.email, values.password);
      router.replace('/(tabs)');
    } catch (err: any) {
      console.error('Login failed:', err);
      setError(err.message || t('auth.loginFailed', 'Login failed. Please check your credentials.'));
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
          <Image
            source={require('../../assets/images/icon.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('auth.welcomeBack', 'سعداء بعودتك')}</Text>
          <Text style={styles.subtitle}>{t('auth.loginSubtitle', 'سجّل الدخول لمتابعة التسوق')}</Text>
        </View>

        {/* Error */}
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        {/* Form */}
        <Formik
          initialValues={{ email: '', password: '' }}
          validationSchema={loginSchema}
          onSubmit={handleLogin}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
            <View style={styles.form}>
              {/* Email */}
              <View style={styles.fieldContainer}>
                <View style={styles.labelRow}>
                  <Text style={styles.labelHint}>{t('auth.optional', 'اختياري/ تلميحة')}</Text>
                  <Text style={styles.label}>{t('auth.emailOrPhone', 'البريد الالكتروني أو رقم الهاتف')}</Text>
                </View>
                <Input
                  placeholder={t('auth.enterEmail', 'أدخل البريد الللكتروني')}
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={touched.email && errors.email ? errors.email : undefined}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  textContentType="emailAddress"
                />
              </View>

              {/* Password */}
              <View style={styles.fieldContainer}>
                <View style={styles.labelRow}>
                  <Text style={styles.labelHint}>{t('auth.optional', 'اختياري/ تلميحة')}</Text>
                  <Text style={styles.label}>{t('auth.password')}</Text>
                </View>
                <Input
                  placeholder={t('auth.password')}
                  value={values.password}
                  onChangeText={handleChange('password')}
                  onBlur={handleBlur('password')}
                  error={touched.password && errors.password ? errors.password : undefined}
                  secureTextEntry={!showPassword}
                  autoCapitalize="none"
                  autoComplete="password"
                  textContentType="password"
                  rightIcon={
                    <Ionicons
                      name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                      size={20}
                      color={colors.darkText[3]}
                    />
                  }
                  onRightIconPress={() => setShowPassword(!showPassword)}
                />
              </View>

              {/* Submit Button */}
              <View style={styles.actionContainer}>
                <Button
                  title={t('auth.continue', 'انقر هنا للاستمرار')}
                  onPress={handleSubmit}
                  loading={isSubmitting}
                  fullWidth
                  style={styles.loginButton}
                />

                {/* Forgot Password */}
                <TouchableOpacity
                  style={styles.forgotPasswordContainer}
                  onPress={() => router.push('/(auth)/forgot-password')}
                >
                  <Text style={styles.forgotPasswordText}>{t('auth.forgotPassword')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          )}
        </Formik>

        {/* Spacer */}
        <View style={styles.spacer} />

        {/* Register Link */}
        <View style={styles.registerContainer}>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={styles.registerLink}>{t('auth.createAccount', 'أنشئ حسابًا')}</Text>
            </TouchableOpacity>
          </Link>
          <Text style={styles.registerText}> {t('auth.notRegistered', 'غير مسجل ؟')}</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: spacing['2xl'],
  },
  logoContainer: {
    alignItems: 'center',
    marginTop: spacing['3xl'],
    marginBottom: spacing['3xl'],
  },
  logo: {
    width: 108,
    height: 83,
  },
  header: {
    alignItems: 'center',
    marginBottom: 70,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#030712',
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '400',
    color: '#6A7282',
    textAlign: 'center',
  },
  form: {
    gap: spacing.md,
  },
  fieldContainer: {
    gap: spacing.sm,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.darkText.DEFAULT,
  },
  labelHint: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(1, 11, 56, 0.4)',
  },
  actionContainer: {
    marginTop: 70 - spacing.md,
    alignItems: 'center',
    gap: spacing.xl,
  },
  loginButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
  },
  forgotPasswordContainer: {
    alignItems: 'center',
  },
  forgotPasswordText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#183DE5',
  },
  spacer: {
    flex: 1,
    minHeight: 40,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingBottom: spacing['2xl'],
  },
  registerText: {
    fontSize: 16,
    fontWeight: '400',
    color: colors.darkText.DEFAULT,
  },
  registerLink: {
    fontSize: 16,
    fontWeight: '500',
    color: '#183DE5',
  },
});
