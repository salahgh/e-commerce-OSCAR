import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { ProductResponse } from '../../graphql/generated/graphql';
import { colors, spacing, typography } from '../../theme';
import { Badge } from '../ui';

interface ProductCardProps {
  product: ProductResponse;
  onPress?: (product: ProductResponse) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ product, onPress }) => {
  const router = useRouter();
  const { i18n } = useTranslation();

  const handlePress = () => {
    if (onPress) {
      onPress(product);
    } else {
      router.push(`/products/${product.id}`);
    }
  };

  // Get product name based on current language
  const getName = () => {
    switch (i18n.language) {
      case 'ar':
        return product.nameAr || product.nameFr || product.nameEn || '';
      case 'en':
        return product.nameEn || product.nameFr || product.nameAr || '';
      default:
        return product.nameFr || product.nameEn || product.nameAr || '';
    }
  };

  // Get first image or placeholder
  const imageUrl = product.imageUrls && product.imageUrls.length > 0 ? product.imageUrls[0] : null;

  // Check if product has sale price
  const hasDiscount = product.salePrice && product.salePrice < (product.basePrice || 0);
  const displayPrice = hasDiscount ? product.salePrice : product.basePrice;

  // Calculate discount percentage
  const discountPercentage = hasDiscount
    ? Math.round(((product.basePrice! - product.salePrice!) / product.basePrice!) * 100)
    : 0;

  // Check stock status
  const isLowStock = (product.stockQuantity || 0) > 0 && (product.stockQuantity || 0) <= 5;
  const isOutOfStock = (product.stockQuantity || 0) === 0;

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

        {/* Badges */}
        <View style={styles.badgeContainer}>
          {product.isFeatured && <Badge label="Featured" variant="primary" size="small" />}
          {hasDiscount && <Badge label={`-${discountPercentage}%`} variant="danger" size="small" />}
        </View>

        {/* Stock Status */}
        {isOutOfStock && (
          <View style={styles.stockOverlay}>
            <Text style={styles.stockText}>Out of Stock</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.info}>
        {/* Category */}
        {product.categoryName && <Text style={styles.category}>{product.categoryName}</Text>}

        {/* Product Name */}
        <Text style={styles.name} numberOfLines={2}>
          {getName()}
        </Text>

        {/* Price */}
        <View style={styles.priceContainer}>
          {hasDiscount && <Text style={styles.oldPrice}>{product.basePrice?.toFixed(2)} DZD</Text>}
          <Text style={styles.price}>{displayPrice?.toFixed(2)} DZD</Text>
        </View>

        {/* Stock Warning */}
        {isLowStock && <Text style={styles.lowStock}>Only {product.stockQuantity} left!</Text>}
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
  badgeContainer: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    flexDirection: 'column',
    gap: spacing.xs,
  },
  stockOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: spacing.sm,
    alignItems: 'center',
  },
  stockText: {
    ...typography.styles.bodySmall,
    color: colors.white,
    fontWeight: typography.fontWeight.semiBold,
  },
  info: {
    padding: spacing.md,
  },
  category: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
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
  oldPrice: {
    ...typography.styles.bodySmall,
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  lowStock: {
    ...typography.styles.caption,
    color: colors.warning,
    fontWeight: typography.fontWeight.medium,
  },
});
