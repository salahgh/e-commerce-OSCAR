import React from 'react';
import { useTranslation } from 'react-i18next';
import { InfoScreen, Paragraph } from '../../../src/components/info';

export default function PrivacyScreen() {
  const { t } = useTranslation();
  return (
    <InfoScreen title={t('info.privacy')} intro={t('privacyPage.intro')}>
      <Paragraph>{t('privacyPage.placeholder')}</Paragraph>
    </InfoScreen>
  );
}
