import { useTranslations } from 'next-intl';
import { InfoPageLayout } from '@/components/patterns';

export default function CareersPage() {
  const t = useTranslations('CareersPage');
  const tInfo = useTranslations('InfoPage');
  return (
    <InfoPageLayout
      title={t('title')}
      intro={t('intro')}
      breadcrumbs={[{ label: tInfo('breadcrumbHome'), href: '/' }, { label: t('title') }]}
    >
      <section>
        <h2>{t('openingsTitle')}</h2>
        <p>{t('noOpenings')}</p>
      </section>
      <section>
        <h2>{t('cultureTitle')}</h2>
        <ul>
          <li>{t('c1')}</li>
          <li>{t('c2')}</li>
          <li>{t('c3')}</li>
        </ul>
      </section>
    </InfoPageLayout>
  );
}
