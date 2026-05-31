import React from 'react';
import { useTranslation } from 'react-i18next';
import { InfoScreen, Section, Paragraph, Bullets } from '../../src/components/info';

export default function ShippingScreen() {
  const { t } = useTranslation();
  return (
    <InfoScreen title={t('info.shipping')} intro={t('shippingPage.intro')}>
      <Section title={t('shippingPage.zonesTitle')}>
        <Bullets
          items={[
            t('shippingPage.zone1'),
            t('shippingPage.zone2'),
            t('shippingPage.zone3'),
            t('shippingPage.zone4'),
          ]}
        />
      </Section>
      <Section title={t('shippingPage.costTitle')}>
        <Paragraph>{t('shippingPage.costBody')}</Paragraph>
      </Section>
      <Section title={t('shippingPage.trackingTitle')}>
        <Paragraph>{t('shippingPage.trackingBody')}</Paragraph>
      </Section>
    </InfoScreen>
  );
}
