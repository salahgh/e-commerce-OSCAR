import { Mail, MapPin, Phone, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { InfoPageLayout } from '@/components/patterns';
import { Alert, Card } from '@/components/ui';

export default function ContactPage() {
  const t = useTranslations('ContactPage');
  const tInfo = useTranslations('InfoPage');
  return (
    <InfoPageLayout
      title={t('title')}
      intro={t('intro')}
      breadcrumbs={[{ label: tInfo('breadcrumbHome'), href: '/' }, { label: t('title') }]}
      showContactCta={false}
    >
      <section className="grid gap-3 md:grid-cols-2">
        <Card padding="md" className="flex flex-col gap-1">
          <p className="inline-flex items-center gap-2 text-12 font-semibold uppercase tracking-wide text-content-muted">
            <Mail className="h-4 w-4" /> {t('emailTitle')}
          </p>
          <a href={`mailto:${t('emailValue')}`} className="text-14 text-content-strong hover:underline">
            {t('emailValue')}
          </a>
        </Card>
        <Card padding="md" className="flex flex-col gap-1">
          <p className="inline-flex items-center gap-2 text-12 font-semibold uppercase tracking-wide text-content-muted">
            <Phone className="h-4 w-4" /> {t('phoneTitle')}
          </p>
          <a href={`tel:${t('phoneValue').replace(/\s+/g, '')}`} className="text-14 text-content-strong hover:underline">
            {t('phoneValue')}
          </a>
        </Card>
        <Card padding="md" className="flex flex-col gap-1">
          <p className="inline-flex items-center gap-2 text-12 font-semibold uppercase tracking-wide text-content-muted">
            <MapPin className="h-4 w-4" /> {t('addressTitle')}
          </p>
          <address className="not-italic text-14 text-content-strong">
            {t('addressLine1')}<br />
            {t('addressLine2')}
          </address>
        </Card>
        <Card padding="md" className="flex flex-col gap-1">
          <p className="inline-flex items-center gap-2 text-12 font-semibold uppercase tracking-wide text-content-muted">
            <Clock className="h-4 w-4" /> {t('hoursTitle')}
          </p>
          <p className="text-14 text-content-strong">{t('hoursValue')}</p>
        </Card>
      </section>
      <section>
        <h2>{t('formTitle')}</h2>
        <Alert intent="info">{t('formNotice')}</Alert>
      </section>
    </InfoPageLayout>
  );
}
