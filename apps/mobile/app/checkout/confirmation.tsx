import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Animated } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { spacing, makeThemedStyles, useThemeColors } from '../../src/theme';
import { useAppFont } from '../../src/hooks/useAppFont';
import Logo from '../../assets/images/logooscarsvg1.svg';

// Mirrors the register-success screen so the two "success" moments share the
// Figma success pattern (logo + concentric-ring checkmark + title + actions),
// matching design node 84:10429.
export default function OrderConfirmationScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const colors = useThemeColors();
  const { fontFamily } = useAppFont();
  const { orderNumber, orderId } = useLocalSearchParams<{
    orderNumber: string;
    orderId: string;
  }>();

  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const ringScale1 = useRef(new Animated.Value(0.5)).current;
  const ringScale2 = useRef(new Animated.Value(0.5)).current;
  const ringOpacity1 = useRef(new Animated.Value(0)).current;
  const ringOpacity2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.spring(scaleAnim, { toValue: 1, friction: 6, tension: 40, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 400, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(ringScale1, { toValue: 1.5, duration: 800, useNativeDriver: true }),
        Animated.timing(ringOpacity1, { toValue: 0.15, duration: 400, useNativeDriver: true }),
        Animated.timing(ringScale2, { toValue: 2, duration: 1000, useNativeDriver: true }),
        Animated.timing(ringOpacity2, { toValue: 0.08, duration: 500, useNativeDriver: true }),
      ]),
    ]).start();
  }, []);

  const handleBackHome = () => router.replace('/(tabs)');
  const handleTrackOrder = () => {
    router.replace(orderId ? `/orders/${orderId}` : '/(tabs)/orders');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Logo width={140} height={108} />
      </View>

      {/* Success animation */}
      <View style={styles.successContainer}>
        <Animated.View
          style={[styles.ring, { transform: [{ scale: ringScale2 }], opacity: ringOpacity2 }]}
        />
        <Animated.View
          style={[styles.ring, { transform: [{ scale: ringScale1 }], opacity: ringOpacity1 }]}
        />
        <Animated.View
          style={[styles.checkCircle, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}
        >
          <Ionicons name="checkmark" size={36} color={colors.text.primary} />
        </Animated.View>
      </View>

      {/* Text */}
      <Text style={[styles.title, { fontFamily: fontFamily.bold }]}>
        {t('checkout.orderConfirmedTitle', 'Your order is confirmed')}
      </Text>
      {orderNumber ? (
        <Text style={[styles.subtitle, { fontFamily: fontFamily.regular }]}>
          {t('checkout.orderNumber', 'Order Number')}: #{orderNumber}
        </Text>
      ) : null}

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Actions */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + spacing.md }]}>
        <View style={styles.buttonRow}>
          <TouchableOpacity
            style={[styles.button, styles.primaryButton]}
            onPress={handleBackHome}
            activeOpacity={0.8}
          >
            <Text style={[styles.primaryButtonText, { fontFamily: fontFamily.medium }]}>
              {t('checkout.backToHome', 'Back to home')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.button, styles.outlineButton]}
            onPress={handleTrackOrder}
            activeOpacity={0.8}
          >
            <Text style={[styles.outlineButtonText, { fontFamily: fontFamily.medium }]}>
              {t('checkout.trackOrder', 'Track order')}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
      alignItems: 'center',
      paddingHorizontal: spacing.xl,
    },
    logoContainer: {
      marginTop: spacing['3xl'],
      marginBottom: spacing['4xl'],
    },
    successContainer: {
      width: 200,
      height: 200,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing['3xl'],
    },
    ring: {
      position: 'absolute',
      width: 120,
      height: 120,
      borderRadius: 60,
      borderWidth: 1,
      borderColor: colors.border,
    },
    checkCircle: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: colors.gray[2],
      justifyContent: 'center',
      alignItems: 'center',
    },
    title: {
      fontSize: 24,
      color: colors.text.primary,
      textAlign: 'center',
      marginBottom: spacing.md,
      lineHeight: 32,
    },
    subtitle: {
      fontSize: 15,
      color: colors.text.secondary,
      textAlign: 'center',
    },
    bottomSection: {
      width: '100%',
      paddingTop: spacing.md,
    },
    buttonRow: {
      flexDirection: 'row',
      gap: spacing.md,
    },
    button: {
      flex: 1,
      borderRadius: 8,
      paddingVertical: 16,
      alignItems: 'center',
      justifyContent: 'center',
    },
    primaryButton: {
      backgroundColor: colors.primary,
    },
    primaryButtonText: {
      fontSize: 16,
      color: colors.text.inverse,
    },
    outlineButton: {
      backgroundColor: colors.surface,
      borderWidth: 1,
      borderColor: colors.border,
    },
    outlineButtonText: {
      fontSize: 16,
      color: colors.text.primary,
    },
  })
);
