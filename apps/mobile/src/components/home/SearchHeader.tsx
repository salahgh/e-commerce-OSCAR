import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { useAppFont } from '../../hooks/useAppFont';

export const SearchHeader: React.FC = () => {
  const { t } = useTranslation();
  const router = useRouter();
  const { fontFamily } = useAppFont();

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.searchBar}
        onPress={() => router.push('/search')}
        activeOpacity={0.8}
      >
        <Ionicons name="search-outline" size={spacing.iconSize.sm} color={colors.text.tertiary} />
        <Text style={[styles.placeholder, { fontFamily: fontFamily.medium }]}>
          {t('home.searchPlaceholder')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.iconButton}
        onPress={() => router.push('/profile/notifications')}
        activeOpacity={0.7}
      >
        <Ionicons name="calendar-outline" size={spacing.iconSize.md} color={colors.text.primary} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    gap: spacing.md,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray[1],
    borderRadius: spacing.borderRadius.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    gap: spacing.sm,
  },
  placeholder: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
  },
  iconButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
