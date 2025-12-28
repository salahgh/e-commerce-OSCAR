import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { Inter } from 'next/font/google';
import { ApolloWrapper } from '@/lib/apollo/apollo-wrapper';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from 'react-hot-toast';
import { locales } from '@/i18n/config';
import { PWAInstallPrompt, OfflineIndicator, UpdateAvailableBanner } from '@/components/pwa';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
});

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // Await params before using
  const { locale } = await params;

  // Validate locale
  if (!locales.includes(locale as any)) {
    notFound();
  }

  // Load messages
  let messages;
  try {
    messages = (await import(`../../messages/${locale}.json`)).default;
  } catch (error) {
    notFound();
  }

  return (
    <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'} suppressHydrationWarning>
      <head>
        {/* PWA Meta Tags */}
        <meta name="application-name" content="OSCAR Fashion" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="OSCAR Fashion" />
        <meta name="format-detection" content="telephone=no" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-TileColor" content="#000000" />
        <meta name="msapplication-tap-highlight" content="no" />
        <meta name="theme-color" content="#000000" />

        {/* PWA Links */}
        <link rel="manifest" href="/manifest.json" />

        {/* Preconnect to important origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href={process.env.NEXT_PUBLIC_GRAPHQL_URL || 'http://localhost:8085'} />
      </head>
      <body className={inter.className}>
        <ThemeProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ApolloWrapper>
              <AuthProvider>
                <CartProvider>
                  {/* Offline indicator */}
                  <OfflineIndicator />

                  {children}

                  {/* PWA Install Prompt */}
                  <PWAInstallPrompt />

                  {/* Update Available Banner */}
                  <UpdateAvailableBanner />

                  <Toaster
                    position={locale === 'ar' ? 'top-left' : 'top-right'}
                    toastOptions={{
                      duration: 4000,
                      style: {
                        background: 'var(--card)',
                        color: 'var(--card-foreground)',
                      },
                    }}
                  />
                </CartProvider>
              </AuthProvider>
            </ApolloWrapper>
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
