import React, { useState, useMemo, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useSearchProductsQuery, SortOrder } from '../../src/graphql/generated/graphql';
import { SimpleProduct } from '../../src/components/products/ProductCard';
import { ProductGrid } from '../../src/components/products';
import { SortSheet, SortValue } from '../../src/components/products/SortSheet';
import { PriceSheet, PriceRange } from '../../src/components/products/PriceSheet';
import { SizeSheet } from '../../src/components/products/SizeSheet';
import { spacing, typography, makeThemedStyles, useThemeColors } from '../../src/theme';
import { formatPrice } from '../../src/utils/vendureAdapters';
import { parseProductDiscount } from '../../src/utils/discountParser';
import { useAppFont } from '../../src/hooks/useAppFont';

export default function ProductsScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const params = useLocalSearchParams();
  const { fontFamily } = useAppFont();
  const colors = useThemeColors();
  const styles = useStyles();

  // Filter state
  const [searchInput, setSearchInput] = useState('');
  const [sortValue, setSortValue] = useState<SortValue | null>(null);
  const [priceRange, setPriceRange] = useState<PriceRange | null>(null);
  const [selectedSizes, setSelectedSizes] = useState<string[]>([]);
  const collectionSlug = (params.category as string) || undefined;

  // Sheet visibility
  const [showSort, setShowSort] = useState(false);
  const [showPrice, setShowPrice] = useState(false);
  const [showSize, setShowSize] = useState(false);

  // Map sort to SearchInput sort
  const getSortParam = () => {
    switch (sortValue) {
      case 'price_asc':
        return { price: SortOrder.Asc };
      case 'price_desc':
        return { price: SortOrder.Desc };
      case 'recent':
        return { name: SortOrder.Asc };
      default:
        return undefined;
    }
  };

  // Fetch products
  const { data, loading, refetch } = useSearchProductsQuery({
    variables: {
      input: {
        term: searchInput.trim() || undefined,
        collectionSlug,
        take: 50,
        groupByProduct: true,
        sort: getSortParam(),
      },
    },
  });

  const totalItems = data?.search?.totalItems || 0;

  // Transform and filter products
  const products = useMemo<SimpleProduct[]>(() => {
    const items = data?.search?.items || [];
    let result = items.map((item: any) => {
      const price = item.priceWithTax;
      const priceValue = price?.__typename === 'SinglePrice' ? price.value : price?.min;
      const cents = priceValue || 0;
      // For search results we don't have collections, so no discount parsing here
      return {
        id: item.productId,
        name: item.productName,
        slug: item.slug,
        description: item.description,
        imageUrl: item.productAsset?.preview,
        price: formatPrice(cents),
        inStock: item.inStock,
      };
    });

    // Deduplicate
    const seen = new Set<string>();
    result = result.filter((p) => {
      if (seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });

    // Client-side price filter
    if (priceRange) {
      result = result.filter((p) => {
        const price = typeof p.price === 'number' ? p.price : parseFloat(String(p.price)) || 0;
        if (priceRange.min && price < priceRange.min) return false;
        if (priceRange.max && price > priceRange.max) return false;
        return true;
      });
    }

    return result;
  }, [data, priceRange]);

  const handleSearch = () => {
    // Trigger re-fetch via searchInput state change
  };

  const handleRefresh = useCallback(() => {
    refetch();
  }, [refetch]);

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header: Back + Search + Filter icon */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => router.back()}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
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
        <TouchableOpacity hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Ionicons name="calendar-outline" size={24} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Filter Chips — pill style matching CategoryTabs */}
      <View style={styles.chipsRow}>
        <TouchableOpacity
          style={[styles.filterChip, sortValue !== null && styles.filterChipActive]}
          onPress={() => setShowSort(true)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterChipText,
              { fontFamily: fontFamily.medium },
              sortValue !== null && styles.filterChipTextActive,
            ]}
          >
            {t('filters.classement')}
          </Text>
          <Ionicons
            name="swap-vertical"
            size={14}
            color={sortValue !== null ? colors.text.inverse : colors.text.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, priceRange !== null && styles.filterChipActive]}
          onPress={() => setShowPrice(true)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterChipText,
              { fontFamily: fontFamily.medium },
              priceRange !== null && styles.filterChipTextActive,
            ]}
          >
            {t('filters.prix')}
          </Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color={priceRange !== null ? colors.text.inverse : colors.text.primary}
          />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterChip, selectedSizes.length > 0 && styles.filterChipActive]}
          onPress={() => setShowSize(true)}
          activeOpacity={0.7}
        >
          <Text
            style={[
              styles.filterChipText,
              { fontFamily: fontFamily.medium },
              selectedSizes.length > 0 && styles.filterChipTextActive,
            ]}
          >
            {t('filters.taille')}
          </Text>
          <Ionicons
            name="chevron-down"
            size={14}
            color={selectedSizes.length > 0 ? colors.text.inverse : colors.text.primary}
          />
        </TouchableOpacity>
      </View>

      {/* Product Grid */}
      <ProductGrid
        products={products}
        loading={loading}
        refreshing={loading}
        onRefresh={handleRefresh}
        onLoadMore={() => {}}
        hasMore={false}
        loadingMore={false}
        numColumns={2}
        emptyMessage={t('products.noProducts', 'Aucun produit trouvé')}
      />

      {/* Filter Sheets */}
      <SortSheet
        visible={showSort}
        onClose={() => setShowSort(false)}
        value={sortValue}
        onApply={setSortValue}
        resultCount={totalItems}
      />
      <PriceSheet
        visible={showPrice}
        onClose={() => setShowPrice(false)}
        value={priceRange}
        onApply={setPriceRange}
        resultCount={totalItems}
      />
      <SizeSheet
        visible={showSize}
        onClose={() => setShowSize(false)}
        value={selectedSizes}
        onApply={setSelectedSizes}
        resultCount={totalItems}
      />
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
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      gap: spacing.md,
    },
    searchInputContainer: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.gray[1],
      borderRadius: 8,
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
    chipsRow: {
      flexDirection: 'row',
      paddingHorizontal: spacing.xl,
      paddingBottom: spacing.md,
      gap: spacing.sm,
    },
    filterChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      paddingHorizontal: spacing.lg,
      paddingVertical: spacing.sm,
      borderRadius: spacing.borderRadius.lg,
      borderWidth: 1,
      borderColor: colors.gray[2],
      backgroundColor: colors.surface,
    },
    filterChipActive: {
      backgroundColor: colors.primary,
      borderColor: colors.primary,
    },
    filterChipText: {
      fontSize: typography.fontSize.sm,
      color: colors.text.primary,
    },
    filterChipTextActive: {
      color: colors.text.inverse,
    },
  })
);
