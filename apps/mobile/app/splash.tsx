import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, StatusBar, Text } from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { spacing, typography, makeThemedStyles } from '../src/theme';
import Logo from '../assets/images/logooscarsvg1.svg';

const ONBOARDING_KEY = '@oscar_onboarding_complete';

export default function SplashScreen() {
  const router = useRouter();
  const { t } = useTranslation();
  const styles = useStyles();

  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.8)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    startAnimations();
  }, []);

  const startAnimations = () => {
    Animated.sequence([
      // Logo fades in with a subtle scale
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          friction: 8,
          tension: 40,
          useNativeDriver: true,
        }),
      ]),

      // Tagline fades in
      Animated.timing(taglineOpacity, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),

      // Hold
      Animated.delay(1200),

      // Exit fade out
      Animated.timing(exitOpacity, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigateNext();
    });
  };

  const navigateNext = async () => {
    try {
      const hasCompletedOnboarding = await AsyncStorage.getItem(ONBOARDING_KEY);

      if (hasCompletedOnboarding === 'true') {
        router.replace('/(tabs)');
      } else {
        router.replace('/onboarding');
      }
    } catch (error) {
      console.error('Error checking onboarding status:', error);
      router.replace('/onboarding');
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View></View>
      <Animated.View style={[styles.content, { opacity: exitOpacity }]}>
        {/* Logo */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: logoOpacity,
              transform: [{ scale: logoScale }],
            },
          ]}
        >
          <Logo width={206} height={158} />
        </Animated.View>

        {/* Tagline */}
        <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
          {t('common.tagline')}
        </Animated.Text>
      </Animated.View>
    </View>
  );
}

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
    },
    content: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing['2xl'],
    },
    logoContainer: {
      width: 206,
      height: 158,
    },
    tagline: {
      ...typography.styles.h4,
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.medium,
      color: colors.text.secondary,
      textAlign: 'center',
      width: 315,
    },
  })
);
