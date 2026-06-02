import { useTranslations } from 'next-intl';
import { InfoPageLayout } from '@/components/patterns';

export default function ReturnsPage() {
  const t = useTranslations('ReturnsPage');
  const tInfo = useTranslations('InfoPage');
  return (
    <InfoPageLayout
      title={t('title')}
      intro={t('intro')}
      breadcrumbs={[{ label: tInfo('breadcrumbHome'), href: '/' }, { label: t('title') }]}
    >
      <section>
        <h2>{t('conditionsTitle')}</h2>
        <ul>
          <li>{t('cond1')}</li>
          <li>{t('cond2')}</li>
          <li>{t('cond3')}</li>
        </ul>
      </section>
      <section>
        <h2>{t('howTitle')}</h2>
        <p>{t('howBody')}</p>
      </section>
    </InfoPageLayout>
  );
}
