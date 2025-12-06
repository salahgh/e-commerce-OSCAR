import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { Inter } from 'next/font/google';
import { ApolloWrapper } from '@/lib/apollo/apollo-wrapper';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ThemeProvider } from '@/components/providers/ThemeProvider';
import { Toaster } from 'react-hot-toast';
import { locales } from '@/i18n/config';
import '../globals.css';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
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
      <body className={inter.variable}>
        <ThemeProvider>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <ApolloWrapper>
              <AuthProvider>
                <CartProvider>
                  {children}
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
