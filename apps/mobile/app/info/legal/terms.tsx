import React from 'react';
import { useTranslation } from 'react-i18next';
import { InfoScreen, Paragraph } from '../../../src/components/info';

export default function TermsScreen() {
  const { t } = useTranslation();
  return (
    <InfoScreen title={t('info.terms')} intro={t('termsPage.intro')}>
      <Paragraph>{t('termsPage.placeholder')}</Paragraph>
    </InfoScreen>
  );
}
