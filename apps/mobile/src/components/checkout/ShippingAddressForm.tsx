import React from 'react';
import { View, Text, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { Input, Button } from '../ui';
import { WilayaPicker } from './WilayaPicker';
import { spacing, typography, makeThemedStyles } from '../../theme';
import { makeShippingAddressSchema, shippingAddressSchema } from '../../utils/validation';
import { useAppFont } from '../../hooks/useAppFont';

export interface ShippingAddressFormValues {
  fullName: string;
  phoneNumber: string;
  address: string;
  city: string;
  postalCode: string;
  notes?: string;
  email: string;
  wilayaCode: string;
}

interface ShippingAddressFormProps {
  initialValues?: Partial<ShippingAddressFormValues>;
  onSubmit: (values: ShippingAddressFormValues) => void;
  loading?: boolean;
  submitButtonText?: string;
  showEmail?: boolean;
  validationSchema?: ReturnType<typeof makeShippingAddressSchema>;
}

const defaultInitialValues: ShippingAddressFormValues = {
  fullName: '',
  phoneNumber: '',
  address: '',
  city: '',
  postalCode: '',
  notes: '',
  email: '',
  wilayaCode: '',
};

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
    },
    header: {
      marginBottom: spacing.lg,
    },
    title: {
      ...typography.styles.h3,
      color: colors.text.primary,
      fontWeight: typography.fontWeight.bold,
      marginBottom: spacing.xs,
    },
    subtitle: {
      ...typography.styles.body,
      color: colors.text.secondary,
    },
    form: {
      gap: spacing.md,
    },
    row: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    halfWidth: {
      flex: 1,
    },
    submitButton: {
      marginTop: spacing.md,
    },
  })
);

export const ShippingAddressForm: React.FC<ShippingAddressFormProps> = ({
  initialValues,
  onSubmit,
  loading = false,
  submitButtonText,
  showEmail = false,
  validationSchema,
}) => {
  const { t } = useTranslation();
  const styles = useStyles();
  const { fontFamily } = useAppFont();

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <Text style={[styles.title, { fontFamily: fontFamily.bold }]}>
            {t('checkout.shippingAddress', 'Shipping Address')}
          </Text>
          <Text style={[styles.subtitle, { fontFamily: fontFamily.regular }]}>
            {t('checkout.shippingAddressSubtitle', 'Where should we deliver your order?')}
          </Text>
        </View>

        <Formik
          initialValues={{ ...defaultInitialValues, ...initialValues }}
          enableReinitialize
          validationSchema={validationSchema ?? shippingAddressSchema}
          onSubmit={onSubmit}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            setFieldValue,
            isValid,
          }) => (
            <View style={styles.form}>
              {showEmail && (
                <Input
                  label={t('checkout.email', 'Email')}
                  placeholder="you@example.com"
                  value={values.email}
                  onChangeText={handleChange('email')}
                  onBlur={handleBlur('email')}
                  error={touched.email && errors.email ? errors.email : undefined}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  required
                />
              )}
              <Input
                label={t('checkout.fullName', 'Full Name')}
                placeholder={t('checkout.fullNamePlaceholder', 'John Doe')}
                value={values.fullName}
                onChangeText={handleChange('fullName')}
                onBlur={handleBlur('fullName')}
                error={touched.fullName && errors.fullName ? errors.fullName : undefined}
                autoCapitalize="words"
                required
              />

              <Input
                label={t('checkout.phoneNumber', 'Phone Number')}
                placeholder="0612345678"
                value={values.phoneNumber}
                onChangeText={handleChange('phoneNumber')}
                onBlur={handleBlur('phoneNumber')}
                error={touched.phoneNumber && errors.phoneNumber ? errors.phoneNumber : undefined}
                keyboardType="phone-pad"
                required
              />

              <Input
                label={t('checkout.address', 'Address')}
                placeholder={t('checkout.addressPlaceholder', 'Street address, apartment number')}
                value={values.address}
                onChangeText={handleChange('address')}
                onBlur={handleBlur('address')}
                error={touched.address && errors.address ? errors.address : undefined}
                multiline
                numberOfLines={2}
                required
              />

              <View style={styles.row}>
                <Input
                  label={t('checkout.city', 'City')}
                  placeholder={t('checkout.cityPlaceholder', 'Algiers')}
                  value={values.city}
                  onChangeText={handleChange('city')}
                  onBlur={handleBlur('city')}
                  error={touched.city && errors.city ? errors.city : undefined}
                  containerStyle={styles.halfWidth}
                  required
                />

                <Input
                  label={t('checkout.postalCode', 'Postal Code')}
                  placeholder="16000"
                  value={values.postalCode}
                  onChangeText={handleChange('postalCode')}
                  onBlur={handleBlur('postalCode')}
                  error={touched.postalCode && errors.postalCode ? errors.postalCode : undefined}
                  keyboardType="number-pad"
                  maxLength={5}
                  containerStyle={styles.halfWidth}
                  required
                />
              </View>

              <WilayaPicker
                value={values.wilayaCode}
                onSelect={(code) => setFieldValue('wilayaCode', code)}
                error={touched.wilayaCode && errors.wilayaCode ? errors.wilayaCode : undefined}
              />

              <Input
                label={t('checkout.notes', 'Delivery Notes')}
                placeholder={t('checkout.notesPlaceholder', 'Optional delivery instructions')}
                value={values.notes}
                onChangeText={handleChange('notes')}
                onBlur={handleBlur('notes')}
                error={touched.notes && errors.notes ? errors.notes : undefined}
                multiline
                numberOfLines={3}
              />

              <Button
                title={submitButtonText || t('checkout.continue', 'Continue')}
                onPress={handleSubmit}
                loading={loading}
                disabled={loading || !isValid}
                fullWidth
                style={styles.submitButton}
              />
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};
