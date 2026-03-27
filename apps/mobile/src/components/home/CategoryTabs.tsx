import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../theme';
import { useAppFont } from '../../hooks/useAppFont';
import { useGetRootCollectionsQuery } from '../../graphql/generated/graphql';

interface CategoryTabsProps {
  onCategoryChange?: (collectionSlug: string | undefined) => void;
}

export const CategoryTabs: React.FC<CategoryTabsProps> = ({ onCategoryChange }) => {
  const { t } = useTranslation();
  const { fontFamily } = useAppFont();
  const [activeSlug, setActiveSlug] = useState<string | undefined>(undefined);

  const { data, loading, error } = useGetRootCollectionsQuery();
  const collections = (data?.collections?.items ?? []).filter((c) => c.slug !== 'banners');
  const handlePress = (slug: string | undefined) => {
    setActiveSlug(slug);
    onCategoryChange?.(slug);
  };

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { fontFamily: fontFamily.bold }]}>
        {t('home.categories')}
      </Text>

      {loading ? (
        <ActivityIndicator size="small" color={colors.primary} style={styles.loader} />
      ) : (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsContainer}
        >
          {/* "All" tab — always first */}
          <TouchableOpacity
            style={[styles.tab, activeSlug === undefined && styles.tabActive]}
            onPress={() => handlePress(undefined)}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.tabText,
                { fontFamily: fontFamily.medium },
                activeSlug === undefined && styles.tabTextActive,
              ]}
            >
              {t('home.all')}
            </Text>
          </TouchableOpacity>

          {/* Dynamic categories from backend */}
          {collections.map((collection) => {
            const isActive = activeSlug === collection.slug;
            return (
              <TouchableOpacity
                key={collection.id}
                style={[styles.tab, isActive && styles.tabActive]}
                onPress={() => handlePress(collection.slug)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.tabText,
                    { fontFamily: fontFamily.medium },
                    isActive && styles.tabTextActive,
                  ]}
                >
                  {collection.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  loader: {
    alignSelf: 'flex-start',
    marginVertical: spacing.sm,
  },
  tabsContainer: {
    gap: spacing.sm,
  },
  tab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.gray[2],
    backgroundColor: colors.surface,
  },
  tabActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  tabText: {
    fontSize: typography.fontSize.sm,
    color: colors.text.primary,
  },
  tabTextActive: {
    color: colors.text.inverse,
  },
});
