import React, { useState, useCallback, useMemo } from 'react';
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
import { formatPrice } from '../../src/utils/vendureAdapters';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const { addToCart, loading: cartLoading } = useCart();

  const [selectedOptions, setSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState(1);
  const [addingToCart, setAddingToCart] = useState(false);
  const [addToCartSuccess, setAddToCartSuccess] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  const { data, loading, error, refetch } = useGetProductQuery({
    variables: { id },
  });

  const product = data?.product;

  // Get unique option groups from variants
  const optionGroups = useMemo(() => {
    if (!product?.variants) return [];

    const groups: Record<string, Set<string>> = {};

    product.variants.forEach((variant: any) => {
      variant.options?.forEach((option: any) => {
        const groupName = option.group?.name || 'Option';
        if (!groups[groupName]) {
          groups[groupName] = new Set();
        }
        groups[groupName].add(option.name);
      });
    });

    return Object.entries(groups).map(([name, values]) => ({
      name,
      values: Array.from(values),
    }));
  }, [product]);

  // Find matching variant based on selected options
  const selectedVariant = useMemo(() => {
    if (!product?.variants || product.variants.length === 0) return null;
    if (product.variants.length === 1) return product.variants[0];

    return product.variants.find((variant: any) => {
      return variant.options?.every((option: any) => {
        const groupName = option.group?.name || 'Option';
        return selectedOptions[groupName] === option.name;
      });
    }) || product.variants[0];
  }, [product, selectedOptions]);

  const handleOptionSelect = (groupName: string, value: string) => {
    setSelectedOptions(prev => ({
      ...prev,
      [groupName]: value,
    }));
  };

  const handleShare = useCallback(async () => {
    if (!product) return;

    const productUrl = `https://oscar-fashion.com/products/${product.slug}`;
    const price = selectedVariant ? formatPrice(selectedVariant.priceWithTax) : 0;

    try {
      await Share.share({
        message: Platform.OS === 'ios'
          ? `Check out ${product.name} - ${price} DZD`
          : `Check out ${product.name} - ${price} DZD\n${productUrl}`,
        url: Platform.OS === 'ios' ? productUrl : undefined,
        title: product.name,
      });
    } catch (error) {
      console.error('Share error:', error);
    }
  }, [product, selectedVariant]);

  const handleToggleFavorite = useCallback(() => {
    setIsFavorite((prev) => !prev);
  }, []);

  const handleGoBack = useCallback(() => {
    if (router.canGoBack()) {
      router.back();
    } else {
      router.push('/');
    }
  }, []);

  const handleAddToCart = async () => {
    if (!selectedVariant?.id) return;

    try {
      setAddingToCart(true);
      setAddToCartSuccess(false);

      await addToCart(selectedVariant.id, quantity);

      setAddToCartSuccess(true);
      setTimeout(() => {
        setAddToCartSuccess(false);
      }, 2000);
    } catch (error: any) {
      console.error('Add to cart error:', error);
      alert(error.message || t('cart.addToCartError', 'Failed to add item to cart'));
    } finally {
      setAddingToCart(false);
    }
  };

  const incrementQuantity = () => {
    setQuantity((prev) => prev + 1);
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

  const price = selectedVariant ? formatPrice(selectedVariant.priceWithTax) : 0;
  const stockLevel = selectedVariant?.stockLevel || 'OUT_OF_STOCK';
  const isOutOfStock = stockLevel === 'OUT_OF_STOCK';
  const isLowStock = stockLevel === 'LOW_STOCK';

  const images = [
    product.featuredAsset?.preview,
    ...(product.assets?.map((a: any) => a.preview) || []),
  ].filter(Boolean);

  const collectionName = product.collections?.[0]?.name;

  // Check if all required options are selected
  const allOptionsSelected = optionGroups.every(group => selectedOptions[group.name]);
  const canAddToCart = !isOutOfStock && (optionGroups.length === 0 || allOptionsSelected);

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
        {/* Image Gallery */}
        <View style={styles.imageContainer}>
          <ImageCarousel
            images={images}
            height={SCREEN_WIDTH}
            showThumbnails={images.length > 1}
            showIndicators={images.length > 1}
            enableZoom
          />
        </View>

        {/* Product Info */}
        <View style={styles.content}>
          {/* Collection/Category */}
          {collectionName && <Text style={styles.category}>{collectionName}</Text>}

          {/* Name */}
          <Text style={styles.name}>{product.name}</Text>

          {/* SKU */}
          {selectedVariant?.sku && <Text style={styles.sku}>SKU: {selectedVariant.sku}</Text>}

          {/* Price */}
          <View style={styles.priceContainer}>
            <Text style={styles.price}>{price} DZD</Text>
          </View>

          {/* Stock Status */}
          {isOutOfStock ? (
            <Text style={styles.outOfStock}>{t('products.outOfStock', 'Out of Stock')}</Text>
          ) : isLowStock ? (
            <Text style={styles.lowStock}>{t('products.lowStock', 'Low Stock')}</Text>
          ) : (
            <Text style={styles.inStock}>{t('products.inStock', 'In Stock')}</Text>
          )}

          {/* Description */}
          {product.description && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t('products.description', 'Description')}</Text>
              <Text style={styles.description}>{product.description}</Text>
            </View>
          )}

          {/* Option Selection (Size, Color, etc.) */}
          {optionGroups.map((group) => (
            <View key={group.name} style={styles.section}>
              <Text style={styles.sectionTitle}>
                {t(`products.select${group.name}`, `Select ${group.name}`)}
              </Text>
              <View style={styles.optionsRow}>
                {group.values.map((value) => (
                  <Chip
                    key={value}
                    label={value}
                    selected={selectedOptions[group.name] === value}
                    onPress={() => handleOptionSelect(group.name, value)}
                    style={styles.optionChip}
                  />
                ))}
              </View>
            </View>
          ))}

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
                >
                  <Ionicons name="add" size={20} color={colors.primary} />
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
                ? t('cart.addedToCart', 'Added to Cart')
                : t('products.addToCart', 'Add to Cart')
            }
            onPress={handleAddToCart}
            fullWidth
            loading={addingToCart}
            disabled={addingToCart || !canAddToCart}
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
