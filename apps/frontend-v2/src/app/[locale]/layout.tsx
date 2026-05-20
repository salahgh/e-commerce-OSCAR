import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, setRequestLocale } from 'next-intl/server';
import { IBM_Plex_Sans_Arabic } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { ApolloWrapper } from '@/lib/apollo/apollo-wrapper';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { ToastProvider } from '@/components/ui/Toast';
import { routing } from '@/i18n/routing';
import { localeDirection, type Locale } from '@/i18n/config';

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-plex-arabic',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  setRequestLocale(locale);
  const messages = await getMessages();
  const dir = localeDirection[locale as Locale];

  return (
    <html lang={locale} dir={dir} className={plexArabic.variable} suppressHydrationWarning>
      <body className="bg-bg-base text-content font-sans antialiased">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ApolloWrapper>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <ToastProvider>
                <AuthProvider>
                  <CartProvider>{children}</CartProvider>
                </AuthProvider>
              </ToastProvider>
            </NextIntlClientProvider>
          </ApolloWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
