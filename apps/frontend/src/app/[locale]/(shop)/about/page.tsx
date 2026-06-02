import { useTranslations } from 'next-intl';
import { InfoPageLayout } from '@/components/patterns';

export default function AboutPage() {
  const t = useTranslations('AboutPage');
  const tInfo = useTranslations('InfoPage');
  return (
    <InfoPageLayout
      title={t('title')}
      intro={t('intro')}
      breadcrumbs={[{ label: tInfo('breadcrumbHome'), href: '/' }, { label: t('title') }]}
    >
      <section>
        <h2>{t('storyTitle')}</h2>
        <p>{t('storyBody')}</p>
      </section>
      <section>
        <h2>{t('valuesTitle')}</h2>
        <ul>
          <li>{t('v1')}</li>
          <li>{t('v2')}</li>
          <li>{t('v3')}</li>
        </ul>
      </section>
    </InfoPageLayout>
  );
}
