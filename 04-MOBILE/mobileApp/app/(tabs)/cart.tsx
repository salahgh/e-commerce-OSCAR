import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../src/contexts/CartContext';
import { CartItem } from '../../src/components/cart';
import { LoadingSpinner, EmptyState, Button } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/theme';
import { CartItemResponse } from '../../src/graphql/generated/graphql';

export default function CartScreen() {
  const { t } = useTranslation();
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

  const handleUpdateQuantity = async (itemId: number, quantity: number) => {
    try {
      await updateCartItem(itemId, { quantity });
    } catch (error: any) {
      console.error('Update quantity error:', error);
      alert(error.message || t('cart.updateError', 'Failed to update cart'));
    }
  };

  const handleRemove = async (itemId: number) => {
    try {
      await removeFromCart(itemId);
    } catch (error: any) {
      console.error('Remove item error:', error);
      alert(error.message || t('cart.removeError', 'Failed to remove item'));
    }
  };

  const handleClearCart = async () => {
    try {
      await clearCart();
    } catch (error: any) {
      console.error('Clear cart error:', error);
      alert(error.message || t('cart.clearError', 'Failed to clear cart'));
    }
  };

  const handleCheckout = () => {
    router.push('/checkout');
  };

  const handleContinueShopping = () => {
    router.push('/products');
  };

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

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>{t('cart.title', 'Shopping Cart')}</Text>
          <Text style={styles.itemCount}>
            {t('cart.itemsCount', { count: itemCount })} ({itemCount})
          </Text>
        </View>
        {items.length > 0 && (
          <TouchableOpacity onPress={handleClearCart} disabled={loading}>
            <Text style={styles.clearButton}>{t('cart.clearAll', 'Clear All')}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Cart Items */}
      <FlatList
        data={items}
        renderItem={({ item }) => (
          <CartItem
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
      />

      {/* Bottom Summary */}
      <View style={styles.bottomSummary}>
        {/* Subtotal */}
        <View style={styles.summaryRow}>
          <Text style={styles.summaryLabel}>{t('cart.subtotal', 'Subtotal')}</Text>
          <Text style={styles.summaryValue}>{totalAmount.toFixed(2)} DZD</Text>
        </View>

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
          <Text style={styles.totalValue}>{totalAmount.toFixed(2)} DZD</Text>
        </View>

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
    paddingTop: spacing.xl,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    ...typography.styles.h2,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
  itemCount: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: spacing.xs,
  },
  clearButton: {
    ...typography.styles.body,
    color: colors.error,
    fontWeight: typography.fontWeight.medium,
  },
  listContent: {
    padding: spacing.lg,
    paddingBottom: spacing.xl,
  },
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
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  summaryValue: {
    ...typography.styles.body,
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
    ...typography.styles.h3,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
  totalValue: {
    ...typography.styles.h3,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  checkoutButton: {
    marginBottom: spacing.sm,
  },
  continueButton: {
    paddingVertical: spacing.md,
    alignItems: 'center',
  },
  continueButtonText: {
    ...typography.styles.body,
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
});
