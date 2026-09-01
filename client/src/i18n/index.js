import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ar from './locales/ar.json';

// Only Arabic is supported. The list is exported for compatibility with code
// that still maps over it (e.g. language picker UI), but it now contains a
// single entry so the picker has nothing to show.
export const LANGUAGES = [
  { code: 'ar', label: 'العربية', dir: 'rtl' },
];

const DEFAULT_LANG = 'ar';

i18n
  .use(initReactI18next)
  .init({
    resources: {
      ar: { translation: ar },
    },
    lng: DEFAULT_LANG,
    fallbackLng: DEFAULT_LANG,
    supportedLngs: [DEFAULT_LANG],
    interpolation: { escapeValue: false },
  });

const applyDir = (lng) => {
  const lang = LANGUAGES.find((l) => l.code === lng) || LANGUAGES[0];
  document.documentElement.lang = lang.code;
  document.documentElement.dir = lang.dir;
  localStorage.setItem('ledgerly_lang', lang.code);
};

applyDir(DEFAULT_LANG);

export default i18n;
