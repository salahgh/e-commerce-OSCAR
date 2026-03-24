import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Alert } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { PaymentWebView, PaymentStatus } from '../../src/components/payment/PaymentWebView';
import { useTranslation } from 'react-i18next';
import { colors } from '../../src/theme';

/**
 * BaridiMob Payment Gateway Screen
 *
 * This screen handles BaridiMob mobile wallet payments through a WebView.
 * It receives order information via route params and loads the BaridiMob payment gateway.
 *
 * Expected params:
 * - orderId: string
 * - orderNumber: string
 * - amount: string (numeric)
 */
export default function BaridiMobPaymentScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const params = useLocalSearchParams<{
    orderId: string;
    orderNumber: string;
    amount: string;
  }>();

  const [paymentUrl, setPaymentUrl] = useState<string>('');

  useEffect(() => {
    // In a real implementation, you would call an API to get the BaridiMob payment URL
    // For now, we'll construct a mock URL
    // The backend should provide this URL after initiating the payment with BaridiMob
    const initiateBaridiMobPayment = async () => {
      try {
        // TODO: Replace with actual API call
        // const response = await fetch('/api/payment/baridimob/initiate', {
        //   method: 'POST',
        //   body: JSON.stringify({
        //     orderId: params.orderId,
        //     amount: params.amount,
        //   }),
        // });
        // const data = await response.json();
        // setPaymentUrl(data.paymentUrl);

        // Mock BaridiMob payment URL for development
        // In production, this should come from your backend after initiating payment with BaridiMob
        const mockBaridiMobUrl = `https://baridimob.dz/payment?orderId=${params.orderId}&amount=${params.amount}&merchantId=YOUR_MERCHANT_ID&callback=${encodeURIComponent(
          'myapp://payment/callback'
        )}`;

        setPaymentUrl(mockBaridiMobUrl);
      } catch (error) {
        Alert.alert(
          t('payment.error', 'Payment Error'),
          t('payment.initError', 'Unable to initialize payment. Please try again.')
        );
        router.back();
      }
    };

    if (params.orderId && params.orderNumber && params.amount) {
      initiateBaridiMobPayment();
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
            paymentMethod: 'BARIDIMOB',
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
            paymentMethod: 'BARIDIMOB',
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
            paymentMethod: 'BARIDIMOB',
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
