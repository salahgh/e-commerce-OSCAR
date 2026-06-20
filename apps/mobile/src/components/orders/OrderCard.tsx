import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { OrderStatusBadge, OrderStatus } from './OrderStatusBadge';
import { colors, spacing, typography } from '../../theme';
import { rtlIcon } from '../../utils/rtl';

interface OrderItem {
  id: number;
  productName: string;
  productImage?: string | null;
  quantity: number;
  price: number;
  subtotal: number;
}

interface OrderCardProps {
  id: number;
  orderNumber: string;
  status: OrderStatus;
  totalAmount: number;
  itemCount: number;
  items: OrderItem[];
  createdAt: string;
  onPress?: () => void;
}

export const OrderCard: React.FC<OrderCardProps> = ({
  id,
  orderNumber,
  status,
  totalAmount,
  itemCount,
  items,
  createdAt,
  onPress,
}) => {
  const { t } = useTranslation();
  const router = useRouter();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-GB', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  const handlePress = () => {
    if (onPress) {
      onPress();
    } else {
      router.push(`/orders/${id}`);
    }
  };

  // Show first 2 product images
  const displayItems = items.slice(0, 2);

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress} activeOpacity={0.7}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.orderNumber}>#{orderNumber}</Text>
          <Text style={styles.date}>{formatDate(createdAt)}</Text>
        </View>
        <OrderStatusBadge status={status} size="small" />
      </View>

      {/* Product Images Preview */}
      <View style={styles.productsPreview}>
        {displayItems.map((item, index) => (
          <View
            key={item.id}
            style={[styles.productImageContainer, index > 0 && styles.productImageOverlap]}
          >
            {item.productImage ? (
              <Image
                source={{ uri: item.productImage }}
                style={styles.productImage}
                resizeMode="cover"
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="image-outline" size={20} color={colors.text.tertiary} />
              </View>
            )}
          </View>
        ))}
        {itemCount > 2 && (
          <View style={styles.moreItemsContainer}>
            <Text style={styles.moreItemsText}>+{itemCount - 2}</Text>
          </View>
        )}
        <Text style={styles.itemCount}>
          {itemCount} {itemCount === 1 ? t('orders.item', 'item') : t('orders.items', 'items')}
        </Text>
      </View>

      <View style={styles.footer}>
        <View style={styles.totalContainer}>
          <Text style={styles.totalLabel}>{t('orders.total', 'Total')}:</Text>
          <Text style={styles.totalAmount}>{totalAmount.toFixed(2)} DZD</Text>
        </View>
        <View style={styles.viewButton}>
          <Text style={styles.viewButtonText}>{t('orders.viewDetails', 'View Details')}</Text>
          <Ionicons name={rtlIcon('chevron-forward')} size={16} color={colors.primary} />
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    padding: spacing.md,
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerLeft: {
    flex: 1,
  },
  orderNumber: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
    marginBottom: spacing.xxs,
  },
  date: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  productsPreview: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  productImageContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  productImageOverlap: {
    marginLeft: -16,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  moreItemsContainer: {
    width: 48,
    height: 48,
    borderRadius: 8,
    backgroundColor: colors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -16,
    borderWidth: 2,
    borderColor: colors.surface,
  },
  moreItemsText: {
    ...typography.styles.bodySmall,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  itemCount: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    marginLeft: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  totalLabel: {
    ...typography.styles.body,
    color: colors.text.secondary,
  },
  totalAmount: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  viewButtonText: {
    ...typography.styles.bodySmall,
    color: colors.primary,
    fontWeight: typography.fontWeight.medium,
  },
});
