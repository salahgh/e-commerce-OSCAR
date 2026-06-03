import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { SettingsItem } from '../../src/components/profile';
import { useThemeMode, ThemeMode } from '../../src/contexts/ThemeContext';
import { spacing, typography, makeThemedStyles, useThemeColors } from '../../src/theme';
import { useAppFont } from '../../src/hooks/useAppFont';

export default function SettingsScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { mode: themeMode, setMode: setThemeMode } = useThemeMode();
  const colors = useThemeColors();
  const styles = useStyles();
  const { fontFamily } = useAppFont();
  const themeOptions: Array<{ value: ThemeMode; labelKey: string }> = [
    { value: 'system', labelKey: 'theme.system' },
    { value: 'light', labelKey: 'theme.light' },
    { value: 'dark', labelKey: 'theme.dark' },
  ];

  const languages = [
    { code: 'fr', name: 'Français', flag: '🇫🇷' },
    { code: 'en', name: 'English', flag: '🇬🇧' },
    { code: 'ar', name: 'العربية', flag: '🇩🇿' },
  ];

  const handleLanguageChange = async (languageCode: string) => {
    await i18n.changeLanguage(languageCode);
    // Optionally save to storage
  };

  const getCurrentLanguage = () => {
    return languages.find((lang) => lang.code === i18n.language) || languages[0];
  };

  return (
    <View style={styles.container} testID="settings-screen">
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontFamily: fontFamily.bold }]}>
          {t('profile.settings', 'Settings')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Language Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: fontFamily.bold }]}>
            {t('profile.language', 'Language')}
          </Text>
          <Text style={[styles.sectionSubtitle, { fontFamily: fontFamily.regular }]}>
            {t('profile.languageDesc', 'Select your preferred language')}
          </Text>

          <View style={styles.languageList}>
            {languages.map((language) => {
              const isSelected = i18n.language === language.code;

              return (
                <TouchableOpacity
                  key={language.code}
                  style={[styles.languageItem, isSelected && styles.languageItemSelected]}
                  onPress={() => handleLanguageChange(language.code)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.languageFlag}>{language.flag}</Text>
                  <Text
                    style={[
                      styles.languageName,
                      isSelected && styles.languageNameSelected,
                      { fontFamily: fontFamily.medium },
                    ]}
                  >
                    {language.name}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: fontFamily.bold }]}>
            {t('profile.notifications', 'Notifications')}
          </Text>
          <SettingsItem
            icon="notifications-outline"
            label={t('profile.orderUpdates', 'Order Updates')}
            value={t('profile.orderUpdatesDesc', 'Get notified about order status changes')}
            showSwitch
            switchValue={true}
            onSwitchChange={(value) => {
              // TODO: Implement notification settings
            }}
          />
          <SettingsItem
            icon="pricetag-outline"
            label={t('profile.promotions', 'Promotions & Offers')}
            value={t('profile.promotionsDesc', 'Receive updates about sales and special offers')}
            showSwitch
            switchValue={true}
            onSwitchChange={(value) => {
              // TODO: Implement notification settings
            }}
          />
          <SettingsItem
            icon="chatbubble-outline"
            label={t('profile.newsletter', 'Newsletter')}
            value={t('profile.newsletterDesc', 'Weekly fashion tips and trends')}
            showSwitch
            switchValue={false}
            onSwitchChange={(value) => {
              // TODO: Implement notification settings
            }}
          />
        </View>

        {/* Appearance Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: fontFamily.bold }]}>
            {t('theme.title')}
          </Text>
          <Text style={[styles.sectionSubtitle, { fontFamily: fontFamily.regular }]}>
            {t('theme.subtitle')}
          </Text>
          <View style={styles.languageList}>
            {themeOptions.map((opt) => {
              const isSelected = themeMode === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.languageItem, isSelected && styles.languageItemSelected]}
                  onPress={() => setThemeMode(opt.value)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={
                      opt.value === 'system'
                        ? 'phone-portrait-outline'
                        : opt.value === 'light'
                          ? 'sunny-outline'
                          : 'moon-outline'
                    }
                    size={24}
                    color={isSelected ? colors.primary : colors.text.secondary}
                    style={{ marginRight: spacing.md }}
                  />
                  <Text
                    style={[
                      styles.languageName,
                      isSelected && styles.languageNameSelected,
                      { fontFamily: fontFamily.medium },
                    ]}
                  >
                    {t(opt.labelKey)}
                  </Text>
                  {isSelected && (
                    <Ionicons name="checkmark-circle" size={24} color={colors.primary} />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </View>
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
    section: {
      padding: spacing.lg,
    },
    sectionTitle: {
      ...typography.styles.h4,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    sectionSubtitle: {
      ...typography.styles.bodySmall,
      color: colors.text.secondary,
      marginBottom: spacing.md,
    },
    languageList: {
      gap: spacing.sm,
    },
    languageItem: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      padding: spacing.md,
      borderRadius: 12,
      borderWidth: 2,
      borderColor: colors.border,
    },
    languageItemSelected: {
      borderColor: colors.primary,
      backgroundColor: colors.primary + '10',
    },
    languageFlag: {
      fontSize: 28,
      marginRight: spacing.md,
    },
    languageName: {
      ...typography.styles.body,
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
      flex: 1,
    },
    languageNameSelected: {
      color: colors.primary,
    },
  })
);
