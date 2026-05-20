import React from 'react';
import { useTranslation } from 'react-i18next';
import { InfoScreen, Section, Paragraph, Bullets } from '../../src/components/info';

export default function CareersScreen() {
  const { t } = useTranslation();
  return (
    <InfoScreen title={t('info.careers')} intro={t('careersPage.intro')}>
      <Section title={t('careersPage.openingsTitle')}>
        <Paragraph>{t('careersPage.noOpenings')}</Paragraph>
      </Section>
      <Section title={t('careersPage.cultureTitle')}>
        <Bullets items={[t('careersPage.c1'), t('careersPage.c2'), t('careersPage.c3')]} />
      </Section>
    </InfoScreen>
  );
}
