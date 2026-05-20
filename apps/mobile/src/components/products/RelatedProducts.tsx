import React, { useMemo } from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import {
  useGetCollectionWithProductsQuery,
  useGetProductsQuery,
} from '../../graphql/generated/graphql';
import { formatPrice } from '../../utils/vendureAdapters';
import { colors, spacing, typography } from '../../theme';

interface RelatedProductsProps {
  /** Slug of the current product's first collection — pass an empty string to skip the collection query. */
  collectionSlug?: string | null;
  /** Current product id, excluded from the results. */
  currentProductId: string;
}

interface SimpleProduct {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  price: number;
  currencyCode: string;
}

export function RelatedProducts({ collectionSlug, currentProductId }: RelatedProductsProps) {
  const { t } = useTranslation();
  const router = useRouter();

  // Prefer collection siblings; fall back to most-recent products when the
  // current product has no collection (Vendure seed data often does).
  const hasCollection = !!collectionSlug;
  const collectionQuery = useGetCollectionWithProductsQuery({
    variables: { slug: collectionSlug ?? '', take: 12, skip: 0 },
    skip: !hasCollection,
  });
  const recentQuery = useGetProductsQuery({
    variables: { options: { take: 12 } },
    skip: hasCollection,
  });

  const products = useMemo<SimpleProduct[]>(() => {
    const source: any[] = hasCollection
      ? (collectionQuery.data?.collection?.productVariants?.items ?? [])
          .map((v: any) => v.product)
          .filter(Boolean)
      : (recentQuery.data?.products?.items ?? []);

    const seen = new Set<string>([currentProductId]);
    const out: SimpleProduct[] = [];
    for (const p of source) {
      if (!p || seen.has(p.id)) continue;
      seen.add(p.id);
      const variant = p.variants?.[0];
      out.push({
        id: p.id,
        slug: p.slug,
        name: p.name,
        imageUrl: p.featuredAsset?.preview ?? null,
        price: variant ? formatPrice(variant.priceWithTax) : 0,
        currencyCode: variant?.currencyCode ?? 'DZD',
      });
      if (out.length >= 6) break;
    }
    return out;
  }, [hasCollection, collectionQuery.data, recentQuery.data, currentProductId]);

  if (products.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={styles.title}>{t('products.related', 'You may also like')}</Text>
      <FlatList
        data={products}
        keyExtractor={(p) => p.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.list}
        ItemSeparatorComponent={() => <View style={{ width: spacing.md }} />}
        renderItem={({ item }) => (
          <Pressable
            style={styles.card}
            onPress={() => router.push(`/products/${item.slug}` as any)}
          >
            <View style={styles.thumb}>
              {item.imageUrl ? (
                <Image source={{ uri: item.imageUrl }} style={styles.thumbImage} contentFit="cover" />
              ) : null}
            </View>
            <Text style={styles.cardName} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={styles.cardPrice}>
              {item.price} {item.currencyCode}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginTop: spacing.lg,
  },
  title: {
    ...typography.styles.h4,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.bold,
    marginBottom: spacing.md,
    paddingHorizontal: spacing.lg,
  },
  list: {
    paddingHorizontal: spacing.lg,
  },
  card: {
    width: 140,
    gap: spacing.xs,
  },
  thumb: {
    width: 140,
    height: 180,
    borderRadius: 8,
    backgroundColor: colors.surface,
    overflow: 'hidden',
  },
  thumbImage: {
    width: '100%',
    height: '100%',
  },
  cardName: {
    ...typography.styles.bodySmall,
    color: colors.text.primary,
    fontWeight: typography.fontWeight.medium,
  },
  cardPrice: {
    ...typography.styles.bodySmall,
    color: colors.text.secondary,
    fontWeight: typography.fontWeight.semiBold,
  },
});
