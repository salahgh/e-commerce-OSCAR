import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { I18nManager } from 'react-native';
import * as Updates from 'expo-updates';

import fr from './locales/fr.json';
import ar from './locales/ar.json';
import en from './locales/en.json';

const LANGUAGE_KEY = 'app_language';

export const LANGUAGES = {
  FR: 'fr',
  AR: 'ar',
  EN: 'en',
} as const;

export type Language = (typeof LANGUAGES)[keyof typeof LANGUAGES];

// Initialize i18n
i18n.use(initReactI18next).init({
  compatibilityJSON: 'v3',
  resources: {
    fr: { translation: fr },
    ar: { translation: ar },
    en: { translation: en },
  },
  lng: 'fr', // Default language
  fallbackLng: 'fr',
  interpolation: {
    escapeValue: false,
  },
});

// Load saved language on app start
export const loadSavedLanguage = async () => {
  try {
    const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
    if (savedLanguage && Object.values(LANGUAGES).includes(savedLanguage as Language)) {
      await i18n.changeLanguage(savedLanguage);
      // Check if RTL needs to be enabled
      const isRTL = savedLanguage === LANGUAGES.AR;
      if (I18nManager.isRTL !== isRTL) {
        I18nManager.forceRTL(isRTL);
      }
    }
  } catch (error) {
    console.error('Error loading saved language:', error);
  }
};

// Change language
export const changeLanguage = async (language: Language) => {
  try {
    // Save language preference
    await AsyncStorage.setItem(LANGUAGE_KEY, language);

    // Change i18n language
    await i18n.changeLanguage(language);

    // Handle RTL for Arabic. Changing layout direction only takes effect after
    // a reload, so force the direction then restart the JS runtime.
    const isRTL = language === LANGUAGES.AR;
    if (I18nManager.isRTL !== isRTL) {
      I18nManager.allowRTL(isRTL);
      I18nManager.forceRTL(isRTL);
      if (__DEV__) {
        // In a dev/dev-client build, Updates.reloadAsync() is unavailable;
        // use DevSettings to reload so the new layout direction applies.
        const { DevSettings } = require('react-native');
        DevSettings.reload();
      } else {
        await Updates.reloadAsync();
      }
    }
  } catch (error) {
    console.error('Error changing language:', error);
    throw error;
  }
};

// Get current language
export const getCurrentLanguage = (): Language => {
  return i18n.language as Language;
};

// Get language display name
export const getLanguageDisplayName = (lang: Language): string => {
  const names: Record<Language, string> = {
    fr: 'Français',
    ar: 'العربية',
    en: 'English',
  };
  return names[lang];
};

export default i18n;
