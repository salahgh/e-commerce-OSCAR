import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useGetProductQuery } from '../../src/graphql/generated/graphql';
import { Button, LoadingSpinner, ErrorState, Badge, Chip } from '../../src/components/ui';
import { colors, spacing, typography } from '../../src/theme';
import { useCart } from '../../src/contexts/CartContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const { addToCart, loading: cartLoading } = useCart();

  // State
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);

  // Fetch product details
  const { data, loading, error, refetch } = useGetProductQuery({
    variables: { id: parseInt(id) },
  });

  const product = data?.product;

  // Get product name based on language
  const getName = () => {
    if (!product) return '';
    switch (i18n.language) {
      case 'ar':
        return product.nameAr || product.nameFr || product.nameEn || '';
      case 'en':
        return product.nameEn || product.nameFr || product.nameAr || '';
      default:
        return product.nameFr || product.nameEn || product.nameAr || '';
    }
  };

  // Get product description based on language
  const getDescription = () => {
    if (!product) return '';
    switch (i18n.language) {
      case 'ar':
        return product.descriptionAr || product.descriptionFr || product.descriptionEn || '';
      case 'en':
        return product.descriptionEn || product.descriptionFr || product.descriptionAr || '';
      default:
        return product.descriptionFr || product.descriptionEn || product.descriptionAr || '';
    }
  };

  const handleAddToCart = async () => {
    if (!product?.id) return;

    try {
      setAddingToCart(true);
      setAddToCartSuccess(false);

      await addToCart({
        productId: product.id,
        quantity,
        selectedSize: selectedSize || undefined,
        selectedColor: selectedColor || undefined,
      });

      setAddToCartSuccess(true);

      // Show success message for 2 seconds
      setTimeout(() => {
        setAddToCartSuccess(false);
      }, 2000);

      // Optionally navigate to cart
      // router.push('/cart');
    } catch (error: any) {
      console.error('Add to cart error:', error);
      alert(error.message || t('cart.addToCartError', 'Failed to add item to cart'));
    } finally {
      setAddingToCart(false);
    }
  };

  const incrementQuantity = () => {
    setQuantity((prev) => Math.min(prev + 1, product?.stockQuantity || 99));
  };

  const decrementQuantity = () => {
    setQuantity((prev) => Math.max(prev - 1, 1));
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  if (error || !product) {
    return (
      <ErrorState
        title={t('common.error', 'Error')}
        message={error?.message || t('products.notFound', 'Product not found')}
        onRetry={refetch}
      />
    );
  }

  const hasDiscount = product.salePrice && product.salePrice < (product.basePrice || 0);
  const displayPrice = hasDiscount ? product.salePrice : product.basePrice;
  const discountPercentage = hasDiscount
    ? Math.round(((product.basePrice! - product.salePrice!) / product.basePrice!) * 100)
    : 0;

  const isOutOfStock = (product.stockQuantity || 0) === 0;
  const isLowStock = (product.stockQuantity || 0) > 0 && (product.stockQuantity || 0) <= 5;

  const images = product.imageUrls || [];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          {images.length > 0 ? (
            <>
              <Image
                source={{ uri: images[selectedImageIndex] }}
                style={styles.mainImage}
                resizeMode="cover"
              />

              {/* Badges */}
              <View style={styles.badgeContainer}>
                {product.isFeatured && <Badge label="Featured" variant="primary" />}
                {hasDiscount && <Badge label={`-${discountPercentage}%`} variant="danger" />}
              </View>

              {/* Image Dots */}
              {images.length > 1 && (
                <View style={styles.imageDots}>
                  {images.map((_, index) => (
                    <TouchableOpacity
                      key={index}
                      onPress={() => setSelectedImageIndex(index)}
                      style={[styles.dot, selectedImageIndex === index && styles.dotActive]}
                    />
                  ))}
                </View>
              )}
            </>
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>No Image</Text>
            </View>
          )}
        </View>

        {/* Product Info */}
        <View style={styles.content}>
          {/* Category */}
          {product.categoryName && <Text style={styles.category}>{product.categoryName}</Text>}

          {/* Name */}
          <Text style={styles.name}>{getName()}</Text>

          {/* SKU */}
          {product.sku && <Text style={styles.sku}>SKU: {product.sku}</Text>}

          {/* Price */}
          <View style={styles.priceContainer}>
            {hasDiscount && (
              <Text style={styles.oldPrice}>{product.basePrice?.toFixed(2)} DZD</Text>
            )}
            <Text style={styles.price}>{displayPrice?.toFixed(2)} DZD</Text>
          </View>

          {/* Stock Status */}
          {isOutOfStock ? (
            <Text style={styles.outOfStock}>{t('products.outOfStock', 'Out of Stock')}</Text>
          ) : isLowStock ? (
            <Text style={styles.lowStock}>
              {t('products.onlyLeft', { count: product.stockQuantity })}
            </Text>
          ) : (
            <Text style={styles.inStock}>{t('products.inStock', 'In Stock')}</Text>
          )}

          {/* Description */}
          {getDescription() && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('products.description', 'Description')}</Text>
              <Text style={styles.description}>{getDescription()}</Text>
            </View>
          )}

          {/* Size Selection */}
          {product.availableSizes && product.availableSizes.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('products.selectSize', 'Select Size')}</Text>
              <View style={styles.optionsRow}>
                {product.availableSizes.map((size) => (
                  <Chip
                    key={size}
                    label={size || ''}
                    selected={selectedSize === size}
                    onPress={() => setSelectedSize(size)}
                    style={styles.optionChip}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Color Selection */}
          {product.availableColors && product.availableColors.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('products.selectColor', 'Select Color')}</Text>
              <View style={styles.optionsRow}>
                {product.availableColors.map((color) => (
                  <Chip
                    key={color}
                    label={color || ''}
                    selected={selectedColor === color}
                    onPress={() => setSelectedColor(color)}
                    style={styles.optionChip}
                  />
                ))}
              </View>
            </View>
          )}

          {/* Quantity Selector */}
          {!isOutOfStock && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('products.quantity', 'Quantity')}</Text>
              <View style={styles.quantitySelector}>
                <TouchableOpacity
                  onPress={decrementQuantity}
                  style={styles.quantityButton}
                  disabled={quantity <= 1}
                >
                  <Ionicons
                    name="remove"
                    size={20}
                    color={quantity <= 1 ? colors.text.tertiary : colors.primary}
                  />
                </TouchableOpacity>
                <Text style={styles.quantityText}>{quantity}</Text>
                <TouchableOpacity
                  onPress={incrementQuantity}
                  style={styles.quantityButton}
                  disabled={quantity >= (product.stockQuantity || 0)}
                >
                  <Ionicons
                    name="add"
                    size={20}
                    color={
                      quantity >= (product.stockQuantity || 0)
                        ? colors.text.tertiary
                        : colors.primary
                    }
                  />
                </TouchableOpacity>
              </View>
            </View>
          )}
        </View>
      </ScrollView>

      {/* Bottom Actions */}
      {!isOutOfStock && (
        <View style={styles.bottomActions}>
          <Button
            title={
              addToCartSuccess
                ? t('cart.addedToCart', '✓ Added to Cart')
                : t('products.addToCart', 'Add to Cart')
            }
            onPress={handleAddToCart}
            fullWidth
            loading={addingToCart}
            disabled={
              addingToCart ||
              (product.availableSizes && product.availableSizes.length > 0 && !selectedSize) ||
              (product.availableColors && product.availableColors.length > 0 && !selectedColor)
            }
            variant={addToCartSuccess ? 'secondary' : 'primary'}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    height: SCREEN_WIDTH,
    position: 'relative',
  },
  mainImage: {
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
    ...typography.styles.body,
    color: colors.text.tertiary,
  },
  badgeContainer: {
    position: 'absolute',
    top: spacing.md,
    right: spacing.md,
    flexDirection: 'column',
    gap: spacing.xs,
  },
  imageDots: {
    position: 'absolute',
    bottom: spacing.md,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.white,
    opacity: 0.5,
  },
  dotActive: {
    opacity: 1,
    backgroundColor: colors.primary,
  },
  content: {
    padding: spacing.lg,
  },
  category: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.xs,
    textTransform: 'uppercase',
  },
  name: {
    ...typography.styles.h2,
    color: colors.text.primary,
    marginBottom: spacing.xs,
    fontWeight: typography.fontWeight.bold,
  },
  sku: {
    ...typography.styles.caption,
    color: colors.text.tertiary,
    marginBottom: spacing.md,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  price: {
    ...typography.styles.h2,
    color: colors.primary,
    fontWeight: typography.fontWeight.bold,
  },
  oldPrice: {
    ...typography.styles.body,
    color: colors.text.tertiary,
    textDecorationLine: 'line-through',
  },
  outOfStock: {
    ...typography.styles.body,
    color: colors.error,
    fontWeight: typography.fontWeight.semiBold,
    marginBottom: spacing.lg,
  },
  lowStock: {
    ...typography.styles.body,
    color: colors.warning,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.lg,
  },
  inStock: {
    ...typography.styles.body,
    color: colors.success,
    fontWeight: typography.fontWeight.medium,
    marginBottom: spacing.lg,
  },
  section: {
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    ...typography.styles.h4,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.semiBold,
    marginBottom: spacing.md,
  },
  description: {
    ...typography.styles.body,
    color: colors.text.secondary,
    lineHeight: 24,
  },
  optionsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
  },
  optionChip: {
    marginRight: 0,
  },
  quantitySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  quantityButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: colors.border,
    justifyContent: 'center',
    alignItems: 'center',
  },
  quantityText: {
    ...typography.styles.h3,
    color: colors.text.primary,
    minWidth: 40,
    textAlign: 'center',
  },
  bottomActions: {
    padding: spacing.lg,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
});
