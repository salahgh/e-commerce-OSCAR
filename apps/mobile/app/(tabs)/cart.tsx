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
  Image,
} from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../../src/contexts/CartContext';
import { LoadingSpinner, EmptyState, Button } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/theme';
import { useApplyCouponCodeMutation, useRemoveCouponCodeMutation } from '../../src/graphql/generated/graphql';

export default function CartScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    order,
    items,
    itemCount,
    subTotal,
    shipping,
    total,
    loading,
    updateQuantity,
    removeFromCart,
    clearCart,
    refetchCart,
  } = useCart();

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [promoError, setPromoError] = useState<string | null>(null);

  // Coupon mutations
  const [applyCoupon, { loading: applyingCoupon }] = useApplyCouponCodeMutation();
  const [removeCoupon, { loading: removingCoupon }] = useRemoveCouponCodeMutation();

  // Applied coupon codes from order
  const appliedCoupons = order?.couponCodes || [];

  const handleUpdateQuantity = useCallback(async (orderLineId: string, quantity: number) => {
    try {
      await updateQuantity(orderLineId, quantity);
    } catch (error: any) {
      console.error('Update quantity error:', error);
      Alert.alert(t('common.error', 'Error'), error.message || t('cart.updateError', 'Failed to update cart'));
    }
  }, [updateQuantity, t]);

  const handleRemove = useCallback(async (orderLineId: string) => {
    try {
      await removeFromCart(orderLineId);
    } catch (error: any) {
      console.error('Remove item error:', error);
      Alert.alert(t('common.error', 'Error'), error.message || t('cart.removeError', 'Failed to remove item'));
    }
  }, [removeFromCart, t]);

  const handleClearCart = useCallback(async () => {
    Alert.alert(
      t('cart.clearCartTitle', 'Clear Cart'),
      t('cart.clearCartMessage', 'Are you sure you want to remove all items from your cart?'),
      [
        { text: t('common.cancel', 'Cancel'), style: 'cancel' },
        {
          text: t('common.clear', 'Clear'),
          style: 'destructive',
          onPress: async () => {
            try {
              await clearCart();
            } catch (error: any) {
              console.error('Clear cart error:', error);
              Alert.alert(t('common.error', 'Error'), error.message || t('cart.clearError', 'Failed to clear cart'));
            }
          },
        },
      ]
    );
  }, [clearCart, t]);

  const handleApplyPromo = useCallback(async () => {
    Keyboard.dismiss();
    if (!promoCode.trim()) return;

    setPromoError(null);

    try {
      const { data } = await applyCoupon({
        variables: { couponCode: promoCode.trim() },
        refetchQueries: ['GetActiveOrder'],
      });

      if (data?.applyCouponCode) {
        const result = data.applyCouponCode;
        if ('errorCode' in result) {
          const errorResult = result as { message: string };
          setPromoError(errorResult.message || t('cart.invalidPromoCode', 'Invalid promo code'));
          return;
        }
      }

      setPromoCode('');
      refetchCart();
    } catch (error: any) {
      setPromoError(error.message || t('cart.invalidPromoCode', 'Invalid promo code'));
    }
  }, [promoCode, applyCoupon, refetchCart, t]);

  const handleRemovePromo = useCallback(async (code: string) => {
    try {
      await removeCoupon({
        variables: { couponCode: code },
        refetchQueries: ['GetActiveOrder'],
      });
      refetchCart();
    } catch (error: any) {
      console.error('Remove coupon error:', error);
    }
  }, [removeCoupon, refetchCart]);

  const handleCheckout = useCallback(() => {
    router.push('/checkout');
  }, []);

  const handleContinueShopping = useCallback(() => {
    router.push('/(tabs)/explore');
  }, []);

  if (loading && items.length === 0) {
    return <LoadingSpinner />;
  }

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <EmptyState
          icon="cart-outline"
          title={t('cart.empty', 'Your cart is empty')}
          actionLabel={t('cart.startShopping', 'Start Shopping')}
          onAction={handleContinueShopping}
        />
      </View>
    );
  }

  // Render cart item
  const renderCartItem = ({ item }: { item: typeof items[0] }) => (
    <View style={styles.itemCard}>
      <View style={styles.itemImageContainer}>
        {item.imageUrl ? (
          <Image
            source={{ uri: item.imageUrl }}
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
        {item.variantName && item.variantName !== item.productName ? (
          <Text style={styles.itemVariant}>{item.variantName}</Text>
        ) : null}
        <Text style={styles.itemPrice}>{item.unitPrice} DZD</Text>

        <View style={styles.quantityRow}>
          <View style={styles.quantitySelector}>
            <TouchableOpacity
              onPress={() => handleUpdateQuantity(item.id, item.quantity - 1)}
              style={styles.quantityButton}
              disabled={item.quantity <= 1 || loading}
            >
              <Ionicons
                name="remove"
                size={16}
                color={item.quantity <= 1 ? colors.text.tertiary : colors.primary}
              />
            </TouchableOpacity>
            <Text style={styles.quantityText}>{item.quantity}</Text>
            <TouchableOpacity
              onPress={() => handleUpdateQuantity(item.id, item.quantity + 1)}
              style={styles.quantityButton}
              disabled={loading}
            >
              <Ionicons name="add" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={() => handleRemove(item.id)}
            style={styles.removeButton}
            disabled={loading}
          >
            <Ionicons name="trash-outline" size={18} color={colors.error} />
          </TouchableOpacity>
        </View>
      </View>

      <Text style={styles.itemLinePrice}>{item.linePrice} DZD</Text>
    </View>
  );

  // Render promo code section
  const renderPromoSection = () => (
    <View style={styles.promoSection}>
      <Text style={styles.promoTitle}>{t('cart.promoCode', 'Promo Code')}</Text>

      {appliedCoupons.length > 0 ? (
        <View style={styles.appliedPromosContainer}>
          {appliedCoupons.map((code) => (
            <View key={code} style={styles.appliedPromoContainer}>
              <View style={styles.appliedPromoInfo}>
                <Ionicons name="pricetag" size={20} color={colors.success} />
                <Text style={styles.appliedPromoCode}>{code}</Text>
              </View>
              <TouchableOpacity
                onPress={() => handleRemovePromo(code)}
                disabled={removingCoupon}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close-circle" size={24} color={colors.text.tertiary} />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      ) : (
        <View>
          <View style={styles.promoInputContainer}>
            <TextInput
              style={styles.promoInput}
              placeholder={t('cart.enterPromoCode', 'Enter promo code')}
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
            <TouchableOpacity
              style={[styles.promoApplyButton, !promoCode.trim() && styles.promoApplyButtonDisabled]}
              onPress={handleApplyPromo}
              disabled={!promoCode.trim() || applyingCoupon}
            >
              {applyingCoupon ? (
                <Ionicons name="sync" size={20} color={colors.surface} />
              ) : (
                <Text style={styles.promoApplyText}>{t('cart.apply', 'Apply')}</Text>
              )}
            </TouchableOpacity>
          </View>
          {promoError ? (
            <View style={styles.promoErrorContainer}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.promoErrorText}>{promoError}</Text>
            </View>
          ) : null}
        </View>
      )}
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('cart.title', 'Shopping Cart')}</Text>
          <Text style={styles.itemCount}>
            {itemCount} {itemCount === 1 ? t('cart.item', 'item') : t('cart.items', 'items')}
          </Text>
        </View>
        {items.length > 0 ? (
          <TouchableOpacity onPress={handleClearCart} disabled={loading}>
            <Text style={styles.clearButton}>{t('cart.clearAll', 'Clear All')}</Text>
          </TouchableOpacity>
        ) : null}
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
        ListFooterComponent={items.length > 0 ? renderPromoSection : null}
      />

      {/* Bottom Summary */}
      <View style={[styles.bottomSummary, { paddingBottom: insets.bottom + spacing.md }]}>
        {/* Subtotal */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t('cart.subtotal', 'Subtotal')}</Text>
          <Text style={styles.summaryValue}>{subTotal} DZD</Text>
        </View>

        {/* Shipping */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t('cart.shipping', 'Shipping')}</Text>
          <Text style={styles.summaryValue}>
            {shipping > 0 ? `${shipping} DZD` : t('cart.calculatedAtCheckout', 'Calculated at checkout')}
          </Text>
        </View>

        {/* Total */}
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>{t('cart.total', 'Total')}</Text>
          <Text style={styles.totalValue}>{total} DZD</Text>
        </View>

        {/* Free Shipping Info */}
        {total < 5000 ? (
          <View style={styles.freeShippingInfo}>
            <Ionicons name="gift-outline" size={16} color={colors.primary} />
            <Text style={styles.freeShippingText}>
              {t('cart.freeShippingHint', `Add ${5000 - total} DZD more for free shipping!`)}
            </Text>
          </View>
        ) : null}

        {/* Checkout Button */}
        <Button
          title={t('cart.proceedToCheckout', 'Proceed to Checkout')}
          onPress={handleCheckout}
          fullWidth
          style={styles.checkoutButton}
        />

        {/* Continue Shopping */}
        <TouchableOpacity onPress={handleContinueShopping} style={styles.continueButton}>
          <Text style={styles.continueButtonText}>
            {t('cart.continueShopping', 'Continue Shopping')}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: typography.fontSize.xl,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
  itemCount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  clearButton: {
    fontSize: typography.fontSize.md,
    color: colors.error,
    fontWeight: typography.fontWeight.medium,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
  },
  // Item styles
  itemCard: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  itemImageContainer: {
    width: 80,
    height: 80,
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
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  itemVariant: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  itemPrice: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
  },
  quantityRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
    minWidth: 24,
    textAlign: 'center',
  },
  removeButton: {
    padding: spacing.xs,
  },
  itemLinePrice: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    alignSelf: 'flex-start',
  },
  // Promo code styles
  promoSection: {
    marginTop: spacing.md,
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  promoTitle: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.md,
  },
  promoInputContainer: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  promoInput: {
    flex: 1,
    height: 44,
    backgroundColor: colors.background,
    borderRadius: 8,
    paddingHorizontal: spacing.md,
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    borderWidth: 1,
    borderColor: colors.border,
  },
  promoApplyButton: {
    height: 44,
    paddingHorizontal: spacing.lg,
    backgroundColor: colors.primary,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  promoApplyButtonDisabled: {
    backgroundColor: colors.border,
  },
  promoApplyText: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.surface,
  },
  promoErrorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
    marginTop: spacing.sm,
  },
  promoErrorText: {
    fontSize: typography.fontSize.sm,
    color: colors.error,
  },
  appliedPromosContainer: {
    gap: spacing.sm,
  },
  appliedPromoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.success + '15',
    padding: spacing.md,
    borderRadius: 8,
  },
  appliedPromoInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  appliedPromoCode: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
  },
  // Bottom summary styles
  bottomSummary: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    elevation: 8,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  summaryLabel: {
    fontSize: typography.fontSize.md,
    color: colors.text.secondary,
  },
  summaryValue: {
    fontSize: typography.fontSize.md,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  totalRow: {
    marginTop: spacing.sm,
    paddingTop: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    marginBottom: spacing.md,
  },
  totalLabel: {
    fontSize: typography.fontSize.lg,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
  totalValue: {
    fontSize: typography.fontSize.lg,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  freeShippingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.sm,
    backgroundColor: colors.primary + '15',
    padding: spacing.sm,
    borderRadius: 8,
    marginBottom: spacing.md,
  },
  freeShippingText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  checkoutButton: {
    marginBottom: spacing.sm,
  },
  continueButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  continueButtonText: {
    fontSize: typography.fontSize.md,
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
});
