import React, { useState } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { OrderCard, OrderStatus } from '../../src/components/orders';
import { EmptyState, ErrorState, LoadingSpinner } from '../../src/components/ui';
import { useGetMyOrdersQuery } from '../../src/graphql/generated/graphql';
import { colors, spacing, typography } from '../../src/theme';

export default function OrdersScreen() {
  const { t } = useTranslation();
  const [page] = useState(0);
  const [size] = useState(20);

  const { data, loading, error, refetch } = useGetMyOrdersQuery({
    variables: { page, size },
    fetchPolicy: 'cache-and-network',
  });

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  if (loading && !data) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <ErrorState
          title={t('orders.errorTitle', 'Failed to Load Orders')}
          message={error.message}
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  const orders = data?.myOrders?.content || [];

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="receipt-outline"
          title={t('orders.emptyTitle', 'No Orders Yet')}
          message={t('orders.emptyMessage', 'Your order history will appear here')}
          actionLabel={t('orders.startShopping', 'Start Shopping')}
          onAction={() => {
            // Navigate to products
          }}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>{t('orders.title', 'My Orders')}</Text>
        <Text style={styles.headerSubtitle}>
          {t('orders.subtitle', 'Track and manage your orders')}
        </Text>
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <OrderCard
            id={item.id}
            orderNumber={item.orderNumber}
            status={item.status as OrderStatus}
            totalAmount={item.totalAmount}
            itemCount={item.items?.length || 0}
            items={
              item.items?.map((orderItem) => ({
                id: orderItem.id,
                productName: orderItem.productName,
                productImage: orderItem.productImage,
                quantity: orderItem.quantity,
                price: orderItem.price,
                subtotal: orderItem.subtotal,
              })) || []
            }
            createdAt={item.createdAt}
          />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
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
    backgroundColor: colors.surface,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  listContent: {
    padding: spacing.lg,
  },
});
