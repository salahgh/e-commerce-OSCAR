import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import {
  ShippingAddressForm,
  ShippingAddressFormValues,
  OrderSummary,
} from '../../src/components/checkout';
import { Button, LoadingSpinner } from '../../src/components/ui';
import { useCart } from '../../src/contexts/CartContext';
import {
  useGetEligibleShippingMethodsQuery,
  useGetEligiblePaymentMethodsQuery,
  useSetOrderShippingAddressMutation,
  useSetOrderShippingMethodMutation,
  useTransitionOrderToStateMutation,
  useAddPaymentToOrderMutation,
  useSetCustomerForOrderMutation,
} from '../../src/graphql/generated/graphql';
import { useAuth } from '../../src/contexts/AuthContext';
import { colors, spacing, typography } from '../../src/theme';
import { formatPrice } from '../../src/utils/vendureAdapters';
import { buildShippingAddressInput, buildGuestCustomerInput } from '../../src/utils/checkout';
import { makeShippingAddressSchema } from '../../src/utils/validation';
import { wilayas } from '../../src/data/wilayas';

type CheckoutStep = 'shipping' | 'shippingMethod' | 'payment' | 'review';

export default function CheckoutScreen() {
  const { t } = useTranslation();
  const { order, items, subTotal, shipping, total, refetchCart } = useCart();
  const { user, isAuthenticated } = useAuth();

  // State
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddressFormValues | null>(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);

  // GraphQL Mutations
  const [setShippingAddressMutation, { loading: settingAddress }] = useSetOrderShippingAddressMutation();
  const [setShippingMethodMutation, { loading: settingShipping }] = useSetOrderShippingMethodMutation();
  const [transitionOrderMutation, { loading: transitioning }] = useTransitionOrderToStateMutation();
  const [addPaymentMutation, { loading: addingPayment }] = useAddPaymentToOrderMutation();
  const [setCustomerMutation, { loading: settingCustomer }] = useSetCustomerForOrderMutation();

  // Queries
  const { data: shippingMethodsData, loading: loadingShippingMethods } = useGetEligibleShippingMethodsQuery({
    skip: currentStep !== 'shippingMethod',
  });

  const { data: paymentMethodsData, loading: loadingPaymentMethods } = useGetEligiblePaymentMethodsQuery({
    skip: currentStep !== 'payment',
  });

  // Prefill the address form for logged-in customers (mirrors the frontend checkout).
  const prefill: Partial<ShippingAddressFormValues> | undefined =
    isAuthenticated && user
      ? {
          email: user.email,
          fullName: `${user.firstName} ${user.lastName}`.trim(),
          phoneNumber: user.phoneNumber ?? '',
        }
      : undefined;

  const shippingMethods = shippingMethodsData?.eligibleShippingMethods || [];
  const paymentMethods = paymentMethodsData?.eligiblePaymentMethods || [];

  // Auto-select first shipping method if only one
  useEffect(() => {
    if (shippingMethods.length === 1 && !selectedShippingMethod) {
      setSelectedShippingMethod(shippingMethods[0].id);
    }
  }, [shippingMethods]);

  // Auto-select first payment method if only one
  useEffect(() => {
    if (paymentMethods.length === 1 && !selectedPaymentMethod) {
      setSelectedPaymentMethod(paymentMethods[0].id);
    }
  }, [paymentMethods]);

  const handleShippingSubmit = async (values: ShippingAddressFormValues) => {
    try {
      // Guest checkout: attach a customer (with a REAL email) to the order first.
      if (!isAuthenticated) {
        const customerResult = await setCustomerMutation({
          variables: { input: buildGuestCustomerInput(values) },
        });
        const customerResp = customerResult.data?.setCustomerForOrder;
        if (customerResp && 'errorCode' in customerResp) {
          if (customerResp.__typename === 'AlreadyLoggedInError') {
            throw new Error(
              t(
                'checkout.staleSession',
                'Your session is out of sync — please sign in again to continue.'
              )
            );
          }
          throw new Error((customerResp as { message: string }).message);
        }
      }

      const { data } = await setShippingAddressMutation({
        variables: { input: buildShippingAddressInput(values, wilayas) },
      });
      if (data?.setOrderShippingAddress && 'errorCode' in data.setOrderShippingAddress) {
        throw new Error((data.setOrderShippingAddress as { message: string }).message);
      }

      setShippingAddress(values);
      setCurrentStep('shippingMethod');
      refetchCart();
    } catch (error: any) {
      console.error('Set shipping address error:', error);
      Alert.alert(
        t('common.error', 'Error'),
        error.message || t('checkout.addressError', 'Failed to set shipping address')
      );
    }
  };

  const handleShippingMethodSelect = async () => {
    if (!selectedShippingMethod) return;

    try {
      const { data } = await setShippingMethodMutation({
        variables: {
          shippingMethodId: [selectedShippingMethod],
        },
      });

      if (data?.setOrderShippingMethod) {
        const result = data.setOrderShippingMethod;
        if ('errorCode' in result) {
          const errorResult = result as { message: string };
          throw new Error(errorResult.message);
        }
      }

      setCurrentStep('payment');
      refetchCart();
    } catch (error: any) {
      console.error('Set shipping method error:', error);
      Alert.alert(
        t('common.error', 'Error'),
        error.message || t('checkout.shippingMethodError', 'Failed to set shipping method')
      );
    }
  };

  const handlePaymentMethodSelect = async () => {
    if (!selectedPaymentMethod) return;
    setCurrentStep('review');
  };

  const handlePlaceOrder = async () => {
    if (!selectedPaymentMethod) return;

    try {
      // Transition order to ArrangingPayment state
      const transitionResult = await transitionOrderMutation({
        variables: {
          state: 'ArrangingPayment',
        },
      });

      if (transitionResult.data?.transitionOrderToState) {
        const result = transitionResult.data.transitionOrderToState;
        if ('errorCode' in result) {
          const errorResult = result as { message: string };
          throw new Error(errorResult.message);
        }
      }

      // Find the payment method code
      const paymentMethod = paymentMethods.find(m => m.id === selectedPaymentMethod);
      const paymentMethodCode = paymentMethod?.code || 'cash-on-delivery';

      // Add payment to order
      const { data } = await addPaymentMutation({
        variables: {
          input: {
            method: paymentMethodCode,
            metadata: {},
          },
        },
      });

      if (data?.addPaymentToOrder) {
        const result = data.addPaymentToOrder;
        if ('errorCode' in result) {
          const errorResult = result as { message: string };
          throw new Error(errorResult.message);
        }

        // Success - navigate to confirmation
        const orderCode = 'code' in result ? result.code : '';
        const orderId = 'id' in result ? result.id : '';

        router.replace({
          pathname: '/checkout/confirmation',
          params: {
            orderNumber: orderCode,
            orderId: orderId,
          },
        });
      }
    } catch (error: any) {
      console.error('Place order error:', error);
      Alert.alert(
        t('common.error', 'Error'),
        error.message || t('checkout.orderError', 'Failed to place order')
      );
    }
  };

  const goBack = () => {
    if (currentStep === 'shippingMethod') {
      setCurrentStep('shipping');
    } else if (currentStep === 'payment') {
      setCurrentStep('shippingMethod');
    } else if (currentStep === 'review') {
      setCurrentStep('payment');
    } else {
      router.back();
    }
  };

  const isLoading = settingAddress || settingShipping || transitioning || addingPayment || settingCustomer;

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
        <StepItem
          number={1}
          label={t('checkout.shipping', 'Shipping')}
          isActive={currentStep === 'shipping'}
          isComplete={currentStep !== 'shipping'}
        />
        <View style={styles.stepLine} />
        <StepItem
          number={2}
          label={t('checkout.delivery', 'Delivery')}
          isActive={currentStep === 'shippingMethod'}
          isComplete={currentStep === 'payment' || currentStep === 'review'}
        />
        <View style={styles.stepLine} />
        <StepItem
          number={3}
          label={t('checkout.payment', 'Payment')}
          isActive={currentStep === 'payment'}
          isComplete={currentStep === 'review'}
        />
        <View style={styles.stepLine} />
        <StepItem
          number={4}
          label={t('checkout.review', 'Review')}
          isActive={currentStep === 'review'}
          isComplete={false}
        />
      </View>

      {/* Content */}
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {currentStep === 'shipping' && (
          <ShippingAddressForm
            initialValues={shippingAddress || prefill}
            showEmail={!isAuthenticated}
            validationSchema={makeShippingAddressSchema(!isAuthenticated)}
            onSubmit={handleShippingSubmit}
            submitButtonText={t('checkout.continueToDelivery', 'Continue to Delivery')}
          />
        )}

        {currentStep === 'shippingMethod' && (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>
              {t('checkout.selectShippingMethod', 'Select Delivery Method')}
            </Text>

            {loadingShippingMethods ? (
              <LoadingSpinner />
            ) : shippingMethods.length === 0 ? (
              <Text style={styles.noMethodsText}>
                {t('checkout.noShippingMethods', 'No delivery methods available')}
              </Text>
            ) : (
              shippingMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodCard,
                    selectedShippingMethod === method.id && styles.methodCardSelected,
                  ]}
                  onPress={() => setSelectedShippingMethod(method.id)}
                >
                  <View style={styles.methodRadio}>
                    <View
                      style={[
                        styles.radioOuter,
                        selectedShippingMethod === method.id && styles.radioOuterSelected,
                      ]}
                    >
                      {selectedShippingMethod === method.id && <View style={styles.radioInner} />}
                    </View>
                  </View>
                  <View style={styles.methodInfo}>
                    <Text style={styles.methodName}>{method.name}</Text>
                    {method.description && (
                      <Text style={styles.methodDescription}>{method.description}</Text>
                    )}
                  </View>
                  <Text style={styles.methodPrice}>
                    {method.priceWithTax === 0
                      ? t('checkout.free', 'Free')
                      : `${formatPrice(method.priceWithTax)} DZD`}
                  </Text>
                </TouchableOpacity>
              ))
            )}

            <Button
              title={t('checkout.continueToPayment', 'Continue to Payment')}
              onPress={handleShippingMethodSelect}
              disabled={!selectedShippingMethod || isLoading}
              loading={settingShipping}
              fullWidth
              style={styles.continueButton}
            />
          </View>
        )}

        {currentStep === 'payment' && (
          <View style={styles.stepContent}>
            <Text style={styles.sectionTitle}>
              {t('checkout.selectPaymentMethod', 'Select Payment Method')}
            </Text>

            {loadingPaymentMethods ? (
              <LoadingSpinner />
            ) : paymentMethods.length === 0 ? (
              <Text style={styles.noMethodsText}>
                {t('checkout.noPaymentMethods', 'No payment methods available')}
              </Text>
            ) : (
              paymentMethods.map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.methodCard,
                    selectedPaymentMethod === method.id && styles.methodCardSelected,
                    !method.isEligible && styles.methodCardDisabled,
                  ]}
                  onPress={() => method.isEligible && setSelectedPaymentMethod(method.id)}
                  disabled={!method.isEligible}
                >
                  <View style={styles.methodRadio}>
                    <View
                      style={[
                        styles.radioOuter,
                        selectedPaymentMethod === method.id && styles.radioOuterSelected,
                        !method.isEligible && styles.radioOuterDisabled,
                      ]}
                    >
                      {selectedPaymentMethod === method.id && <View style={styles.radioInner} />}
                    </View>
                  </View>
                  <View style={styles.methodInfo}>
                    <Text
                      style={[styles.methodName, !method.isEligible && styles.methodNameDisabled]}
                    >
                      {method.name}
                    </Text>
                    {method.description && (
                      <Text style={styles.methodDescription}>{method.description}</Text>
                    )}
                    {!method.isEligible && method.eligibilityMessage && (
                      <Text style={styles.eligibilityMessage}>{method.eligibilityMessage}</Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            )}

            <Button
              title={t('checkout.continueToReview', 'Continue to Review')}
              onPress={handlePaymentMethodSelect}
              disabled={!selectedPaymentMethod || isLoading}
              fullWidth
              style={styles.continueButton}
            />
          </View>
        )}

        {currentStep === 'review' && shippingAddress && (
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
                  {shippingAddress.city}
                  {shippingAddress.postalCode && `, ${shippingAddress.postalCode}`}
                </Text>
                {shippingAddress.notes && (
                  <Text style={styles.reviewTextSecondary}>Notes: {shippingAddress.notes}</Text>
                )}
              </View>
            </View>

            {/* Shipping Method Review */}
            <View style={styles.reviewSection}>
              <View style={styles.reviewHeader}>
                <Text style={styles.reviewTitle}>
                  {t('checkout.deliveryMethod', 'Delivery Method')}
                </Text>
                <TouchableOpacity onPress={() => setCurrentStep('shippingMethod')}>
                  <Text style={styles.editButton}>{t('common.edit', 'Edit')}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.reviewContent}>
                <Text style={styles.reviewText}>
                  {shippingMethods.find((m) => m.id === selectedShippingMethod)?.name || ''}
                </Text>
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
                <Text style={styles.reviewText}>
                  {paymentMethods.find((m) => m.id === selectedPaymentMethod)?.name || ''}
                </Text>
              </View>
            </View>

            {/* Order Summary */}
            <OrderSummary
              items={items}
              subtotal={subTotal}
              shippingCost={shipping}
              total={total}
              showItems={true}
            />

            {/* Place Order Button */}
            <Button
              title={t('checkout.placeOrder', 'Place Order')}
              onPress={handlePlaceOrder}
              loading={isLoading}
              disabled={isLoading}
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

// Step Item Component
function StepItem({
  number,
  label,
  isActive,
  isComplete,
}: {
  number: number;
  label: string;
  isActive: boolean;
  isComplete: boolean;
}) {
  return (
    <View style={styles.stepItem}>
      <View
        style={[
          styles.stepCircle,
          isActive && styles.stepCircleActive,
          isComplete && styles.stepCircleComplete,
        ]}
      >
        {isComplete ? (
          <Ionicons name="checkmark" size={14} color={colors.surface} />
        ) : (
          <Text style={[styles.stepNumber, (isActive || isComplete) && styles.stepNumberActive]}>
            {number}
          </Text>
        )}
      </View>
      <Text style={[styles.stepLabel, isActive && styles.stepLabelActive]}>{label}</Text>
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
    padding: spacing.md,
    backgroundColor: colors.surface,
  },
  stepItem: {
    alignItems: 'center',
    gap: 4,
  },
  stepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
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
    fontSize: 12,
    color: colors.text.tertiary,
    fontWeight: typography.fontWeight.bold,
  },
  stepNumberActive: {
    color: colors.surface,
  },
  stepLabel: {
    fontSize: 10,
    color: colors.text.tertiary,
  },
  stepLabelActive: {
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: colors.border,
    marginHorizontal: 4,
  },
  content: {
    flex: 1,
    padding: spacing.lg,
  },
  stepContent: {
    gap: spacing.md,
  },
  sectionTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semiBold,
    marginBottom: spacing.sm,
  },
  noMethodsText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    padding: spacing.xl,
  },
  methodCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  methodCardSelected: {
    borderColor: colors.primary,
  },
  methodCardDisabled: {
    opacity: 0.5,
  },
  methodRadio: {
    marginRight: spacing.md,
  },
  radioOuter: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioOuterSelected: {
    borderColor: colors.primary,
  },
  radioOuterDisabled: {
    borderColor: colors.text.tertiary,
  },
  radioInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: colors.primary,
  },
  methodInfo: {
    flex: 1,
  },
  methodName: {
    ...typography.styles.body,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
  methodNameDisabled: {
    color: colors.text.tertiary,
  },
  methodDescription: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginTop: 2,
  },
  eligibilityMessage: {
    ...typography.styles.caption,
    color: colors.error,
    marginTop: 4,
  },
  methodPrice: {
    ...typography.styles.body,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
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
