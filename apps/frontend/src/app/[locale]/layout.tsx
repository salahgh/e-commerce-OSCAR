import type { Metadata } from 'next';
import Script from 'next/script';
import { notFound } from 'next/navigation';
import { hasLocale, NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations, setRequestLocale } from 'next-intl/server';
import { IBM_Plex_Sans_Arabic, DM_Sans } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { ApolloWrapper } from '@/lib/apollo/apollo-wrapper';
import { AuthProvider } from '@/contexts/AuthContext';
import { CartProvider } from '@/contexts/CartContext';
import { WishlistProvider } from '@/contexts/WishlistContext';
import { SiteSettingsProvider } from '@/contexts/SiteSettingsContext';
import { MiniCart, SkipToContent } from '@/components/layout';
import { ToastProvider } from '@/components/ui/Toast';
import { routing } from '@/i18n/routing';
import { localeDirection, type Locale } from '@/i18n/config';
import type { Viewport } from 'next';
import { JsonLd } from '@/components/seo/JsonLd';
import { organizationSchema, websiteSchema } from '@/lib/seo/schema';
import { ServiceWorkerRegistrar } from '@/components/pwa/ServiceWorkerRegistrar';
import { PWAInstallPrompt } from '@/components/pwa/PWAInstallPrompt';
import { PixelPageView } from '@/components/analytics/PixelPageView';

const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '700'],
  display: 'swap',
  variable: '--font-plex-arabic',
});

// Latin display/numeric face — used by prices and footer Latin copy (Figma uses DM Sans)
const dmSans = DM_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '700', '800'],
  display: 'swap',
  variable: '--font-dm-sans',
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://oscarfashion.dz';
const GTM_ID = 'GTM-PB2KLTSW';

export const viewport: Viewport = {
  themeColor: '#1E1E1E',
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) return {};

  const t = await getTranslations({ locale, namespace: 'HomePage' });
  const title = t('title');
  const description = t('subtitle');
  const isDefault = locale === routing.defaultLocale;
  const path = isDefault ? '/' : `/${locale}`;

  const languages: Record<string, string> = {};
  for (const l of routing.locales) {
    languages[l] = l === routing.defaultLocale ? SITE_URL : `${SITE_URL}/${l}`;
  }
  languages['x-default'] = SITE_URL;

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: title, template: '%s · OSCAR Najar' },
    description,
    alternates: { canonical: `${SITE_URL}${path === '/' ? '' : path}`, languages },
    openGraph: {
      title,
      description,
      url: `${SITE_URL}${path === '/' ? '' : path}`,
      siteName: 'OSCAR Najar',
      locale,
      type: 'website',
    },
    twitter: { card: 'summary_large_image', title, description },
    icons: {
      icon: '/icons/favicon.png',
      apple: '/icons/apple-touch-icon.png',
    },
    appleWebApp: { capable: true, title: 'OSCAR', statusBarStyle: 'default' },
  };
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
    <html lang={locale} dir={dir} className={`${plexArabic.variable} ${dmSans.variable}`} suppressHydrationWarning>
      {/* Google Tag Manager */}
      <Script id="google-tag-manager" strategy="afterInteractive">
        {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${GTM_ID}');`}
      </Script>
      <body className="bg-bg-base text-content font-sans antialiased">
        {/* Google Tag Manager (noscript) */}
        <noscript>
          <iframe
            src={`https://www.googletagmanager.com/ns.html?id=${GTM_ID}`}
            height="0"
            width="0"
            style={{ display: 'none', visibility: 'hidden' }}
          />
        </noscript>
        <JsonLd data={[organizationSchema(), websiteSchema()]} />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <ApolloWrapper locale={locale}>
            <NextIntlClientProvider locale={locale} messages={messages}>
              <SiteSettingsProvider>
              <ToastProvider>
                <AuthProvider>
                  <CartProvider>
                    <WishlistProvider>
                      <SkipToContent />
                      {children}
                      <MiniCart />
                      <ServiceWorkerRegistrar />
                      <PWAInstallPrompt />
                      <PixelPageView />
                    </WishlistProvider>
                  </CartProvider>
                </AuthProvider>
              </ToastProvider>
              </SiteSettingsProvider>
            </NextIntlClientProvider>
          </ApolloWrapper>
        </ThemeProvider>
      </body>
    </html>
  );
}
