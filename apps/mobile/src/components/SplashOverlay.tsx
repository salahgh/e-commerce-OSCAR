import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import * as NativeSplash from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { spacing, typography, makeThemedStyles } from '../theme';
import Logo from '../../assets/images/logooscarsvg1.svg';

const ONBOARDING_KEY = '@oscar_onboarding_complete';

/**
 * Branded launch splash, rendered as a full-screen OVERLAY on top of the navigator
 * (not as a router route). This is what fixes the "home renders, then the splash
 * appears" bug: the cold-launch URL `/` is owned by `(tabs)/index` (home), so a
 * `/splash` route can never reliably display first. As an overlay it simply covers
 * whatever the router mounts until the intro animation finishes, while the onboarding
 * redirect happens invisibly underneath.
 *
 * It also owns the hand-off from the native splash screen: it calls
 * `NativeSplash.hideAsync()` on its first layout, so the native OSCAR splash stays up
 * until this overlay has painted — zero flash between the two.
 */
export function SplashOverlay({ onFinish }: { onFinish: () => void }) {
  const router = useRouter();
  const { t } = useTranslation();
  const styles = useStyles();

  // Logo starts FULLY VISIBLE so the overlay is pixel-identical to the native
  // splash at the hand-off moment — animating it in from opacity:0/scale:0.8
  // made the logo blink out and fade back in right after `hideAsync()`, which
  // read as the splash "flickering". Only the tagline animates in now.
  const logoOpacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  // Decide the destination ONCE, up front, while the overlay still fully covers
  // the screen. This must fire exactly once: `router` is not a stable dependency
  // in expo-router, so keying the effect on it (or letting it re-run) turns the
  // onboarding redirect into an infinite replace→re-render→replace loop — which
  // showed up as the whole splash flickering forever on first launch (the only
  // time onboarding is incomplete and the redirect actually runs). A ref guard +
  // run-once effect makes the redirect idempotent.
  const didRedirect = useRef(false);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (didRedirect.current) return;
      let done: string | null = null;
      try {
        done = await AsyncStorage.getItem(ONBOARDING_KEY);
      } catch {
        done = null;
      }
      if (cancelled || didRedirect.current) return;
      if (done !== 'true') {
        didRedirect.current = true;
        router.replace('/onboarding');
      }
    })();
    return () => {
      cancelled = true;
    };
    // Run once on mount — see comment above; `router` intentionally omitted.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    Animated.sequence([
      Animated.timing(taglineOpacity, { toValue: 1, duration: 400, useNativeDriver: true }),
      Animated.delay(900),
      Animated.timing(exitOpacity, { toValue: 0, duration: 300, useNativeDriver: true }),
    ]).start(({ finished }) => {
      if (finished) onFinish();
    });
    // animations are ref-stable; run once on mount
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Hand off from the native splash exactly when this overlay first paints.
  const handleLayout = useCallback(() => {
    NativeSplash.hideAsync().catch(() => {});
  }, []);

  return (
    <Animated.View style={[StyleSheet.absoluteFill, styles.container, { opacity: exitOpacity }]} onLayout={handleLayout}>
      <StatusBar style="auto" />
      <Animated.View
        style={[styles.logoContainer, { opacity: logoOpacity, transform: [{ scale: logoScale }] }]}
      >
        <Logo width={206} height={158} />
      </Animated.View>
      <Animated.Text style={[styles.tagline, { opacity: taglineOpacity }]}>
        {t('common.tagline')}
      </Animated.Text>
    </Animated.View>
  );
}

const useStyles = makeThemedStyles((colors) =>
  StyleSheet.create({
    container: {
      backgroundColor: colors.surface,
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing['2xl'],
      zIndex: 999,
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
