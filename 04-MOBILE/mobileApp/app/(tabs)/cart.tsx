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
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useCart } from '../../src/contexts/CartContext';
import { SwipeableCartItem } from '../../src/components/cart';
import { LoadingSpinner, EmptyState, Button } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/theme';
import { CartItemResponse } from '../../src/graphql/generated/graphql';

// Sample promo codes for demo (in production, validate via API)
const PROMO_CODES: Record<string, { type: 'percent' | 'fixed'; value: number; minOrder?: number }> = {
  WELCOME10: { type: 'percent', value: 10 },
  SAVE500: { type: 'fixed', value: 500, minOrder: 3000 },
  SUMMER20: { type: 'percent', value: 20, minOrder: 5000 },
};

export default function CartScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const {
    items,
    itemCount,
    totalAmount,
    loading,
    updateCartItem,
    removeFromCart,
    clearCart,
    refetchCart,
  } = useCart();

  // Promo code state
  const [promoCode, setPromoCode] = useState('');
  const [appliedPromo, setAppliedPromo] = useState<{
    code: string;
    type: 'percent' | 'fixed';
    value: number;
  } | null>(null);
  const [promoError, setPromoError] = useState<string | null>(null);
  const [applyingPromo, setApplyingPromo] = useState(false);

  // Calculate discount
  const calculateDiscount = useCallback(() => {
    if (!appliedPromo) return 0;
    if (appliedPromo.type === 'percent') {
      return (totalAmount * appliedPromo.value) / 100;
    }
    return appliedPromo.value;
  }, [appliedPromo, totalAmount]);

  const discount = calculateDiscount();
  const finalTotal = Math.max(0, totalAmount - discount);

  const handleUpdateQuantity = useCallback(async (itemId: number, quantity: number) => {
    try {
      await updateCartItem(itemId, { quantity });
    } catch (error: any) {
      console.error('Update quantity error:', error);
      Alert.alert(t('common.error', 'Error'), error.message || t('cart.updateError', 'Failed to update cart'));
    }
  }, [updateCartItem, t]);

  const handleRemove = useCallback(async (itemId: number) => {
    try {
      await removeFromCart(itemId);
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
              setAppliedPromo(null);
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

    setApplyingPromo(true);
    setPromoError(null);

    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 500));

    const code = promoCode.trim().toUpperCase();
    const promo = PROMO_CODES[code];

    if (!promo) {
      setPromoError(t('cart.invalidPromoCode', 'Invalid promo code'));
      setApplyingPromo(false);
      return;
    }

    if (promo.minOrder && totalAmount < promo.minOrder) {
      setPromoError(t('cart.minOrderRequired', `Minimum order of ${promo.minOrder} DZD required`));
      setApplyingPromo(false);
      return;
    }

    setAppliedPromo({ code, type: promo.type, value: promo.value });
    setPromoCode('');
    setApplyingPromo(false);
  }, [promoCode, totalAmount, t]);

  const handleRemovePromo = useCallback(() => {
    setAppliedPromo(null);
    setPromoError(null);
  }, []);

  const handleCheckout = useCallback(() => {
    router.push('/checkout');
  }, []);

  const handleContinueShopping = useCallback(() => {
    router.push('/products');
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
          message={t('cart.emptyMessage', 'Add some products to get started!')}
          actionText={t('cart.startShopping', 'Start Shopping')}
          onAction={handleContinueShopping}
        />
      </View>
    );
  }

  // Render promo code section
  const renderPromoSection = () => (
    <View style={styles.promoSection}>
      <Text style={styles.promoTitle}>{t('cart.promoCode', 'Promo Code')}</Text>

      {appliedPromo ? (
        <View style={styles.appliedPromoContainer}>
          <View style={styles.appliedPromoInfo}>
            <Ionicons name="pricetag" size={20} color={colors.success} />
            <View style={styles.appliedPromoDetails}>
              <Text style={styles.appliedPromoCode}>{appliedPromo.code}</Text>
              <Text style={styles.appliedPromoDiscount}>
                {appliedPromo.type === 'percent'
                  ? `-${appliedPromo.value}%`
                  : `-${appliedPromo.value.toFixed(2)} DZD`}
              </Text>
            </View>
          </View>
          <TouchableOpacity onPress={handleRemovePromo} hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Ionicons name="close-circle" size={24} color={colors.text.tertiary} />
          </TouchableOpacity>
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
              disabled={!promoCode.trim() || applyingPromo}
            >
              {applyingPromo ? (
                <Ionicons name="sync" size={20} color={colors.surface} />
              ) : (
                <Text style={styles.promoApplyText}>{t('cart.apply', 'Apply')}</Text>
              )}
            </TouchableOpacity>
          </View>
          {promoError && (
            <View style={styles.promoErrorContainer}>
              <Ionicons name="alert-circle" size={16} color={colors.error} />
              <Text style={styles.promoErrorText}>{promoError}</Text>
            </View>
          )}
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
        {items.length > 0 && (
          <TouchableOpacity onPress={handleClearCart} disabled={loading}>
            <Text style={styles.clearButton}>{t('cart.clearAll', 'Clear All')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Swipe Hint */}
      {items.length > 0 && (
        <View style={styles.swipeHintContainer}>
          <Ionicons name="swap-horizontal" size={16} color={colors.text.tertiary} />
          <Text style={styles.swipeHintText}>
            {t('cart.swipeToDelete', 'Swipe left to delete items')}
          </Text>
        </View>
      )}

      {/* Cart Items */}
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <SwipeableCartItem
            item={item as CartItemResponse}
            onUpdateQuantity={handleUpdateQuantity}
            onRemove={handleRemove}
            loading={loading}
          />
        )}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
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
          <Text style={styles.summaryValue}>{totalAmount.toFixed(2)} DZD</Text>
        </View>

        {/* Discount */}
        {appliedPromo && discount > 0 && (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryLabel, styles.discountLabel]}>
              {t('cart.discount', 'Discount')} ({appliedPromo.code})
            </Text>
            <Text style={styles.discountValue}>-{discount.toFixed(2)} DZD</Text>
          </View>
        )}

        {/* Shipping */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t('cart.shipping', 'Shipping')}</Text>
          <Text style={styles.summaryValue}>
            {t('cart.calculatedAtCheckout', 'Calculated at checkout')}
          </Text>
        </View>

        {/* Total */}
        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={styles.totalLabel}>{t('cart.total', 'Total')}</Text>
          <Text style={styles.totalValue}>{finalTotal.toFixed(2)} DZD</Text>
        </View>

        {/* Free Shipping Info */}
        {finalTotal < 5000 && (
          <View style={styles.freeShippingInfo}>
            <Ionicons name="gift-outline" size={16} color={colors.primary} />
            <Text style={styles.freeShippingText}>
              {t('cart.freeShippingHint', `Add ${(5000 - finalTotal).toFixed(0)} DZD more for free shipping!`)}
            </Text>
          </View>
        )}

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
  swipeHintContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing.xs,
    paddingVertical: spacing.sm,
    backgroundColor: colors.background,
  },
  swipeHintText: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.md,
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
  appliedPromoDetails: {
    gap: spacing.xs,
  },
  appliedPromoCode: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: colors.success,
  },
  appliedPromoDiscount: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
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
  discountLabel: {
    color: colors.success,
  },
  discountValue: {
    fontSize: typography.fontSize.md,
    color: colors.success,
    fontWeight: typography.fontWeight.semiBold,
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
