import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';

import en from './locales/en.json';
import hi from './locales/hi.json';
import mr from './locales/mr.json';

const resources = {
  en: { translation: en },
  hi: { translation: hi },
  mr: { translation: mr },
} as const;

const getDeviceLanguage = (): string => {
  try {
    const locales = Localization.getLocales();
    if (locales && Array.isArray(locales) && locales.length > 0 && locales[0]?.languageCode) {
      return locales[0].languageCode;
    }
  } catch (err) {
    console.warn('[i18n] Failed to read device locales on startup:', err);
  }
  return 'en';
};

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: getDeviceLanguage(),
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
    compatibilityJSON: 'v4',
    saveMissing: true,
    missingKeyHandler: (lngs, ns, key) => {
      const languages = Array.isArray(lngs) ? lngs.join(', ') : lngs;
      console.warn(`[i18n MISSING TRANSLATION] Key "${key}" missing for language(s): "${languages}" (ns: "${ns}")`);
    },
  });

export default i18n;
