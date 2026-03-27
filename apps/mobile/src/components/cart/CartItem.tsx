import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { CartItemContent, cartItemStyles } from './CartItemContent';
import { colors, spacing } from '../../theme';

export interface CartItemData {
  id: string;
  productId?: string;
  productName?: string;
  productImage?: string | null;
  selectedSize?: string | null;
  selectedColor?: string | null;
  price?: number;
  quantity?: number;
  subtotal?: number;
}

interface CartItemProps {
  item: CartItemData;
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
  const handleRemove = () => {
    if (item.id) {
      onRemove(item.id);
    }
  };

  return (
    <View style={cartItemStyles.container}>
      <CartItemContent
        item={item}
        onUpdateQuantity={onUpdateQuantity}
        loading={loading}
      />

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
  removeButton: {
    padding: spacing.xs,
    marginLeft: spacing.sm,
  },
});
