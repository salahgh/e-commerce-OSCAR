import React from 'react';
import {
  View,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SimpleProduct } from './ProductCard';
import { ProductCardFigma, FigmaProduct } from '../home/ProductCardFigma';
import { EmptyState, LoadingSpinner } from '../ui';
import { spacing, useThemeColors } from '../../theme';

const SCREEN_WIDTH = Dimensions.get('window').width;

interface ProductGridProps {
  products: SimpleProduct[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  numColumns?: number;
  emptyMessage?: string;
  onProductPress?: (product: SimpleProduct) => void;
}

// Convert SimpleProduct to FigmaProduct
function toFigmaProduct(p: SimpleProduct): FigmaProduct {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    imageUrl: p.imageUrl,
    price: p.price,
    originalPrice: p.originalPrice,
    discountPercent: p.discountPercent,
    inStock: p.inStock,
    rating: 0,
    reviewCount: 0,
  };
}

export const ProductGrid: React.FC<ProductGridProps> = ({
  products,
  loading = false,
  refreshing = false,
  onRefresh,
  onLoadMore,
  hasMore = false,
  loadingMore = false,
  numColumns = 2,
  emptyMessage = 'No products found',
  onProductPress,
}) => {
  const cardWidth = (SCREEN_WIDTH - spacing.md * 2 - spacing.xs * (numColumns - 1)) / numColumns;
  const colors = useThemeColors();

  const renderProduct = ({ item }: { item: SimpleProduct }) => {
    const figmaProduct = toFigmaProduct(item);
    return (
      <View style={styles.productWrapper}>
        <ProductCardFigma
          product={figmaProduct}
          width={cardWidth}
          onPress={onProductPress ? () => onProductPress(item) : undefined}
        />
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;

    return (
      <View style={styles.footer}>
        <ActivityIndicator size="small" color={colors.primary} />
      </View>
    );
  };

  const handleEndReached = () => {
    if (hasMore && !loadingMore && !loading && onLoadMore) {
      onLoadMore();
    }
  };

  if (loading && products.length === 0) {
    return <LoadingSpinner />;
  }

  if (!loading && products.length === 0) {
    return (
      <EmptyState
        icon="search"
        title="No Products"
        message={emptyMessage}
        actionText="Refresh"
        onAction={onRefresh}
      />
    );
  }

  return (
    <FlatList
      data={products}
      renderItem={renderProduct}
      keyExtractor={(item, index) => item.id?.toString() || `product-${index}`}
      numColumns={numColumns}
      contentContainerStyle={styles.container}
      columnWrapperStyle={numColumns > 1 ? styles.row : undefined}
      showsVerticalScrollIndicator={false}
      refreshControl={
        onRefresh ? (
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        ) : undefined
      }
      onEndReached={handleEndReached}
      onEndReachedThreshold={0.5}
      ListFooterComponent={renderFooter}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    padding: spacing.md,
  },
  row: {
    gap: spacing.xs,
  },
  productWrapper: {
    marginBottom: spacing.xs,
  },
  footer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
