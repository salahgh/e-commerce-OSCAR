import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { Button } from '../../src/components/ui';
import { useCart } from '../../src/contexts/CartContext';
import { colors, spacing, typography } from '../../src/theme';

type PaymentStatusType = 'success' | 'failure' | 'cancelled';

/**
 * Payment Status Screen
 *
 * Displays the result of a payment transaction (success, failure, or cancelled).
 *
 * Expected params:
 * - status: 'success' | 'failure' | 'cancelled'
 * - orderId: string
 * - orderNumber: string
 * - transactionId?: string (only for success)
 * - paymentMethod: 'CIB' | 'BARIDIMOB'
 */
export default function PaymentStatusScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const { clearCart } = useCart();
  const params = useLocalSearchParams<{
    status: PaymentStatusType;
    orderId: string;
    orderNumber: string;
    transactionId?: string;
    paymentMethod: string;
  }>();

  const status = params.status || 'failure';

  // Clear cart on successful payment
  useEffect(() => {
    if (status === 'success') {
      clearCart();
    }
  }, [status]);

  const getStatusConfig = () => {
    switch (status) {
      case 'success':
        return {
          icon: 'checkmark-circle' as keyof typeof Ionicons.glyphMap,
          iconColor: colors.success,
          title: t('payment.success.title', 'Payment Successful!'),
          message: t(
            'payment.success.message',
            'Your payment has been processed successfully. Your order is confirmed and will be shipped soon.'
          ),
          showTransactionId: true,
          showOrderNumber: true,
          actions: [
            {
              label: t('payment.viewOrder', 'View Order'),
              onPress: () => router.replace(`/orders/${params.orderId}`),
              variant: 'primary' as const,
            },
            {
              label: t('payment.continueShopping', 'Continue Shopping'),
              onPress: () => router.replace('/products'),
              variant: 'outline' as const,
            },
            {
              label: t('payment.goHome', 'Go to Home'),
              onPress: () => router.replace('/(tabs)/home'),
              variant: 'outline' as const,
            },
          ],
        };

      case 'failure':
        return {
          icon: 'close-circle' as keyof typeof Ionicons.glyphMap,
          iconColor: colors.error,
          title: t('payment.failure.title', 'Payment Failed'),
          message: t(
            'payment.failure.message',
            'Unfortunately, your payment could not be processed. Please try again or use a different payment method.'
          ),
          showTransactionId: false,
          showOrderNumber: true,
          actions: [
            {
              label: t('payment.tryAgain', 'Try Again'),
              onPress: () => router.replace(`/checkout`),
              variant: 'primary' as const,
            },
            {
              label: t('payment.contactSupport', 'Contact Support'),
              onPress: () => router.push('/support'),
              variant: 'outline' as const,
            },
            {
              label: t('payment.goHome', 'Go to Home'),
              onPress: () => router.replace('/(tabs)/home'),
              variant: 'outline' as const,
            },
          ],
        };

      case 'cancelled':
        return {
          icon: 'ban' as keyof typeof Ionicons.glyphMap,
          iconColor: colors.text.secondary,
          title: t('payment.cancelled.title', 'Payment Cancelled'),
          message: t(
            'payment.cancelled.message',
            'You have cancelled the payment. Your order is still pending. You can complete the payment anytime.'
          ),
          showTransactionId: false,
          showOrderNumber: true,
          actions: [
            {
              label: t('payment.completePayment', 'Complete Payment'),
              onPress: () => router.replace(`/checkout`),
              variant: 'primary' as const,
            },
            {
              label: t('payment.viewOrder', 'View Order'),
              onPress: () => router.replace(`/orders/${params.orderId}`),
              variant: 'outline' as const,
            },
            {
              label: t('payment.goHome', 'Go to Home'),
              onPress: () => router.replace('/(tabs)/home'),
              variant: 'outline' as const,
            },
          ],
        };

      default:
        return {
          icon: 'alert-circle' as keyof typeof Ionicons.glyphMap,
          iconColor: colors.text.secondary,
          title: t('payment.unknown.title', 'Unknown Status'),
          message: t('payment.unknown.message', 'Payment status is unknown.'),
          showTransactionId: false,
          showOrderNumber: false,
          actions: [
            {
              label: t('payment.goHome', 'Go to Home'),
              onPress: () => router.replace('/(tabs)/home'),
              variant: 'primary' as const,
            },
          ],
        };
    }
  };

  const config = getStatusConfig();

  const getPaymentMethodDisplay = () => {
    switch (params.paymentMethod) {
      case 'CIB':
        return 'CIB Card';
      case 'BARIDIMOB':
        return 'BaridiMob';
      default:
        return params.paymentMethod;
    }
  };

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
      {/* Status Icon */}
      <View style={styles.iconContainer}>
        <Ionicons name={config.icon} size={100} color={config.iconColor} />
      </View>

      {/* Title */}
      <Text style={styles.title}>{config.title}</Text>

      {/* Message */}
      <Text style={styles.message}>{config.message}</Text>

      {/* Order Information */}
      <View style={styles.infoContainer}>
        {config.showOrderNumber && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('payment.orderNumber', 'Order Number')}:</Text>
            <Text style={styles.infoValue}>#{params.orderNumber}</Text>
          </View>
        )}

        {config.showTransactionId && params.transactionId && (
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>{t('payment.transactionId', 'Transaction ID')}:</Text>
            <Text style={styles.infoValue}>{params.transactionId}</Text>
          </View>
        )}

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>{t('payment.paymentMethod', 'Payment Method')}:</Text>
          <Text style={styles.infoValue}>{getPaymentMethodDisplay()}</Text>
        </View>
      </View>

      {/* Additional Info for Success */}
      {status === 'success' && (
        <View style={styles.successInfoBox}>
          <Ionicons name="information-circle-outline" size={20} color={colors.success} />
          <Text style={styles.successInfoText}>
            {t(
              'payment.success.trackingInfo',
              'You will receive email confirmation and tracking information shortly.'
            )}
          </Text>
        </View>
      )}

      {/* Additional Info for Failure */}
      {status === 'failure' && (
        <View style={styles.errorInfoBox}>
          <Ionicons name="alert-circle-outline" size={20} color={colors.error} />
          <Text style={styles.errorInfoText}>
            {t(
              'payment.failure.commonReasons',
              'Common reasons: Insufficient funds, incorrect card details, or network issues.'
            )}
          </Text>
        </View>
      )}

      {/* Actions */}
      <View style={styles.actionsContainer}>
        {config.actions.map((action, index) => (
          <Button
            key={index}
            title={action.label}
            onPress={action.onPress}
            variant={action.variant}
            fullWidth
            style={index < config.actions.length - 1 ? styles.actionButton : undefined}
          />
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  contentContainer: {
    padding: spacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    marginTop: spacing.xxl,
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.styles.h2,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  message: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    paddingHorizontal: spacing.md,
    lineHeight: 24,
  },
  infoContainer: {
    width: '100%',
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.lg,
    elevation: 1,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  infoLabel: {
    ...typography.styles.body,
    color: colors.text.secondary,
    flex: 1,
  },
  infoValue: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
    flex: 1,
    textAlign: 'right',
  },
  successInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.success + '15',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.xl,
    width: '100%',
  },
  successInfoText: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    flex: 1,
  },
  errorInfoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.error + '15',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.xl,
    width: '100%',
  },
  errorInfoText: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    flex: 1,
  },
  actionsContainer: {
    width: '100%',
    gap: spacing.md,
  },
  actionButton: {
    marginBottom: spacing.sm,
  },
});
