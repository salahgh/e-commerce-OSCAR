import React, { useEffect, useState } from 'react';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack, useRouter, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ApolloProvider } from '@apollo/client';
import 'react-native-reanimated';
import '../src/i18n';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { apolloClient } from '../src/apollo/client';
import { AuthProvider, useAuth } from '../src/contexts/AuthContext';
import { CartProvider } from '../src/contexts/CartContext';
import { loadSavedLanguage } from '../src/i18n';
import { LoadingSpinner } from '../src/components/ui';

export const unstable_settings = {
  anchor: '(tabs)',
};

function RootNavigator() {
  const { isAuthenticated, isLoading } = useAuth();
  const segments = useSegments();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;

    const inAuthGroup = segments[0] === '(auth)';

    if (!isAuthenticated && !inAuthGroup) {
      // Redirect to login if not authenticated
      router.replace('/(auth)/login');
    } else if (isAuthenticated && inAuthGroup) {
      // Redirect to home if authenticated
      router.replace('/(tabs)');
    }
  }, [isAuthenticated, isLoading, segments]);

  if (isLoading) {
    return <LoadingSpinner />;
  }

  return (
    <Stack>
      <Stack.Screen name="(auth)" options={{ headerShown: false }} />
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
    </Stack>
  );
}

export default function RootLayout() {
  const colorScheme = useColorScheme();
  const [languageLoaded, setLanguageLoaded] = useState(false);

  useEffect(() => {
    loadSavedLanguage().then(() => {
      setLanguageLoaded(true);
    });
  }, []);

  if (!languageLoaded) {
    return <LoadingSpinner />;
  }

  return (
    <ApolloProvider client={apolloClient}>
      <AuthProvider>
        <CartProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <RootNavigator />
            <StatusBar style="auto" />
          </ThemeProvider>
        </CartProvider>
      </AuthProvider>
    </ApolloProvider>
  );
}
