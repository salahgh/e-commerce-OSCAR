import React, { useState, useMemo, useCallback } from 'react';
import { View, StyleSheet } from 'react-native';
import { useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  useGetProductsQuery,
  useGetCollectionsQuery,
  useGetProductsByCollectionQuery,
} from '../../src/graphql/generated/graphql';
import { SimpleProduct } from '../../src/components/products/ProductCard';
import { ProductGrid, SearchBar, FilterBar, SortOption } from '../../src/components/products';
import { colors, spacing } from '../../src/theme';
import { formatPrice } from '../../src/utils/vendureAdapters';
import { parseProductDiscount } from '../../src/utils/discountParser';

export default function ProductsScreen() {
  const { t } = useTranslation();
  const params = useLocalSearchParams();

  // State
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(
    (params.category as string) || null
  );
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Map sort option to Vendure ProductSortParameter
  const getSortParams = () => {
    switch (sortBy) {
      case 'newest':
        return { createdAt: 'DESC' as const };
      case 'price_asc':
        return { price: 'ASC' as const };
      case 'price_desc':
        return { price: 'DESC' as const };
      default:
        return { createdAt: 'DESC' as const };
    }
  };

  // Fetch all products (when no category filter)
  const {
    data: productsData,
    loading: productsLoading,
    refetch: refetchProducts,
  } = useGetProductsQuery({
    variables: {
      options: {
        take: 50,
        sort: getSortParams(),
      },
    },
    skip: !!selectedCategory,
  });

  // Fetch products by collection (when category is selected)
  const {
    data: collectionProductsData,
    loading: collectionProductsLoading,
    refetch: refetchCollectionProducts,
  } = useGetProductsByCollectionQuery({
    variables: {
      collectionSlug: selectedCategory!,
      take: 50,
    },
    skip: !selectedCategory,
  });

  const isLoading = selectedCategory ? collectionProductsLoading : productsLoading;

  // Fetch collections for filter
  const { data: collectionsData } = useGetCollectionsQuery();

  // Derive products directly from query data — no stale state
  const products = useMemo<SimpleProduct[]>(() => {
    if (selectedCategory && collectionProductsData?.search?.items) {
      const seen = new Set<string>();
      return collectionProductsData.search.items
        .filter((item: any) => {
          if (seen.has(item.productId)) return false;
          seen.add(item.productId);
          return true;
        })
        .map((item: any) => {
          const price = item.priceWithTax;
          const priceValue = price?.__typename === 'SinglePrice' ? price.value : price?.min;
          return {
            id: item.productId,
            name: item.productName,
            slug: item.slug,
            description: item.description,
            imageUrl: item.productAsset?.preview,
            price: formatPrice(priceValue || 0),
            inStock: item.inStock,
          };
        });
    }

    if (!selectedCategory && productsData?.products?.items) {
      return productsData.products.items.map((product: any) => {
        const defaultVariant = product.variants?.[0];
        const priceInCents = defaultVariant?.priceWithTax ?? 0;
        const discount = parseProductDiscount(product.collections, priceInCents);
        return {
          id: product.id,
          name: product.name,
          slug: product.slug,
          description: product.description,
          imageUrl: product.featuredAsset?.preview,
          price: formatPrice(discount.salePrice),
          originalPrice: discount.hasDiscount ? formatPrice(discount.originalPrice) : undefined,
          discountPercent: discount.hasDiscount ? discount.percentage : undefined,
          inStock: defaultVariant?.stockLevel !== 'OUT_OF_STOCK',
        };
      });
    }

    return [];
  }, [productsData, collectionProductsData, selectedCategory]);

  const handleRefresh = useCallback(() => {
    if (selectedCategory) {
      refetchCollectionProducts();
    } else {
      refetchProducts();
    }
  }, [selectedCategory, refetchCollectionProducts, refetchProducts]);

  const handleCategoryChange = (categorySlug: string | null) => {
    setSelectedCategory(categorySlug);
  };

  const handleSortChange = (sort: SortOption) => {
    setSortBy(sort);
  };

  const handleSearch = () => {
    console.log('Search:', searchQuery);
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <SearchBar
          value={searchQuery}
          onChangeText={setSearchQuery}
          onSearch={handleSearch}
          placeholder={t('products.searchPlaceholder', 'Search products...')}
          loading={isLoading}
        />
      </View>

      {/* Filter Bar */}
      <FilterBar
        categories={collectionsData?.collections?.items as any[]}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        sortBy={sortBy}
        onSortChange={handleSortChange}
        showSort={true}
        showCategories={true}
      />

      {/* Product Grid */}
      <ProductGrid
        products={products}
        loading={isLoading}
        refreshing={isLoading}
        onRefresh={handleRefresh}
        onLoadMore={() => {}}
        hasMore={false}
        loadingMore={false}
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
