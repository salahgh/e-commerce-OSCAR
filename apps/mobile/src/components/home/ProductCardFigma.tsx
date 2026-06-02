import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { colors, spacing, typography } from '../../theme';
import { useAppFont } from '../../hooks/useAppFont';
import { productAccessibilityLabel } from '../../utils/a11y';

export interface FigmaProduct {
  id: string;
  name: string;
  slug: string;
  imageUrl?: string | null;
  price: string | number;
  originalPrice?: string | number | null;
  discountPercent?: number | null;
  rating?: number;
  reviewCount?: number;
  inStock?: boolean;
}

interface ProductCardFigmaProps {
  product: FigmaProduct;
  onPress?: (product: FigmaProduct) => void;
  onWishlistPress?: (product: FigmaProduct) => void;
  width?: number;
}

const STAR_COLOR = '#F2C94C';
const STAR_EMPTY_COLOR = '#D1D5DC';
const BORDER_COLOR = '#D1D5DC';

export const ProductCardFigma: React.FC<ProductCardFigmaProps> = ({
  product,
  onPress,
  onWishlistPress,
  width = 170,
}) => {
  const router = useRouter();
  const { fontFamily } = useAppFont();
  const imageSize = width - 15;

  const handlePress = () => {
    if (onPress) {
      onPress(product);
    } else {
      router.push(`/products/${product.slug}`);
    }
  };

  const handleWishlist = () => {
    onWishlistPress?.(product);
  };

  const hasDiscount = product.discountPercent && product.discountPercent > 0;
  const rating = product.rating ?? 0;
  const reviewCount = product.reviewCount ?? 0;

  return (
    <TouchableOpacity
      style={[styles.card, { width }]}
      onPress={handlePress}
      activeOpacity={0.8}
      accessibilityRole="button"
      accessibilityLabel={productAccessibilityLabel({ name: product.name, price: typeof product.price === 'number' ? product.price : undefined, currencyCode: 'DZD' })}
    >
      {/* Image Container */}
      <View style={[styles.imageContainer, { width: imageSize, height: imageSize }]}>
        <Image
          source={product.imageUrl ? { uri: product.imageUrl } : undefined}
          style={styles.image}
          contentFit="cover"
          placeholder={{ blurhash: 'L6PZfSi_.AyE_3t7t7R**0o#DgR4' }}
          transition={200}
        />

        {/* Discount Badge — top-left */}
        {hasDiscount && (
          <View style={styles.discountBadge}>
            <Text style={[styles.discountText, { fontFamily: fontFamily.medium }]}>
              -{product.discountPercent}%
            </Text>
          </View>
        )}

        {/* Wishlist Heart — bottom-right of image */}
        <TouchableOpacity
          style={styles.heartButton}
          onPress={handleWishlist}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="heart-outline" size={12} color={colors.text.primary} />
        </TouchableOpacity>
      </View>

      {/* Product Name */}
      <Text
        style={[styles.name, { fontFamily: fontFamily.medium }]}
        numberOfLines={2}
      >
        {product.name}
      </Text>

      {/* Star Rating + Review Count */}
      <View style={styles.ratingRow}>
        <Text style={[styles.reviewCount, { fontFamily: fontFamily.medium }]}>
          ({reviewCount})
        </Text>
        {[1, 2, 3, 4, 5].map((star) => (
          <Ionicons
            key={star}
            name="star"
            size={11}
            color={star <= Math.round(rating) ? STAR_COLOR : STAR_EMPTY_COLOR}
          />
        ))}
      </View>

      {/* Price */}
      <View style={styles.priceRow}>
        <Text style={[styles.price, { fontFamily: fontFamily.bold }]}>
          {typeof product.price === 'number'
            ? product.price.toLocaleString()
            : product.price}{' '}
          DZD
        </Text>
        {hasDiscount && product.originalPrice && (
          <Text style={styles.originalPrice}>
            {typeof product.originalPrice === 'number'
              ? product.originalPrice.toLocaleString()
              : product.originalPrice}{' '}
            DZD
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: 7,
    borderWidth: 0.46,
    borderColor: BORDER_COLOR,
    padding: 8,
    gap: 8,
  },
  imageContainer: {
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
    alignSelf: 'center',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  discountBadge: {
    position: 'absolute',
    top: 7,
    left: 4,
    backgroundColor: '#FFE5E5',
    borderWidth: 1,
    borderColor: '#EB3E3E',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  discountText: {
    fontSize: 10,
    color: '#B22F2F',
    lineHeight: 16,
  },
  heartButton: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    width: 23,
    height: 23,
    borderRadius: 230,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  name: {
    fontSize: 12,
    color: '#1E1E1E',
    lineHeight: 18,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  reviewCount: {
    fontSize: 8,
    color: '#1E1E1E',
    marginRight: 2,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: 14,
    color: '#1E1E1E',
    lineHeight: 21,
  },
  originalPrice: {
    fontSize: 11,
    color: '#999',
    textDecorationLine: 'line-through',
    lineHeight: 16,
  },
});
