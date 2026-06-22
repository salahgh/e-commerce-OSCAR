import React, { useCallback, useEffect, useRef } from 'react';
import { StyleSheet, Animated } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useRouter, useRootNavigationState } from 'expo-router';
import * as NativeSplash from 'expo-splash-screen';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useTranslation } from 'react-i18next';
import { spacing, typography, makeThemedStyles } from '../theme';
import Logo from '../../assets/images/logooscarsvg1.svg';

const ONBOARDING_KEY = '@oscar_onboarding_complete';

// MODULE-LEVEL, not a component ref: the onboarding redirect must fire at most
// ONCE per app process. A per-instance `useRef` does not survive a root-layout
// remount, so calling `router.replace('/onboarding')` (which itself remounts the
// gated root) handed each fresh SplashOverlay a fresh ref → the redirect re-fired
// every remount → the splash logo flickered forever and never advanced. A
// module-scoped flag is immune to remounts and breaks that cycle.
let onboardingRedirectFired = false;

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

  // The root navigator must be fully mounted before we navigate. `key` is
  // undefined until the <Stack> has committed; redirecting before then is what
  // remounted the gated root layout and started the flicker loop.
  const navState = useRootNavigationState();
  const navReady = !!navState?.key;

  // Logo starts FULLY VISIBLE so the overlay is pixel-identical to the native
  // splash at the hand-off moment — animating it in from opacity:0/scale:0.8
  // made the logo blink out and fade back in right after `hideAsync()`, which
  // read as the splash "flickering". Only the tagline animates in now.
  const logoOpacity = useRef(new Animated.Value(1)).current;
  const logoScale = useRef(new Animated.Value(1)).current;
  const taglineOpacity = useRef(new Animated.Value(0)).current;
  const exitOpacity = useRef(new Animated.Value(1)).current;

  // Decide the destination while the overlay still fully covers the screen, but
  // only AFTER the navigator is ready and only ONCE per app process (see the
  // module-level guard above). Both conditions are load-bearing: navigating too
  // early remounts the gated root, and a non-process-scoped guard re-fires across
  // remounts — either one reintroduces the infinite splash-flicker loop.
  useEffect(() => {
    if (!navReady || onboardingRedirectFired) return;
    let cancelled = false;
    (async () => {
      let done: string | null = null;
      try {
        done = await AsyncStorage.getItem(ONBOARDING_KEY);
      } catch {
        done = null;
      }
      if (cancelled || onboardingRedirectFired) return;
      if (done !== 'true') {
        onboardingRedirectFired = true;
        router.replace('/onboarding');
      }
    })();
    return () => {
      cancelled = true;
    };
    // `router` intentionally omitted (unstable identity in expo-router).
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [navReady]);

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
      // Figma splash (node 7:52) specifies gray-600 #4A5565 for the tagline, a
      // neutral slate rather than the navy-tinted text.secondary. Splash is
      // always light, so the literal is safe.
      color: '#4A5565',
      textAlign: 'center',
      width: 315,
    },
  })
);
