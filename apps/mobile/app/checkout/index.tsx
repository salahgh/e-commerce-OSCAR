import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import {
  ShippingAddressForm,
  ShippingAddressFormValues,
} from '../../src/components/checkout';
import { Button } from '../../src/components/ui';
import { useCart } from '../../src/contexts/CartContext';
import {
  useGetEligibleShippingMethodsQuery,
  useGetEligiblePaymentMethodsQuery,
  useSetOrderShippingAddressMutation,
  useSetOrderShippingMethodMutation,
  useTransitionOrderToStateMutation,
  useAddPaymentToOrderMutation,
  useSetCustomerForOrderMutation,
  useActiveCustomerQuery,
} from '../../src/graphql/generated/graphql';
import { useAuth } from '../../src/contexts/AuthContext';
import { spacing, typography, makeThemedStyles, useThemeColors } from '../../src/theme';
import { useAppFont } from '../../src/hooks/useAppFont';
import { formatPrice } from '../../src/utils/vendureAdapters';
import {
  submitCheckoutAddress,
  STALE_SESSION_ERROR,
} from '../../src/utils/checkout';
import { makeShippingAddressSchema } from '../../src/utils/validation';
import { wilayas } from '../../src/data/wilayas';
import { addressToCheckoutValues, SavedAddress } from '../../src/utils/address';
import { SavedAddressPicker } from '../../src/components/checkout/SavedAddressPicker';
import { partitionPaymentMethods, getPaymentAvailability } from '../../src/utils/payment';
import { rtlIcon } from '../../src/utils/rtl';

// The Figma checkout (node 84:10030 / 84:10255) is a single "ملخص الطلب" screen
// combining the order summary, payment-method selection and the confirm button.
// Vendure still requires a shipping address + shipping method before payment, so
// the address form is kept as the preceding step (the design assumes an address
// already exists); everything after it lives on one consolidated summary screen.
type CheckoutStep = 'shipping' | 'summary';

export default function CheckoutScreen() {
  const styles = useStyles();
  const colors = useThemeColors();
  const { fontFamily } = useAppFont();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { order, items, subTotal, shipping, total, refetchCart } = useCart();
  const { user, isAuthenticated, logout } = useAuth();

  // State
  const [currentStep, setCurrentStep] = useState<CheckoutStep>('shipping');
  const [shippingAddress, setShippingAddress] = useState<ShippingAddressFormValues | null>(null);
  const [selectedShippingMethod, setSelectedShippingMethod] = useState<string | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string | null>(null);
  const [placingOrder, setPlacingOrder] = useState(false);

  // GraphQL Mutations
  const [setShippingAddressMutation, { loading: settingAddress }] =
    useSetOrderShippingAddressMutation();
  const [setShippingMethodMutation] = useSetOrderShippingMethodMutation();
  const [transitionOrderMutation] = useTransitionOrderToStateMutation();
  const [addPaymentMutation] = useAddPaymentToOrderMutation();
  const [setCustomerMutation, { loading: settingCustomer }] = useSetCustomerForOrderMutation();

  // Eligible methods are needed once the shopper reaches the summary screen.
  const { data: shippingMethodsData } = useGetEligibleShippingMethodsQuery({
    skip: currentStep !== 'summary',
  });
  const { data: paymentMethodsData, loading: loadingPaymentMethods } =
    useGetEligiblePaymentMethodsQuery({
      skip: currentStep !== 'summary',
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

  // Saved addresses for the signed-in shopper — selecting one prefills the form.
  const { data: customerData } = useActiveCustomerQuery({
    skip: !isAuthenticated,
    fetchPolicy: 'cache-and-network',
  });
  const savedAddresses = (customerData?.activeCustomer?.addresses ?? []) as SavedAddress[];
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  // True once the shopper explicitly chooses "New address" — stops the auto-select
  // below from re-picking a saved address and keeps the form empty (prefill only).
  const [enteringNewAddress, setEnteringNewAddress] = useState(false);

  useEffect(() => {
    if (!enteringNewAddress && !selectedAddressId && savedAddresses.length > 0) {
      const def = savedAddresses.find((a) => a.defaultShippingAddress) ?? savedAddresses[0];
      setSelectedAddressId(def.id);
    }
  }, [savedAddresses, selectedAddressId, enteringNewAddress]);

  const selectedAddress = savedAddresses.find((a) => a.id === selectedAddressId) ?? null;
  const formInitialValues =
    shippingAddress ??
    (selectedAddress ? addressToCheckoutValues(selectedAddress, wilayas) : prefill);

  const shippingMethods = shippingMethodsData?.eligibleShippingMethods || [];
  const paymentMethods = paymentMethodsData?.eligiblePaymentMethods || [];

  const { available: availablePaymentMethods } = partitionPaymentMethods(paymentMethods);

  // On the summary screen, apply the (single) delivery method so the delivery fee
  // and total reflect it. Guard with selectedShippingMethod so it runs at most once.
  useEffect(() => {
    if (currentStep !== 'summary' || selectedShippingMethod || shippingMethods.length === 0) return;
    const first = shippingMethods[0].id;
    setSelectedShippingMethod(first);
    setShippingMethodMutation({ variables: { shippingMethodId: [first] } })
      .then(() => refetchCart())
      .catch((e) => console.warn('Auto-apply shipping method failed:', e));
  }, [currentStep, shippingMethods, selectedShippingMethod]);

  // Default the payment selection to COD (or the first available method).
  useEffect(() => {
    if (!selectedPaymentMethod && availablePaymentMethods.length > 0) {
      const cod = availablePaymentMethods.find((m) => m.code === 'cash-on-delivery');
      setSelectedPaymentMethod((cod ?? availablePaymentMethods[0]).id);
    }
  }, [availablePaymentMethods, selectedPaymentMethod]);

  const handleShippingSubmit = async (values: ShippingAddressFormValues) => {
    try {
      await submitCheckoutAddress({
        values,
        isAuthenticated,
        wilayas,
        setCustomer: async (input) =>
          (await setCustomerMutation({ variables: { input } })).data?.setCustomerForOrder,
        setShippingAddress: async (input) =>
          (await setShippingAddressMutation({ variables: { input } })).data
            ?.setOrderShippingAddress,
      });

      setShippingAddress(values);
      setCurrentStep('summary');
      refetchCart();
    } catch (error: any) {
      const isStaleSession = error?.message === STALE_SESSION_ERROR;
      const message = isStaleSession
        ? t(
            'checkout.staleSession',
            'Your session is out of sync — please sign in again to continue.'
          )
        : error?.message || t('checkout.addressError', 'Failed to set shipping address');
      console.error('Set shipping address error:', error);
      if (isStaleSession) {
        Alert.alert(t('common.error', 'Error'), message, [
          { text: t('common.cancel', 'Cancel'), style: 'cancel' },
          {
            text: t('checkout.signInAgain', 'Sign in again'),
            onPress: async () => {
              await logout();
              router.replace('/(auth)/login');
            },
          },
        ]);
      } else {
        Alert.alert(t('common.error', 'Error'), message);
      }
    }
  };

  // Confirm the order from the consolidated summary screen: make sure the delivery
  // method is applied, transition to ArrangingPayment, then add the payment.
  const handleConfirmOrder = async () => {
    if (!selectedPaymentMethod) return;
    setPlacingOrder(true);
    try {
      if (selectedShippingMethod) {
        const { data: smData } = await setShippingMethodMutation({
          variables: { shippingMethodId: [selectedShippingMethod] },
        });
        const sm = smData?.setOrderShippingMethod;
        if (sm && 'errorCode' in sm) throw new Error((sm as { message: string }).message);
      }

      const transitionResult = await transitionOrderMutation({
        variables: { state: 'ArrangingPayment' },
      });
      const transitioned = transitionResult.data?.transitionOrderToState;
      if (transitioned && 'errorCode' in transitioned) {
        throw new Error((transitioned as { message: string }).message);
      }

      const paymentMethod = paymentMethods.find((m) => m.id === selectedPaymentMethod);
      const paymentMethodCode = paymentMethod?.code || 'cash-on-delivery';

      const { data } = await addPaymentMutation({
        variables: { input: { method: paymentMethodCode, metadata: {} } },
      });
      const result = data?.addPaymentToOrder;
      if (result && 'errorCode' in result) {
        throw new Error((result as { message: string }).message);
      }

      const orderCode = result && 'code' in result ? result.code : '';
      const orderId = result && 'id' in result ? result.id : '';
      router.replace({
        pathname: '/checkout/confirmation',
        params: { orderNumber: orderCode, orderId },
      });
    } catch (error: any) {
      console.error('Place order error:', error);
      Alert.alert(
        t('common.error', 'Error'),
        error.message || t('checkout.orderError', 'Failed to place order')
      );
    } finally {
      setPlacingOrder(false);
    }
  };

  const goBack = () => {
    if (currentStep === 'summary') {
      setCurrentStep('shipping');
    } else {
      router.back();
    }
  };

  // Order-level discount for the summary (subtotal + delivery − total), clamped.
  const discount = Math.max(0, subTotal + shipping - total);

  // Localised payment label, falling back to the backend method name.
  const paymentLabel = (code: string, name: string) => {
    const c = code.toLowerCase();
    if (c.includes('cash') || c.includes('delivery') || c === 'cod')
      return t('checkout.cashOnDelivery', 'Cash on delivery');
    if (c.includes('cib')) return t('checkout.cibFull', 'Pay by CIB bank card');
    if (c.includes('barid')) return t('checkout.baridimobFull', 'Pay via the BaridiMob app');
    return name;
  };

  const selectedMethodCode =
    paymentMethods.find((m) => m.id === selectedPaymentMethod)?.code?.toLowerCase() ?? '';
  const showSecureRedirect =
    selectedMethodCode.includes('cib') || selectedMethodCode.includes('barid');

  if (items.length === 0) {
    return (
      <View style={styles.container}>
        <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name={rtlIcon('arrow-back')} size={24} color={colors.text.primary} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { fontFamily: fontFamily.bold }]}>
            {t('checkout.orderSummary', 'Order Summary')}
          </Text>
          <View style={styles.placeholder} />
        </View>
        <View style={styles.emptyContainer}>
          <Ionicons name="cart-outline" size={64} color={colors.text.tertiary} />
          <Text style={[styles.emptyTitle, { fontFamily: fontFamily.bold }]}>
            {t('checkout.emptyCart', 'Your cart is empty')}
          </Text>
          <Text style={[styles.emptyMessage, { fontFamily: fontFamily.regular }]}>
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

  // Renders one payment radio row matching the Figma layout (label + circular radio).
  const renderPaymentOption = (
    id: string,
    label: string,
    opts: { selectable: boolean; selected: boolean; comingSoon?: boolean }
  ) => (
    <TouchableOpacity
      key={id}
      style={styles.paymentRow}
      activeOpacity={opts.selectable ? 0.7 : 1}
      disabled={!opts.selectable}
      onPress={() => opts.selectable && setSelectedPaymentMethod(id)}
    >
      <View style={styles.paymentLabelWrap}>
        <Text
          style={[
            styles.paymentLabel,
            !opts.selectable && styles.paymentLabelDisabled,
            { fontFamily: fontFamily.medium },
          ]}
        >
          {label}
        </Text>
        {opts.comingSoon && (
          <Text style={[styles.comingSoonTag, { fontFamily: fontFamily.regular }]}>
            {t('checkout.comingSoon', 'Coming soon')}
          </Text>
        )}
      </View>
      <View style={[styles.radioOuter, opts.selected && styles.radioOuterSelected]}>
        {opts.selected && <View style={styles.radioInner} />}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + spacing.md }]}>
        <TouchableOpacity onPress={goBack} style={styles.backButton}>
          <Ionicons name={rtlIcon('arrow-back')} size={24} color={colors.text.primary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { fontFamily: fontFamily.bold }]}>
          {currentStep === 'summary'
            ? t('checkout.orderSummary', 'Order Summary')
            : t('checkout.shippingAddress', 'Shipping Address')}
        </Text>
        <View style={styles.placeholder} />
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + spacing.xl }}
        showsVerticalScrollIndicator={false}
      >
        {currentStep === 'shipping' && (
          <>
            {isAuthenticated && (
              <SavedAddressPicker
                addresses={savedAddresses}
                selectedId={selectedAddressId}
                onSelect={(a) => {
                  setEnteringNewAddress(false);
                  setSelectedAddressId(a.id);
                }}
                onSelectNew={() => {
                  setEnteringNewAddress(true);
                  setSelectedAddressId(null);
                }}
              />
            )}
            <ShippingAddressForm
              key={selectedAddressId ?? 'new'}
              initialValues={formInitialValues}
              showEmail={!isAuthenticated}
              validationSchema={makeShippingAddressSchema(!isAuthenticated)}
              onSubmit={handleShippingSubmit}
              submitButtonText={t('checkout.continue', 'Continue')}
            />
          </>
        )}

        {currentStep === 'summary' && (
          <View style={styles.summary}>
            {/* Summary rows */}
            <View style={styles.summaryRows}>
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { fontFamily: fontFamily.medium }]}>
                  {t('checkout.subtotal', 'Subtotal')}:
                </Text>
                <Text style={[styles.summaryValue, { fontFamily: fontFamily.medium }]}>
                  {subTotal.toLocaleString()} {t('common.currency', 'DZD')}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryMuted, { fontFamily: fontFamily.medium }]}>
                  {t('checkout.discount', 'Discount')}:
                </Text>
                <Text style={[styles.summaryMuted, { fontFamily: fontFamily.medium }]}>
                  {discount > 0 ? `${discount.toLocaleString()} ${t('common.currency', 'DZD')}` : '--'}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { fontFamily: fontFamily.medium }]}>
                  {t('checkout.deliveryFee', 'Delivery fee')}:
                </Text>
                <Text style={[styles.summaryValue, { fontFamily: fontFamily.medium }]}>
                  {shipping > 0
                    ? `${shipping.toLocaleString()} ${t('common.currency', 'DZD')}`
                    : t('checkout.free', 'Free')}
                </Text>
              </View>

              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { fontFamily: fontFamily.medium }]}>
                  {t('checkout.total', 'Total')}:
                </Text>
                <Text style={[styles.summaryValue, { fontFamily: fontFamily.medium }]}>
                  {total.toLocaleString()} {t('common.currency', 'DZD')}
                </Text>
              </View>
            </View>

            {/* Payment method */}
            <View style={styles.paymentSection}>
              <Text style={[styles.paymentHeading, { fontFamily: fontFamily.medium }]}>
                {t('checkout.paymentMethod', 'Payment method')}
              </Text>

              {availablePaymentMethods.map((method) =>
                renderPaymentOption(method.id, paymentLabel(method.code, method.name), {
                  selectable: method.isEligible,
                  selected: selectedPaymentMethod === method.id,
                })
              )}

              {/* CIB / BaridiMob are backend-blocked for now — shown but non-selectable. */}
              {!loadingPaymentMethods &&
                paymentMethods
                  .filter((m) => getPaymentAvailability(m.code) === 'coming-soon')
                  .map((method) =>
                    renderPaymentOption(method.id, paymentLabel(method.code, method.name), {
                      selectable: false,
                      selected: false,
                      comingSoon: true,
                    })
                  )}
            </View>

            {/* Secure-redirect note (shown for online gateways, per design 84:10255) */}
            {showSecureRedirect && (
              <View style={styles.noticeBanner}>
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color={colors.warning ?? colors.text.secondary}
                />
                <Text style={[styles.noticeText, { fontFamily: fontFamily.regular }]}>
                  {t('checkout.secureRedirectNote', "You'll be redirected to complete payment securely")}
                </Text>
              </View>
            )}

            {/* Confirm */}
            <TouchableOpacity
              style={[styles.confirmButton, (placingOrder || !selectedPaymentMethod) && styles.confirmButtonDisabled]}
              onPress={handleConfirmOrder}
              disabled={placingOrder || !selectedPaymentMethod}
              activeOpacity={0.8}
            >
              <Text style={[styles.confirmButtonText, { fontFamily: fontFamily.medium }]}>
                {t('checkout.placeOrder', 'Confirm order')}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
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
    content: {
      flex: 1,
      padding: spacing.lg,
    },
    // Summary screen
    summary: {
      gap: spacing['2xl'],
      paddingTop: spacing.lg,
    },
    summaryRows: {
      gap: spacing.lg,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryLabel: {
      fontSize: 16,
      color: colors.text.primary,
    },
    summaryValue: {
      fontSize: 16,
      color: colors.text.primary,
    },
    summaryMuted: {
      fontSize: 16,
      color: colors.text.secondary,
    },
    // Payment
    paymentSection: {
      gap: spacing.md,
    },
    paymentHeading: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.text.primary,
    },
    paymentRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing.sm,
    },
    paymentLabelWrap: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      flexWrap: 'wrap',
    },
    paymentLabel: {
      fontSize: 16,
      lineHeight: 24,
      color: colors.text.primary,
    },
    paymentLabelDisabled: {
      color: colors.text.tertiary,
    },
    comingSoonTag: {
      fontSize: 12,
      color: colors.text.tertiary,
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
    radioInner: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: colors.primary,
    },
    // Secure-redirect notice
    noticeBanner: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing.sm,
      backgroundColor: colors.warningLight ?? colors.surface,
      borderWidth: 1,
      borderColor: colors.warning ?? colors.border,
      borderRadius: 8,
      padding: spacing.md,
    },
    noticeText: {
      flex: 1,
      fontSize: 13,
      color: colors.text.primary,
    },
    // Confirm button
    confirmButton: {
      backgroundColor: colors.primary,
      borderRadius: 8,
      paddingVertical: 14,
      alignItems: 'center',
      justifyContent: 'center',
    },
    confirmButtonDisabled: {
      opacity: 0.6,
    },
    confirmButtonText: {
      fontSize: 16,
      color: colors.text.inverse,
    },
    // Empty state
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
  })
);
