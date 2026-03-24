import React from 'react';
import { View, Text, StyleSheet, ScrollView, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ProfileHeader, SettingsItem } from '../../src/components/profile';
import { LoadingSpinner, ErrorState } from '../../src/components/ui';
import { useAuth } from '../../src/contexts/AuthContext';
import { useGetCurrentUserQuery } from '../../src/graphql/generated/graphql';
import { colors, spacing, typography } from '../../src/theme';

export default function ProfileScreen() {
  const { t, i18n } = useTranslation();
  const router = useRouter();
  const { logout } = useAuth();

  const { data, loading, error, refetch } = useGetCurrentUserQuery({
    fetchPolicy: 'cache-and-network',
  });

  const user = data?.me;

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout', 'Logout'),
      t('profile.logoutConfirm', 'Are you sure you want to logout?'),
      [
        {
          text: t('common.cancel', 'Cancel'),
          style: 'cancel',
        },
        {
          text: t('profile.logout', 'Logout'),
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.replace('/(auth)/login');
          },
        },
      ]
    );
  };

  const getCurrentLanguageName = () => {
    switch (i18n.language) {
      case 'fr':
        return 'Français';
      case 'en':
        return 'English';
      case 'ar':
        return 'العربية';
      default:
        return 'English';
    }
  };

  if (loading && !data) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
      </View>
    );
  }

  if (error || !user) {
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

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('profile.title', 'Profile')}</Text>
      </View>

      {/* Content */}
      <View style={styles.content}>
        {/* Profile Header */}
        <ProfileHeader
          firstName={user.firstName}
          lastName={user.lastName}
          email={user.email}
          phone={user.phone}
          onEditPress={() => router.push('/profile/edit')}
        />

        {/* Account Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.account', 'Account')}</Text>
          <SettingsItem
            icon="person-outline"
            label={t('profile.editProfile', 'Edit Profile')}
            value={t('profile.editProfileDesc', 'Update your personal information')}
            onPress={() => router.push('/profile/edit')}
          />
          <SettingsItem
            icon="lock-closed-outline"
            label={t('profile.changePassword', 'Change Password')}
            value={t('profile.changePasswordDesc', 'Update your password')}
            onPress={() => router.push('/profile/change-password')}
          />
          <SettingsItem
            icon="receipt-outline"
            label={t('profile.orderHistory', 'Order History')}
            value={t('profile.orderHistoryDesc', 'View your past orders')}
            onPress={() => router.push('/(tabs)/orders')}
          />
        </View>

        {/* App Settings Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.appSettings', 'App Settings')}</Text>
          <SettingsItem
            icon="language-outline"
            label={t('profile.language', 'Language')}
            value={getCurrentLanguageName()}
            onPress={() => router.push('/profile/settings')}
          />
          <SettingsItem
            icon="notifications-outline"
            label={t('profile.notifications', 'Notifications')}
            value={t('profile.notificationsDesc', 'Manage notification preferences')}
            onPress={() => router.push('/profile/settings')}
          />
          <SettingsItem
            icon="moon-outline"
            label={t('profile.darkMode', 'Dark Mode')}
            showSwitch
            switchValue={false}
            onSwitchChange={(value) => {
              // TODO: Implement dark mode toggle
              Alert.alert(
                t('profile.comingSoon', 'Coming Soon'),
                t('profile.darkModeComingSoon', 'Dark mode will be available in a future update')
              );
            }}
          />
        </View>

        {/* About Section */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('profile.about', 'About')}</Text>
          <SettingsItem
            icon="information-circle-outline"
            label={t('profile.aboutApp', 'About OSCAR Fashion')}
            value={t('profile.version', 'Version 2.0.0')}
            onPress={() => {
              Alert.alert(
                t('profile.aboutApp', 'About OSCAR Fashion'),
                t(
                  'profile.aboutMessage',
                  'OSCAR Fashion is your one-stop destination for the latest fashion trends and styles.'
                )
              );
            }}
          />
          <SettingsItem
            icon="document-text-outline"
            label={t('profile.termsAndConditions', 'Terms & Conditions')}
            onPress={() => {
              // TODO: Navigate to Terms & Conditions screen
              Alert.alert(
                t('profile.comingSoon', 'Coming Soon'),
                t('profile.termsComingSoon', 'Terms & Conditions will be available soon')
              );
            }}
          />
          <SettingsItem
            icon="shield-checkmark-outline"
            label={t('profile.privacyPolicy', 'Privacy Policy')}
            onPress={() => {
              // TODO: Navigate to Privacy Policy screen
              Alert.alert(
                t('profile.comingSoon', 'Coming Soon'),
                t('profile.privacyComingSoon', 'Privacy Policy will be available soon')
              );
            }}
          />
          <SettingsItem
            icon="help-circle-outline"
            label={t('profile.helpAndSupport', 'Help & Support')}
            onPress={() => {
              // TODO: Navigate to Help & Support screen
              Alert.alert(
                t('profile.comingSoon', 'Coming Soon'),
                t('profile.helpComingSoon', 'Help & Support will be available soon')
              );
            }}
          />
        </View>

        {/* Logout Section */}
        <View style={styles.section}>
          <SettingsItem
            icon="log-out-outline"
            label={t('profile.logout', 'Logout')}
            onPress={handleLogout}
            showChevron={false}
            isDestructive
          />
        </View>

        {/* App Version */}
        <Text style={styles.versionText}>{t('profile.appVersion', 'OSCAR Fashion v2.0.0')}</Text>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.styles.bodySmall,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: spacing.sm,
    marginLeft: spacing.xs,
  },
  versionText: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
});
