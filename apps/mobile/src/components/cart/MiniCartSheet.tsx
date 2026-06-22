import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  Pressable,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { useCart } from '../../contexts/CartContext';
import { spacing, typography, makeThemedStyles, useThemeColors } from '../../theme';
import { Button } from '../ui';
import { useAppFont } from '../../hooks/useAppFont';

/**
 * Global mini-cart bottom sheet, mounted in app/_layout.tsx.
 * Opens automatically after addToCart succeeds (set in CartContext); the user
 * can also open it manually via openMiniCart() from the cart icon.
 */
export function MiniCartSheet() {
  const { t } = useTranslation();
  const router = useRouter();
  const colors = useThemeColors();
  const styles = useStyles();
  const { fontFamily } = useAppFont();
  const { items, itemCount, subTotal, isMiniCartOpen, closeMiniCart } = useCart();

  const go = (path: string) => {
    closeMiniCart();
    router.push(path as any);
  };

  return (
    <Modal
      visible={isMiniCartOpen}
      transparent
      animationType="slide"
      onRequestClose={closeMiniCart}
    >
      <Pressable style={styles.backdrop} onPress={closeMiniCart}>
        <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
          <View style={styles.handle} />

          <View style={styles.header}>
            <Text style={[styles.title, { fontFamily: fontFamily.bold }]}>
              {t('miniCart.title')}
              {itemCount > 0 ? ` (${itemCount})` : ''}
            </Text>
            <TouchableOpacity onPress={closeMiniCart} accessibilityLabel={t('common.close')}>
              <Ionicons name="close" size={24} color={colors.text.primary} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.list} contentContainerStyle={styles.listContent}>
            {items.map((item) => (
              <View key={item.id} style={styles.row}>
                <View style={styles.thumb}>
                  {item.imageUrl ? (
                    <Image
                      source={{ uri: item.imageUrl }}
                      style={styles.thumbImage}
                      contentFit="cover"
                    />
                  ) : null}
                </View>
                <View style={styles.rowBody}>
                  <Text
                    style={[styles.rowName, { fontFamily: fontFamily.medium }]}
                    numberOfLines={1}
                  >
                    {item.productName}
                  </Text>
                  <Text
                    style={[styles.rowVariant, { fontFamily: fontFamily.regular }]}
                    numberOfLines={1}
                  >
                    {item.variantName} · ×{item.quantity}
                  </Text>
                </View>
                <Text style={[styles.rowPrice, { fontFamily: fontFamily.semiBold }]}>
                  {item.linePrice.toLocaleString()} {t('common.currency', 'DZD')}
                </Text>
              </View>
            ))}
          </ScrollView>

          <View style={styles.footer}>
            <View style={styles.subtotalRow}>
              <Text style={[styles.subtotalLabel, { fontFamily: fontFamily.regular }]}>
                {t('miniCart.subtotal')}
              </Text>
              <Text style={[styles.subtotalValue, { fontFamily: fontFamily.bold }]}>
                {subTotal.toLocaleString()} {t('common.currency', 'DZD')}
              </Text>
            </View>
            <Button title={t('miniCart.checkout')} onPress={() => go('/checkout')} />
            <View style={{ height: spacing.sm }} />
            <Button
              title={t('miniCart.viewCart')}
              variant="outline"
              onPress={() => go('/(tabs)/cart')}
            />
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: 'rgba(0,0,0,0.4)',
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: colors.background,
      borderTopLeftRadius: 24,
      borderTopRightRadius: 24,
      paddingHorizontal: spacing.lg,
      paddingTop: spacing.sm,
      paddingBottom: spacing.lg,
      maxHeight: '80%',
    },
    handle: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: colors.border,
      marginBottom: spacing.md,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    title: {
      ...typography.styles.h3,
      color: colors.text.primary,
      fontWeight: typography.fontWeight.bold,
    },
    list: {
      flexGrow: 0,
    },
    listContent: {
      gap: spacing.sm,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.sm,
      gap: spacing.md,
    },
    thumb: {
      width: 48,
      height: 48,
      borderRadius: 8,
      backgroundColor: colors.background,
      overflow: 'hidden',
    },
    thumbImage: {
      width: '100%',
      height: '100%',
    },
    rowBody: {
      flex: 1,
      gap: 2,
    },
    rowName: {
      ...typography.styles.body,
      color: colors.text.primary,
      fontWeight: typography.fontWeight.medium,
    },
    rowVariant: {
      ...typography.styles.caption,
      color: colors.text.secondary,
    },
    rowPrice: {
      ...typography.styles.body,
      color: colors.text.primary,
      fontWeight: typography.fontWeight.semiBold,
    },
    footer: {
      marginTop: spacing.md,
      borderTopWidth: 1,
      borderTopColor: colors.border,
      paddingTop: spacing.md,
    },
    subtotalRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: spacing.md,
    },
    subtotalLabel: {
      ...typography.styles.body,
      color: colors.text.secondary,
    },
    subtotalValue: {
      ...typography.styles.h4,
      color: colors.text.primary,
      fontWeight: typography.fontWeight.bold,
    },
  })
);
