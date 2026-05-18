import { Mail, Phone, MapPin, Facebook, Instagram, Twitter, Youtube } from 'lucide-react';
import { Link } from '@/i18n/routing';
import { Logo } from './Logo';

export function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-bg-elevated">
      <div className="mx-auto grid max-w-7xl grid-cols-1 gap-12 px-6 py-12 md:grid-cols-4">
        <div className="flex flex-col gap-4">
          <Logo size="lg" />
          <p className="text-14 text-content-muted">
            La mode élégante au cœur de l&apos;Algérie. Livraison à travers toutes les wilayas.
          </p>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-14 font-bold text-content-strong">Contact</p>
          <ul className="flex flex-col gap-2 text-14 text-content-muted">
            <li className="inline-flex items-center gap-2">
              <Mail className="h-4 w-4" />
              <a href="mailto:contact@oscarnajar.dz" className="hover:text-content-strong">
                contact@oscarnajar.dz
              </a>
            </li>
            <li className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4" />
              <a href="tel:+213555000000" className="hover:text-content-strong">
                +213 555 000 000
              </a>
            </li>
            <li className="inline-flex items-start gap-2">
              <MapPin className="mt-1 h-4 w-4" />
              <span>Alger, Algérie</span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-14 font-bold text-content-strong">Aide</p>
          <ul className="flex flex-col gap-2 text-14">
            <FooterLink href="/shipping">Livraison</FooterLink>
            <FooterLink href="/returns">Retours</FooterLink>
            <FooterLink href="/size-guide">Guide des tailles</FooterLink>
            <FooterLink href="/faq">FAQ</FooterLink>
          </ul>
        </div>

        <div className="flex flex-col gap-3">
          <p className="text-14 font-bold text-content-strong">Entreprise</p>
          <ul className="flex flex-col gap-2 text-14">
            <FooterLink href="/about">À propos</FooterLink>
            <FooterLink href="/careers">Carrières</FooterLink>
            <FooterLink href="/contact">Contact</FooterLink>
            <FooterLink href="/legal/terms">Conditions générales</FooterLink>
            <FooterLink href="/legal/privacy">Confidentialité</FooterLink>
          </ul>
        </div>
      </div>

      <div className="border-t border-border">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 px-6 py-6 md:flex-row">
          <p className="text-12 text-content-muted">
            © {year} OSCAR Najar — Tous droits réservés.
          </p>
          <ul className="flex items-center gap-3 text-content-muted">
            <SocialIcon href="https://facebook.com" label="Facebook"><Facebook className="h-5 w-5" /></SocialIcon>
            <SocialIcon href="https://instagram.com" label="Instagram"><Instagram className="h-5 w-5" /></SocialIcon>
            <SocialIcon href="https://twitter.com" label="Twitter"><Twitter className="h-5 w-5" /></SocialIcon>
            <SocialIcon href="https://youtube.com" label="YouTube"><Youtube className="h-5 w-5" /></SocialIcon>
          </ul>
        </div>
      </div>
    </footer>
  );
}

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <li>
      <Link href={href} className="text-content-muted transition-colors hover:text-content-strong">
        {children}
      </Link>
    </li>
  );
}

function SocialIcon({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
  return (
    <li>
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={label}
        className="inline-flex h-9 w-9 items-center justify-center rounded transition-colors hover:bg-bg-subtle hover:text-content-strong"
      >
        {children}
      </a>
    </li>
  );
}
