import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import ja from './locales/ja.json';
import en from './locales/en.json';
import ko from './locales/ko.json';

const resources = {
  ja: {
    translation: ja,
  },
  en: {
    translation: en,
  },
  ko: {
    translation: ko,
  },
};

// ローカルストレージから保存された言語設定を取得
const savedLanguage = localStorage.getItem('preferred-language') || 'ja';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: savedLanguage, // 保存された言語またはデフォルト言語
    fallbackLng: 'ja',
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;