import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
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

import { useColorScheme } from 'react-native';
import { apolloClient } from '@/src/apollo/client';
import { AuthProvider, useAuth } from '@/src/contexts/AuthContext';
import { CartProvider } from '@/src/contexts/CartContext';
import { ToastProvider , LoadingSpinner } from '@/src/components/ui';

export const unstable_settings = {
  initialRouteName: 'splash',
};

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
    const inSplash = segments[0] === 'splash';
    const currentRoute = segments[0] as string;

    // Don't redirect if in splash or onboarding
    if (inSplash || inOnboarding) return;

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
      <Stack.Screen name="splash" options={{ headerShown: false, animation: 'none' }} />
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

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [languageLoaded, setLanguageLoaded] = useState(false);

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

  if (!languageLoaded || !fontsLoaded) {
    return <LoadingSpinner />;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <ApolloProvider client={apolloClient}>
          <AuthProvider>
            <CartProvider>
              <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
                <ToastProvider>
                  <RootNavigator />
                  <StatusBar style="auto" />
                </ToastProvider>
              </ThemeProvider>
            </CartProvider>
          </AuthProvider>
        </ApolloProvider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
