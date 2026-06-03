import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Keyboard,
  Alert,
} from 'react-native';
import { Image } from 'expo-image';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../../src/contexts/CartContext';
import { LoadingSpinner, EmptyState, Button } from '../../src/components/ui';
import { spacing, typography, makeThemedStyles, useThemeColors } from '../../src/theme';
import { useAppFont } from '../../src/hooks/useAppFont';
import {
  useApplyCouponCodeMutation,
  useRemoveCouponCodeMutation,
} from '../../src/graphql/generated/graphql';

export default function CartScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { fontFamily } = useAppFont();
  const colors = useThemeColors();
  const styles = useStyles();
  const { order, items, subTotal, total, loading, updateQuantity, removeFromCart, refetchCart } =
    useCart();

  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);
  const [applyCoupon, { loading: applyingCoupon }] = useApplyCouponCodeMutation();
  const [removeCoupon] = useRemoveCouponCodeMutation();
  const appliedCoupons = order?.couponCodes || [];

  const handleUpdateQuantity = useCallback(
    async (orderLineId: string, quantity: number) => {
      if (quantity < 1) return;
      try {
        await updateQuantity(orderLineId, quantity);
      } catch (error: any) {
        Alert.alert(t('common.error'), error.message || t('common.error'));
      }
    },
    [updateQuantity]
  );

  const handleRemove = useCallback(
    async (orderLineId: string) => {
      try {
        await removeFromCart(orderLineId);
      } catch (error: any) {
        Alert.alert(t('common.error'), error.message || t('common.error'));
      }
    },
    [removeFromCart]
  );

  const handleApplyPromo = useCallback(async () => {
    Keyboard.dismiss();
    if (!promoCode.trim()) return;
    setPromoError(null);
    try {
      const { data } = await applyCoupon({
        variables: { couponCode: promoCode.trim() },
        refetchQueries: ['GetActiveOrder'],
      });
      if (data?.applyCouponCode && 'errorCode' in data.applyCouponCode) {
        setPromoError((data.applyCouponCode as any).message || t('cart.invalidCode'));
        return;
      }
      setPromoCode('');
      refetchCart();
    } catch (error: any) {
      setPromoError(error.message || t('cart.invalidCode'));
    }
  }, [promoCode, applyCoupon, refetchCart]);

  const handleCheckout = useCallback(() => {
    router.push('/checkout');
  }, []);

  if (loading && items.length === 0) {
    return <LoadingSpinner />;
  }

  if (items.length === 0) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontFamily: fontFamily.medium }]}>
            {t('cart.title')}
          </Text>
          <View style={{ width: 24 }} />
        </View>
        <EmptyState
          icon="cart-outline"
          title={t('cart.empty')}
          actionLabel={t('cart.startShopping')}
          onAction={() => router.push('/(tabs)')}
        />
      </View>
    );
  }

  // Calculate discount
  const discount = subTotal - total;

  const renderCartItem = ({ item }: { item: (typeof items)[0] }) => (
    <View style={styles.itemRow}>
      {/* Product Image */}
      <View style={styles.itemImageContainer}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.itemImage} contentFit="cover" />
        ) : (
          <View style={[styles.itemImage, styles.placeholderImage]}>
            <Ionicons name="image-outline" size={24} color={colors.text.tertiary} />
          </View>
        )}
      </View>

      {/* Details */}
      <View style={styles.itemDetails}>
        {/* Name + Remove */}
        <View style={styles.itemTopRow}>
          <Text style={[styles.itemName, { fontFamily: fontFamily.medium }]} numberOfLines={2}>
            {item.productName}
          </Text>
          <TouchableOpacity
            onPress={() => handleRemove(item.id)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="close" size={20} color={colors.text.tertiary} />
          </TouchableOpacity>
        </View>

        {/* Prices + Quantity */}
        <View style={styles.itemBottomRow}>
          <View>
            {/* Strikethrough original price if discount exists */}
            {discount > 0 && (
              <Text style={[styles.originalPrice, { fontFamily: fontFamily.regular }]}>
                {item.unitPrice} DZD
              </Text>
            )}
            <Text style={[styles.salePrice, { fontFamily: fontFamily.bold }]}>
              {item.unitPrice} DZD
            </Text>
          </View>

          {/* Quantity selector */}
          <View style={styles.quantitySelector}>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
              disabled={item.quantity <= 1}
            >
              <Text style={[styles.qtyBtnText, item.quantity <= 1 && styles.qtyBtnTextDisabled]}>
                −
              </Text>
            </TouchableOpacity>
            <Text style={[styles.qtyValue, { fontFamily: fontFamily.medium }]}>
              {item.quantity}
            </Text>
            <TouchableOpacity
              style={styles.qtyBtn}
              onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
            >
              <Text style={styles.qtyBtnText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontFamily: fontFamily.medium }]}>
          {t('cart.title')}
        </Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Cart Items */}
      <FlatList
        data={items}
        renderItem={renderCartItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        onRefresh={refetchCart}
        refreshing={loading}
      />

      {/* Bottom: Promo + Summary + Button */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + spacing.md }]}>
        {/* Promo Code */}
        <View style={styles.promoRow}>
          <Text style={[styles.promoLabel, { fontFamily: fontFamily.medium }]}>
            {t('cart.promoCode')}
          </Text>
          <Text style={[styles.promoOptional, { fontFamily: fontFamily.regular }]}>
            {t('common.optional')}
          </Text>
        </View>
        <View style={styles.promoInputRow}>
          <Ionicons name="ticket-outline" size={20} color={colors.text.tertiary} />
          <TextInput
            style={[styles.promoInput, { fontFamily: fontFamily.regular }]}
            placeholder={t('cart.enterPromoCode')}
            placeholderTextColor={colors.text.tertiary}
            value={promoCode}
            onChangeText={(text) => {
              setPromoCode(text);
              setPromoError(null);
            }}
            autoCapitalize="characters"
            returnKeyType="done"
            onSubmitEditing={handleApplyPromo}
          />
        </View>
        {promoError && <Text style={styles.promoError}>{promoError}</Text>}

        {/* Summary */}
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { fontFamily: fontFamily.medium }]}>
            {t('cart.total')}:
          </Text>
          <Text style={[styles.summaryValue, { fontFamily: fontFamily.medium }]}>
            {subTotal} DZD
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.reductionLabel, { fontFamily: fontFamily.regular }]}>
            {t('cart.reduction')}:
          </Text>
          <Text style={[styles.reductionValue, { fontFamily: fontFamily.regular }]}>
            {discount > 0 ? `-${discount} DZD` : '--'}
          </Text>
        </View>
        <View style={[styles.summaryRow, styles.totalAfterRow]}>
          <Text style={[styles.totalLabel, { fontFamily: fontFamily.bold }]}>
            {t('cart.totalAfterDiscount')}:
          </Text>
          <Text style={[styles.totalValue, { fontFamily: fontFamily.bold }]}>{total} DZD</Text>
        </View>

        {/* Checkout Button */}
        <TouchableOpacity
          style={styles.checkoutButton}
          onPress={handleCheckout}
          activeOpacity={0.8}
        >
          <Text style={[styles.checkoutButtonText, { fontFamily: fontFamily.medium }]}>
            {t('common.continue')}
          </Text>
          <Ionicons name="arrow-forward" size={20} color={colors.text.inverse} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
    },
    // Header
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
      paddingVertical: spacing.md,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
    },
    headerTitle: {
      fontSize: typography.fontSize.lg,
      color: colors.text.primary,
    },
    // List
    listContent: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      paddingBottom: spacing.md,
    },
    // Cart Item
    itemRow: {
      flexDirection: 'row',
      paddingVertical: spacing.lg,
      borderBottomWidth: StyleSheet.hairlineWidth,
      borderBottomColor: colors.border,
      gap: spacing.md,
    },
    itemImageContainer: {
      width: 100,
      height: 100,
      borderRadius: 8,
      overflow: 'hidden',
    },
    itemImage: {
      width: '100%',
      height: '100%',
    },
    placeholderImage: {
      backgroundColor: colors.gray[2],
      justifyContent: 'center',
      alignItems: 'center',
    },
    itemDetails: {
      flex: 1,
      justifyContent: 'space-between',
    },
    itemTopRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: spacing.sm,
    },
    itemName: {
      flex: 1,
      fontSize: 14,
      color: colors.text.primary,
      lineHeight: 20,
    },
    itemBottomRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-end',
    },
    originalPrice: {
      fontSize: 12,
      color: colors.text.tertiary,
      textDecorationLine: 'line-through',
      marginBottom: 2,
    },
    salePrice: {
      fontSize: 16,
      color: colors.text.primary,
    },
    // Quantity
    quantitySelector: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.md,
    },
    qtyBtn: {
      width: 28,
      height: 28,
      borderRadius: 6,
      borderWidth: 1,
      borderColor: colors.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    qtyBtnText: {
      fontSize: 16,
      color: colors.text.primary,
    },
    qtyBtnTextDisabled: {
      color: colors.text.tertiary,
    },
    qtyValue: {
      fontSize: 14,
      color: colors.text.primary,
      minWidth: 16,
      textAlign: 'center',
    },
    // Bottom Section
    bottomSection: {
      paddingHorizontal: spacing.xl,
      paddingTop: spacing.lg,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
    },
    // Promo
    promoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    promoLabel: {
      fontSize: 14,
      color: colors.text.primary,
    },
    promoOptional: {
      fontSize: 12,
      color: colors.text.tertiary,
    },
    promoInputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.gray[1],
      borderRadius: 8,
      paddingHorizontal: spacing.md,
      height: 44,
      gap: spacing.sm,
      marginBottom: spacing.lg,
    },
    promoInput: {
      flex: 1,
      fontSize: 14,
      color: colors.text.primary,
      paddingVertical: 0,
    },
    promoError: {
      fontSize: 12,
      color: colors.error,
      marginTop: -spacing.md,
      marginBottom: spacing.md,
    },
    // Summary
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.sm,
    },
    summaryLabel: {
      fontSize: 14,
      color: colors.text.primary,
    },
    summaryValue: {
      fontSize: 14,
      color: colors.text.primary,
    },
    reductionLabel: {
      fontSize: 14,
      color: colors.text.tertiary,
    },
    reductionValue: {
      fontSize: 14,
      color: colors.text.tertiary,
    },
    totalAfterRow: {
      paddingTop: spacing.sm,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: colors.border,
      marginTop: spacing.xs,
      marginBottom: spacing.lg,
    },
    totalLabel: {
      fontSize: 14,
      color: colors.text.primary,
    },
    totalValue: {
      fontSize: 14,
      color: colors.text.primary,
    },
    // Checkout Button
    checkoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing.sm,
      backgroundColor: colors.primary,
      borderRadius: spacing.borderRadius.lg,
      paddingVertical: 14,
    },
    checkoutButtonText: {
      fontSize: 16,
      color: colors.text.inverse,
    },
  })
);
