import { useTranslation } from 'react-i18next';
import { fonts } from '../theme';

/**
 * Returns the correct font family object (arabic or latin) based on the current i18n locale.
 *
 * Usage:
 *   const { fontFamily } = useAppFont();
 *   <Text style={{ fontFamily: fontFamily.medium }}>Hello</Text>
 */
export const useAppFont = () => {
  const { i18n } = useTranslation();
  const isArabic = i18n.language === 'ar';
  const fontFamily = isArabic ? fonts.arabic : fonts.latin;

  return {
    fontFamily,
    isArabic,
    isRTL: isArabic,
  };
};
