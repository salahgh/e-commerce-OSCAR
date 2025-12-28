import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { ProductResponse } from '../../graphql/generated/graphql';
import { colors, spacing, typography } from '../../theme';
import { Badge } from '../ui';

interface ProductListItemProps {
  product: ProductResponse;
  onPress?: (product: ProductResponse) => void;
  onAddToCart?: (product: ProductResponse) => void;
  showAddToCart?: boolean;
}

export const ProductListItem: React.FC<ProductListItemProps> = ({
  product,
  onPress,
  onAddToCart,
  showAddToCart = true,
}) => {
  const router = useRouter();
  const { i18n, t } = useTranslation();

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

  // Get product description based on current language
  const getDescription = () => {
    switch (i18n.language) {
      case 'ar':
        return product.descriptionAr || product.descriptionFr || product.descriptionEn || '';
      case 'en':
        return product.descriptionEn || product.descriptionFr || product.descriptionAr || '';
      default:
        return product.descriptionFr || product.descriptionEn || product.descriptionAr || '';
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
  const isOutOfStock = (product.stockQuantity || 0) === 0;

  return (
    <TouchableOpacity
      style={styles.container}
      onPress={handlePress}
      activeOpacity={0.7}
    >
      {/* Product Image */}
      <View style={styles.imageContainer}>
        {imageUrl ? (
          <Image
            source={{ uri: imageUrl }}
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons
              name="image-outline"
              size={32}
              color={colors.text.tertiary}
            />
          </View>
        )}

        {/* Discount Badge */}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>-{discountPercentage}%</Text>
          </View>
        )}

        {/* Out of Stock Overlay */}
        {isOutOfStock && (
          <View style={styles.stockOverlay}>
            <Text style={styles.stockText}>Out of Stock</Text>
          </View>
        )}
      </View>

      {/* Product Info */}
      <View style={styles.infoContainer}>
        {/* Category */}
        {product.categoryName && (
          <Text style={styles.category}>{product.categoryName}</Text>
        )}

        {/* Product Name */}
        <Text style={styles.name} numberOfLines={2}>
          {getName()}
        </Text>

        {/* Description */}
        <Text style={styles.description} numberOfLines={2}>
          {getDescription()}
        </Text>

        {/* Price Row */}
        <View style={styles.priceRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{displayPrice?.toFixed(2)} DZD</Text>
            {hasDiscount && (
              <Text style={styles.oldPrice}>{product.basePrice?.toFixed(2)} DZD</Text>
            )}
          </View>

          {/* Add to Cart Button */}
          {showAddToCart && !isOutOfStock && onAddToCart && (
            <TouchableOpacity
              style={styles.addToCartButton}
              onPress={(e) => {
                e.stopPropagation();
                onAddToCart(product);
              }}
              activeOpacity={0.7}
            >
              <Ionicons name="cart-outline" size={20} color={colors.text.inverse} />
            </TouchableOpacity>
          )}
        </View>

        {/* Badges */}
        <View style={styles.badgeRow}>
          {product.isFeatured && (
            <Badge label="Featured" variant="primary" size="small" />
          )}
          {product.isNew && (
            <Badge label="New" variant="success" size="small" />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: 12,
    marginBottom: spacing.md,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: colors.text.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  imageContainer: {
    width: 120,
    height: 140,
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
  discountBadge: {
    position: 'absolute',
    top: spacing.xs,
    left: spacing.xs,
    backgroundColor: colors.error,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: spacing.borderRadius.sm,
  },
  discountText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.inverse,
  },
  stockOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  stockText: {
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.text.inverse,
  },
  infoContainer: {
    flex: 1,
    padding: spacing.md,
    justifyContent: 'space-between',
  },
  category: {
    fontSize: typography.fontSize.xs,
    color: colors.text.tertiary,
    textTransform: 'uppercase',
    marginBottom: spacing.xs,
  },
  name: {
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.semiBold,
    color: colors.text.primary,
    marginBottom: spacing.xs,
  },
  description: {
    fontSize: typography.fontSize.sm,
    color: colors.text.secondary,
    marginBottom: spacing.sm,
    lineHeight: 18,
  },
  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    flexWrap: 'wrap',
  },
  price: {
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  oldPrice: {
    fontSize: typography.fontSize.sm,
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  addToCartButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginTop: spacing.xs,
  },
});
