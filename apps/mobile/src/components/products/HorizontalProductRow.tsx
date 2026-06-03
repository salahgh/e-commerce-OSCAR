import React from 'react';
import { View, Text, StyleSheet, FlatList, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter } from 'expo-router';
import { spacing, typography, makeThemedStyles } from '../../theme';
import { productAccessibilityLabel } from '../../utils/a11y';
import { useAppFont } from '../../hooks/useAppFont';

export interface SimpleProduct {
  id: string;
  slug: string;
  name: string;
  imageUrl: string | null;
  price: number;
  currencyCode: string;
}

export function HorizontalProductRow({
  title,
  products,
}: {
  title: string;
  products: SimpleProduct[];
}) {
  const router = useRouter();
  const { fontFamily } = useAppFont();
  const styles = useStyles();
  if (products.length === 0) return null;

  return (
    <View style={styles.section}>
      <Text style={[styles.title, { fontFamily: fontFamily.bold }]}>{title}</Text>
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
            accessibilityRole="button"
            accessibilityLabel={productAccessibilityLabel({
              name: item.name,
              price: item.price,
              currencyCode: item.currencyCode,
            })}
          >
            <View style={styles.thumb}>
              {item.imageUrl ? (
                <Image
                  source={{ uri: item.imageUrl }}
                  style={styles.thumbImage}
                  contentFit="cover"
                />
              ) : null}
            </View>
            <Text style={[styles.cardName, { fontFamily: fontFamily.medium }]} numberOfLines={2}>
              {item.name}
            </Text>
            <Text style={[styles.cardPrice, { fontFamily: fontFamily.semiBold }]}>
              {item.price} {item.currencyCode}
            </Text>
          </Pressable>
        )}
      />
    </View>
  );
}

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
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
  })
);
