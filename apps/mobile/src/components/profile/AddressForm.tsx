import React from 'react';
import { View, StyleSheet, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import { Formik } from 'formik';
import { useTranslation } from 'react-i18next';
import { Input, Button, Switch } from '../ui';
import { WilayaPicker } from '../checkout/WilayaPicker';
import { addressFormSchema } from '../../utils/validation';
import type { AddressFormValues } from '../../utils/address';
import { spacing } from '../../theme';

const EMPTY: AddressFormValues = {
  fullName: '',
  phoneNumber: '',
  streetLine1: '',
  streetLine2: '',
  city: '',
  wilayaCode: '',
  postalCode: '',
  defaultShippingAddress: false,
};

interface Props {
  initialValues?: Partial<AddressFormValues>;
  onSubmit: (values: AddressFormValues) => void;
  submitting?: boolean;
  submitLabel: string;
}

export const AddressForm: React.FC<Props> = ({ initialValues, onSubmit, submitting = false, submitLabel }) => {
  const { t } = useTranslation();
  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={100}
    >
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled" contentContainerStyle={styles.form}>
        <Formik initialValues={{ ...EMPTY, ...initialValues }} validationSchema={addressFormSchema} onSubmit={onSubmit}>
          {({ values, errors, touched, handleChange, handleBlur, handleSubmit, setFieldValue, isValid }) => (
            <View style={styles.fields}>
              <Input
                label={t('checkout.fullName', 'Full Name')}
                value={values.fullName}
                onChangeText={handleChange('fullName')}
                onBlur={handleBlur('fullName')}
                error={touched.fullName && errors.fullName ? errors.fullName : undefined}
                autoCapitalize="words"
                required
              />
              <Input
                label={t('checkout.phoneNumber', 'Phone Number')}
                value={values.phoneNumber}
                onChangeText={handleChange('phoneNumber')}
                onBlur={handleBlur('phoneNumber')}
                error={touched.phoneNumber && errors.phoneNumber ? errors.phoneNumber : undefined}
                keyboardType="phone-pad"
                required
              />
              <Input
                label={t('checkout.address', 'Address')}
                value={values.streetLine1}
                onChangeText={handleChange('streetLine1')}
                onBlur={handleBlur('streetLine1')}
                error={touched.streetLine1 && errors.streetLine1 ? errors.streetLine1 : undefined}
                required
              />
              <Input
                label={t('address.line2', 'Apartment / extra (optional)')}
                value={values.streetLine2}
                onChangeText={handleChange('streetLine2')}
                onBlur={handleBlur('streetLine2')}
              />
              <View style={styles.row}>
                <Input
                  label={t('checkout.city', 'City')}
                  value={values.city}
                  onChangeText={handleChange('city')}
                  onBlur={handleBlur('city')}
                  error={touched.city && errors.city ? errors.city : undefined}
                  containerStyle={styles.half}
                  required
                />
                <Input
                  label={t('checkout.postalCode', 'Postal Code')}
                  value={values.postalCode}
                  onChangeText={handleChange('postalCode')}
                  onBlur={handleBlur('postalCode')}
                  error={touched.postalCode && errors.postalCode ? errors.postalCode : undefined}
                  keyboardType="number-pad"
                  maxLength={5}
                  containerStyle={styles.half}
                  required
                />
              </View>
              <WilayaPicker
                value={values.wilayaCode}
                onSelect={(code) => setFieldValue('wilayaCode', code)}
                error={touched.wilayaCode && errors.wilayaCode ? errors.wilayaCode : undefined}
              />
              <Switch
                label={t('address.setDefault', 'Set as default address')}
                value={values.defaultShippingAddress}
                onValueChange={(v) => setFieldValue('defaultShippingAddress', v)}
                labelPosition="left"
              />
              <Button
                title={submitLabel}
                onPress={handleSubmit}
                loading={submitting}
                disabled={submitting || !isValid}
                fullWidth
                style={styles.submit}
              />
            </View>
          )}
        </Formik>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  form: { padding: spacing.lg },
  fields: { gap: spacing.md },
  row: { flexDirection: 'row', gap: spacing.md },
  half: { flex: 1 },
  submit: { marginTop: spacing.md },
});
