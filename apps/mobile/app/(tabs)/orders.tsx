import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, FlatList, RefreshControl, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Ionicons } from '@expo/vector-icons';
import { EmptyState, ErrorState, LoadingSpinner, Badge } from '../../src/components/ui';
import { useGetMyOrdersQuery } from '../../src/graphql/generated/graphql';
import { useAuth } from '../../src/contexts/AuthContext';
import {
  spacing,
  typography,
  makeThemedStyles,
  useThemeColors,
  type ColorPalette,
} from '../../src/theme';
import { formatPrice } from '../../src/utils/vendureAdapters';
import { useAppFont } from '../../src/hooks/useAppFont';

// Map Vendure order states to display info (palette-aware so colors theme correctly).
// Labels resolve through i18n at call time so they follow the active language.
function getOrderStateInfo(state: string, colors: ColorPalette, t: TFunction) {
  const label = (s: string, fallback: string) => t(`orders.states.${s}`, fallback) as string;
  const orderStateMap: Record<string, { label: string; color: string; icon: string }> = {
    AddingItems: { label: label('AddingItems', 'Draft'), color: colors.text.tertiary, icon: 'cart-outline' },
    ArrangingPayment: { label: label('ArrangingPayment', 'Awaiting Payment'), color: colors.warning, icon: 'time-outline' },
    PaymentAuthorized: { label: label('PaymentAuthorized', 'Payment Authorized'), color: colors.info, icon: 'card-outline' },
    PaymentSettled: { label: label('PaymentSettled', 'Paid'), color: colors.success, icon: 'checkmark-circle-outline' },
    PartiallyShipped: { label: label('PartiallyShipped', 'Partially Shipped'), color: colors.info, icon: 'cube-outline' },
    Shipped: { label: label('Shipped', 'Shipped'), color: colors.info, icon: 'airplane-outline' },
    PartiallyDelivered: { label: label('PartiallyDelivered', 'Partially Delivered'), color: colors.info, icon: 'cube-outline' },
    Delivered: { label: label('Delivered', 'Delivered'), color: colors.success, icon: 'checkmark-done-outline' },
    Modifying: { label: label('Modifying', 'Modifying'), color: colors.warning, icon: 'create-outline' },
    ArrangingAdditionalPayment: {
      label: label('ArrangingAdditionalPayment', 'Additional Payment Required'),
      color: colors.warning,
      icon: 'card-outline',
    },
    Cancelled: { label: label('Cancelled', 'Cancelled'), color: colors.error, icon: 'close-circle-outline' },
  };
  return (
    orderStateMap[state] || {
      label: state,
      color: colors.text.secondary,
      icon: 'help-outline',
    }
  );
}

function formatDate(dateString: string) {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

interface OrderItemProps {
  order: {
    id: string;
    code: string;
    state: string;
    createdAt: string;
    totalWithTax: number;
    totalQuantity: number;
    lines: Array<{
      id: string;
      quantity: number;
      productVariant?: {
        name?: string;
        product?: {
          name?: string;
          featuredAsset?: {
            preview?: string;
          };
        };
      };
      featuredAsset?: {
        preview?: string;
      };
    }>;
  };
  onPress: () => void;
}

function OrderItem({ order, onPress }: OrderItemProps) {
  const { t } = useTranslation();
  const colors = useThemeColors();
  const styles = useStyles();
  const { fontFamily } = useAppFont();
  const stateInfo = getOrderStateInfo(order.state, colors, t);

  // Get first product image
  const firstLine = order.lines[0];
  const productImage =
    firstLine?.featuredAsset?.preview || firstLine?.productVariant?.product?.featuredAsset?.preview;

  return (
    <TouchableOpacity style={styles.orderCard} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.orderHeader}>
        <View>
          <Text style={[styles.orderNumber, { fontFamily: fontFamily.bold }]}>#{order.code}</Text>
          <Text style={[styles.orderDate, { fontFamily: fontFamily.regular }]}>
            {formatDate(order.createdAt)}
          </Text>
        </View>
        <Badge
          label={stateInfo.label}
          variant="default"
          style={{ backgroundColor: stateInfo.color + '20' }}
          textStyle={{ color: stateInfo.color }}
        />
      </View>

      <View style={styles.orderDetails}>
        <View style={styles.orderItems}>
          <Ionicons name="cube-outline" size={16} color={colors.text.secondary} />
          <Text style={[styles.orderItemsText, { fontFamily: fontFamily.regular }]}>
            {t('orders.itemCount', '{{count}} items', { count: order.totalQuantity })}
          </Text>
        </View>

        <View style={styles.orderTotal}>
          <Text style={[styles.orderTotalLabel, { fontFamily: fontFamily.regular }]}>
            {t('orders.total', 'Total')}:
          </Text>
          <Text style={[styles.orderTotalValue, { fontFamily: fontFamily.bold }]}>
            {formatPrice(order.totalWithTax).toLocaleString()} DZD
          </Text>
        </View>
      </View>

      <View style={styles.orderFooter}>
        <View style={styles.statusIndicator}>
          <Ionicons name={stateInfo.icon as any} size={18} color={stateInfo.color} />
          <Text
            style={[styles.statusText, { color: stateInfo.color, fontFamily: fontFamily.medium }]}
          >
            {stateInfo.label}
          </Text>
        </View>
        <Ionicons name="chevron-forward" size={20} color={colors.text.tertiary} />
      </View>
    </TouchableOpacity>
  );
}

export default function OrdersScreen() {
  const { t } = useTranslation();
  const { isAuthenticated } = useAuth();
  const colors = useThemeColors();
  const styles = useStyles();
  const { fontFamily } = useAppFont();
  const [refreshing, setRefreshing] = useState(false);

  const { data, loading, error, refetch } = useGetMyOrdersQuery({
    variables: {
      options: {
        take: 50,
        sort: { createdAt: 'DESC' as any },
        filter: {
          state: { notIn: ['AddingItems'] },
        },
      },
    },
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  }, [refetch]);

  const handleOrderPress = (orderCode: string) => {
    router.push(`/orders/${orderCode}`);
  };

  // Not authenticated - show login prompt
  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { fontFamily: fontFamily.bold }]}>
            {t('orders.title', 'My Orders')}
          </Text>
          <Text style={[styles.headerSubtitle, { fontFamily: fontFamily.regular }]}>
            {t('orders.subtitle', 'Track and manage your orders')}
          </Text>
        </View>
        <View style={styles.authPrompt}>
          <Ionicons name="lock-closed-outline" size={64} color={colors.text.tertiary} />
          <Text style={[styles.authTitle, { fontFamily: fontFamily.bold }]}>
            {t('orders.loginRequired', 'Login Required')}
          </Text>
          <Text style={[styles.authMessage, { fontFamily: fontFamily.regular }]}>
            {t('orders.loginMessage', 'Please log in to view your orders')}
          </Text>
          <TouchableOpacity style={styles.loginButton} onPress={() => router.push('/(auth)/login')}>
            <Text style={[styles.loginButtonText, { fontFamily: fontFamily.semiBold }]}>
              {t('auth.login', 'Log In')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading && !data) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { fontFamily: fontFamily.bold }]}>
            {t('orders.title', 'My Orders')}
          </Text>
          <Text style={[styles.headerSubtitle, { fontFamily: fontFamily.regular }]}>
            {t('orders.subtitle', 'Track and manage your orders')}
          </Text>
        </View>
        <LoadingSpinner />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { fontFamily: fontFamily.bold }]}>
            {t('orders.title', 'My Orders')}
          </Text>
        </View>
        <ErrorState
          title={t('orders.errorTitle', 'Failed to Load Orders')}
          message={error.message}
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  const orders = data?.activeCustomer?.orders?.items || [];

  if (orders.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={[styles.headerTitle, { fontFamily: fontFamily.bold }]}>
            {t('orders.title', 'My Orders')}
          </Text>
          <Text style={[styles.headerSubtitle, { fontFamily: fontFamily.regular }]}>
            {t('orders.subtitle', 'Track and manage your orders')}
          </Text>
        </View>
        <EmptyState
          icon="receipt-outline"
          title={t('orders.emptyTitle', 'No Orders Yet')}
          message={t('orders.emptyMessage', 'Your order history will appear here')}
          actionLabel={t('orders.startShopping', 'Start Shopping')}
          onAction={() => router.push('/(tabs)/explore')}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.headerTitle, { fontFamily: fontFamily.bold }]}>
          {t('orders.title', 'My Orders')}
        </Text>
        <Text style={[styles.headerSubtitle, { fontFamily: fontFamily.regular }]}>
          {t('orders.orderCount', '{{count}} orders', {
            count: data?.activeCustomer?.orders?.totalItems || orders.length,
          })}
        </Text>
      </View>

      {/* Orders List */}
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <OrderItem order={item as any} onPress={() => handleOrderPress(item.code)} />
        )}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
    </View>
  );
}

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
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
      padding: spacing.md,
    },
    orderCard: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.md,
      marginBottom: spacing.md,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
    },
    orderHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      marginBottom: spacing.md,
    },
    orderNumber: {
      ...typography.styles.h4,
      color: colors.text.primary,
      fontWeight: typography.fontWeight.bold,
    },
    orderDate: {
      ...typography.styles.caption,
      color: colors.text.tertiary,
      marginTop: 2,
    },
    orderDetails: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing.sm,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: colors.border,
    },
    orderItems: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    orderItemsText: {
      ...typography.styles.bodySmall,
      color: colors.text.secondary,
    },
    orderTotal: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    orderTotalLabel: {
      ...typography.styles.bodySmall,
      color: colors.text.secondary,
    },
    orderTotalValue: {
      ...typography.styles.body,
      color: colors.primary,
      fontWeight: typography.fontWeight.bold,
    },
    orderFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginTop: spacing.md,
    },
    statusIndicator: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.xs,
    },
    statusText: {
      ...typography.styles.bodySmall,
      fontWeight: typography.fontWeight.medium,
    },
    authPrompt: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
    },
    authTitle: {
      ...typography.styles.h3,
      color: colors.text.primary,
      fontWeight: typography.fontWeight.bold,
      marginTop: spacing.lg,
      marginBottom: spacing.sm,
    },
    authMessage: {
      ...typography.styles.body,
      color: colors.text.secondary,
      textAlign: 'center',
      marginBottom: spacing.xl,
    },
    loginButton: {
      backgroundColor: colors.primary,
      paddingVertical: spacing.md,
      paddingHorizontal: spacing.xl,
      borderRadius: spacing.borderRadius.lg,
    },
    loginButtonText: {
      ...typography.styles.body,
      color: colors.surface,
      fontWeight: typography.fontWeight.semiBold,
    },
  })
);
