import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PaymentWebView, PaymentStatus } from '../../src/components/payment/PaymentWebView';
import { useTranslation } from 'react-i18next';
import { colors } from '../../src/theme';

/**
 * CIB Payment Gateway Screen
 *
 * This screen handles CIB card payments through a WebView.
 * It receives order information via route params and loads the CIB payment gateway.
 *
 * Expected params:
 * - orderId: string
 * - orderNumber: string
 * - amount: string (numeric)
 */
export default function CIBPaymentScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{
    orderId: string;
    orderNumber: string;
    amount: string;
  }>();

  const [paymentUrl, setPaymentUrl] = useState<string>('');

  useEffect(() => {
    // In a real implementation, you would call an API to get the CIB payment URL
    // For now, we'll construct a mock URL
    // The backend should provide this URL after initiating the payment with CIB
    const initiateCIBPayment = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/payment/cib/initiate', {
        //   method: 'POST',
        //   body: JSON.stringify({
        //     orderId: params.orderId,
        //     amount: params.amount,
        //   }),
        // });
        // const data = await response.json();
        // setPaymentUrl(data.paymentUrl);

        // Mock CIB payment URL for development
        // In production, this should come from your backend after initiating payment with CIB
        const mockCIBUrl = `https://cib-payment-gateway.dz/checkout?orderId=${params.orderId}&amount=${params.amount}&merchantId=YOUR_MERCHANT_ID&returnUrl=${encodeURIComponent(
          'myapp://payment/callback'
        )}`;

        setPaymentUrl(mockCIBUrl);
      } catch (error) {
        Alert.alert(
          t('payment.error', 'Payment Error'),
          t('payment.initError', 'Unable to initialize payment. Please try again.')
        );
        router.back();
      }
    };

    if (params.orderId && params.orderNumber && params.amount) {
      initiateCIBPayment();
    } else {
      Alert.alert(
        t('payment.error', 'Payment Error'),
        t('payment.missingParams', 'Missing payment information.')
      );
      router.back();
    }
  }, [params.orderId, params.orderNumber, params.amount]);

  const handlePaymentComplete = (status: PaymentStatus, transactionId?: string) => {
    switch (status) {
      case 'success':
        router.replace({
          pathname: '/payment/status',
          params: {
            status: 'success',
            orderId: params.orderId,
            orderNumber: params.orderNumber,
            transactionId: transactionId || '',
            paymentMethod: 'CIB',
          },
        });
        break;

      case 'failure':
        router.replace({
          pathname: '/payment/status',
          params: {
            status: 'failure',
            orderId: params.orderId,
            orderNumber: params.orderNumber,
            paymentMethod: 'CIB',
          },
        });
        break;

      case 'cancelled':
        router.replace({
          pathname: '/payment/status',
          params: {
            status: 'cancelled',
            orderId: params.orderId,
            orderNumber: params.orderNumber,
            paymentMethod: 'CIB',
          },
        });
        break;
    }
  };

  if (!paymentUrl) {
    return <View style={styles.container} />;
  }

  return (
    <View style={styles.container}>
      <PaymentWebView
        paymentUrl={paymentUrl}
        orderId={params.orderId}
        orderNumber={params.orderNumber}
        amount={parseFloat(params.amount)}
        onPaymentComplete={handlePaymentComplete}
        successUrlPattern="/payment/success"
        failureUrlPattern="/payment/failure"
        cancelUrlPattern="/payment/cancel"
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
});
