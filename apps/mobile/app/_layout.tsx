import React, { useEffect, useState } from 'react';
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

export default function RootLayout() {
  const [languageLoaded, setLanguageLoaded] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const [fontsLoaded] = useFonts({
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
    loadSavedLanguage().then(() => {
      setLanguageLoaded(true);
    });
  }, []);

  const cacheRestored = useApolloPersistence();

  if (!languageLoaded || !fontsLoaded || !cacheRestored) {
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
