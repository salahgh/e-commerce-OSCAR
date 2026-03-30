import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { Link, router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTranslation } from 'react-i18next';
import { colors, spacing, typography } from '../../src/theme';
import { useAppFont } from '../../src/hooks/useAppFont';
import Logo from '../../assets/images/logooscarsvg1.svg';

export default function RegisterSuccessScreen() {
  const insets = useSafeAreaInsets();
  const { fontFamily } = useAppFont();
  const { t } = useTranslation();

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

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Logo */}
      <View style={styles.logoContainer}>
        <Logo width={140} height={108} />
      </View>

      {/* Success animation */}
      <View style={styles.successContainer}>
        {/* Rings */}
        <Animated.View style={[styles.ring, { transform: [{ scale: ringScale2 }], opacity: ringOpacity2 }]} />
        <Animated.View style={[styles.ring, { transform: [{ scale: ringScale1 }], opacity: ringOpacity1 }]} />

        {/* Checkmark circle */}
        <Animated.View style={[styles.checkCircle, { transform: [{ scale: scaleAnim }], opacity: opacityAnim }]}>
          <Ionicons name="checkmark" size={36} color={colors.text.primary} />
        </Animated.View>
      </View>

      {/* Text */}
      <Text style={[styles.title, { fontFamily: fontFamily.bold }]}>
        {t('auth.accountCreated')}
      </Text>
      <Text style={[styles.subtitle, { fontFamily: fontFamily.regular }]}>
        {t('auth.welcomeOscar')}
      </Text>

      {/* Spacer */}
      <View style={{ flex: 1 }} />

      {/* Go to home */}
      <View style={[styles.bottomSection, { paddingBottom: insets.bottom + spacing.md }]}>
        <TouchableOpacity
          style={styles.homeButton}
          onPress={() => router.replace('/(tabs)')}
          activeOpacity={0.8}
        >
          <Text style={[styles.homeButtonText, { fontFamily: fontFamily.medium }]}>
            {t('auth.goToHome')}
          </Text>
        </TouchableOpacity>

        <View style={styles.registerContainer}>
          <Text style={[styles.registerText, { fontFamily: fontFamily.regular }]}>
            {t('auth.notRegistered')}{' '}
          </Text>
          <Link href="/(auth)/register" asChild>
            <TouchableOpacity>
              <Text style={[styles.registerLink, { fontFamily: fontFamily.medium }]}>{t('auth.createAccount')}</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
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
  // Success animation
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
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Text
  title: {
    fontSize: 24,
    color: colors.text.primary,
    textAlign: 'center',
    marginBottom: spacing.md,
    lineHeight: 32,
  },
  subtitle: {
    fontSize: 15,
    color: '#6A7282',
    textAlign: 'center',
  },
  // Bottom
  bottomSection: {
    width: '100%',
    paddingTop: spacing.md,
  },
  homeButton: {
    backgroundColor: colors.primary,
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
  },
  homeButtonText: {
    fontSize: 16,
    color: colors.text.inverse,
  },
  registerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: spacing.xl,
  },
  registerText: {
    fontSize: 15,
    color: colors.text.primary,
  },
  registerLink: {
    fontSize: 15,
    color: '#183DE5',
  },
});
