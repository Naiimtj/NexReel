import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import translationEN from './translations/enUS/translation.json';
import translationES from './translations/esES/translation.json';
import translationFR from './translations/frFR/translation.json';

// Creating object with the variables of imported translation files
const resources = {
  'en-US': {
    translation: translationEN,
  },
  'es-ES': {
    translation: translationES,
  },
  'fr-FR': {
    translation: translationFR,
  },
};

i18n.use(initReactI18next).init({
  resources,
  lng: 'es-ES', // default language
  keySeparator: false,
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;