import React, { useState, useCallback, useMemo, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Keyboard,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  useSearchProductsQuery,
  useGetCategoriesQuery,
  ProductResponse,
} from '../../src/graphql/generated/graphql';
import { ProductCard } from '../../src/components/products';
import { FilterBottomSheet, FilterOptions } from '../../src/components/products/FilterBottomSheet';
import { LoadingSpinner, EmptyState } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/theme';

const PAGE_SIZE = 20;

export default function ExploreScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams<{ q?: string; category?: string }>();

  // State
  const [searchQuery, setSearchQuery] = useState(params.q || '');
  const [searchInput, setSearchInput] = useState(params.q || '');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    params.category || null
  );
  const [filters, setFilters] = useState<FilterOptions>({});
  const [showFilters, setShowFilters] = useState(false);
  const [page, setPage] = useState(1);
  const [allProducts, setAllProducts] = useState<ProductResponse[]>([]);
  const [hasMore, setHasMore] = useState(true);

  const searchInputRef = useRef<TextInput>(null);

  // Fetch categories
  const { data: categoriesData } = useGetCategoriesQuery();

  // Fetch products
  const { data, loading, error, refetch, fetchMore } = useSearchProductsQuery({
    variables: {
      query: searchQuery || undefined,
      categoryId: selectedCategory ? parseInt(selectedCategory) : undefined,
      minPrice: filters.priceRange?.min,
      maxPrice: filters.priceRange?.max === Infinity ? undefined : filters.priceRange?.max,
      sizes: filters.sizes?.length ? filters.sizes : undefined,
      colors: filters.colors?.length ? filters.colors : undefined,
      inStock: filters.inStock,
      onSale: filters.onSale,
      sortBy: filters.sortBy,
      page: 1,
      pageSize: PAGE_SIZE,
    },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data) => {
      const products = data?.searchProducts?.products || [];
      setAllProducts(products);
      setHasMore(products.length === PAGE_SIZE);
      setPage(1);
    },
  });

  const categories = useMemo(() => {
    return (
      categoriesData?.categories?.map((cat: any) => ({
        id: cat.id?.toString() || '',
        name: cat.nameFr || cat.nameEn || '',
      })) || []
    );
  }, [categoriesData]);

  const handleSearch = useCallback(() => {
    Keyboard.dismiss();
    setSearchQuery(searchInput.trim());
    setPage(1);
    setAllProducts([]);
  }, [searchInput]);

  const handleClearSearch = useCallback(() => {
    setSearchInput('');
    setSearchQuery('');
    setPage(1);
    setAllProducts([]);
    searchInputRef.current?.focus();
  }, []);

  const handleCategoryPress = useCallback((categoryId: string | null) => {
    setSelectedCategory(categoryId);
    setPage(1);
    setAllProducts([]);
  }, []);

  const handleFilterApply = useCallback((newFilters: FilterOptions) => {
    setFilters(newFilters);
    setPage(1);
    setAllProducts([]);
  }, []);

  const handleRefresh = useCallback(async () => {
    setPage(1);
    await refetch();
  }, [refetch]);

  const handleLoadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    const nextPage = page + 1;
    try {
      const result = await fetchMore({
        variables: {
          page: nextPage,
        },
      });

      const newProducts = result.data?.searchProducts?.products || [];
      if (newProducts.length < PAGE_SIZE) {
        setHasMore(false);
      }
      setAllProducts((prev) => [...prev, ...newProducts]);
      setPage(nextPage);
    } catch (error) {
      console.error('Load more error:', error);
    }
  }, [page, hasMore, loading, fetchMore]);

  const handleProductPress = useCallback((product: ProductResponse) => {
    router.push(`/products/${product.id}`);
  }, []);

  const activeFiltersCount = useMemo(() => {
    return (
      (filters.categories?.length || 0) +
      (filters.sizes?.length || 0) +
      (filters.colors?.length || 0) +
      (filters.priceRange ? 1 : 0) +
      (filters.inStock ? 1 : 0) +
      (filters.onSale ? 1 : 0) +
      (filters.sortBy ? 1 : 0)
    );
  }, [filters]);

  const renderHeader = () => (
    <View>
      {/* Category Tabs */}
      <View style={styles.categoryTabsContainer}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={[{ id: null, name: 'All' }, ...categories]}
          keyExtractor={(item) => item.id?.toString() || 'all'}
          contentContainerStyle={styles.categoryTabs}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={[
                styles.categoryTab,
                (item.id === null ? selectedCategory === null : selectedCategory === item.id) &&
                  styles.categoryTabActive,
              ]}
              onPress={() => handleCategoryPress(item.id)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.categoryTabText,
                  (item.id === null ? selectedCategory === null : selectedCategory === item.id) &&
                    styles.categoryTabTextActive,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          )}
        />
      </View>

      {/* Results count */}
      {!loading && (
        <View style={styles.resultsInfo}>
          <Text style={styles.resultsCount}>
            {allProducts.length} products found
          </Text>
          {(searchQuery || activeFiltersCount > 0) && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSearchInput('');
                setFilters({});
                setSelectedCategory(null);
              }}
            >
              <Text style={styles.clearAll}>Clear All</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );

  const renderProduct = ({ item, index }: { item: ProductResponse; index: number }) => (
    <View style={[styles.productCard, index % 2 === 1 && styles.productCardRight]}>
      <ProductCard product={item} onPress={() => handleProductPress(item)} />
    </View>
  );

  const renderFooter = () => {
    if (!hasMore) return null;
    return (
      <View style={styles.loadingMore}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const renderEmpty = () => {
    if (loading) return null;
    return (
      <EmptyState
        icon="search-outline"
        title="No products found"
        message={
          searchQuery
            ? `No results for "${searchQuery}". Try a different search.`
            : 'Try adjusting your filters or search for something else.'
        }
      />
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Explore</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <Ionicons name="search-outline" size={20} color={colors.text.tertiary} />
          <TextInput
            ref={searchInputRef}
            style={styles.searchInput}
            placeholder={t('products.searchPlaceholder', 'Search products...')}
            placeholderTextColor={colors.text.tertiary}
            value={searchInput}
            onChangeText={setSearchInput}
            onSubmitEditing={handleSearch}
            returnKeyType="search"
            autoCapitalize="none"
            autoCorrect={false}
          />
          {searchInput.length > 0 && (
            <TouchableOpacity onPress={handleClearSearch}>
              <Ionicons name="close-circle" size={20} color={colors.text.tertiary} />
            </TouchableOpacity>
          )}
        </View>

        {/* Filter Button */}
        <TouchableOpacity
          style={[styles.filterButton, activeFiltersCount > 0 && styles.filterButtonActive]}
          onPress={() => setShowFilters(true)}
          activeOpacity={0.7}
        >
          <Ionicons
            name="options-outline"
            size={20}
            color={activeFiltersCount > 0 ? colors.surface : colors.text.primary}
          />
          {activeFiltersCount > 0 && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFiltersCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Product Grid */}
      {loading && allProducts.length === 0 ? (
        <LoadingSpinner />
      ) : (
        <FlatList
          data={allProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id?.toString() || ''}
          numColumns={2}
          contentContainerStyle={styles.productList}
          columnWrapperStyle={styles.productRow}
          ListHeaderComponent={renderHeader}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={loading && allProducts.length > 0}
              onRefresh={handleRefresh}
              colors={[colors.primary]}
              tintColor={colors.primary}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
        />
      )}

      {/* Filter Bottom Sheet */}
      <FilterBottomSheet
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        onApply={handleFilterApply}
        initialFilters={filters}
        availableCategories={categories}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
    gap: spacing.sm,
    backgroundColor: colors.surface,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.background,
    borderRadius: spacing.borderRadius.lg,
    paddingHorizontal: spacing.md,
    height: 44,
    gap: spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
  },
  filterButton: {
    width: 44,
    height: 44,
    borderRadius: spacing.borderRadius.lg,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: colors.primary,
  },
  filterBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: colors.error,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.surface,
  },
  categoryTabsContainer: {
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  categoryTabs: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    gap: spacing.sm,
  },
  categoryTab: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.borderRadius.lg,
    backgroundColor: colors.background,
  },
  categoryTabActive: {
    backgroundColor: colors.primary,
  },
  categoryTabText: {
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.secondary,
  },
  categoryTabTextActive: {
    color: colors.surface,
  },
  resultsInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.md,
  },
  resultsCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
  },
  clearAll: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  productList: {
    paddingBottom: spacing['2xl'],
  },
  productRow: {
    paddingHorizontal: spacing.md,
  },
  productCard: {
    flex: 1,
    marginHorizontal: spacing.xs,
    marginBottom: spacing.md,
  },
  productCardRight: {},
  loadingMore: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
