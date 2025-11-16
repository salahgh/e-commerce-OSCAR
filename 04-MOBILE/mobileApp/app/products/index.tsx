import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  useGetProductsQuery,
  useGetActiveCategoriesQuery,
  ProductResponse,
} from '../../src/graphql/generated/graphql';
import { ProductGrid, SearchBar, FilterBar, SortOption } from '../../src/components/products';
import { colors, spacing } from '../../src/theme';

export default function ProductsScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [page, setPage] = useState(0);
  const [allProducts, setAllProducts] = useState<ProductResponse[]>([]);

  // Map sort option to GraphQL parameters
  const getSortParams = () => {
    switch (sortBy) {
      case 'newest':
        return { sortBy: 'createdAt', sortDirection: 'DESC' };
      case 'popular':
        return { sortBy: 'viewCount', sortDirection: 'DESC' };
      case 'price_asc':
        return { sortBy: 'basePrice', sortDirection: 'ASC' };
      case 'price_desc':
        return { sortBy: 'basePrice', sortDirection: 'DESC' };
      default:
        return { sortBy: 'createdAt', sortDirection: 'DESC' };
    }
  };

  const sortParams = getSortParams();

  // Fetch products
  const {
    data: productsData,
    loading: productsLoading,
    error: productsError,
    refetch: refetchProducts,
    fetchMore,
  } = useGetProductsQuery({
    variables: {
      page,
      size: 20,
      sortBy: sortParams.sortBy,
      sortDirection: sortParams.sortDirection,
    },
    notifyOnNetworkStatusChange: true,
  });

  // Fetch categories
  const { data: categoriesData } = useGetActiveCategoriesQuery();

  // Update products list when data changes
  useEffect(() => {
    if (productsData?.products?.content) {
      if (page === 0) {
        setAllProducts(productsData.products.content as ProductResponse[]);
      } else {
        setAllProducts((prev) => [
          ...prev,
          ...(productsData.products.content as ProductResponse[]),
        ]);
      }
    }
  }, [productsData, page]);

  // Reset page when filters change
  useEffect(() => {
    setPage(0);
    setAllProducts([]);
  }, [selectedCategory, sortBy]);

  // Handle category from URL params
  useEffect(() => {
    if (params.category) {
      const category = categoriesData?.activeCategories?.find(
        (cat) => cat.slug === params.category
      );
      if (category?.id) {
        setSelectedCategory(category.id);
      }
    }
  }, [params.category, categoriesData]);

  const handleRefresh = () => {
    setPage(0);
    setAllProducts([]);
    refetchProducts();
  };

  const handleLoadMore = () => {
    if (productsData?.products?.hasNext && !productsLoading) {
      setPage((prev) => prev + 1);
    }
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
  };

  const handleSearch = () => {
    // Navigate to search screen or filter locally
    console.log('Search:', searchQuery);
  };

  // Filter products by category if selected
  const filteredProducts = selectedCategory
    ? allProducts.filter((product) => product.categoryId === selectedCategory)
    : allProducts;

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={handleSearch}
          placeholder={t('products.searchPlaceholder', 'Search products...')}
          loading={productsLoading && page === 0}
        />
      </View>

      {/* Filter Bar */}
      <FilterBar
        categories={categoriesData?.activeCategories as any[]}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        showSort={true}
        showCategories={true}
      />

      {/* Product Grid */}
      <ProductGrid
        products={filteredProducts}
        loading={productsLoading && page === 0}
        refreshing={productsLoading && page === 0}
        onRefresh={handleRefresh}
        onLoadMore={handleLoadMore}
        hasMore={productsData?.products?.hasNext || false}
        loadingMore={productsLoading && page > 0}
        numColumns={2}
        emptyMessage={t('products.noProducts', 'No products found')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  searchContainer: {
    padding: spacing.md,
    paddingBottom: spacing.sm,
  },
});
