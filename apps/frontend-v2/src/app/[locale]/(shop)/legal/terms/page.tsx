import { useTranslations } from 'next-intl';
import { InfoPageLayout } from '@/components/patterns';

export default function TermsPage() {
  const t = useTranslations('TermsPage');
  const tInfo = useTranslations('InfoPage');
  return (
    <InfoPageLayout
      title={t('title')}
      intro={t('intro')}
      breadcrumbs={[{ label: tInfo('breadcrumbHome'), href: '/' }, { label: t('title') }]}
    >
      <p>{t('placeholder')}</p>
    </InfoPageLayout>
  );
}
