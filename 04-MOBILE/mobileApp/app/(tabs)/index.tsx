import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useGetFeaturedProductsQuery } from '../../src/graphql/generated/graphql';
import { ProductCard, SearchBar } from '../../src/components/products';
import { LoadingSpinner, ErrorState } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/theme';
import { useAuth } from '../../src/contexts/AuthContext';

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch featured products
  const {
    data: featuredData,
    loading: featuredLoading,
    error: featuredError,
    refetch: refetchFeatured,
  } = useGetFeaturedProductsQuery();

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/products/search?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleRefresh = () => {
    refetchFeatured();
  };

  const handleSeeAllProducts = () => {
    router.push('/products');
  };

  const handleSeeCategory = (category: string) => {
    router.push(`/products?category=${encodeURIComponent(category)}`);
  };

  if (featuredLoading) {
    return <LoadingSpinner />;
  }

  if (featuredError) {
    return (
      <ErrorState
        title={t('common.error', 'Error')}
        message={featuredError.message}
        onRetry={refetchFeatured}
      />
    );
  }

  const featuredProducts = featuredData?.featuredProducts || [];

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={featuredLoading}
          onRefresh={handleRefresh}
          colors={[colors.primary]}
          tintColor={colors.primary}
        />
      }
    >
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {user?.firstName
              ? t('home.greeting', { name: user.firstName })
              : t('home.welcome', 'Welcome')}
          </Text>
          <Text style={styles.subtitle}>OSCAR Fashion</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={handleSearch}
          placeholder={t('products.searchPlaceholder', 'Search for fashion items...')}
        />
      </View>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t('home.featured', 'Featured Products')}</Text>
            <TouchableOpacity onPress={handleSeeAllProducts}>
              <Text style={styles.seeAll}>{t('home.seeAll', 'See All')}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.horizontalScroll}
          >
            {featuredProducts.map((product) => (
              <View key={product.id} style={styles.horizontalCard}>
                <ProductCard product={product} />
              </View>
            ))}
          </ScrollView>
        </View>
      )}

      {/* Categories Quick Access */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>{t('home.shopByCategory', 'Shop by Category')}</Text>
        <View style={styles.categoriesGrid}>
          <TouchableOpacity style={styles.categoryCard} onPress={() => handleSeeCategory('women')}>
            <Text style={styles.categoryEmoji}>👗</Text>
            <Text style={styles.categoryText}>{t('categories.women', 'Women')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryCard} onPress={() => handleSeeCategory('men')}>
            <Text style={styles.categoryEmoji}>👔</Text>
            <Text style={styles.categoryText}>{t('categories.men', 'Men')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.categoryCard}
            onPress={() => handleSeeCategory('accessories')}
          >
            <Text style={styles.categoryEmoji}>👜</Text>
            <Text style={styles.categoryText}>{t('categories.accessories', 'Accessories')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.categoryCard} onPress={() => handleSeeCategory('shoes')}>
            <Text style={styles.categoryEmoji}>👟</Text>
            <Text style={styles.categoryText}>{t('categories.shoes', 'Shoes')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Call to Action */}
      <TouchableOpacity style={styles.ctaButton} onPress={handleSeeAllProducts}>
        <Text style={styles.ctaText}>{t('home.browseAllProducts', 'Browse All Products')}</Text>
      </TouchableOpacity>

      <View style={styles.bottomSpacer} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    paddingTop: spacing.xl,
  },
  greeting: {
    ...typography.styles.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  subtitle: {
    ...typography.styles.body,
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.xl,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    marginBottom: spacing.md,
  },
  sectionTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
  seeAll: {
    ...typography.styles.body,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  horizontalScroll: {
    paddingLeft: spacing.lg,
    gap: spacing.md,
  },
  horizontalCard: {
    width: 180,
  },
  categoriesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.lg,
    gap: spacing.md,
  },
  categoryCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    aspectRatio: 1,
    elevation: 2,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  categoryEmoji: {
    fontSize: 48,
    marginBottom: spacing.sm,
  },
  categoryText: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semiBold,
    textAlign: 'center',
  },
  ctaButton: {
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: spacing.xl,
  },
  ctaText: {
    ...typography.styles.body,
    color: colors.white,
    fontWeight: typography.fontWeight.semiBold,
  },
  bottomSpacer: {
    height: spacing.xl,
  },
});
