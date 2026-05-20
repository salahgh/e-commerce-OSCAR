import React from 'react';
import { useTranslation } from 'react-i18next';
import { InfoScreen, Section, Paragraph, Bullets } from '../../src/components/info';

export default function ReturnsScreen() {
  const { t } = useTranslation();
  return (
    <InfoScreen title={t('info.returns')} intro={t('returnsPage.intro')}>
      <Section title={t('returnsPage.conditionsTitle')}>
        <Bullets items={[t('returnsPage.cond1'), t('returnsPage.cond2'), t('returnsPage.cond3')]} />
      </Section>
      <Section title={t('returnsPage.howTitle')}>
        <Paragraph>{t('returnsPage.howBody')}</Paragraph>
      </Section>
    </InfoScreen>
  );
}
