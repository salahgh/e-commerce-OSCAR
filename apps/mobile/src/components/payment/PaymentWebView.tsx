import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { WebView, WebViewNavigation } from 'react-native-webview';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../theme';
import { Button } from '../ui';

export type PaymentStatus = 'success' | 'failure' | 'cancelled';

interface PaymentWebViewProps {
  paymentUrl: string;
  orderId: string;
  orderNumber: string;
  amount: number;
  onPaymentComplete: (status: PaymentStatus, transactionId?: string) => void;
  successUrlPattern?: string;
  failureUrlPattern?: string;
  cancelUrlPattern?: string;
}

export const PaymentWebView: React.FC<PaymentWebViewProps> = ({
  paymentUrl,
  orderId,
  orderNumber,
  amount,
  onPaymentComplete,
  successUrlPattern = '/payment/success',
  failureUrlPattern = '/payment/failure',
  cancelUrlPattern = '/payment/cancel',
}) => {
  const { t } = useTranslation();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const webViewRef = useRef<WebView>(null);

  const handleNavigationStateChange = (navState: WebViewNavigation) => {
    const { url } = navState;

    // Check for success pattern
    if (url.includes(successUrlPattern)) {
      setLoading(false);
      const transactionId = extractTransactionId(url);
      onPaymentComplete('success', transactionId);
      return;
    }

    // Check for failure pattern
    if (url.includes(failureUrlPattern)) {
      setLoading(false);
      onPaymentComplete('failure');
      return;
    }

    // Check for cancel pattern
    if (url.includes(cancelUrlPattern)) {
      setLoading(false);
      onPaymentComplete('cancelled');
      return;
    }
  };

  const extractTransactionId = (url: string): string | undefined => {
    try {
      const urlObj = new URL(url);
      return (
        urlObj.searchParams.get('transactionId') || urlObj.searchParams.get('txnId') || undefined
      );
    } catch {
      return undefined;
    }
  };

  const handleWebViewError = () => {
    setError(true);
    setLoading(false);
  };

  const handleReload = () => {
    setError(false);
    setLoading(true);
    webViewRef.current?.reload();
  };

  const handleCancel = () => {
    Alert.alert(
      t('payment.cancelPayment', 'Cancel Payment'),
      t('payment.cancelPaymentMessage', 'Are you sure you want to cancel this payment?'),
      [
        {
          text: t('common.no', 'No'),
          style: 'cancel',
        },
        {
          text: t('common.yes', 'Yes'),
          onPress: () => onPaymentComplete('cancelled'),
        },
      ]
    );
  };

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color={colors.error} />
        <Text style={styles.errorTitle}>{t('payment.loadError', 'Payment Gateway Error')}</Text>
        <Text style={styles.errorMessage}>
          {t('payment.loadErrorMessage', 'Unable to load the payment gateway. Please try again.')}
        </Text>
        <View style={styles.errorActions}>
          <Button title={t('common.retry', 'Retry')} onPress={handleReload} />
          <Button
            title={t('common.cancel', 'Cancel')}
            onPress={() => onPaymentComplete('cancelled')}
            variant="outline"
          />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>{t('payment.securePa yment', 'Secure Payment')}</Text>
          <Text style={styles.headerSubtitle}>
            {t('payment.orderNumber', 'Order')} #{orderNumber}
          </Text>
        </View>
        <Text style={styles.amount}>{amount.toFixed(2)} DZD</Text>
      </View>

      {/* WebView */}
      <View style={styles.webViewContainer}>
        {loading && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color={colors.primary} />
            <Text style={styles.loadingText}>
              {t('payment.loadingGateway', 'Loading payment gateway...')}
            </Text>
          </View>
        )}

        <WebView
          ref={webViewRef}
          source={{ uri: paymentUrl }}
          onNavigationStateChange={handleNavigationStateChange}
          onLoad={() => setLoading(false)}
          onError={handleWebViewError}
          onHttpError={handleWebViewError}
          startInLoadingState={true}
          javaScriptEnabled={true}
          domStorageEnabled={true}
          sharedCookiesEnabled={true}
          style={styles.webView}
        />
      </View>

      {/* Cancel Button */}
      <View style={styles.footer}>
        <Button
          title={t('payment.cancelPayment', 'Cancel Payment')}
          onPress={handleCancel}
          variant="outline"
          fullWidth
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    elevation: 2,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    ...typography.styles.h4,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  headerSubtitle: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  amount: {
    ...typography.styles.h4,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  webViewContainer: {
    flex: 1,
    position: 'relative',
  },
  webView: {
    flex: 1,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: colors.background,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  loadingText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginTop: spacing.md,
  },
  footer: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
    backgroundColor: colors.background,
  },
  errorTitle: {
    ...typography.styles.h3,
    fontWeight: typography.fontWeight.bold,
    color: colors.error,
    marginTop: spacing.lg,
    marginBottom: spacing.sm,
  },
  errorMessage: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
  },
  errorActions: {
    flexDirection: 'row',
    gap: spacing.md,
  },
});
