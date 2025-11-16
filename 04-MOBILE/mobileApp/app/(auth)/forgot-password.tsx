import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { router } from 'expo-router';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { useMutation } from '@apollo/client';
import { Input, Button, ErrorBanner } from '../../../src/components/ui';
import { colors, spacing, typography } from '../../../src/theme';
import { forgotPasswordSchema } from '../../../src/utils/validation';
import { FORGOT_PASSWORD_MUTATION } from '../../../src/graphql/mutations/auth.graphql';

interface ForgotPasswordFormValues {
  email: string;
}

export default function ForgotPasswordScreen() {
  const { t } = useTranslation();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const [forgotPassword] = useMutation(FORGOT_PASSWORD_MUTATION);

  const handleForgotPassword = async (values: ForgotPasswordFormValues) => {
    try {
      setError(null);
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
      <View style={styles.container}>
        <View style={styles.successContainer}>
          <Text style={styles.successIcon}>✉️</Text>
          <Text style={styles.successTitle}>Check your email</Text>
          <Text style={styles.successMessage}>
            We've sent password reset instructions to your email address. Please check your inbox
            and follow the link to reset your password.
          </Text>
          <Button
            title="Back to Login"
            onPress={() => router.back()}
            variant="primary"
            style={styles.backButton}
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
      <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
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
  header: {
    marginBottom: spacing['4xl'],
    alignItems: 'center',
  },
  title: {
    ...typography.styles.h2,
    color: colors.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
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
    padding: spacing['4xl'],
  },
  successIcon: {
    fontSize: 64,
    marginBottom: spacing['2xl'],
  },
  successTitle: {
    ...typography.styles.h2,
    color: colors.primary,
    marginBottom: spacing.md,
    textAlign: 'center',
  },
  successMessage: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing['4xl'],
  },
  backButton: {
    minWidth: 200,
  },
});
