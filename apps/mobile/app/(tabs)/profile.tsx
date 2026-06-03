import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../src/contexts/AuthContext';
import { useActiveCustomerQuery } from '../../src/graphql/generated/graphql';
import { LoadingSpinner } from '../../src/components/ui';
import { spacing, typography, makeThemedStyles, useThemeColors } from '../../src/theme';
import { useAppFont } from '../../src/hooks/useAppFont';

interface MenuItem {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
  onPress: () => void;
}

export default function ProfileScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { fontFamily } = useAppFont();
  const colors = useThemeColors();
  const styles = useStyles();
  const { user, logout, isAuthenticated } = useAuth();

  const { data, loading } = useActiveCustomerQuery({
    fetchPolicy: 'cache-and-network',
    skip: !isAuthenticated,
  });

  const customer = data?.activeCustomer;

  const handleLogout = () => {
    Alert.alert(t('profile.logoutConfirm'), t('profile.logoutConfirmMessage'), [
      { text: t('common.cancel'), style: 'cancel' },
      {
        text: t('profile.logoutConfirm'),
        style: 'destructive',
        onPress: async () => {
          await logout();
          router.replace('/(auth)/login');
        },
      },
    ]);
  };

  if (!isAuthenticated) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { fontFamily: fontFamily.medium }]}>
            {t('profile.title')}
          </Text>
        </View>
        <View style={styles.loginPrompt}>
          <Text style={[styles.loginPromptText, { fontFamily: fontFamily.regular }]}>
            {t('profile.loginPrompt')}
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/(auth)/login')}>
            <Text style={[styles.loginButtonText, { fontFamily: fontFamily.medium }]}>
              {t('auth.signIn')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading && !customer) {
    return <LoadingSpinner />;
  }

  const displayName = customer
    ? `${customer.firstName} ${customer.lastName}`
    : user?.firstName
      ? `${user.firstName} ${user.lastName}`
      : '';
  const displayPhone = customer?.phoneNumber || user?.phoneNumber || '';

  const menuItems: MenuItem[] = [
    {
      icon: 'person-outline',
      label: t('profile.personalInfo'),
      onPress: () => router.push('/profile/edit'),
    },
    {
      icon: 'location-outline',
      label: t('profile.addresses', 'My Addresses'),
      onPress: () => router.push('/profile/addresses' as any),
    },
    {
      icon: 'cube-outline',
      label: t('profile.trackOrders'),
      onPress: () => router.push('/(tabs)/orders' as any),
    },
    {
      icon: 'heart-outline',
      label: t('wishlist.title'),
      onPress: () => router.push('/profile/wishlist' as any),
    },
    {
      icon: 'settings-outline',
      label: t('profile.settings'),
      onPress: () => router.push('/profile/settings'),
    },
    {
      icon: 'information-circle-outline',
      label: t('info.indexTitle'),
      onPress: () => router.push('/info' as any),
    },
    {
      icon: 'help-circle-outline',
      label: t('profile.helpSupport'),
      onPress: () => router.push('/profile/support' as any),
    },
  ];

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { fontFamily: fontFamily.medium }]}>
          {t('profile.title')}
        </Text>
      </View>

      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        {/* Avatar + Name */}
        <View style={styles.profileSection}>
          <View style={styles.avatar}>
            {customer?.customFields?.avatar ? (
              <Image
                source={{ uri: customer.customFields.avatar }}
                style={styles.avatarImage}
                contentFit="cover"
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Ionicons name="person" size={32} color={colors.text.tertiary} />
              </View>
            )}
          </View>
          <View style={styles.profileInfo}>
            <Text style={[styles.profileName, { fontFamily: fontFamily.bold }]}>{displayName}</Text>
            <Text style={[styles.profilePhone, { fontFamily: fontFamily.regular }]}>
              {displayPhone}
            </Text>
          </View>
        </View>

        {/* Menu Items */}
        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.onPress}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <Ionicons name={item.icon} size={22} color={colors.text.primary} />
                <Text style={[styles.menuItemLabel, { fontFamily: fontFamily.regular }]}>
                  {item.label}
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {/* Logout at bottom */}
      <TouchableOpacity
        style={[styles.logoutButton, { paddingBottom: insets.bottom + spacing.lg }]}
        onPress={handleLogout}
        activeOpacity={0.7}
      >
        <Ionicons name="log-out-outline" size={22} color={colors.error} />
        <Text style={[styles.logoutText, { fontFamily: fontFamily.regular }]}>
          {t('profile.logoutConfirm')}
        </Text>
      </TouchableOpacity>
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
      alignItems: 'center',
      paddingVertical: spacing.md,
    },
    headerTitle: {
      fontSize: typography.fontSize.lg,
      color: colors.text.primary,
    },
    scroll: {
      flex: 1,
    },
    // Profile section
    profileSection: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.xl,
      gap: spacing.lg,
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: 32,
      overflow: 'hidden',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarPlaceholder: {
      width: '100%',
      height: '100%',
      backgroundColor: colors.gray[2],
      justifyContent: 'center',
      alignItems: 'center',
    },
    profileInfo: {
      flex: 1,
    },
    profileName: {
      fontSize: 18,
      color: colors.text.primary,
      marginBottom: 2,
    },
    profilePhone: {
      fontSize: 14,
      color: colors.text.secondary,
    },
    // Menu
    menuSection: {
      paddingHorizontal: spacing.xl,
      marginTop: spacing.lg,
    },
    menuItem: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    menuItemLeft: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    menuItemLabel: {
      fontSize: 15,
      color: colors.text.primary,
    },
    // Logout
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    logoutText: {
      fontSize: 15,
      color: colors.error,
    },
    // Login prompt
    loginPrompt: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      gap: spacing.xl,
    },
    loginPromptText: {
      fontSize: 15,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    loginButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 14,
      paddingHorizontal: 40,
    },
    loginButtonText: {
      fontSize: 16,
      color: colors.text.inverse,
    },
  })
);
