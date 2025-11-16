import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../theme';

export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'SHIPPED' | 'DELIVERED' | 'CANCELLED';

interface OrderStatusBadgeProps {
  status: OrderStatus;
  size?: 'small' | 'medium' | 'large';
}

export const OrderStatusBadge: React.FC<OrderStatusBadgeProps> = ({ status, size = 'medium' }) => {
  const { t } = useTranslation();

  const getStatusConfig = () => {
    switch (status) {
      case 'PENDING':
        return {
          label: t('orders.status.pending', 'Pending'),
          color: colors.warning,
          backgroundColor: colors.warning + '20',
        };
      case 'CONFIRMED':
        return {
          label: t('orders.status.confirmed', 'Confirmed'),
          color: colors.info,
          backgroundColor: colors.info + '20',
        };
      case 'SHIPPED':
        return {
          label: t('orders.status.shipped', 'Shipped'),
          color: colors.primary,
          backgroundColor: colors.primary + '20',
        };
      case 'DELIVERED':
        return {
          label: t('orders.status.delivered', 'Delivered'),
          color: colors.success,
          backgroundColor: colors.success + '20',
        };
      case 'CANCELLED':
        return {
          label: t('orders.status.cancelled', 'Cancelled'),
          color: colors.error,
          backgroundColor: colors.error + '20',
        };
      default:
        return {
          label: status,
          color: colors.text.secondary,
          backgroundColor: colors.border,
        };
    }
  };

  const config = getStatusConfig();

  const sizeStyles = {
    small: {
      container: styles.containerSmall,
      text: styles.textSmall,
    },
    medium: {
      container: styles.containerMedium,
      text: styles.textMedium,
    },
    large: {
      container: styles.containerLarge,
      text: styles.textLarge,
    },
  };

  return (
    <View
      style={[
        styles.container,
        sizeStyles[size].container,
        { backgroundColor: config.backgroundColor, borderColor: config.color },
      ]}
    >
      <Text style={[sizeStyles[size].text, { color: config.color }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 12,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  containerSmall: {
    paddingHorizontal: spacing.xs,
    paddingVertical: spacing.xxs,
  },
  containerMedium: {
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  containerLarge: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  textSmall: {
    ...typography.styles.caption,
    fontSize: 10,
    fontWeight: typography.fontWeight.semiBold,
  },
  textMedium: {
    ...typography.styles.caption,
    fontWeight: typography.fontWeight.semiBold,
  },
  textLarge: {
    ...typography.styles.bodySmall,
    fontWeight: typography.fontWeight.semiBold,
  },
});
