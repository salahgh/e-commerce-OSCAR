import React, { useMemo } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useWishlist } from '../../src/contexts/WishlistContext';
import { Button } from '../../src/components/ui';
import { ProductGrid } from '../../src/components/products';
import { SimpleProduct } from '../../src/components/products/ProductCard';
import { makeThemedStyles, useThemeColors, spacing, typography } from '../../src/theme';
import { useAppFont } from '../../src/hooks/useAppFont';

export default function WishlistScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const styles = useStyles();
  const colors = useThemeColors();
  const { fontFamily } = useAppFont();
  const { items } = useWishlist();

  // Render wishlisted items as the same 2-column rich-card grid the design uses
  // (ProductCardFigma carries the filled wishlist heart, which removes on tap).
  const products = useMemo<SimpleProduct[]>(
    () =>
      items.map((item) => ({
        id: item.productId,
        name: item.name,
        slug: item.slug ?? '',
        imageUrl: item.imageUrl ?? null,
        price: item.price ?? 0,
        inStock: true,
      })),
    [items],
  );

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: t('wishlist.title'), headerBackTitle: '' }} />
      {items.length === 0 ? (
        <View style={styles.empty}>
          <Ionicons name="heart-outline" size={64} color={colors.text.secondary} />
          <Text style={[styles.emptyTitle, { fontFamily: fontFamily.medium }]}>
            {t('wishlist.empty')}
          </Text>
          <Button title={t('wishlist.browse')} onPress={() => router.push('/products')} />
        </View>
      ) : (
        <ProductGrid
          products={products}
          numColumns={2}
          emptyMessage={t('wishlist.empty')}
        />
      )}
    </View>
  );
}

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    empty: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      padding: spacing.xl,
      gap: spacing.md,
    },
    emptyTitle: {
      ...typography.styles.h4,
      color: colors.text.primary,
      textAlign: 'center',
    },
  })
);
