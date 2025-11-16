import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { Button } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/theme';

export default function OrderConfirmationScreen() {
  const { t } = useTranslation();
  const { orderNumber, orderId } = useLocalSearchParams<{
    orderNumber: string;
    orderId: string;
  }>();

  const handleViewOrder = () => {
    if (orderId) {
      router.replace(`/orders/${orderId}`);
    }
  };

  const handleContinueShopping = () => {
    router.replace('/products');
  };

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  return (
    <View style={styles.container}>
      <View style={styles.content}>
        {/* Success Icon */}
        <View style={styles.iconContainer}>
          <Ionicons name="checkmark-circle" size={120} color={colors.success} />
        </View>

        {/* Success Message */}
        <Text style={styles.title}>{t('checkout.orderPlaced', 'Order Placed Successfully!')}</Text>

        <Text style={styles.message}>
          {t(
            'checkout.orderPlacedMessage',
            'Thank you for your order. We will send you a confirmation email shortly.'
          )}
        </Text>

        {/* Order Number */}
        {orderNumber && (
          <View style={styles.orderNumberContainer}>
            <Text style={styles.orderNumberLabel}>{t('checkout.orderNumber', 'Order Number')}</Text>
            <Text style={styles.orderNumber}>{orderNumber}</Text>
          </View>
        )}

        {/* Info Box */}
        <View style={styles.infoBox}>
          <Ionicons name="information-circle-outline" size={24} color={colors.info} />
          <Text style={styles.infoText}>
            {t(
              'checkout.trackingInfo',
              'You can track your order status in the "My Orders" section of your profile.'
            )}
          </Text>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          {orderId && (
            <Button
              title={t('checkout.viewOrder', 'View Order Details')}
              onPress={handleViewOrder}
              variant="primary"
              fullWidth
              style={styles.actionButton}
            />
          )}

          <Button
            title={t('checkout.continueShopping', 'Continue Shopping')}
            onPress={handleContinueShopping}
            variant="outline"
            fullWidth
            style={styles.actionButton}
          />

          <Button
            title={t('checkout.goHome', 'Go to Home')}
            onPress={handleGoHome}
            variant="ghost"
            fullWidth
            style={styles.actionButton}
          />
        </View>

        {/* Additional Info */}
        <View style={styles.additionalInfo}>
          <Text style={styles.additionalInfoText}>
            {t('checkout.needHelp', 'Need help with your order?')}
          </Text>
          <Text style={styles.additionalInfoLink}>
            {t('checkout.contactSupport', 'Contact our support team')}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    padding: spacing['2xl'],
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: spacing.xl,
  },
  title: {
    ...typography.styles.h2,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
    textAlign: 'center',
    marginBottom: spacing.md,
  },
  message: {
    ...typography.styles.body,
    color: colors.text.secondary,
    textAlign: 'center',
    marginBottom: spacing.xl,
    lineHeight: 24,
  },
  orderNumberContainer: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.lg,
    marginBottom: spacing.xl,
    width: '100%',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderStyle: 'dashed',
  },
  orderNumberLabel: {
    ...typography.styles.caption,
    color: colors.text.secondary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  orderNumber: {
    ...typography.styles.h3,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.info + '15',
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.xl,
    width: '100%',
  },
  infoText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    flex: 1,
  },
  actions: {
    width: '100%',
    gap: spacing.md,
  },
  actionButton: {
    // No additional styles needed
  },
  additionalInfo: {
    marginTop: spacing.xl,
    alignItems: 'center',
  },
  additionalInfoText: {
    ...typography.styles.body,
    color: colors.text.secondary,
    marginBottom: spacing.xs,
  },
  additionalInfoLink: {
    ...typography.styles.body,
    color: colors.primary,
    fontWeight: typography.fontWeight.semiBold,
  },
});
