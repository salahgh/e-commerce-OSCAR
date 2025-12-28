import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Keyboard,
} from 'react-native';
import { router } from 'expo-router';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Input, Button, ErrorBanner } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/theme';
import { forgotPasswordSchema } from '../../src/utils/validation';
import { useForgotPasswordMutation } from '../../src/graphql/generated/graphql';

interface ForgotPasswordFormValues {
  email: string;
}

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');
  const successScale = useRef(new Animated.Value(0)).current;
  const successOpacity = useRef(new Animated.Value(0)).current;

  const [forgotPassword] = useForgotPasswordMutation();

  useEffect(() => {
    if (success) {
      Animated.parallel([
        Animated.spring(successScale, {
          toValue: 1,
          friction: 4,
          useNativeDriver: true,
        }),
        Animated.timing(successOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [success]);

  const handleForgotPassword = async (values: ForgotPasswordFormValues) => {
    Keyboard.dismiss();
    try {
      setError(null);
      setSubmittedEmail(values.email);
      await forgotPassword({
        variables: {
          email: values.email,
        },
      });
      setSuccess(true);
    } catch (err: any) {
      console.error('Forgot password failed:', err);
      setError(err.message || 'Failed to send reset email. Please try again.');
    }
  };

  if (success) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.successContainer}>
          <Animated.View
            style={[
              styles.successIconContainer,
              {
                transform: [{ scale: successScale }],
                opacity: successOpacity,
              },
            ]}
          >
            <Ionicons name="mail-outline" size={64} color={colors.success} />
          </Animated.View>
          <Text style={styles.successTitle}>Check your email</Text>
          <Text style={styles.successEmail}>{submittedEmail}</Text>
          <Text style={styles.successMessage}>
            We've sent password reset instructions to your email address. Please check your inbox
            and follow the link to reset your password.
          </Text>
          <Text style={styles.spamNote}>
            Didn't receive the email? Check your spam folder.
          </Text>
          <Button
            title="Back to Login"
            onPress={() => router.replace('/(auth)/login')}
            variant="primary"
            fullWidth
            style={styles.backButton}
          />
          <Button
            title="Resend Email"
            onPress={() => {
              setSuccess(false);
              setError(null);
            }}
            variant="ghost"
            fullWidth
          />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingTop: insets.top + spacing.xl }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Icon */}
        <View style={styles.iconContainer}>
          <View style={styles.iconCircle}>
            <Ionicons name="lock-closed-outline" size={48} color={colors.primary} />
          </View>
        </View>

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{t('auth.forgotPassword')}</Text>
          <Text style={styles.subtitle}>
            Enter your email address and we'll send you instructions to reset your password
          </Text>
        </View>

        {/* Error Banner */}
        {error && <ErrorBanner message={error} onDismiss={() => setError(null)} />}

        {/* Forgot Password Form */}
        <Formik
          initialValues={{ email: '' }}
          validationSchema={forgotPasswordSchema}
          onSubmit={handleForgotPassword}
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

              <Button
                title="Send Reset Instructions"
                onPress={handleSubmit}
                loading={isSubmitting}
                fullWidth
                style={styles.submitButton}
              />

              <Button
                title="Back to Login"
                onPress={() => router.back()}
                variant="ghost"
                fullWidth
                style={styles.backToLoginButton}
              />
            </View>
          )}
        </Formik>
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
  iconContainer: {
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: colors.secondaryLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    marginBottom: spacing['3xl'],
    alignItems: 'center',
  },
  title: {
    ...typography.styles.h2,
    color: colors.text.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  form: {
    marginBottom: spacing.xl,
  },
  submitButton: {
    marginTop: spacing.md,
  },
  backToLoginButton: {
    marginTop: spacing.md,
  },
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  successTitle: {
    ...typography.styles.h2,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    textAlign: 'center',
  },
  successEmail: {
    ...typography.styles.body,
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
    marginBottom: spacing.lg,
    textAlign: 'center',
  },
  successMessage: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: spacing.md,
  },
  spamNote: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginBottom: spacing['3xl'],
  },
  backButton: {
    marginBottom: spacing.sm,
  },
});
