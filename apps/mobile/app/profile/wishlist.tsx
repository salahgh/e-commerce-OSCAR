import React from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Pressable } from 'react-native';
import { Image } from 'expo-image';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useWishlist, WishlistEntry } from '../../src/contexts/WishlistContext';
import { Button } from '../../src/components/ui';
import { makeThemedStyles, useThemeColors, spacing, typography } from '../../src/theme';
import { useAppFont } from '../../src/hooks/useAppFont';

export default function WishlistScreen() {
  const { t } = useTranslation();
  const router = useRouter();
  const styles = useStyles();
  const colors = useThemeColors();
  const { fontFamily } = useAppFont();
  const insets = useSafeAreaInsets();
  const { items, remove } = useWishlist();

  const renderItem = ({ item }: { item: WishlistEntry }) => (
    <Pressable
      style={styles.card}
      onPress={() => item.slug && router.push(`/products/${item.slug}` as any)}
    >
      <View style={styles.thumb}>
        {item.imageUrl ? (
          <Image source={{ uri: item.imageUrl }} style={styles.thumbImage} contentFit="cover" />
        ) : null}
      </View>
      <View style={styles.cardBody}>
        <Text style={[styles.cardName, { fontFamily: fontFamily.medium }]} numberOfLines={2}>
          {item.name}
        </Text>
        {item.price !== undefined && (
          <Text style={[styles.cardPrice, { fontFamily: fontFamily.regular }]}>
            {item.price.toLocaleString()} {item.currencyCode ?? 'DZD'}
          </Text>
        )}
      </View>
      <TouchableOpacity
        accessibilityLabel={t('wishlist.remove')}
        onPress={() => remove(item.productId)}
        style={styles.removeBtn}
      >
        <Ionicons name="trash-outline" size={20} color={colors.error} />
      </TouchableOpacity>
    </Pressable>
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
        <FlatList
          data={items}
          keyExtractor={(it) => it.productId}
          renderItem={renderItem}
          contentContainerStyle={[styles.list, { paddingBottom: insets.bottom + spacing.lg }]}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
    list: {
      padding: spacing.lg,
    },
    separator: {
      height: spacing.md,
    },
    card: {
      flexDirection: 'row',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.sm,
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.border,
    },
    thumb: {
      width: 72,
      height: 72,
      borderRadius: 8,
      backgroundColor: colors.background,
      overflow: 'hidden',
    },
    thumbImage: {
      width: '100%',
      height: '100%',
    },
    cardBody: {
      flex: 1,
      paddingHorizontal: spacing.md,
      gap: spacing.xs,
    },
    cardName: {
      ...typography.styles.body,
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
    },
    cardPrice: {
      ...typography.styles.bodySmall,
      color: colors.text.secondary,
    },
    removeBtn: {
      padding: spacing.sm,
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
