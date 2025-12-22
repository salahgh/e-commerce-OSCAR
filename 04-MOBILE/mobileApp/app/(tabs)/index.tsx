import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  useGetFeaturedProductsQuery,
  useGetNewArrivalsQuery,
  useGetCategoriesQuery,
} from '../../src/graphql/generated/graphql';
import { ProductCard, SearchBar } from '../../src/components/products';
import { HeroBanner, CategoryScroll, ProductSection } from '../../src/components/home';
import { LoadingSpinner, ErrorState } from '../../src/components/ui';
import { CartBadge } from '../../src/components/cart';
import { colors, spacing, typography } from '../../src/theme';
import { useAuth } from '../../src/contexts/AuthContext';

// Sample banner data - in production, this would come from an API
const bannerSlides = [
  {
    id: '1',
    title: 'New Collection',
    subtitle: 'Discover the latest trends in fashion',
    imageUrl: 'https://images.unsplash.com/photo-1483985988355-763728e1935b?w=800',
    buttonText: 'Shop Now',
    link: '/products?collection=new',
  },
  {
    id: '2',
    title: 'Summer Sale',
    subtitle: 'Up to 50% off on selected items',
    imageUrl: 'https://images.unsplash.com/photo-1469334031218-e382a71b716b?w=800',
    buttonText: 'View Offers',
    link: '/products?sale=true',
  },
  {
    id: '3',
    title: 'Premium Quality',
    subtitle: 'Handpicked fashion for you',
    imageUrl: 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800',
    buttonText: 'Explore',
    link: '/products',
  },
];

// Default categories with icons
const defaultCategories = [
  { id: '1', name: 'Women', slug: 'women', icon: 'woman-outline' as const },
  { id: '2', name: 'Men', slug: 'men', icon: 'man-outline' as const },
  { id: '3', name: 'Accessories', slug: 'accessories', icon: 'watch-outline' as const },
  { id: '4', name: 'Shoes', slug: 'shoes', icon: 'footsteps-outline' as const },
  { id: '5', name: 'Bags', slug: 'bags', icon: 'bag-outline' as const },
  { id: '6', name: 'Jewelry', slug: 'jewelry', icon: 'diamond-outline' as const },
];

export default function HomeScreen() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // Fetch featured products
  const {
    data: featuredData,
    loading: featuredLoading,
    error: featuredError,
    refetch: refetchFeatured,
  } = useGetFeaturedProductsQuery();

  // Fetch new arrivals
  const {
    data: newArrivalsData,
    loading: newArrivalsLoading,
    refetch: refetchNewArrivals,
  } = useGetNewArrivalsQuery({
    variables: { limit: 10 },
  });

  // Fetch categories
  const {
    data: categoriesData,
    refetch: refetchCategories,
  } = useGetCategoriesQuery();

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await Promise.all([
        refetchFeatured(),
        refetchNewArrivals(),
        refetchCategories(),
      ]);
    } finally {
      setRefreshing(false);
    }
  }, [refetchFeatured, refetchNewArrivals, refetchCategories]);

  const handleSearch = () => {
    if (searchQuery.trim()) {
      router.push(`/(tabs)/explore?q=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      router.push('/(tabs)/explore');
    }
  };

  const handleSeeAllFeatured = () => {
    router.push('/products?featured=true');
  };

  const handleSeeAllNewArrivals = () => {
    router.push('/products?sort=newest');
  };

  const handleSeeAllCategories = () => {
    router.push('/(tabs)/explore');
  };

  const loading = featuredLoading && newArrivalsLoading;

  if (loading && !refreshing) {
    return <LoadingSpinner />;
  }

  if (featuredError) {
    return (
      <ErrorState
        title={t('common.error', 'Error')}
        message={featuredError.message}
        onRetry={handleRefresh}
      />
    );
  }

  const featuredProducts = featuredData?.featuredProducts || [];
  const newArrivals = newArrivalsData?.newArrivals || [];
  const categories = categoriesData?.categories?.map((cat: any) => ({
    id: cat.id?.toString() || '',
    name: cat.nameFr || cat.nameEn || '',
    slug: cat.slug || '',
    imageUrl: cat.imageUrl,
  })) || defaultCategories;

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>
            {user?.firstName
              ? `Hello, ${user.firstName}`
              : t('home.welcome', 'Welcome')}
          </Text>
          <Text style={styles.brandName}>OSCAR Fashion</Text>
        </View>
        <View style={styles.headerRight}>
          <TouchableOpacity
            style={styles.headerIcon}
            onPress={() => router.push('/profile/notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <CartBadge />
        </View>
      </View>

      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={handleRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      >
        {/* Search Bar */}
        <TouchableOpacity
          style={styles.searchContainer}
          onPress={() => router.push('/search')}
          activeOpacity={0.8}
        >
          <View style={styles.searchBar}>
            <Ionicons name="search-outline" size={20} color={colors.text.tertiary} />
            <Text style={styles.searchPlaceholder}>
              {t('products.searchPlaceholder', 'Search for fashion items...')}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Hero Banner */}
        <HeroBanner slides={bannerSlides} autoScroll height={200} />

        {/* Categories */}
        <View style={styles.section}>
          <CategoryScroll
            categories={categories}
            title={t('home.shopByCategory', 'Shop by Category')}
            showSeeAll
            onSeeAll={handleSeeAllCategories}
          />
        </View>

        {/* Featured Products */}
        {featuredProducts.length > 0 && (
          <ProductSection
            title={t('home.featured', 'Featured Products')}
            products={featuredProducts}
            onSeeAll={handleSeeAllFeatured}
            variant="horizontal"
          />
        )}

        {/* New Arrivals */}
        {newArrivals.length > 0 && (
          <ProductSection
            title={t('home.newArrivals', 'New Arrivals')}
            products={newArrivals}
            onSeeAll={handleSeeAllNewArrivals}
            variant="horizontal"
          />
        )}

        {/* Promotional Section */}
        <TouchableOpacity
          style={styles.promoSection}
          onPress={() => router.push('/products')}
          activeOpacity={0.8}
        >
          <View style={styles.promoContent}>
            <Ionicons name="gift-outline" size={32} color={colors.primary} />
            <View style={styles.promoText}>
              <Text style={styles.promoTitle}>Free Delivery</Text>
              <Text style={styles.promoSubtitle}>On orders over 5000 DZD</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color={colors.primary} />
          </View>
        </TouchableOpacity>

        {/* Browse All Button */}
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => router.push('/products')}
          activeOpacity={0.8}
        >
          <Text style={styles.ctaText}>{t('home.browseAllProducts', 'Browse All Products')}</Text>
          <Ionicons name="arrow-forward" size={20} color={colors.surface} />
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
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
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  greeting: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: 2,
  },
  brandName: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  headerIcon: {
    padding: spacing.xs,
  },
  scrollView: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: spacing.borderRadius.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    gap: spacing.sm,
  },
  searchPlaceholder: {
    fontSize: typography.fontSize.md,
    color: colors.text.tertiary,
  },
  section: {
    marginTop: spacing.lg,
  },
  promoSection: {
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    backgroundColor: colors.secondaryLight,
    borderRadius: spacing.borderRadius.lg,
    overflow: 'hidden',
  },
  promoContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: spacing.lg,
    gap: spacing.md,
  },
  promoText: {
    flex: 1,
  },
  promoTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  promoSubtitle: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: 2,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primary,
    marginHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    borderRadius: spacing.borderRadius.lg,
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  ctaText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.surface,
  },
  bottomSpacer: {
    height: spacing['2xl'],
  },
});
