import React from 'react';
import { View, Text, StyleSheet, Image, ScrollView } from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { CartItemData } from '../cart/CartItem';
import { spacing, typography, makeThemedStyles, useThemeColors } from '../../theme';
import { Divider } from '../ui';
import { useAppFont } from '../../hooks/useAppFont';

interface OrderSummaryProps {
  items: CartItemData[];
  subtotal: number;
  shippingCost: number;
  total: number;
  showItems?: boolean;
}

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.lg,
      elevation: 2,
      shadowColor: colors.text.primary,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4,
    },
    title: {
      ...typography.styles.h4,
      color: colors.text.primary,
      fontWeight: typography.fontWeight.bold,
      marginBottom: spacing.md,
    },
    itemsList: {
      maxHeight: 200,
      marginBottom: spacing.md,
    },
    item: {
      flexDirection: 'row',
      marginBottom: spacing.md,
    },
    itemImageContainer: {
      width: 60,
      height: 60,
      borderRadius: 8,
      overflow: 'hidden',
      marginRight: spacing.md,
    },
    itemImage: {
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
    itemDetails: {
      flex: 1,
    },
    itemName: {
      ...typography.styles.bodySmall,
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
      marginBottom: spacing.xs,
    },
    itemAttributes: {
      flexDirection: 'row',
      gap: spacing.sm,
      marginBottom: spacing.xs,
    },
    itemAttribute: {
      ...typography.styles.caption,
      color: colors.text.secondary,
    },
    itemPriceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    itemQuantity: {
      ...typography.styles.caption,
      color: colors.text.secondary,
    },
    itemPrice: {
      ...typography.styles.bodySmall,
      fontWeight: typography.fontWeight.semiBold,
      color: colors.text.primary,
    },
    itemCount: {
      paddingVertical: spacing.md,
    },
    itemCountText: {
      ...typography.styles.body,
      color: colors.text.secondary,
    },
    divider: {
      marginVertical: spacing.md,
    },
    summaryRows: {
      gap: spacing.sm,
    },
    summaryRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    summaryLabel: {
      ...typography.styles.body,
      color: colors.text.secondary,
    },
    summaryValue: {
      ...typography.styles.body,
      fontWeight: typography.fontWeight.medium,
      color: colors.text.primary,
    },
    totalRow: {
      marginTop: spacing.sm,
    },
    totalLabel: {
      ...typography.styles.h4,
      fontWeight: typography.fontWeight.bold,
      color: colors.text.primary,
    },
    totalValue: {
      ...typography.styles.h4,
      fontWeight: typography.fontWeight.bold,
      color: colors.primary,
    },
  })
);

export const OrderSummary: React.FC<OrderSummaryProps> = ({
  items,
  subtotal,
  shippingCost,
  total,
  showItems = true,
}) => {
  const { t } = useTranslation();
  const styles = useStyles();
  const colors = useThemeColors();
  const { fontFamily } = useAppFont();

  return (
    <View style={styles.container}>
      <Text style={[styles.title, { fontFamily: fontFamily.bold }]}>
        {t('checkout.orderSummary', 'Order Summary')}
      </Text>

      {showItems && (
        <ScrollView style={styles.itemsList} showsVerticalScrollIndicator={false}>
          {items.map((item) => (
            <View key={item.id} style={styles.item}>
              <View style={styles.itemImageContainer}>
                {item.productImage ? (
                  <Image
                    source={{ uri: item.productImage }}
                    style={styles.itemImage}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholderImage}>
                    <Ionicons name="image-outline" size={24} color={colors.text.tertiary} />
                  </View>
                )}
              </View>

              <View style={styles.itemDetails}>
                <Text
                  style={[styles.itemName, { fontFamily: fontFamily.medium }]}
                  numberOfLines={2}
                >
                  {item.productName}
                </Text>

                {(item.selectedSize || item.selectedColor) && (
                  <View style={styles.itemAttributes}>
                    {item.selectedSize && (
                      <Text style={[styles.itemAttribute, { fontFamily: fontFamily.regular }]}>
                        Size: {item.selectedSize}
                      </Text>
                    )}
                    {item.selectedColor && (
                      <Text style={[styles.itemAttribute, { fontFamily: fontFamily.regular }]}>
                        Color: {item.selectedColor}
                      </Text>
                    )}
                  </View>
                )}

                <View style={styles.itemPriceRow}>
                  <Text style={[styles.itemQuantity, { fontFamily: fontFamily.regular }]}>
                    Qty: {item.quantity}
                  </Text>
                  <Text style={[styles.itemPrice, { fontFamily: fontFamily.semiBold }]}>
                    {item.subtotal?.toFixed(2)} DZD
                  </Text>
                </View>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {!showItems && (
        <View style={styles.itemCount}>
          <Text style={[styles.itemCountText, { fontFamily: fontFamily.regular }]}>
            {t('checkout.itemsCount', { count: items.length })} ({items.length})
          </Text>
        </View>
      )}

      <Divider style={styles.divider} />

      {/* Summary Rows */}
      <View style={styles.summaryRows}>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { fontFamily: fontFamily.regular }]}>
            {t('checkout.subtotal', 'Subtotal')}
          </Text>
          <Text style={[styles.summaryValue, { fontFamily: fontFamily.medium }]}>
            {subtotal.toFixed(2)} DZD
          </Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={[styles.summaryLabel, { fontFamily: fontFamily.regular }]}>
            {t('checkout.shipping', 'Shipping')}
          </Text>
          <Text style={[styles.summaryValue, { fontFamily: fontFamily.medium }]}>
            {shippingCost > 0 ? `${shippingCost.toFixed(2)} DZD` : t('checkout.free', 'Free')}
          </Text>
        </View>

        <Divider style={styles.divider} />

        <View style={[styles.summaryRow, styles.totalRow]}>
          <Text style={[styles.totalLabel, { fontFamily: fontFamily.bold }]}>
            {t('checkout.total', 'Total')}
          </Text>
          <Text style={[styles.totalValue, { fontFamily: fontFamily.bold }]}>
            {total.toFixed(2)} DZD
          </Text>
        </View>
      </View>
    </View>
  );
};
