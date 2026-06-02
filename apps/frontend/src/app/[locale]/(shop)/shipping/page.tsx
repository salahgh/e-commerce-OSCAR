import { useTranslations } from 'next-intl';
import { InfoPageLayout } from '@/components/patterns';

export default function ShippingPage() {
  const t = useTranslations('ShippingPage');
  const tInfo = useTranslations('InfoPage');
  return (
    <InfoPageLayout
      title={t('title')}
      intro={t('intro')}
      breadcrumbs={[{ label: tInfo('breadcrumbHome'), href: '/' }, { label: t('title') }]}
    >
      <section>
        <h2>{t('zonesTitle')}</h2>
        <ul>
          <li>{t('zone1')}</li>
          <li>{t('zone2')}</li>
          <li>{t('zone3')}</li>
          <li>{t('zone4')}</li>
        </ul>
      </section>
      <section>
        <h2>{t('costTitle')}</h2>
        <p>{t('costBody')}</p>
      </section>
      <section>
        <h2>{t('trackingTitle')}</h2>
        <p>{t('trackingBody')}</p>
      </section>
    </InfoPageLayout>
  );
}
