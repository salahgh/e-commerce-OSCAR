import React, { useEffect, useRef, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ApolloProvider } from '@apollo/client/react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import 'react-native-reanimated';
import { loadSavedLanguage } from '@/src/i18n';
import {
  Gabarito_400Regular,
  Gabarito_500Medium,
  Gabarito_600SemiBold,
  Gabarito_700Bold,
} from '@expo-google-fonts/gabarito';
import {
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
  IBMPlexSansArabic_600SemiBold,
  IBMPlexSansArabic_700Bold,
} from '@expo-google-fonts/ibm-plex-sans-arabic';
import { useFonts } from 'expo-font';

import { apolloClient } from '@/src/apollo/client';
import { useApolloPersistence } from '@/src/hooks/useApolloPersistence';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';
import { CartProvider } from '@/src/contexts/CartContext';
import { WishlistProvider } from '@/src/contexts/WishlistContext';
import { RecentlyViewedProvider } from '@/src/contexts/RecentlyViewedContext';
import { ThemeProvider, useThemeMode } from '@/src/contexts/ThemeContext';
import { ToastProvider , LoadingSpinner } from '@/src/components/ui';
import { MiniCartSheet } from '@/src/components/cart';
import * as NativeSplash from 'expo-splash-screen';
import { SplashOverlay } from '@/src/components/SplashOverlay';

export { AppErrorBoundary as ErrorBoundary } from '@/src/components/AppErrorBoundary';

// Hold the native splash until JS has loaded fonts/lang/cache and the branded
// SplashOverlay has painted — prevents the bare-spinner / home-screen flash.
NativeSplash.preventAutoHideAsync().catch(() => {});

// Routes that require authentication
const PROTECTED_ROUTES = ['checkout', 'orders', 'profile', 'payment'];

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';
    const inOnboarding = segments[0] === 'onboarding';
    const currentRoute = segments[0] as string;

    // Don't redirect while onboarding is showing
    if (inOnboarding) return;

    // Only redirect to login if accessing a protected route without authentication
    if (!isAuthenticated && PROTECTED_ROUTES.includes(currentRoute)) {
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if authenticated and trying to access auth pages
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/*<Stack.Screen name="onboarding" options={{ headerShown: false, animation: 'fade' }} />*/}
      {/*<Stack.Screen name="(auth)" options={{ headerShown: false }} />*/}
      {/*<Stack.Screen name="(tabs)" options={{ headerShown: false }} />*/}
      {/*<Stack.Screen name="search" options={{ headerShown: false }} />*/}
      {/*<Stack.Screen name="products" options={{ headerShown: false }} />*/}
      {/*<Stack.Screen name="checkout" options={{ headerShown: false }} />*/}
      {/*<Stack.Screen name="orders" options={{ headerShown: false }} />*/}
      {/*<Stack.Screen name="profile" options={{ headerShown: false }} />*/}
      {/*<Stack.Screen name="payment" options={{ headerShown: false }} />*/}
    </Stack>
  );
}

function NavigationThemeBridge({ children }: { children: React.ReactNode }) {
  const { resolved } = useThemeMode();
  return (
    <NavigationThemeProvider value={resolved === 'dark' ? DarkTheme : DefaultTheme}>
      {children}
    </NavigationThemeProvider>
  );
}

// Hard ceiling on how long boot may wait for its async gates (fonts, language,
// cache) before releasing anyway. Prevents a never-settling gate from leaving the
// user stuck on the native-splash logo forever.
const BOOT_FAILSAFE_MS = 6000;

export default function RootLayout() {
  const [languageLoaded, setLanguageLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [bootTimedOut, setBootTimedOut] = useState(false);

  const [fontsLoaded, fontError] = useFonts({
    Gabarito_400Regular,
    Gabarito_500Medium,
    Gabarito_600SemiBold,
    Gabarito_700Bold,
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_500Medium,
    IBMPlexSansArabic_600SemiBold,
    IBMPlexSansArabic_700Bold,
  });

  useEffect(() => {
    // `.finally` (not `.then`) so the gate releases even if language loading ever
    // rejects — a saved-language read must never permanently block boot.
    loadSavedLanguage().finally(() => {
      setLanguageLoaded(true);
    });
  }, []);

  const cacheRestored = useApolloPersistence();

  // A font-load failure must never permanently hang boot: useFonts keeps `loaded`
  // false forever on error, so treat an errored load as "ready" and fall back to
  // the system font rather than deadlocking on the native splash.
  const fontsReady = fontsLoaded || !!fontError;

  useEffect(() => {
    if (fontError) {
      console.warn('[boot] font load failed, falling back to system font:', fontError);
    }
  }, [fontError]);

  // Snapshot live gate state for the failsafe's diagnostic log (effect closure
  // below captures mount-time values, which are always false).
  const gateRef = useRef<{ languageLoaded: boolean; fontsReady: boolean; cacheRestored: boolean }>({
    languageLoaded,
    fontsReady,
    cacheRestored,
  });
  gateRef.current = { languageLoaded, fontsReady, cacheRestored };

  useEffect(() => {
    const id = setTimeout(() => {
      const g = gateRef.current;
      if (g.languageLoaded && g.fontsReady && g.cacheRestored) return; // already booted cleanly
      console.warn(
        `[boot] failsafe release after ${BOOT_FAILSAFE_MS}ms — pending gates:`,
        g,
      );
      setBootTimedOut(true);
    }, BOOT_FAILSAFE_MS);
    return () => clearTimeout(id);
  }, []);

  const bootReady = (languageLoaded && fontsReady && cacheRestored) || bootTimedOut;

  if (!bootReady) {
    // Render nothing so the native splash screen stays up (held via
    // preventAutoHideAsync) — no themed spinner flash before the branded overlay.
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ApolloProvider client={apolloClient}>
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <RecentlyViewedProvider>
                  <ThemeProvider>
                    <NavigationThemeBridge>
                      <ToastProvider>
                        <RootNavigator />
                        <MiniCartSheet />
                        {showSplash && <SplashOverlay onFinish={() => setShowSplash(false)} />}
                        <StatusBar style="auto" />
                      </ToastProvider>
                    </NavigationThemeBridge>
                  </ThemeProvider>
                </RecentlyViewedProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </ApolloProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
