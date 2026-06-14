'use client';

import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Logo } from './Logo';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';

export function Footer() {
  const t = useTranslations('Layout.footer');
  const s = useSiteSettings();
  const year = new Date().getFullYear();

  const email = s?.contactEmail || 'contact@oscarfashion.dz';
  const phone = s?.contactPhone || '+213 555 000 000';
  const telHref = `tel:${phone.replace(/\s+/g, '')}`;
  const address = s?.footerAddress || t('address');
  const copyright = s?.copyrightText || t('copyright', { year });

  const socials = [
    { href: s?.social.facebook || 'https://facebook.com', label: 'Facebook', icon: <Facebook className="h-6 w-6 fill-current" stroke="none" /> },
    { href: s?.social.twitter || 'https://twitter.com', label: 'Twitter', icon: <Twitter className="h-6 w-6 fill-current" stroke="none" /> },
    { href: s?.social.instagram || 'https://instagram.com', label: 'Instagram', icon: <Instagram className="h-6 w-6" strokeWidth={1.75} /> },
    { href: s?.social.linkedin || 'https://linkedin.com', label: 'LinkedIn', icon: <Linkedin className="h-6 w-6 fill-current" stroke="none" /> },
    { href: s?.social.youtube || 'https://youtube.com', label: 'YouTube', icon: <Youtube className="h-6 w-6 fill-current" stroke="none" /> },
  ];

  return (
    <footer className="px-6 pb-6 pt-12">
      <div className="mx-auto flex max-w-[1392px] flex-col gap-7 rounded-[20px] border-[0.5px] border-border bg-bg-elevated px-6 py-8 shadow-sm">
        {/* Top: brand / contacts */}
        <div className="flex flex-col-reverse items-stretch justify-between gap-10 md:flex-row md:items-start">
          {/* Brand column */}
          <div className="flex flex-1 flex-col items-start gap-8">
            <Logo size="lg" />

            <div className="flex flex-wrap items-start gap-10">
              {/* Find us on */}
              <div className="flex flex-col items-start gap-4">
                <p className="text-18 text-ink-muted">{t('findUs')}</p>
                <div className="flex items-center gap-7 text-content-strong">
                  {socials.map((sl) => (
                    <SocialLink key={sl.label} href={sl.href} label={sl.label}>{sl.icon}</SocialLink>
                  ))}
                </div>
              </div>

              {/* Our app */}
              <div className="flex flex-col items-start gap-4">
                <p className="text-18 text-ink-muted">{t('app')}</p>
                <div className="flex items-center gap-7">
                  <AppLink href={s?.app.appStore || 'https://apps.apple.com'} label="App Store" src="/images/home/icon-apple.svg" />
                  <AppLink href={s?.app.googlePlay || 'https://play.google.com'} label="Google Play" src="/images/home/icon-googleplay.svg" />
                </div>
              </div>
            </div>

            {/* Quick nav */}
            <nav className="flex flex-wrap items-center gap-x-12 gap-y-3 text-16 text-accent">
              <Link href="/" className="transition-opacity hover:opacity-70">{t('navHome')}</Link>
              <Link href="/products" className="transition-opacity hover:opacity-70">{t('navProducts')}</Link>
              <Link href="/user/wishlist" className="transition-opacity hover:opacity-70">{t('navWishlist')}</Link>
              <Link href="/cart" className="transition-opacity hover:opacity-70">{t('navCart')}</Link>
            </nav>
          </div>

          {/* Contacts column */}
          <div className="flex flex-col items-start gap-8 md:w-[406px]">
            <p className="font-dm text-20 font-bold text-ink-heading">{t('contactsTitle')}</p>
            <ul className="flex flex-col items-start gap-5 font-dm text-18 text-ink-muted">
              <li className="flex items-center gap-2">
                <Mail className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                <a href={`mailto:${email}`} className="transition-colors hover:text-content-strong">
                  {email}
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                <a href={telHref} className="transition-colors hover:text-content-strong">
                  {phone}
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-1 h-5 w-5 shrink-0" strokeWidth={1.75} />
                <span className="leading-relaxed">{address}</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-border" />

        {/* Legal bar */}
        <div className="flex flex-col items-center justify-between gap-3 font-dm text-18 text-ink-muted md:flex-row">
          <p className="flex flex-wrap items-center gap-1">
            <span>{t('rights')}</span>
            <span>|</span>
            <Link href="/legal/terms" className="text-link underline">{t('terms')}</Link>
            <span>|</span>
            <Link href="/legal/privacy" className="text-link underline">{t('privacy')}</Link>
          </p>
          <p>{copyright}</p>
        </div>
      </div>
    </footer>
  );
}

function SocialLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex items-center justify-center transition-opacity hover:opacity-70"
    >
      {children}
    </a>
  );
}

function AppLink({ href, label, src }: { href: string; label: string; src: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="inline-flex items-center justify-center transition-opacity hover:opacity-70"
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={src} alt={label} className="h-7 w-auto" />
    </a>
  );
}
