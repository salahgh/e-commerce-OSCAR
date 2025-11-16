import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { OrderStatusBadge, OrderTimeline, OrderStatus } from '../../src/components/orders';
import { Button, Divider, LoadingSpinner, ErrorState } from '../../src/components/ui';
import { useGetOrderQuery, useCancelOrderMutation } from '../../src/graphql/generated/graphql';
import { colors, spacing, typography } from '../../src/theme';

export default function OrderDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const orderId = parseInt(params.id);

  const { data, loading, error, refetch } = useGetOrderQuery({
    variables: { id: orderId },
    skip: !orderId,
    fetchPolicy: 'cache-and-network',
  });

  const [cancelOrder, { loading: cancelling }] = useCancelOrderMutation();
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);

  const order = data?.order;

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handleCancelOrder = () => {
    Alert.alert(
      t('orders.cancelOrder', 'Cancel Order'),
      t('orders.cancelOrderConfirm', 'Are you sure you want to cancel this order?'),
      [
        {
          text: t('common.no', 'No'),
          style: 'cancel',
        },
        {
          text: t('common.yes', 'Yes'),
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelOrder({
                variables: { id: orderId },
                refetchQueries: ['GetMyOrders', 'GetOrder'],
              });
              Alert.alert(
                t('orders.cancelSuccess', 'Order Cancelled'),
                t('orders.cancelSuccessMessage', 'Your order has been cancelled successfully.')
              );
              refetch();
            } catch (err: any) {
              Alert.alert(
                t('orders.cancelError', 'Cancellation Failed'),
                err.message ||
                  t('orders.cancelErrorMessage', 'Failed to cancel order. Please try again.')
              );
            }
          },
        },
      ]
    );
  };

  const canCancelOrder = () => {
    return order?.status === 'PENDING' || order?.status === 'CONFIRMED';
  };

  if (loading && !data) {
    return (
      <View style={styles.container}>
        <LoadingSpinner />
      </View>
    );
  }

  if (error || !order) {
    return (
      <View style={styles.container}>
        <ErrorState
          title={t('orders.errorTitle', 'Failed to Load Order')}
          message={error?.message || t('orders.notFound', 'Order not found')}
          onRetry={() => refetch()}
        />
      </View>
    );
  }

  const SHIPPING_COST = order.shippingCost || 0;
  const SUBTOTAL = order.subtotal || order.totalAmount - SHIPPING_COST;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={styles.orderNumber}>#{order.orderNumber}</Text>
          <Text style={styles.orderDate}>{formatDate(order.createdAt)}</Text>
        </View>
        <OrderStatusBadge status={order.status as OrderStatus} size="medium" />
      </View>

      <View style={styles.content}>
        {/* Timeline */}
        <OrderTimeline
          currentStatus={order.status as OrderStatus}
          createdAt={order.createdAt}
          paidAt={order.paidAt}
          deliveredAt={order.deliveredAt}
        />

        {/* Shipping Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('orders.shippingInformation', 'Shipping Information')}
          </Text>
          <View style={styles.sectionContent}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={colors.text.secondary} />
              <Text style={styles.infoText}>{order.shippingAddress}</Text>
            </View>
            <View style={styles.infoRow}>
              <Ionicons name="call-outline" size={20} color={colors.text.secondary} />
              <Text style={styles.infoText}>{order.phoneNumber}</Text>
            </View>
            {order.trackingNumber && (
              <View style={styles.infoRow}>
                <Ionicons name="qr-code-outline" size={20} color={colors.text.secondary} />
                <Text style={styles.infoText}>
                  {t('orders.trackingNumber', 'Tracking')}: {order.trackingNumber}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>
            {t('orders.paymentInformation', 'Payment Information')}
          </Text>
          <View style={styles.sectionContent}>
            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={20} color={colors.text.secondary} />
              <Text style={styles.infoText}>
                {order.paymentMethod === 'COD'
                  ? t('orders.cashOnDelivery', 'Cash on Delivery')
                  : order.paymentMethod}
              </Text>
            </View>
            {order.paidAt && (
              <View style={styles.infoRow}>
                <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
                <Text style={styles.infoText}>
                  {t('orders.paidOn', 'Paid on')} {formatDate(order.paidAt)}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('orders.orderItems', 'Order Items')}</Text>
          <View style={styles.itemsList}>
            {order.items?.map((item) => (
              <View key={item.id} style={styles.itemCard}>
                <View style={styles.itemImageContainer}>
                  {item.productImage ? (
                    <Image
                      source={{ uri: item.productImage }}
                      style={styles.itemImage}
                      resizeMode="cover"
                    />
                  ) : (
                    <View style={styles.placeholderImage}>
                      <Ionicons name="image-outline" size={24} color={colors.text.tertiary} />
                    </View>
                  )}
                </View>
                <View style={styles.itemDetails}>
                  <Text style={styles.itemName} numberOfLines={2}>
                    {item.productName}
                  </Text>
                  {(item.selectedSize || item.selectedColor) && (
                    <View style={styles.itemAttributes}>
                      {item.selectedSize && (
                        <Text style={styles.itemAttribute}>Size: {item.selectedSize}</Text>
                      )}
                      {item.selectedColor && (
                        <Text style={styles.itemAttribute}>Color: {item.selectedColor}</Text>
                      )}
                    </View>
                  )}
                  <View style={styles.itemPriceRow}>
                    <Text style={styles.itemQuantity}>Qty: {item.quantity}</Text>
                    <Text style={styles.itemPrice}>{item.price.toFixed(2)} DZD</Text>
                  </View>
                </View>
                <Text style={styles.itemSubtotal}>{item.subtotal.toFixed(2)} DZD</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t('orders.orderSummary', 'Order Summary')}</Text>
          <View style={styles.summaryContent}>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('orders.subtotal', 'Subtotal')}</Text>
              <Text style={styles.summaryValue}>{SUBTOTAL.toFixed(2)} DZD</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>{t('orders.shipping', 'Shipping')}</Text>
              <Text style={styles.summaryValue}>
                {SHIPPING_COST > 0 ? `${SHIPPING_COST.toFixed(2)} DZD` : t('orders.free', 'Free')}
              </Text>
            </View>
            <Divider style={styles.divider} />
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={styles.totalLabel}>{t('orders.total', 'Total')}</Text>
              <Text style={styles.totalValue}>{order.totalAmount.toFixed(2)} DZD</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        {order.notes && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t('orders.notes', 'Delivery Notes')}</Text>
            <View style={styles.sectionContent}>
              <Text style={styles.notesText}>{order.notes}</Text>
            </View>
          </View>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          {canCancelOrder() && (
            <Button
              title={t('orders.cancelOrder', 'Cancel Order')}
              onPress={handleCancelOrder}
              variant="outline"
              fullWidth
              loading={cancelling}
              disabled={cancelling}
              style={styles.cancelButton}
            />
          )}
          <Button
            title={t('orders.reorder', 'Reorder Items')}
            onPress={() => {
              Alert.alert(
                t('orders.reorder', 'Reorder Items'),
                t('orders.reorderMessage', 'Add all items from this order to your cart?'),
                [
                  { text: t('common.cancel', 'Cancel'), style: 'cancel' },
                  {
                    text: t('common.yes', 'Yes'),
                    onPress: () => {
                      // TODO: Implement reorder functionality
                      Alert.alert(
                        t('common.success', 'Success'),
                        t('orders.reorderSuccess', 'Items added to cart')
                      );
                    },
                  },
                ]
              );
            }}
            variant="outline"
            fullWidth
            style={styles.reorderButton}
          />
        </View>
      </View>
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
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    paddingTop: spacing.xl,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerContent: {
    flex: 1,
    marginLeft: spacing.sm,
  },
  orderNumber: {
    ...typography.styles.h4,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  orderDate: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  content: {
    padding: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.styles.h4,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  sectionContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: spacing.sm,
    gap: spacing.sm,
  },
  infoText: {
    ...typography.styles.body,
    color: colors.text.primary,
    flex: 1,
  },
  itemsList: {
    gap: spacing.md,
  },
  itemCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  itemImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemDetails: {
    flex: 1,
  },
  itemName: {
    ...typography.styles.bodySmall,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  itemAttributes: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  itemAttribute: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  itemPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemQuantity: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  itemPrice: {
    ...typography.styles.bodySmall,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  itemSubtotal: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
  },
  summaryContent: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  summaryValue: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
  },
  divider: {
    marginVertical: spacing.sm,
  },
  totalRow: {
    marginTop: spacing.sm,
    marginBottom: 0,
  },
  totalLabel: {
    ...typography.styles.h4,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  totalValue: {
    ...typography.styles.h4,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  notesText: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontStyle: 'italic',
  },
  actions: {
    gap: spacing.md,
    marginTop: spacing.md,
    marginBottom: spacing.xl,
  },
  cancelButton: {
    borderColor: colors.error,
  },
  reorderButton: {},
});
