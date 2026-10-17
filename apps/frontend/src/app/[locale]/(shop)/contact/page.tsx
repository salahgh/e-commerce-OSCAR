import { Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { InfoPageLayout } from '@/components/patterns';
import { Alert, Card } from '@/components/ui';
import { ContactDetails } from './ContactDetails';

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
        <ContactDetails />
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
