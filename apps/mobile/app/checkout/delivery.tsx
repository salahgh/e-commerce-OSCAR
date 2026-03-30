import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../src/theme';
import { useAppFont } from '../../src/hooks/useAppFont';
import { wilayas } from '../../src/data/wilayas';
import { FilterSheet } from '../../src/components/products/FilterSheet';

type DeliveryMode = 'bureau' | 'domicile' | null;

export default function DeliveryScreen() {
  const insets = useSafeAreaInsets();
  const { fontFamily } = useAppFont();
  const { t } = useTranslation();

  // Form state
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneExtra, setPhoneExtra] = useState('');
  const [selectedWilaya, setSelectedWilaya] = useState<string | null>(null);
  const [selectedCommune, setSelectedCommune] = useState<string | null>(null);
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>(null);
  const [address, setAddress] = useState('');
  const [selectedOffice, setSelectedOffice] = useState<string | null>(null);

  // Picker visibility
  const [showWilayaPicker, setShowWilayaPicker] = useState(false);
  const [showCommunePicker, setShowCommunePicker] = useState(false);
  const [showOfficePicker, setShowOfficePicker] = useState(false);

  // Derived data
  const wilayaData = useMemo(() => {
    return wilayas.find((w) => w.code === selectedWilaya);
  }, [selectedWilaya]);

  const communes = wilayaData?.communes ?? [];

  const wilayaName = wilayaData?.name ?? '';
  const communeName = communes.find((c) => c.code === selectedCommune)?.name ?? '';

  // Shipping prices (example — these could come from API based on wilaya zone)
  const bureauPrice = 400;
  const domicilePrice = 900;

  const canContinue = fullName.trim() && phone.trim() && selectedWilaya && selectedCommune && deliveryMode &&
    (deliveryMode === 'domicile' ? address.trim() : true);

  const handleContinue = () => {
    if (!canContinue) return;
    // Navigate to next checkout step with delivery data
    router.push({
      pathname: '/checkout',
      params: {
        fullName,
        phone,
        phoneExtra,
        wilaya: selectedWilaya!,
        commune: selectedCommune!,
        deliveryMode,
        address: deliveryMode === 'domicile' ? address : '',
        office: deliveryMode === 'bureau' ? selectedOffice || '' : '',
      },
    });
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontFamily: fontFamily.medium }]}>
          {t('checkout.deliveryInfo')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={100}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { fontFamily: fontFamily.medium }]}>
              {t('auth.fullName')}<Text style={styles.required}>*</Text>
            </Text>
            <TextInput
              style={[styles.input, { fontFamily: fontFamily.regular }]}
              placeholder={t('auth.enterFullName')}
              placeholderTextColor={colors.text.tertiary}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>

          {/* Phone */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { fontFamily: fontFamily.medium }]}>
              {t('auth.phoneNumber')}<Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.phoneContainer}>
              <View style={styles.phonePrefix}>
                <Text style={styles.phonePrefixFlag}>🇩🇿</Text>
                <Text style={[styles.phonePrefixText, { fontFamily: fontFamily.medium }]}>+213</Text>
              </View>
              <View style={styles.phoneDivider} />
              <TextInput
                style={[styles.phoneInput, { fontFamily: fontFamily.regular }]}
                placeholder="XXX XX XX XX"
                placeholderTextColor={colors.text.tertiary}
                value={phone}
                onChangeText={(text) => {
                  const digits = text.replace(/[^\d]/g, '').slice(0, 9);
                  let formatted = '';
                  for (let i = 0; i < digits.length; i++) {
                    if (i === 3 || i === 5 || i === 7) formatted += ' ';
                    formatted += digits[i];
                  }
                  setPhone(formatted);
                }}
                keyboardType="phone-pad"
                maxLength={12}
              />
            </View>
          </View>

          {/* Extra Phone */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { fontFamily: fontFamily.medium }]}>
              {t('auth.phoneNumber')} ({t('common.optional')})
            </Text>
            <View style={styles.phoneContainer}>
              <View style={styles.phonePrefix}>
                <Text style={styles.phonePrefixFlag}>🇩🇿</Text>
                <Text style={[styles.phonePrefixText, { fontFamily: fontFamily.medium }]}>+213</Text>
              </View>
              <View style={styles.phoneDivider} />
              <TextInput
                style={[styles.phoneInput, { fontFamily: fontFamily.regular }]}
                placeholder="XXX XX XX XX"
                placeholderTextColor={colors.text.tertiary}
                value={phoneExtra}
                onChangeText={(text) => {
                  const digits = text.replace(/[^\d]/g, '').slice(0, 9);
                  let formatted = '';
                  for (let i = 0; i < digits.length; i++) {
                    if (i === 3 || i === 5 || i === 7) formatted += ' ';
                    formatted += digits[i];
                  }
                  setPhoneExtra(formatted);
                }}
                keyboardType="phone-pad"
                maxLength={12}
              />
            </View>
          </View>

          {/* Wilaya */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { fontFamily: fontFamily.medium }]}>
              Wilaya<Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => setShowWilayaPicker(true)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.selectText,
                { fontFamily: fontFamily.regular },
                !selectedWilaya && styles.selectPlaceholder,
              ]}>
                {wilayaName || t('checkout.chooseWilaya')}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>

          {/* Commune */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { fontFamily: fontFamily.medium }]}>
              Commune<Text style={styles.required}>*</Text>
            </Text>
            <TouchableOpacity
              style={styles.selectInput}
              onPress={() => selectedWilaya && setShowCommunePicker(true)}
              activeOpacity={selectedWilaya ? 0.7 : 1}
            >
              <Text style={[
                styles.selectText,
                { fontFamily: fontFamily.regular },
                !selectedCommune && styles.selectPlaceholder,
              ]}>
                {communeName || t('checkout.chooseCommune')}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>

          {/* Separator */}
          <View style={styles.separator} />

          {/* Delivery Mode */}
          <Text style={[styles.sectionTitle, { fontFamily: fontFamily.medium }]}>
            {t('checkout.shippingMethod')}
          </Text>

          {/* Option: Bureau */}
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setDeliveryMode('bureau')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={deliveryMode === 'bureau' ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={deliveryMode === 'bureau' ? colors.primary : colors.border}
            />
            <Text style={[styles.radioLabel, { fontFamily: fontFamily.medium }]}>
              {t('checkout.deliveryBureau')}{deliveryMode === 'bureau' || selectedWilaya ? ` (${bureauPrice}da)` : ''}
            </Text>
          </TouchableOpacity>

          {/* Bureau dropdown — shown when bureau is selected */}
          {deliveryMode === 'bureau' && (
            <TouchableOpacity
              style={[styles.selectInput, styles.subField]}
              onPress={() => setShowOfficePicker(true)}
              activeOpacity={0.7}
            >
              <Text style={[
                styles.selectText,
                { fontFamily: fontFamily.regular },
                !selectedOffice && styles.selectPlaceholder,
              ]}>
                {selectedOffice || t('checkout.chooseBureau')}
              </Text>
              <Ionicons name="chevron-down" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}

          {/* Option: Domicile */}
          <TouchableOpacity
            style={styles.radioRow}
            onPress={() => setDeliveryMode('domicile')}
            activeOpacity={0.7}
          >
            <Ionicons
              name={deliveryMode === 'domicile' ? 'radio-button-on' : 'radio-button-off'}
              size={22}
              color={deliveryMode === 'domicile' ? colors.primary : colors.border}
            />
            <Text style={[styles.radioLabel, { fontFamily: fontFamily.medium }]}>
              {t('checkout.deliveryHome')}{deliveryMode === 'domicile' || selectedWilaya ? ` (${domicilePrice}da)` : ''}
            </Text>
          </TouchableOpacity>

          {/* Address input — shown when domicile is selected */}
          {deliveryMode === 'domicile' && (
            <TextInput
              style={[styles.input, styles.subField, { fontFamily: fontFamily.regular }]}
              placeholder={t('checkout.enterAddress')}
              placeholderTextColor={colors.text.tertiary}
              value={address}
              onChangeText={setAddress}
            />
          )}
        </ScrollView>

        {/* Continue Button */}
        <View style={[styles.bottomBar, { paddingBottom: insets.bottom + spacing.md }]}>
          <TouchableOpacity
            style={[styles.continueButton, !canContinue && styles.continueButtonDisabled]}
            onPress={handleContinue}
            activeOpacity={0.8}
            disabled={!canContinue}
          >
            <Text style={[styles.continueText, { fontFamily: fontFamily.medium }]}>{t('common.continue')}</Text>
            <Ionicons name="arrow-forward" size={20} color={colors.text.inverse} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>

      {/* Wilaya Picker */}
      <FilterSheet
        visible={showWilayaPicker}
        onClose={() => setShowWilayaPicker(false)}
        title="Wilaya"
        onClear={() => { setSelectedWilaya(null); setSelectedCommune(null); }}
        onSave={() => setShowWilayaPicker(false)}
      >
        {wilayas.map((w) => (
          <TouchableOpacity
            key={w.code}
            style={styles.pickerOption}
            onPress={() => {
              setSelectedWilaya(w.code);
              setSelectedCommune(null);
              setShowWilayaPicker(false);
            }}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.pickerOptionText,
              { fontFamily: fontFamily.regular },
              selectedWilaya === w.code && styles.pickerOptionTextActive,
            ]}>
              {w.code} - {w.name}
            </Text>
            {selectedWilaya === w.code && (
              <Ionicons name="checkmark" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </FilterSheet>

      {/* Commune Picker */}
      <FilterSheet
        visible={showCommunePicker}
        onClose={() => setShowCommunePicker(false)}
        title="Commune"
        onClear={() => setSelectedCommune(null)}
        onSave={() => setShowCommunePicker(false)}
      >
        {communes.map((c) => (
          <TouchableOpacity
            key={c.code}
            style={styles.pickerOption}
            onPress={() => {
              setSelectedCommune(c.code);
              setShowCommunePicker(false);
            }}
            activeOpacity={0.7}
          >
            <Text style={[
              styles.pickerOptionText,
              { fontFamily: fontFamily.regular },
              selectedCommune === c.code && styles.pickerOptionTextActive,
            ]}>
              {c.name}
            </Text>
            {selectedCommune === c.code && (
              <Ionicons name="checkmark" size={20} color={colors.primary} />
            )}
          </TouchableOpacity>
        ))}
      </FilterSheet>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
  },
  headerTitle: {
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.xl,
    paddingBottom: spacing.lg,
  },
  // Fields
  fieldGroup: {
    marginBottom: spacing.lg,
  },
  fieldLabel: {
    fontSize: 14,
    color: colors.text.primary,
    marginBottom: spacing.sm,
  },
  required: {
    color: colors.error,
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
  selectInput: {
    height: 48,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 8,
    paddingHorizontal: spacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  selectText: {
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
  },
  selectPlaceholder: {
    color: colors.text.tertiary,
  },
  // Separator
  separator: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: spacing.xl,
  },
  // Delivery mode
  sectionTitle: {
    fontSize: 16,
    color: colors.text.primary,
    marginBottom: spacing.lg,
  },
  radioRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
    paddingVertical: spacing.sm,
    marginBottom: spacing.sm,
  },
  radioLabel: {
    fontSize: 14,
    color: colors.text.primary,
    flex: 1,
  },
  subField: {
    marginLeft: 34,
    marginBottom: spacing.md,
  },
  // Bottom bar
  bottomBar: {
    paddingHorizontal: spacing.xl,
    paddingTop: spacing.md,
  },
  continueButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary,
    borderRadius: spacing.borderRadius.lg,
    paddingVertical: 14,
  },
  continueButtonDisabled: {
    opacity: 0.5,
  },
  continueText: {
    fontSize: 16,
    color: colors.text.inverse,
  },
  // Picker options
  pickerOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
  },
  pickerOptionText: {
    fontSize: 14,
    color: colors.text.primary,
  },
  pickerOptionTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
});
