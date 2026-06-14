'use client';

import * as React from 'react';
import { useLocale } from 'next-intl';
import { useGetSiteSettingsQuery } from '@oscar/graphql-shop/generated';

/** Resolved, locale-collapsed site content for the current request. */
export interface SiteSettings {
  promoText: string | null;
  freeShippingThreshold: number | null;
  contactEmail: string | null;
  contactPhone: string | null;
  footerAddress: string | null;
  social: {
    facebook: string | null;
    instagram: string | null;
    twitter: string | null;
    linkedin: string | null;
    youtube: string | null;
  };
  app: { appStore: string | null; googlePlay: string | null };
  reviewsTitle: string | null;
  reviewsSubtitle: string | null;
  copyrightText: string | null;
  heroImage: string | null;
  bannerImages: string[];
  reviewImages: string[];
}

const SiteSettingsContext = React.createContext<SiteSettings | null>(null);

type Locale = 'ar' | 'fr' | 'en';
const suffixFor = (locale: string): 'Ar' | 'Fr' | 'En' =>
  locale === 'ar' ? 'Ar' : locale === 'en' ? 'En' : 'Fr';

export function SiteSettingsProvider({ children }: { children: React.ReactNode }) {
  const locale = useLocale() as Locale;
  // Apollo's auth link sends Accept-Language; non-localized fields are channel-wide.
  const { data } = useGetSiteSettingsQuery();
  const cf = data?.activeChannel?.customFields as Record<string, unknown> | undefined;

  const value = React.useMemo<SiteSettings | null>(() => {
    if (!cf) return null;
    const sfx = suffixFor(locale);
    const text = (base: string) => (cf[`${base}${sfx}`] as string | null) ?? null;
    const str = (k: string) => (cf[k] as string | null) ?? null;
    const assetUrls = (k: string) =>
      ((cf[k] as Array<{ preview: string }> | null) ?? []).map((a) => a.preview);
    return {
      promoText: text('promoText'),
      freeShippingThreshold: (cf.freeShippingThreshold as number | null) ?? null,
      contactEmail: str('contactEmail'),
      contactPhone: str('contactPhone'),
      footerAddress: text('footerAddress'),
      social: {
        facebook: str('socialFacebook'),
        instagram: str('socialInstagram'),
        twitter: str('socialTwitter'),
        linkedin: str('socialLinkedin'),
        youtube: str('socialYoutube'),
      },
      app: { appStore: str('appAppStore'), googlePlay: str('appGooglePlay') },
      reviewsTitle: text('reviewsTitle'),
      reviewsSubtitle: text('reviewsSubtitle'),
      copyrightText: text('copyrightText'),
      heroImage: (cf.heroImage as { preview: string } | null)?.preview ?? null,
      bannerImages: assetUrls('bannerImages'),
      reviewImages: assetUrls('reviewImages'),
    };
  }, [cf, locale]);

  return <SiteSettingsContext.Provider value={value}>{children}</SiteSettingsContext.Provider>;
}

/** Site content for the current locale, or null until loaded. Consumers must fall back to defaults. */
export function useSiteSettings(): SiteSettings | null {
  return React.useContext(SiteSettingsContext);
}
