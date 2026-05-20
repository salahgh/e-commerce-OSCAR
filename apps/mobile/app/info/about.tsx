import React from 'react';
import { useTranslation } from 'react-i18next';
import { InfoScreen, Section, Paragraph, Bullets } from '../../src/components/info';

export default function AboutScreen() {
  const { t } = useTranslation();
  return (
    <InfoScreen title={t('info.about')} intro={t('aboutPage.intro')}>
      <Section title={t('aboutPage.storyTitle')}>
        <Paragraph>{t('aboutPage.storyBody')}</Paragraph>
      </Section>
      <Section title={t('aboutPage.valuesTitle')}>
        <Bullets items={[t('aboutPage.v1'), t('aboutPage.v2'), t('aboutPage.v3')]} />
      </Section>
    </InfoScreen>
  );
}
