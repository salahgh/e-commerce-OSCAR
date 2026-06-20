import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import type { TFunction } from 'i18next';
import { Button, Divider, LoadingSpinner, ErrorState, Badge } from '../../src/components/ui';
import { useGetOrderByCodeQuery } from '../../src/graphql/generated/graphql';
import {
  spacing,
  typography,
  makeThemedStyles,
  useThemeColors,
  type ColorPalette,
} from '../../src/theme';
import { formatPrice } from '../../src/utils/vendureAdapters';
import { useCart } from '../../src/contexts/CartContext';
import { useToast } from '../../src/components/ui';
import { summarizeReorder } from '../../src/utils/reorder';
import { useAppFont } from '../../src/hooks/useAppFont';
import { isCashOnDelivery } from '../../src/utils/payment';

// Map Vendure order states to display info (palette-aware so colors theme correctly).
// Labels resolve through i18n at call time so they follow the active language.
//
// COD orders are auto-settled by the backend handler, so they reach
// `PaymentSettled` without the money being collected. When `isCod` is set we
// surface a neutral "Cash on delivery" status instead of the green "Paid",
// until the order actually reaches a delivered state.
function getOrderStateInfo(state: string, colors: ColorPalette, t: TFunction, isCod = false) {
  const label = (s: string, fallback: string) => t(`orders.states.${s}`, fallback) as string;
  // COD payments are auto-authorized by the backend handler (and may later be
  // settled by the courier), so a COD order reaches PaymentAuthorized/PaymentSettled
  // without money actually changing hands. Surface a neutral "Cash on delivery"
  // status for BOTH states so it never wrongly reads as "Paid".
  if (isCod && (state === 'PaymentAuthorized' || state === 'PaymentSettled')) {
    return {
      label: t('orders.codPending', 'Cash on delivery') as string,
      color: colors.info,
      icon: 'cash-outline',
    };
  }
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

export default function OrderDetailScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{ id: string }>();
  const orderCode = params.id;
  const colors = useThemeColors();
  const styles = useStyles();
  const { fontFamily } = useAppFont();
  const insets = useSafeAreaInsets();

  const { data, loading, error, refetch } = useGetOrderByCodeQuery({
    variables: { code: orderCode },
    skip: !orderCode,
    fetchPolicy: 'cache-and-network',
  });

  const order = data?.orderByCode;

  const { addToCart } = useCart();
  const toast = useToast();
  const [reordering, setReordering] = useState(false);

  const handleReorder = async () => {
    if (reordering || !order?.lines?.length) return;
    setReordering(true);
    let added = 0;
    let failed = 0;
    for (const line of order.lines) {
      const variantId = line.productVariant?.id;
      if (!variantId) {
        failed += 1;
        continue;
      }
      try {
        await addToCart(variantId, line.quantity, {
          productVariantId: variantId,
          unitPriceWithTax: line.unitPriceWithTax, // raw cents, taken from the order line
          name: line.productVariant?.name ?? '',
          sku: line.productVariant?.sku ?? '',
          product: {
            id: line.productVariant?.product?.id ?? '',
            name: line.productVariant?.product?.name ?? '',
            slug: line.productVariant?.product?.slug ?? '',
            featuredAsset: line.productVariant?.product?.featuredAsset ?? null,
          },
          featuredAsset: line.featuredAsset ?? null,
        });
        added += 1;
      } catch {
        failed += 1;
      }
    }
    setReordering(false);

    const status = summarizeReorder({ added, failed });
    if (status === 'failed') {
      toast.error(t('orders.reorderFailed', 'Could not add items to your cart'));
      return;
    }
    if (status === 'partial') {
      toast.show({
        type: 'warning',
        message: t('orders.reorderPartial', {
          added,
          failed,
          defaultValue: '{{added}} added, {{failed}} unavailable',
        }),
      });
    } else {
      toast.success(t('orders.reorderSuccess', 'Items added to cart'));
    }
    router.push('/(tabs)/cart');
  };

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

  const isCod = isCashOnDelivery(order);
  const stateInfo = getOrderStateInfo(order.state, colors, t, isCod);
  const shippingCost = order.shippingWithTax || 0;
  const subTotal = order.subTotalWithTax || 0;
  const totalAmount = order.totalWithTax || 0;

  // Format address
  const formatAddress = () => {
    const addr = order.shippingAddress;
    if (!addr) return t('orders.noAddress', 'No address provided');

    const parts = [
      addr.fullName,
      addr.streetLine1,
      addr.streetLine2,
      `${addr.city}${addr.province ? `, ${addr.province}` : ''}`,
      addr.postalCode,
      addr.country,
    ].filter(Boolean);

    return parts.join('\n');
  };

  // Get payment method from payments
  const paymentMethod = order.payments?.[0]?.method || t('orders.notPaid', 'Not paid yet');
  const paidAt = order.payments?.[0]?.createdAt;

  // Get tracking code from fulfillments
  const trackingCode = order.fulfillments?.[0]?.trackingCode;

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: insets.bottom + spacing.lg }}
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <View style={styles.headerContent}>
          <Text style={[styles.orderNumber, { fontFamily: fontFamily.bold }]}>#{order.code}</Text>
          <Text style={[styles.orderDate, { fontFamily: fontFamily.regular }]}>
            {formatDate(order.createdAt)}
          </Text>
        </View>
        <Badge
          label={stateInfo.label}
          variant="info"
          style={{ backgroundColor: stateInfo.color + '20' }}
          textStyle={{ color: stateInfo.color }}
        />
      </View>

      <View style={styles.content}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={styles.statusIconContainer}>
            <Ionicons name={stateInfo.icon as any} size={32} color={stateInfo.color} />
          </View>
          <View style={styles.statusInfo}>
            <Text
              style={[styles.statusLabel, { color: stateInfo.color, fontFamily: fontFamily.bold }]}
            >
              {stateInfo.label}
            </Text>
            <Text style={[styles.statusDate, { fontFamily: fontFamily.regular }]}>
              {t('orders.lastUpdated', 'Last updated')}: {formatDate(order.updatedAt)}
            </Text>
          </View>
        </View>

        {/* Shipping Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: fontFamily.bold }]}>
            {t('orders.shippingInformation', 'Shipping Information')}
          </Text>
          <View style={styles.sectionContent}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color={colors.text.secondary} />
              <Text style={[styles.infoText, { fontFamily: fontFamily.regular }]}>
                {formatAddress()}
              </Text>
            </View>
            {order.shippingAddress?.phoneNumber && (
              <View style={styles.infoRow}>
                <Ionicons name="call-outline" size={20} color={colors.text.secondary} />
                <Text style={[styles.infoText, { fontFamily: fontFamily.regular }]}>
                  {order.shippingAddress.phoneNumber}
                </Text>
              </View>
            )}
            {trackingCode && (
              <View style={styles.infoRow}>
                <Ionicons name="qr-code-outline" size={20} color={colors.text.secondary} />
                <Text style={[styles.infoText, { fontFamily: fontFamily.regular }]}>
                  {t('orders.trackingNumber', 'Tracking')}: {trackingCode}
                </Text>
              </View>
            )}
            {order.shippingLines?.[0] && (
              <View style={styles.infoRow}>
                <Ionicons name="car-outline" size={20} color={colors.text.secondary} />
                <Text style={[styles.infoText, { fontFamily: fontFamily.regular }]}>
                  {order.shippingLines[0].shippingMethod?.name}
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Payment Information */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: fontFamily.bold }]}>
            {t('orders.paymentInformation', 'Payment Information')}
          </Text>
          <View style={styles.sectionContent}>
            <View style={styles.infoRow}>
              <Ionicons name="card-outline" size={20} color={colors.text.secondary} />
              <Text style={[styles.infoText, { fontFamily: fontFamily.regular }]}>
                {paymentMethod}
              </Text>
            </View>
            {isCod ? (
              <View style={styles.infoRow}>
                <Ionicons name="cash-outline" size={20} color={colors.info} />
                <Text style={[styles.infoText, { fontFamily: fontFamily.regular }]}>
                  {t('orders.codPending', 'Cash on delivery')}
                </Text>
              </View>
            ) : (
              paidAt && (
                <View style={styles.infoRow}>
                  <Ionicons name="checkmark-circle-outline" size={20} color={colors.success} />
                  <Text style={[styles.infoText, { fontFamily: fontFamily.regular }]}>
                    {t('orders.paidOn', 'Paid on')} {formatDate(paidAt)}
                  </Text>
                </View>
              )
            )}
          </View>
        </View>

        {/* Order Items */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: fontFamily.bold }]}>
            {t('orders.orderItems', 'Order Items')} ({order.totalQuantity})
          </Text>
          <View style={styles.itemsList}>
            {order.lines?.map((line) => {
              const productImage =
                line.featuredAsset?.preview || line.productVariant?.product?.featuredAsset?.preview;

              return (
                <View key={line.id} style={styles.itemCard}>
                  <View style={styles.itemImageContainer}>
                    {productImage ? (
                      <Image
                        source={{ uri: productImage }}
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
                    <Text
                      style={[styles.itemName, { fontFamily: fontFamily.medium }]}
                      numberOfLines={2}
                    >
                      {line.productVariant?.product?.name}
                    </Text>
                    {line.productVariant?.name &&
                      line.productVariant.name !== line.productVariant?.product?.name && (
                        <Text style={[styles.itemVariant, { fontFamily: fontFamily.regular }]}>
                          {line.productVariant.name}
                        </Text>
                      )}
                    <View style={styles.itemPriceRow}>
                      <Text style={[styles.itemQuantity, { fontFamily: fontFamily.regular }]}>
                        {t('orders.qty', 'Qty')}: {line.quantity}
                      </Text>
                      <Text style={[styles.itemPrice, { fontFamily: fontFamily.medium }]}>
                        {formatPrice(line.unitPriceWithTax).toLocaleString()} DZD
                      </Text>
                    </View>
                  </View>
                  <Text style={[styles.itemSubtotal, { fontFamily: fontFamily.semiBold }]}>
                    {formatPrice(line.linePriceWithTax).toLocaleString()} DZD
                  </Text>
                </View>
              );
            })}
          </View>
        </View>

        {/* Order Summary */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { fontFamily: fontFamily.bold }]}>
            {t('orders.orderSummary', 'Order Summary')}
          </Text>
          <View style={styles.summaryContent}>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { fontFamily: fontFamily.regular }]}>
                {t('orders.subtotal', 'Subtotal')}
              </Text>
              <Text style={[styles.summaryValue, { fontFamily: fontFamily.medium }]}>
                {formatPrice(subTotal).toLocaleString()} DZD
              </Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={[styles.summaryLabel, { fontFamily: fontFamily.regular }]}>
                {t('orders.shipping', 'Shipping')}
              </Text>
              <Text style={[styles.summaryValue, { fontFamily: fontFamily.medium }]}>
                {shippingCost > 0 ? `${formatPrice(shippingCost).toLocaleString()} DZD` : t('orders.free', 'Free')}
              </Text>
            </View>
            <Divider style={styles.divider} />
            <View style={[styles.summaryRow, styles.totalRow]}>
              <Text style={[styles.totalLabel, { fontFamily: fontFamily.bold }]}>
                {t('orders.total', 'Total')}
              </Text>
              <Text style={[styles.totalValue, { fontFamily: fontFamily.bold }]}>
                {formatPrice(totalAmount).toLocaleString()} DZD
              </Text>
            </View>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
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
                      handleReorder();
                    },
                  },
                ]
              );
            }}
            variant="outline"
            fullWidth
            disabled={reordering}
            style={styles.reorderButton}
          />
        </View>
      </View>
    </ScrollView>
  );
}

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
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
      ...typography.styles.body,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    orderDate: {
      ...typography.styles.caption,
      color: colors.text.secondary,
    },
    content: {
      padding: spacing.lg,
    },
    statusCard: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.lg,
      marginBottom: spacing.lg,
    },
    statusIconContainer: {
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: colors.background,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: spacing.md,
    },
    statusInfo: {
      flex: 1,
    },
    statusLabel: {
      ...typography.styles.h4,
      fontWeight: typography.fontWeight.bold,
      marginBottom: spacing.xs,
    },
    statusDate: {
      ...typography.styles.caption,
      color: colors.text.secondary,
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
    itemVariant: {
      ...typography.styles.caption,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
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
      alignSelf: 'flex-start',
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
    actions: {
      gap: spacing.md,
      marginTop: spacing.md,
      marginBottom: spacing.xl,
    },
    reorderButton: {},
  })
);
