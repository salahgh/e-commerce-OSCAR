import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import {
  ShippingAddressForm,
  ShippingAddressFormValues,
  PaymentMethodSelector,
  PaymentMethod,
  OrderSummary,
} from '../../src/components/checkout';
import { Button, LoadingSpinner } from '../../src/components/ui';
import { useCart } from '../../src/contexts/CartContext';
import { useCreateOrderMutation } from '../../src/graphql/generated/graphql';
import { colors, spacing, typography } from '../../src/theme';

type CheckoutStep = 'shipping' | 'payment' | 'review';

export default function CheckoutScreen() {
  const { t } = useTranslation();
  const { items, totalAmount, clearCart } = useCart();

  // State
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddressFormValues | null>(null);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | null>(null);

  // GraphQL
  const [createOrder, { loading: creatingOrder }] = useCreateOrderMutation();

  // Calculate shipping cost (free for orders over 5000 DZD)
  const SHIPPING_COST = totalAmount >= 5000 ? 0 : 500;
  const FINAL_TOTAL = totalAmount + SHIPPING_COST;

  const handleShippingSubmit = (values: ShippingAddressFormValues) => {
    setShippingAddress(values);
    setCurrentStep('payment');
  };

  const handlePaymentSelect = (method: PaymentMethod) => {
    setPaymentMethod(method);
  };

  const handlePaymentContinue = () => {
    if (!paymentMethod) return;
    setCurrentStep('review');
  };

  const handlePlaceOrder = async () => {
    if (!shippingAddress || !paymentMethod) return;

    try {
      // Construct shipping address string
      const fullAddress = `${shippingAddress.address}, ${shippingAddress.city}, ${shippingAddress.postalCode}`;

      const { data } = await createOrder({
        variables: {
          input: {
            shippingAddress: fullAddress,
            phoneNumber: shippingAddress.phoneNumber,
            paymentMethod: paymentMethod,
            notes: shippingAddress.notes || undefined,
          },
        },
      });

      if (data?.createOrder) {
        const orderId = data.createOrder.id?.toString() || '';
        const orderNumber = data.createOrder.orderNumber;
        const amount = FINAL_TOTAL.toString();

        // Handle different payment methods
        if (paymentMethod === 'COD') {
          // Cash on Delivery - clear cart and go directly to confirmation
          await clearCart();
          router.replace({
            pathname: '/checkout/confirmation',
            params: {
              orderNumber: orderNumber,
              orderId: orderId,
            },
          });
        } else if (paymentMethod === 'CIB') {
          // CIB payment - redirect to CIB WebView
          router.push({
            pathname: '/payment/cib',
            params: {
              orderId: orderId,
              orderNumber: orderNumber,
              amount: amount,
            },
          });
        } else if (paymentMethod === 'BARIDIMOB') {
          // BaridiMob payment - redirect to BaridiMob WebView
          router.push({
            pathname: '/payment/baridimob',
            params: {
              orderId: orderId,
              orderNumber: orderNumber,
              amount: amount,
            },
          });
        }
      }
    } catch (error: any) {
      console.error('Create order error:', error);
      alert(error.message || t('checkout.orderError', 'Failed to create order'));
    }
  };

  const goBack = () => {
    if (currentStep === 'payment') {
      setCurrentStep('shipping');
    } else if (currentStep === 'review') {
      setCurrentStep('payment');
    } else {
      router.back();
    }
  };

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color={colors.text.tertiary} />
          <Text style={styles.emptyTitle}>{t('checkout.emptyCart', 'Your cart is empty')}</Text>
          <Text style={styles.emptyMessage}>
            {t('checkout.emptyCartMessage', 'Add some items to checkout')}
          </Text>
          <Button
            title={t('checkout.startShopping', 'Start Shopping')}
            onPress={() => router.push('/products')}
            style={styles.emptyButton}
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('checkout.title', 'Checkout')}</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Step Indicator */}
      <View style={styles.stepIndicator}>
        <View style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              currentStep === 'shipping' && styles.stepCircleActive,
              (currentStep === 'payment' || currentStep === 'review') && styles.stepCircleComplete,
            ]}
          >
            {currentStep === 'payment' || currentStep === 'review' ? (
              <Ionicons name="checkmark" size={16} color={colors.white} />
            ) : (
              <Text style={styles.stepNumber}>1</Text>
            )}
          </View>
          <Text style={styles.stepLabel}>{t('checkout.shipping', 'Shipping')}</Text>
        </View>

        <View style={styles.stepLine} />

        <View style={styles.stepItem}>
          <View
            style={[
              styles.stepCircle,
              currentStep === 'payment' && styles.stepCircleActive,
              currentStep === 'review' && styles.stepCircleComplete,
            ]}
          >
            {currentStep === 'review' ? (
              <Ionicons name="checkmark" size={16} color={colors.white} />
            ) : (
              <Text style={styles.stepNumber}>2</Text>
            )}
          </View>
          <Text style={styles.stepLabel}>{t('checkout.payment', 'Payment')}</Text>
        </View>

        <View style={styles.stepLine} />

        <View style={styles.stepItem}>
          <View style={[styles.stepCircle, currentStep === 'review' && styles.stepCircleActive]}>
            <Text style={styles.stepNumber}>3</Text>
          </View>
          <Text style={styles.stepLabel}>{t('checkout.review', 'Review')}</Text>
        </View>
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 'shipping' && (
          <ShippingAddressForm
            initialValues={shippingAddress || undefined}
            onSubmit={handleShippingSubmit}
            submitButtonText={t('checkout.continueToPayment', 'Continue to Payment')}
          />
        )}

        {currentStep === 'payment' && (
          <View style={styles.stepContent}>
            <PaymentMethodSelector selectedMethod={paymentMethod} onSelect={handlePaymentSelect} />

            <Button
              title={t('checkout.continueToReview', 'Continue to Review')}
              onPress={handlePaymentContinue}
              disabled={!paymentMethod}
              fullWidth
              style={styles.continueButton}
            />
          </View>
        )}

        {currentStep === 'review' && shippingAddress && paymentMethod && (
          <View style={styles.stepContent}>
            {/* Shipping Address Review */}
            <View style={styles.reviewSection}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewTitle}>
                  {t('checkout.shippingAddress', 'Shipping Address')}
                </Text>
                <TouchableOpacity onPress={() => setCurrentStep('shipping')}>
                  <Text style={styles.editButton}>{t('common.edit', 'Edit')}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.reviewContent}>
                <Text style={styles.reviewText}>{shippingAddress.fullName}</Text>
                <Text style={styles.reviewText}>{shippingAddress.phoneNumber}</Text>
                <Text style={styles.reviewText}>{shippingAddress.address}</Text>
                <Text style={styles.reviewText}>
                  {shippingAddress.city}, {shippingAddress.postalCode}
                </Text>
                {shippingAddress.notes && (
                  <Text style={styles.reviewTextSecondary}>Notes: {shippingAddress.notes}</Text>
                )}
              </View>
            </View>

            {/* Payment Method Review */}
            <View style={styles.reviewSection}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewTitle}>
                  {t('checkout.paymentMethod', 'Payment Method')}
                </Text>
                <TouchableOpacity onPress={() => setCurrentStep('payment')}>
                  <Text style={styles.editButton}>{t('common.edit', 'Edit')}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.reviewContent}>
                <Text style={styles.reviewText}>{paymentMethod}</Text>
              </View>
            </View>

            {/* Order Summary */}
            <OrderSummary
              items={items}
              subtotal={totalAmount}
              shippingCost={SHIPPING_COST}
              total={FINAL_TOTAL}
              showItems={true}
            />

            {/* Place Order Button */}
            <Button
              title={t('checkout.placeOrder', 'Place Order')}
              onPress={handlePlaceOrder}
              loading={creatingOrder}
              disabled={creatingOrder}
              fullWidth
              style={styles.placeOrderButton}
            />

            {/* Terms */}
            <Text style={styles.terms}>
              {t(
                'checkout.terms',
                'By placing your order, you agree to our Terms & Conditions and Privacy Policy'
              )}
            </Text>
          </View>
        )}
      </ScrollView>
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
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    paddingTop: spacing.xl,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  headerTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
  },
  placeholder: {
    width: 40,
  },
  stepIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: spacing.lg,
    backgroundColor: colors.surface,
  },
  stepItem: {
    alignItems: 'center',
    gap: spacing.xs,
  },
  stepCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  stepCircleActive: {
    backgroundColor: colors.primary,
  },
  stepCircleComplete: {
    backgroundColor: colors.success,
  },
  stepNumber: {
    ...typography.styles.bodySmall,
    color: colors.white,
    fontWeight: typography.fontWeight.bold,
  },
  stepLabel: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: spacing.sm,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  stepContent: {
    gap: spacing.lg,
  },
  continueButton: {
    marginTop: spacing.lg,
  },
  reviewSection: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  reviewHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  reviewTitle: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
  },
  editButton: {
    ...typography.styles.body,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  reviewContent: {
    gap: spacing.xs,
  },
  reviewText: {
    ...typography.styles.body,
    color: colors.text.primary,
  },
  reviewTextSecondary: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    fontStyle: 'italic',
  },
  placeOrderButton: {
    marginTop: spacing.lg,
  },
  terms: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
    textAlign: 'center',
    marginTop: spacing.md,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing['2xl'],
  },
  emptyTitle: {
    ...typography.styles.h3,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  emptyMessage: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  emptyButton: {
    minWidth: 200,
  },
});
