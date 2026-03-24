'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from 'lucide-react';

export default function Footer() {
  const params = useParams();
  const locale = (params.locale as string) || 'fr';

  const footerLinks = {
    shop: [
      { name: 'Nouveautés', href: `/${locale}/new-arrivals` },
      { name: 'Hommes', href: `/${locale}/men` },
      { name: 'Femmes', href: `/${locale}/women` },
      { name: 'Accessoires', href: `/${locale}/accessories` },
      { name: 'Promotions', href: `/${locale}/promotions` },
    ],
    help: [
      { name: 'FAQ', href: `/${locale}/faq` },
      { name: 'Livraison', href: `/${locale}/shipping` },
      { name: 'Retours', href: `/${locale}/returns` },
      { name: 'Guide des tailles', href: `/${locale}/size-guide` },
      { name: 'Nous contacter', href: `/${locale}/contact` },
    ],
    about: [
      { name: 'Notre histoire', href: `/${locale}/about` },
      { name: 'Carrières', href: `/${locale}/careers` },
      { name: 'Blog', href: `/${locale}/blog` },
      { name: 'Magasins', href: `/${locale}/stores` },
    ],
    legal: [
      { name: 'Conditions générales', href: `/${locale}/terms` },
      { name: 'Politique de confidentialité', href: `/${locale}/privacy` },
      { name: 'Politique de cookies', href: `/${locale}/cookies` },
    ],
  };

  return (
    <footer className="bg-muted border-t border-border">
      {/* Newsletter */}
      <div className="bg-primary text-primary-foreground py-12">
        <div className="container-custom">
          <div className="max-w-2xl mx-auto text-center">
            <h3 className="text-2xl font-bold mb-2">Restez informé</h3>
            <p className="mb-6">Inscrivez-vous à notre newsletter pour recevoir les dernières nouveautés</p>
            <div className="flex gap-2 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 px-4 py-2 rounded-lg text-gray-900 focus:outline-none focus:ring-2 focus:ring-secondary"
              />
              <button className="px-6 py-2 bg-secondary text-secondary-foreground rounded-lg hover:bg-secondary-dark transition-colors font-medium">
                S'inscrire
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="container-custom py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href={`/${locale}`} className="inline-flex items-center mb-4">
              <span className="text-2xl font-bold text-primary">OSCAR</span>
              <span className="text-2xl font-light text-secondary ml-1">Fashion</span>
            </Link>
            <p className="text-muted-foreground mb-4">
              Découvrez l'élégance et le style avec OSCAR Fashion. Votre destination pour la mode en Algérie.
            </p>
            <div className="space-y-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span>Alger, Algérie</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="h-4 w-4" />
                <span>+213 XXX XXX XXX</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>contact@oscarfashion.dz</span>
              </div>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Boutique</h4>
            <ul className="space-y-2">
              {footerLinks.shop.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">Aide</h4>
            <ul className="space-y-2">
              {footerLinks.help.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* About */}
          <div>
            <h4 className="font-semibold text-foreground mb-4">À propos</h4>
            <ul className="space-y-2 mb-6">
              {footerLinks.about.map((link) => (
                <li key={link.name}>
                  <Link href={link.href} className="text-muted-foreground hover:text-primary transition-colors text-sm">
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>

            {/* Social Media */}
            <div className="flex gap-3">
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-muted-foreground/20 rounded-full hover:bg-primary hover:text-white transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-4 w-4" />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-muted-foreground/20 rounded-full hover:bg-primary hover:text-white transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-4 w-4" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 bg-muted-foreground/20 rounded-full hover:bg-primary hover:text-white transition-colors"
                aria-label="Twitter"
              >
                <Twitter className="h-4 w-4" />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-border py-6">
        <div className="container-custom">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-muted-foreground">
            <p>© 2024 OSCAR Fashion. Tous droits réservés.</p>
            <div className="flex gap-6">
              {footerLinks.legal.map((link) => (
                <Link key={link.name} href={link.href} className="hover:text-primary transition-colors">
                  {link.name}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
