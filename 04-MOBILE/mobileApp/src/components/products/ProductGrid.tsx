import React from 'react';
import { View, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { ProductResponse } from '../../graphql/generated/graphql';
import { ProductCard } from './ProductCard';
import { EmptyState, LoadingSpinner } from '../ui';
import { colors, spacing } from '../../theme';

interface ProductGridProps {
  products: ProductResponse[];
  loading?: boolean;
  refreshing?: boolean;
  onRefresh?: () => void;
  onLoadMore?: () => void;
  hasMore?: boolean;
  loadingMore?: boolean;
  numColumns?: number;
  emptyMessage?: string;
  onProductPress?: (product: ProductResponse) => void;
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
  const renderProduct = ({ item }: { item: ProductResponse }) => {
    return (
      <View style={[styles.productWrapper, { width: `${100 / numColumns}%` }]}>
        <View style={styles.productInner}>
          <ProductCard product={item} onPress={onProductPress} />
        </View>
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
      keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
      numColumns={numColumns}
      contentContainerStyle={styles.container}
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
  productWrapper: {
    padding: spacing.xs,
  },
  productInner: {
    flex: 1,
  },
  footer: {
    paddingVertical: spacing.lg,
    alignItems: 'center',
  },
});
