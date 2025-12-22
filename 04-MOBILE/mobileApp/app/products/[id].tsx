import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  Share,
  Platform,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useGetProductQuery } from '../../src/graphql/generated/graphql';
import { Button, LoadingSpinner, ErrorState, Badge, Chip } from '../../src/components/ui';
import { ImageCarousel } from '../../src/components/products';
import { colors, spacing, typography } from '../../src/theme';
import { useCart } from '../../src/contexts/CartContext';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t, i18n } = useTranslation();
  const insets = useSafeAreaInsets();
  const { addToCart, loading: cartLoading } = useCart();

  // State
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

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

  // Share product
  const handleShare = useCallback(async () => {
    if (!product) return;

    const productName = getName();
    const productUrl = `https://oscar-fashion.com/products/${product.id}`;
    const price = product.salePrice || product.basePrice;

    try {
      await Share.share({
        message: Platform.OS === 'ios'
          ? `Check out ${productName} - ${price?.toFixed(2)} DZD`
          : `Check out ${productName} - ${price?.toFixed(2)} DZD\n${productUrl}`,
        url: Platform.OS === 'ios' ? productUrl : undefined,
        title: productName,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  }, [product]);

  // Toggle favorite
  const handleToggleFavorite = useCallback(() => {
    setIsFavorite((prev) => !prev);
    // TODO: Implement favorite/wishlist API call
  }, []);

  // Go back
  const handleGoBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  }, []);

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
      {/* Floating Header */}
      <View style={[styles.floatingHeader, { top: insets.top + spacing.sm }]}>
        <TouchableOpacity
          style={styles.floatingButton}
          onPress={handleGoBack}
          activeOpacity={0.8}
        >
          <Ionicons name="arrow-back" size={24} color={colors.text.primary} />
        </TouchableOpacity>

        <View style={styles.floatingActions}>
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={handleToggleFavorite}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isFavorite ? 'heart' : 'heart-outline'}
              size={24}
              color={isFavorite ? colors.error : colors.text.primary}
            />
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.floatingButton}
            onPress={handleShare}
            activeOpacity={0.8}
          >
            <Ionicons name="share-outline" size={24} color={colors.text.primary} />
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Image Gallery with Carousel */}
        <View style={styles.imageContainer}>
          <ImageCarousel
            images={images}
            height={SCREEN_WIDTH}
            showThumbnails={images.length > 1}
            showIndicators={images.length > 1}
            enableZoom
          />

          {/* Badges */}
          <View style={styles.badgeContainer}>
            {product.isFeatured && <Badge label="Featured" variant="primary" />}
            {hasDiscount && <Badge label={`-${discountPercentage}%`} variant="danger" />}
          </View>
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
  floatingHeader: {
    position: 'absolute',
    left: spacing.md,
    right: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 100,
  },
  floatingButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  floatingActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  imageContainer: {
    width: SCREEN_WIDTH,
    position: 'relative',
  },
  badgeContainer: {
    position: 'absolute',
    top: spacing.md + 60, // Below floating header
    right: spacing.md,
    flexDirection: 'column',
    gap: spacing.xs,
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
