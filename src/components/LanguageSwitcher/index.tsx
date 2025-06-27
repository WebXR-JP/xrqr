import { useTranslation } from 'react-i18next';
import styles from './styles.module.css';

const languages = [
  { code: 'ja', name: '日本語', flag: '🇯🇵' },
  { code: 'en', name: 'English', flag: '🇺🇸' },
  { code: 'ko', name: '한국어', flag: '🇰🇷' }
];

export function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleLanguageChange = (languageCode: string) => {
    i18n.changeLanguage(languageCode);
    // ローカルストレージに保存
    localStorage.setItem('preferred-language', languageCode);
  };

  return (
    <div className={styles.languageSwitcher}>
      {languages.map((language) => (
        <button
          key={language.code}
          className={`${styles.languageButton} ${i18n.language === language.code ? styles.active : ''}`}
          onClick={() => handleLanguageChange(language.code)}
          type="button"
        >
          <span className={styles.flag}>{language.flag}</span>
          <span className={styles.name}>{language.name}</span>
        </button>
      ))}
    </div>
  );
}