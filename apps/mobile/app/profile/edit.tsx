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
import { Input, Button, LoadingSpinner, ErrorState } from '../../src/components/ui';
import {
  useActiveCustomerQuery,
  useUpdateCustomerProfileMutation,
} from '../../src/graphql/generated/graphql';
import { updateProfileSchema } from '../../src/utils/validation';
import { colors, spacing, typography } from '../../src/theme';

interface EditProfileFormValues {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const [submitError, setSubmitError] = useState<string>('');

  const { data, loading, error, refetch } = useActiveCustomerQuery({
    fetchPolicy: 'cache-and-network',
  });

  const [updateProfile, { loading: updating }] = useUpdateCustomerProfileMutation();

  const customer = data?.activeCustomer;

  const handleSubmit = async (values: EditProfileFormValues) => {
    try {
      setSubmitError('');

      await updateProfile({
        variables: {
          input: {
            firstName: values.firstName.trim(),
            lastName: values.lastName.trim(),
            phoneNumber: values.phone.trim() || undefined,
          },
        },
        refetchQueries: ['ActiveCustomer'],
      });

      Alert.alert(
        t('profile.updateSuccess', 'Profile Updated'),
        t('profile.updateSuccessMessage', 'Your profile has been updated successfully'),
        [
          {
            text: t('common.ok', 'OK'),
            onPress: () => router.back(),
          },
        ]
      );
    } catch (err: any) {
      setSubmitError(err.message || t('profile.updateError', 'Failed to update profile'));
    }
  };

  if (loading && !data) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
      </View>
    );
  }

  if (error || !customer) {
    return (
      <View style={styles.container}>
        <ErrorState
          title={t('profile.errorTitle', 'Failed to Load Profile')}
          message={error?.message || t('profile.errorMessage', 'Unable to load your profile')}
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  const initialValues: EditProfileFormValues = {
    firstName: customer.firstName || '',
    lastName: customer.lastName || '',
    email: customer.emailAddress,
    phone: customer.phoneNumber || '',
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
        <Text style={styles.headerTitle}>{t('profile.editProfile', 'Edit Profile')}</Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Formik
          initialValues={initialValues}
          validationSchema={updateProfileSchema}
          onSubmit={handleSubmit}
          enableReinitialize
        >
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isValid }) => (
            <View style={styles.form}>
              <Input
                label={t('auth.firstName', 'First Name')}
                placeholder={t('auth.firstNamePlaceholder', 'John')}
                value={values.firstName}
                onChangeText={handleChange('firstName')}
                onBlur={handleBlur('firstName')}
                error={touched.firstName && errors.firstName ? errors.firstName : undefined}
                autoCapitalize="words"
                required
              />

              <Input
                label={t('auth.lastName', 'Last Name')}
                placeholder={t('auth.lastNamePlaceholder', 'Doe')}
                value={values.lastName}
                onChangeText={handleChange('lastName')}
                onBlur={handleBlur('lastName')}
                error={touched.lastName && errors.lastName ? errors.lastName : undefined}
                autoCapitalize="words"
                required
              />

              <Input
                label={t('auth.email', 'Email')}
                placeholder={t('auth.emailPlaceholder', 'john.doe@example.com')}
                value={values.email}
                onChangeText={handleChange('email')}
                onBlur={handleBlur('email')}
                error={touched.email && errors.email ? errors.email : undefined}
                keyboardType="email-address"
                autoCapitalize="none"
                required
              />

              <Input
                label={t('auth.phone', 'Phone Number')}
                placeholder="0612345678"
                value={values.phone}
                onChangeText={handleChange('phone')}
                onBlur={handleBlur('phone')}
                error={touched.phone && errors.phone ? errors.phone : undefined}
                keyboardType="phone-pad"
              />

              {submitError ? (
                <View style={styles.errorContainer}>
                  <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
                  <Text style={styles.errorText}>{submitError}</Text>
                </View>
              ) : null}

              <Button
                title={t('profile.saveChanges', 'Save Changes')}
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

const styles = StyleSheet.create({
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
  form: {
    padding: spacing.lg,
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
});
