import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import { useGetRootCollectionsQuery } from '../../src/graphql/generated/graphql';
import { colors, spacing, typography } from '../../src/theme';
import { useAppFont } from '../../src/hooks/useAppFont';

const SIDEBAR_WIDTH = 111;
const CIRCLE_SIZE = 79;
const CIRCLE_GAP = 14;

export default function ExploreScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { fontFamily } = useAppFont();

  const [searchInput, setSearchInput] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const { data, loading } = useGetRootCollectionsQuery();

  // Filter out banners collection
  const rootCollections = useMemo(() => {
    return (data?.collections?.items ?? []).filter((c) => c.slug !== 'banners');
  }, [data]);

  const selectedCollection = rootCollections[selectedIndex] || null;
  const children = selectedCollection?.children ?? [];

  const handleSearch = () => {
    if (searchInput.trim()) {
      router.push(`/search?q=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleViewAll = () => {
    if (selectedCollection) {
      router.push(`/products?category=${selectedCollection.slug}` as any);
    }
  };

  const handleSubcategoryPress = (slug: string) => {
    router.push(`/products?category=${slug}` as any);
  };

  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Search Bar */}
      <View style={styles.searchRow}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color={colors.text.tertiary} />
          <TextInput
            style={[styles.searchInput, { fontFamily: fontFamily.regular }]}
            placeholder={t('explore.searchPlaceholder', 'Rechercher dans Oscar')}
            placeholderTextColor={colors.text.tertiary}
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
          />
        </View>
        <TouchableOpacity style={styles.filterIcon} activeOpacity={0.7}>
          <Ionicons name="calendar-outline" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Main Content: Sidebar + Right Panel */}
      <View style={styles.mainContent}>
        {/* Left Sidebar */}
        <ScrollView style={styles.sidebar} showsVerticalScrollIndicator={false}>
          {rootCollections.map((collection, index) => {
            const isActive = index === selectedIndex;
            return (
              <TouchableOpacity
                key={collection.id}
                style={[styles.sidebarItem, isActive && styles.sidebarItemActive]}
                onPress={() => setSelectedIndex(index)}
                activeOpacity={0.7}
              >
                <Text
                  style={[
                    styles.sidebarText,
                    { fontFamily: fontFamily.medium },
                    isActive && styles.sidebarTextActive,
                  ]}
                >
                  {collection.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Right Panel */}
        <ScrollView style={styles.rightPanel} showsVerticalScrollIndicator={false}>
          {selectedCollection && (
            <>
              {/* "Tout les articles" link */}
              <TouchableOpacity style={styles.viewAllRow} onPress={handleViewAll} activeOpacity={0.7}>
                <Text style={[styles.viewAllText, { fontFamily: fontFamily.medium }]}>
                  {t('explore.allItems', 'Tout les articles')}
                </Text>
                <Ionicons name="arrow-forward" size={16} color={colors.text.primary} />
              </TouchableOpacity>

              {/* Section title */}
              <Text style={[styles.sectionTitle, { fontFamily: fontFamily.medium }]}>
                {selectedCollection.name}
              </Text>

              {/* Subcategory circles grid */}
              <View style={styles.circleGrid}>
                {children.map((child) => (
                  <TouchableOpacity
                    key={child.id}
                    style={styles.circleItem}
                    onPress={() => handleSubcategoryPress(child.slug)}
                    activeOpacity={0.7}
                  >
                    {child.featuredAsset?.preview ? (
                      <Image
                        source={{ uri: child.featuredAsset.preview }}
                        style={styles.circleImage}
                        contentFit="cover"
                        transition={200}
                      />
                    ) : (
                      <View style={[styles.circleImage, styles.circlePlaceholder]}>
                        <Ionicons name="shirt-outline" size={28} color={colors.text.tertiary} />
                      </View>
                    )}
                    <Text
                      style={[styles.circleName, { fontFamily: fontFamily.medium }]}
                      numberOfLines={1}
                    >
                      {child.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {children.length === 0 && (
                <View style={styles.emptyChildren}>
                  <Ionicons name="folder-open-outline" size={40} color={colors.text.tertiary} />
                  <Text style={[styles.emptyText, { fontFamily: fontFamily.regular }]}>
                    {t('explore.noSubcategories', 'Aucune sous-catégorie')}
                  </Text>
                </View>
              )}
            </>
          )}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Search bar
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.md,
    gap: spacing.lg,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#F9FAFB',
    paddingHorizontal: spacing.sm,
    height: 36,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.text.primary,
    paddingVertical: 0,
  },
  filterIcon: {
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Main content
  mainContent: {
    flex: 1,
    flexDirection: 'row',
  },
  // Left sidebar
  sidebar: {
    width: SIDEBAR_WIDTH,
    backgroundColor: '#EFEFEF',
  },
  sidebarItem: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginBottom: 28,
  },
  sidebarItemActive: {
    backgroundColor: colors.surface,
    borderLeftWidth: 2,
    borderLeftColor: '#1E1E1E',
  },
  sidebarText: {
    fontSize: 14,
    color: '#999DAF',
    lineHeight: 24,
  },
  sidebarTextActive: {
    color: '#1E1E1E',
  },
  // Right panel
  rightPanel: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 0,
  },
  viewAllRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginBottom: 23,
  },
  viewAllText: {
    fontSize: 12,
    color: colors.text.primary,
    lineHeight: 16,
  },
  sectionTitle: {
    fontSize: 14,
    color: colors.text.primary,
    lineHeight: 16,
    marginBottom: 24,
  },
  // Subcategory circles
  circleGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: CIRCLE_GAP,
  },
  circleItem: {
    width: CIRCLE_SIZE,
    alignItems: 'center',
    gap: 6,
  },
  circleImage: {
    width: CIRCLE_SIZE,
    height: CIRCLE_SIZE,
    borderRadius: CIRCLE_SIZE / 2,
  },
  circlePlaceholder: {
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  circleName: {
    fontSize: 12,
    color: colors.text.primary,
    lineHeight: 16,
    textAlign: 'center',
    width: CIRCLE_SIZE,
  },
  emptyChildren: {
    alignItems: 'center',
    paddingTop: 60,
    gap: spacing.md,
  },
  emptyText: {
    fontSize: 14,
    color: colors.text.tertiary,
  },
});
