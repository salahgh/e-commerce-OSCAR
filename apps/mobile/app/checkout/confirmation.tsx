import React, { useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  withSequence,
  withDelay,
  withTiming,
  Easing,
  interpolate,
  runOnJS,
} from 'react-native-reanimated';
import { Button } from '../../src/components/ui';
import { spacing, typography, makeThemedStyles, useThemeColors } from '../../src/theme';

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    confettiContainer: {
      position: 'absolute',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      zIndex: 10,
      pointerEvents: 'none',
    },
    confettiParticle: {
      position: 'absolute',
    },
    content: {
      flex: 1,
      padding: spacing.xl,
      justifyContent: 'center',
      alignItems: 'center',
    },
    iconWrapper: {
      width: 160,
      height: 160,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing.xl,
    },
    iconBackground: {
      position: 'absolute',
      width: 140,
      height: 140,
      borderRadius: 70,
      backgroundColor: colors.success + '20',
    },
    iconContainer: {
      zIndex: 2,
    },
    pulseRing: {
      position: 'absolute',
      width: 160,
      height: 160,
      borderRadius: 80,
      borderWidth: 2,
      borderColor: colors.success + '30',
    },
    contentAnimated: {
      width: '100%',
      alignItems: 'center',
    },
    title: {
      ...typography.styles.h2,
      color: colors.text.primary,
      fontWeight: typography.fontWeight.bold,
      textAlign: 'center',
      marginBottom: spacing.md,
    },
    message: {
      ...typography.styles.body,
      color: colors.text.secondary,
      textAlign: 'center',
      marginBottom: spacing.xl,
      lineHeight: 24,
    },
    orderNumberContainer: {
      backgroundColor: colors.surface,
      borderRadius: 12,
      padding: spacing.lg,
      marginBottom: spacing.xl,
      width: '100%',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.primary,
      borderStyle: 'dashed',
    },
    orderNumberLabel: {
      ...typography.styles.caption,
      color: colors.text.secondary,
      textTransform: 'uppercase',
      marginBottom: spacing.xs,
    },
    orderNumber: {
      ...typography.styles.h3,
      color: colors.primary,
      fontWeight: typography.fontWeight.bold,
    },
    infoBox: {
      flexDirection: 'row',
      alignItems: 'flex-start',
      gap: spacing.sm,
      backgroundColor: colors.info + '15',
      padding: spacing.md,
      borderRadius: 8,
      marginBottom: spacing.xl,
      width: '100%',
    },
    infoText: {
      ...typography.styles.body,
      color: colors.text.secondary,
      flex: 1,
    },
    actions: {
      width: '100%',
      gap: spacing.md,
    },
    actionButton: {
      // No additional styles needed
    },
    additionalInfo: {
      marginTop: spacing.xl,
      alignItems: 'center',
    },
    additionalInfoText: {
      ...typography.styles.body,
      color: colors.text.secondary,
      marginBottom: spacing.xs,
    },
    additionalInfoLink: {
      ...typography.styles.body,
      color: colors.primary,
      fontWeight: typography.fontWeight.semiBold,
    },
  })
);

export default function OrderConfirmationScreen() {
  const { t } = useTranslation();
  const insets = useSafeAreaInsets();
  const styles = useStyles();
  const colors = useThemeColors();
  const { orderNumber, orderId } = useLocalSearchParams<{
    orderNumber: string;
    orderId: string;
  }>();

  // Animation values
  const iconScale = useSharedValue(0);
  const iconRotation = useSharedValue(0);
  const checkmarkProgress = useSharedValue(0);
  const circleProgress = useSharedValue(0);
  const contentOpacity = useSharedValue(0);
  const contentTranslateY = useSharedValue(30);
  const confettiOpacity = useSharedValue(0);

  // Start animations on mount
  useEffect(() => {
    // Circle background animation
    circleProgress.value = withTiming(1, { duration: 600, easing: Easing.out(Easing.ease) });

    // Icon scale and rotation animation
    iconScale.value = withSequence(
      withDelay(200, withSpring(1.2, { damping: 8 })),
      withSpring(1, { damping: 10 })
    );

    iconRotation.value = withSequence(
      withDelay(200, withTiming(10, { duration: 100 })),
      withTiming(-10, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );

    // Checkmark draw animation
    checkmarkProgress.value = withDelay(
      400,
      withTiming(1, { duration: 400, easing: Easing.out(Easing.ease) })
    );

    // Content fade in
    contentOpacity.value = withDelay(600, withTiming(1, { duration: 400 }));
    contentTranslateY.value = withDelay(600, withSpring(0, { damping: 15 }));

    // Confetti animation
    confettiOpacity.value = withSequence(
      withDelay(500, withTiming(1, { duration: 200 })),
      withDelay(2000, withTiming(0, { duration: 500 }))
    );
  }, []);

  // Animated styles
  const iconContainerStyle = useAnimatedStyle(() => ({
    transform: [{ scale: iconScale.value }, { rotate: `${iconRotation.value}deg` }],
  }));

  const circleStyle = useAnimatedStyle(() => ({
    transform: [{ scale: circleProgress.value }],
    opacity: circleProgress.value,
  }));

  const contentStyle = useAnimatedStyle(() => ({
    opacity: contentOpacity.value,
    transform: [{ translateY: contentTranslateY.value }],
  }));

  const confettiStyle = useAnimatedStyle(() => ({
    opacity: confettiOpacity.value,
  }));

  const handleViewOrder = () => {
    if (orderId) {
      router.replace(`/orders/${orderId}`);
    }
  };

  const handleContinueShopping = () => {
    router.replace('/products');
  };

  const handleGoHome = () => {
    router.replace('/(tabs)');
  };

  // Confetti particles
  const renderConfetti = () => {
    const particles = [];
    const confettiColors = [colors.primary, colors.success, '#FFD700', '#FF69B4', '#00CED1'];

    for (let i = 0; i < 20; i++) {
      const left = Math.random() * 100;
      const top = Math.random() * 40;
      const size = 6 + Math.random() * 8;
      const color = confettiColors[Math.floor(Math.random() * confettiColors.length)];
      const rotation = Math.random() * 360;

      particles.push(
        <Animated.View
          key={i}
          style={[
            styles.confettiParticle,
            confettiStyle,
            {
              left: `${left}%`,
              top: `${top}%`,
              width: size,
              height: size,
              backgroundColor: color,
              transform: [{ rotate: `${rotation}deg` }],
              borderRadius: Math.random() > 0.5 ? size / 2 : 0,
            },
          ]}
        />
      );
    }
    return particles;
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Confetti */}
      <View style={styles.confettiContainer}>{renderConfetti()}</View>

      <View style={styles.content}>
        {/* Success Icon with Animation */}
        <View style={styles.iconWrapper}>
          {/* Background circle */}
          <Animated.View style={[styles.iconBackground, circleStyle]} />

          {/* Animated icon container */}
          <Animated.View style={[styles.iconContainer, iconContainerStyle]}>
            <Ionicons name="checkmark-circle" size={120} color={colors.success} />
          </Animated.View>

          {/* Pulse rings */}
          <Animated.View style={[styles.pulseRing, circleStyle]} />
        </View>

        {/* Animated Content */}
        <Animated.View style={[styles.contentAnimated, contentStyle]}>
          {/* Success Message */}
          <Text style={styles.title}>
            {t('checkout.orderPlaced', 'Order Placed Successfully!')}
          </Text>

          <Text style={styles.message}>
            {t(
              'checkout.orderPlacedMessage',
              'Thank you for your order. We will send you a confirmation email shortly.'
            )}
          </Text>

          {/* Order Number */}
          {orderNumber && (
            <View style={styles.orderNumberContainer}>
              <Text style={styles.orderNumberLabel}>
                {t('checkout.orderNumber', 'Order Number')}
              </Text>
              <Text style={styles.orderNumber}>{orderNumber}</Text>
            </View>
          )}

          {/* Info Box */}
          <View style={styles.infoBox}>
            <Ionicons name="information-circle-outline" size={24} color={colors.info} />
            <Text style={styles.infoText}>
              {t(
                'checkout.trackingInfo',
                'You can track your order status in the "My Orders" section of your profile.'
              )}
            </Text>
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {orderId && (
              <Button
                title={t('checkout.viewOrder', 'View Order Details')}
                onPress={handleViewOrder}
                variant="primary"
                fullWidth
                style={styles.actionButton}
              />
            )}

            <Button
              title={t('checkout.continueShopping', 'Continue Shopping')}
              onPress={handleContinueShopping}
              variant="outline"
              fullWidth
              style={styles.actionButton}
            />

            <Button
              title={t('checkout.goHome', 'Go to Home')}
              onPress={handleGoHome}
              variant="ghost"
              fullWidth
              style={styles.actionButton}
            />
          </View>

          {/* Additional Info */}
          <View style={styles.additionalInfo}>
            <Text style={styles.additionalInfoText}>
              {t('checkout.needHelp', 'Need help with your order?')}
            </Text>
            <Text style={styles.additionalInfoLink}>
              {t('checkout.contactSupport', 'Contact our support team')}
            </Text>
          </View>
        </Animated.View>
      </View>
    </View>
  );
}
