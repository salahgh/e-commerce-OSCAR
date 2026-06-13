import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube, Linkedin } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Logo } from './Logo';

export function Footer() {
  const t = useTranslations('Layout.footer');
  const year = new Date().getFullYear();

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
                  <SocialLink href="https://facebook.com" label="Facebook"><Facebook className="h-6 w-6 fill-current" stroke="none" /></SocialLink>
                  <SocialLink href="https://twitter.com" label="Twitter"><Twitter className="h-6 w-6 fill-current" stroke="none" /></SocialLink>
                  <SocialLink href="https://instagram.com" label="Instagram"><Instagram className="h-6 w-6" strokeWidth={1.75} /></SocialLink>
                  <SocialLink href="https://linkedin.com" label="LinkedIn"><Linkedin className="h-6 w-6 fill-current" stroke="none" /></SocialLink>
                  <SocialLink href="https://youtube.com" label="YouTube"><Youtube className="h-6 w-6 fill-current" stroke="none" /></SocialLink>
                </div>
              </div>

              {/* Our app */}
              <div className="flex flex-col items-start gap-4">
                <p className="text-18 text-ink-muted">{t('app')}</p>
                <div className="flex items-center gap-7">
                  <AppLink href="https://apps.apple.com" label="App Store" src="/images/home/icon-apple.svg" />
                  <AppLink href="https://play.google.com" label="Google Play" src="/images/home/icon-googleplay.svg" />
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
                <a href="mailto:contact@oscarfashion.dz" className="transition-colors hover:text-content-strong">
                  contact@oscarfashion.dz
                </a>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="h-5 w-5 shrink-0" strokeWidth={1.75} />
                <a href="tel:+213555000000" className="transition-colors hover:text-content-strong">
                  +213 555 000 000
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MapPin className="mt-1 h-5 w-5 shrink-0" strokeWidth={1.75} />
                <span className="leading-relaxed">{t('address')}</span>
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
          <p>{t('copyright', { year })}</p>
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
