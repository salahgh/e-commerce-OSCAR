import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { colors, spacing, typography } from '../../theme';

export interface SimpleProduct {
  id: string;
  name: string;
  slug: string;
  description?: string;
  imageUrl?: string | null;
  price: string | number;
  originalPrice?: string | number | null;
  discountPercent?: number | null;
  inStock?: boolean;
}

interface ProductCardProps {
  product: SimpleProduct;
  onPress?: (product: SimpleProduct) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const router = useRouter();

  const handlePress = () => {
    if (onPress) {
      onPress(product);
    } else {
      router.push(`/products/${product.slug}`);
    }
  };

  const imageUrl = product.imageUrl || null;
  const isOutOfStock = product.inStock === false;

  return (
    <TouchableOpacity style={styles.card} onPress={handlePress} activeOpacity={0.7}>
      {/* Product Image */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
        ) : (
          <View style={styles.placeholderImage}>
            <Text style={styles.placeholderText}>No Image</Text>
          </View>
        )}

        {/* Stock Status */}
        {isOutOfStock && (
          <View style={styles.stockOverlay}>
            <Text style={styles.stockText}>Out of Stock</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.info}>
        {/* Product Name */}
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>

        {/* Price */}
        <View style={styles.priceContainer}>
          <Text style={styles.price}>{product.price} DZD</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: spacing.md,
    elevation: 2,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    width: '100%',
    height: 200,
    position: 'relative',
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
  placeholderText: {
    ...typography.styles.bodySmall,
    color: colors.text.tertiary,
  },
  stockOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: colors.overlayDark,
    padding: spacing.sm,
    alignItems: 'center',
  },
  stockText: {
    ...typography.styles.bodySmall,
    color: colors.text.inverse,
    fontWeight: typography.fontWeight.semiBold,
  },
  info: {
    padding: spacing.md,
  },
  name: {
    ...typography.styles.body,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.sm,
    minHeight: 40,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  price: {
    ...typography.styles.h4,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
});
