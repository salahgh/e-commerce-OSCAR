import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import {
  useActiveCustomerQuery,
  useUpdateCustomerProfileMutation,
} from '../../src/graphql/generated/graphql';
import { makeThemedStyles, useThemeColors, spacing, typography } from '../../src/theme';
import { useAppFont } from '../../src/hooks/useAppFont';
import { changeLanguage, getCurrentLanguage, Language } from '../../src/i18n';

export default function EditProfileScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { fontFamily } = useAppFont();
  const { user, updateUser } = useAuth();
  const styles = useStyles();
  const colors = useThemeColors();

  const { data } = useActiveCustomerQuery({ fetchPolicy: 'cache-and-network' });
  const customer = data?.activeCustomer;

  const [fullName, setFullName] = useState(
    customer
      ? `${customer.firstName} ${customer.lastName}`
      : `${user?.firstName || ''} ${user?.lastName || ''}`
  );
  const [email] = useState(customer?.emailAddress || user?.email || '');
  const [phone, setPhone] = useState(customer?.phoneNumber || '');
  const [selectedLang, setSelectedLang] = useState<Language>(getCurrentLanguage());
  const [saving, setSaving] = useState(false);

  const [updateProfile] = useUpdateCustomerProfileMutation();

  const handleSave = async () => {
    setSaving(true);
    try {
      const [firstName, ...rest] = fullName.trim().split(' ');
      const lastName = rest.join(' ') || firstName;

      await updateProfile({
        variables: {
          input: {
            firstName,
            lastName,
            phoneNumber: phone,
          },
        },
        refetchQueries: ['ActiveCustomer'],
      });

      if (selectedLang !== getCurrentLanguage()) {
        await changeLanguage(selectedLang);
      }

      updateUser({
        id: user?.id || '',
        email,
        firstName,
        lastName,
        phoneNumber: phone,
      });

      Alert.alert(t('common.success'), t('profile.updated'));
      router.back();
    } catch (err: any) {
      Alert.alert(t('common.error'), err.message || t('profile.updateError'));
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontFamily: fontFamily.medium }]}>
          {t('profile.personalInfo')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Avatar */}
          <View style={styles.avatarSection}>
            <View style={styles.avatarContainer}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={48} color={colors.text.tertiary} />
              </View>
              <TouchableOpacity style={styles.cameraButton}>
                <Ionicons name="camera" size={16} color={colors.text.secondary} />
              </TouchableOpacity>
            </View>
          </View>

          {/* Full Name */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { fontFamily: fontFamily.medium }]}>
              {t('auth.fullName')}
            </Text>
            <TextInput
              style={[styles.input, { fontFamily: fontFamily.regular }]}
              value={fullName}
              onChangeText={setFullName}
              placeholder={t('auth.enterFullName')}
              placeholderTextColor={colors.text.tertiary}
            />
          </View>

          {/* Email */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { fontFamily: fontFamily.medium }]}>
              {t('auth.addressEmail')}
            </Text>
            <TextInput
              style={[styles.input, styles.inputDisabled, { fontFamily: fontFamily.regular }]}
              value={email}
              editable={false}
            />
          </View>

          {/* Phone */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { fontFamily: fontFamily.medium }]}>
              {t('auth.phoneNumber')}
            </Text>
            <TextInput
              style={[styles.input, { fontFamily: fontFamily.regular }]}
              value={phone}
              onChangeText={setPhone}
              placeholder="+213 XXX XX XX XX"
              placeholderTextColor={colors.text.tertiary}
              keyboardType="phone-pad"
            />
          </View>

          {/* Password */}
          <View style={styles.fieldGroup}>
            <Text style={[styles.fieldLabel, { fontFamily: fontFamily.medium }]}>
              {t('auth.password')}
            </Text>
            <TouchableOpacity
              style={styles.passwordRow}
              onPress={() => router.push('/profile/change-password')}
            >
              <Text style={[styles.passwordDots, { fontFamily: fontFamily.regular }]}>
                ••••••••••
              </Text>
              <Ionicons name="eye-off-outline" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          </View>

          {/* Language */}
          <View style={styles.langSection}>
            <Text style={[styles.langTitle, { fontFamily: fontFamily.bold }]}>
              {t('profile.language')}
            </Text>

            <TouchableOpacity
              style={styles.langOption}
              onPress={() => setSelectedLang('ar')}
              activeOpacity={0.7}
            >
              <Ionicons
                name={selectedLang === 'ar' ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={selectedLang === 'ar' ? colors.primary : colors.border}
              />
              <Text style={[styles.langLabel, { fontFamily: fontFamily.medium }]}>
                (AR) العربية
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.langOption}
              onPress={() => setSelectedLang('fr')}
              activeOpacity={0.7}
            >
              <Ionicons
                name={selectedLang === 'fr' ? 'radio-button-on' : 'radio-button-off'}
                size={22}
                color={selectedLang === 'fr' ? colors.primary : colors.border}
              />
              <Text style={[styles.langLabel, { fontFamily: fontFamily.medium }]}>
                Français (FR)
              </Text>
            </TouchableOpacity>
          </View>

          {/* Save Button */}
          <TouchableOpacity
            style={styles.saveButton}
            onPress={handleSave}
            activeOpacity={0.8}
            disabled={saving}
          >
            <Text style={[styles.saveButtonText, { fontFamily: fontFamily.medium }]}>
              {saving ? t('common.saving') : t('common.save')}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
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
    scrollContent: {
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing['3xl'],
    },
    avatarSection: {
      alignItems: 'center',
      paddingVertical: spacing['2xl'],
    },
    avatarContainer: {
      position: 'relative',
    },
    avatar: {
      width: 120,
      height: 120,
      borderRadius: 60,
      backgroundColor: colors.gray[2],
      justifyContent: 'center',
      alignItems: 'center',
    },
    cameraButton: {
      position: 'absolute',
      bottom: 4,
      right: 4,
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      elevation: 2,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.15,
      shadowRadius: 2,
    },
    fieldGroup: {
      marginBottom: spacing.md,
    },
    fieldLabel: {
      fontSize: 13,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    input: {
      height: 48,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
      fontSize: 14,
      color: colors.text.primary,
      paddingHorizontal: 0,
    },
    inputDisabled: {
      color: colors.text.tertiary,
    },
    passwordRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: 48,
      borderBottomWidth: 1,
      borderBottomColor: colors.border,
    },
    passwordDots: {
      fontSize: 14,
      color: colors.text.primary,
    },
    langSection: {
      marginTop: spacing.xl,
      marginBottom: spacing.xl,
    },
    langTitle: {
      fontSize: 16,
      color: colors.text.primary,
      marginBottom: spacing.lg,
    },
    langOption: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingVertical: spacing.sm,
      marginBottom: spacing.sm,
    },
    langLabel: {
      fontSize: 15,
      color: colors.text.primary,
    },
    saveButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 16,
      alignItems: 'center',
    },
    saveButtonText: {
      fontSize: 16,
      color: colors.text.inverse,
    },
  })
);
