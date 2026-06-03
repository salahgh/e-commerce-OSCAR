import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Formik } from 'formik';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Input, Button } from '../../src/components/ui';
import { useUpdateCustomerPasswordMutation } from '../../src/graphql/generated/graphql';
import { changePasswordSchema } from '../../src/utils/validation';
import { makeThemedStyles, useThemeColors, spacing, typography } from '../../src/theme';

interface ChangePasswordFormValues {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ChangePasswordScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const styles = useStyles();
  const colors = useThemeColors();
  const [submitError, setSubmitError] = useState<string>('');

  const [updatePassword, { loading: updating }] = useUpdateCustomerPasswordMutation();

  const initialValues: ChangePasswordFormValues = {
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  };

  const handleSubmit = async (values: ChangePasswordFormValues, { resetForm }: any) => {
    try {
      setSubmitError('');

      await updatePassword({
        variables: {
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        },
      });

      Alert.alert(
        t('profile.passwordChanged', 'Password Changed'),
        t('profile.passwordChangedMessage', 'Your password has been changed successfully'),
        [
          {
            text: t('common.ok', 'OK'),
            onPress: () => {
              resetForm();
              router.back();
            },
          },
        ]
      );
    } catch (err: any) {
      setSubmitError(err.message || t('profile.passwordChangeError', 'Failed to change password'));
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('profile.changePassword', 'Change Password')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={20} color={colors.info} />
          <Text style={styles.infoText}>
            {t('profile.passwordRequirements', 'Password must be at least 6 characters long')}
          </Text>
        </View>

        <Formik
          initialValues={initialValues}
          validationSchema={changePasswordSchema}
          onSubmit={handleSubmit}
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isValid }) => (
            <View style={styles.form}>
              <Input
                label={t('profile.currentPassword', 'Current Password')}
                placeholder={t('profile.currentPasswordPlaceholder', 'Enter current password')}
                value={values.currentPassword}
                onChangeText={handleChange('currentPassword')}
                onBlur={handleBlur('currentPassword')}
                error={
                  touched.currentPassword && errors.currentPassword
                    ? errors.currentPassword
                    : undefined
                }
                secureTextEntry
                required
              />

              <Input
                label={t('profile.newPassword', 'New Password')}
                placeholder={t('profile.newPasswordPlaceholder', 'Enter new password')}
                value={values.newPassword}
                onChangeText={handleChange('newPassword')}
                onBlur={handleBlur('newPassword')}
                error={touched.newPassword && errors.newPassword ? errors.newPassword : undefined}
                secureTextEntry
                required
              />

              <Input
                label={t('profile.confirmNewPassword', 'Confirm New Password')}
                placeholder={t('profile.confirmNewPasswordPlaceholder', 'Confirm new password')}
                value={values.confirmPassword}
                onChangeText={handleChange('confirmPassword')}
                onBlur={handleBlur('confirmPassword')}
                error={
                  touched.confirmPassword && errors.confirmPassword
                    ? errors.confirmPassword
                    : undefined
                }
                secureTextEntry
                required
              />

              {submitError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
                  <Text style={styles.errorText}>{submitError}</Text>
                </View>
              ) : null}

              <Button
                title={t('profile.changePassword', 'Change Password')}
                onPress={handleSubmit}
                loading={updating}
                disabled={updating || !isValid}
                fullWidth
                style={styles.submitButton}
              />

              <Button
                title={t('common.cancel', 'Cancel')}
                onPress={() => router.back()}
                variant="outline"
                fullWidth
                disabled={updating}
              />
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      backgroundColor: colors.surface,
      padding: spacing.lg,
      paddingTop: spacing.xl,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    backButton: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'flex-start',
    },
    headerTitle: {
      ...typography.styles.h3,
      color: colors.text.primary,
      fontWeight: typography.fontWeight.bold,
    },
    placeholder: {
      width: 40,
    },
    content: {
      flex: 1,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      backgroundColor: colors.info + '15',
      padding: spacing.md,
      borderRadius: 8,
      margin: spacing.lg,
    },
    infoText: {
      ...typography.styles.bodySmall,
      color: colors.text.secondary,
      flex: 1,
    },
    form: {
      padding: spacing.lg,
      paddingTop: 0,
      gap: spacing.md,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.error + '15',
      padding: spacing.md,
      borderRadius: 8,
    },
    errorText: {
      ...typography.styles.bodySmall,
      color: colors.error,
      flex: 1,
    },
    submitButton: {
      marginTop: spacing.md,
    },
  })
);
