'use client';

import { Mail, MapPin, Phone } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Card } from '@/components/ui';
import { useSiteSettings } from '@/contexts/SiteSettingsContext';
import { phoneNumbers } from '@/lib/site-settings/localized';

/**
 * Email, phone and address as entered in the back-office (Paramètres → contenu
 * du site). A card the shop has not filled in is left out instead of showing
 * a made-up value.
 */
export function ContactDetails() {
  const t = useTranslations('ContactPage');
  const s = useSiteSettings();
  const phones = phoneNumbers(s?.contactPhone);

  return (
    <>
      {s?.contactEmail && (
        <Card padding="md" className="flex flex-col gap-1">
          <p className="inline-flex items-center gap-2 text-12 font-semibold uppercase tracking-wide text-content-muted">
            <Mail className="h-4 w-4" /> {t('emailTitle')}
          </p>
          <a href={`mailto:${s.contactEmail}`} className="text-14 text-content-strong hover:underline">
            {s.contactEmail}
          </a>
        </Card>
      )}
      {phones.length > 0 && (
        <Card padding="md" className="flex flex-col gap-1">
          <p className="inline-flex items-center gap-2 text-12 font-semibold uppercase tracking-wide text-content-muted">
            <Phone className="h-4 w-4" /> {t('phoneTitle')}
          </p>
          {phones.map((p) => (
            <a key={p.href} href={p.href} dir="ltr" className="text-14 text-content-strong hover:underline">
              {p.label}
            </a>
          ))}
        </Card>
      )}
      {s?.footerAddress && (
        <Card padding="md" className="flex flex-col gap-1">
          <p className="inline-flex items-center gap-2 text-12 font-semibold uppercase tracking-wide text-content-muted">
            <MapPin className="h-4 w-4" /> {t('addressTitle')}
          </p>
          <address className="not-italic text-14 text-content-strong">
            {t('addressLine1')}
            <br />
            <span dir="auto">{s.footerAddress}</span>
          </address>
        </Card>
      )}
    </>
  );
}
