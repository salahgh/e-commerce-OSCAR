import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { CartItemResponse } from '../../graphql/generated/graphql';
import { colors, spacing, typography } from '../../theme';

interface CartItemProps {
  item: CartItemResponse;
  onUpdateQuantity: (itemId: number, quantity: number) => void;
  onRemove: (itemId: number) => void;
  loading?: boolean;
}

export const CartItem: React.FC<CartItemProps> = ({
  item,
  onUpdateQuantity,
  onRemove,
  loading = false,
}) => {
  const { t } = useTranslation();

  const handleProductPress = () => {
    if (item.productId) {
      router.push(`/products/${item.productId}`);
    }
  };

  const incrementQuantity = () => {
    if (item.id) {
      onUpdateQuantity(item.id, (item.quantity || 0) + 1);
    }
  };

  const decrementQuantity = () => {
    if (item.id && (item.quantity || 0) > 1) {
      onUpdateQuantity(item.id, (item.quantity || 0) - 1);
    }
  };

  const handleRemove = () => {
    if (item.id) {
      onRemove(item.id);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.imageContainer} onPress={handleProductPress}>
        {item.productImage ? (
          <Image source={{ uri: item.productImage }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={32} color={colors.text.tertiary} />
          </View>
        )}
      </TouchableOpacity>

      <View style={styles.details}>
        <TouchableOpacity onPress={handleProductPress}>
          <Text style={styles.productName} numberOfLines={2}>
            {item.productName}
          </Text>
        </TouchableOpacity>

        {/* Size and Color */}
        {(item.selectedSize || item.selectedColor) && (
          <View style={styles.attributes}>
            {item.selectedSize && <Text style={styles.attribute}>Size: {item.selectedSize}</Text>}
            {item.selectedColor && (
              <Text style={styles.attribute}>Color: {item.selectedColor}</Text>
            )}
          </View>
        )}

        {/* Price */}
        <Text style={styles.price}>{item.price?.toFixed(2)} DZD</Text>

        {/* Quantity Controls */}
        <View style={styles.quantityRow}>
          <View style={styles.quantityControls}>
            <TouchableOpacity
              onPress={decrementQuantity}
              style={[
                styles.quantityButton,
                (item.quantity || 0) <= 1 && styles.quantityButtonDisabled,
              ]}
              disabled={loading || (item.quantity || 0) <= 1}
            >
              <Ionicons
                name="remove"
                size={16}
                color={(item.quantity || 0) <= 1 ? colors.text.tertiary : colors.primary}
              />
            </TouchableOpacity>

            <Text style={styles.quantity}>{item.quantity}</Text>

            <TouchableOpacity
              onPress={incrementQuantity}
              style={styles.quantityButton}
              disabled={loading}
            >
              <Ionicons name="add" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Subtotal */}
          <Text style={styles.subtotal}>{item.subtotal?.toFixed(2)} DZD</Text>
        </View>
      </View>

      {/* Remove Button */}
      <TouchableOpacity
        style={styles.removeButton}
        onPress={handleRemove}
        disabled={loading}
        hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      >
        <Ionicons name="trash-outline" size={20} color={colors.error} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.md,
    elevation: 1,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  imageContainer: {
    width: 80,
    height: 80,
    borderRadius: 8,
    overflow: 'hidden',
    marginRight: spacing.md,
  },
  image: {
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
  details: {
    flex: 1,
    justifyContent: 'space-between',
  },
  productName: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  attributes: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  attribute: {
    ...typography.styles.caption,
    color: colors.text.secondary,
  },
  price: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  quantityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  quantityControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  quantityButton: {
    width: 28,
    height: 28,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  quantityButtonDisabled: {
    opacity: 0.5,
  },
  quantity: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.medium,
    color: colors.text.primary,
    minWidth: 24,
    textAlign: 'center',
  },
  subtotal: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.primary,
  },
  removeButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
});
