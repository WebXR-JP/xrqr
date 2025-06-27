import React from 'react'
import ReactDOM from 'react-dom/client'
import { useTranslation } from 'react-i18next'
import BackgroundShader from './components/BackgroundShader'
import { LanguageSwitcher } from './components/LanguageSwitcher'
import { checkHMDBrowser } from './utils'
import { ReceiverScreen } from './screens/ReceiverScreen'
import { SenderScreen } from './screens/SenderScreen'
import { ToastDispatcherProvider } from './providers/ToastDispatcher'
import './i18n'
import styles from './styles.module.css'

function App() {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <BackgroundShader />
      <header className={styles.header}>
        <h1 className={styles.title}>
          <img src="/title.png" alt="XRQR" className={styles.titleImage} />
        </h1>
        <p className={styles.subtitle}>{t('header.subtitle')}</p>
      </header>
      {checkHMDBrowser() ? (
        <ReceiverScreen />
      ) : (
        <SenderScreen />
      )}
      <footer className={styles.footer}>
        <LanguageSwitcher />
        <div className={styles.footerInfo}>
          <p className={styles.copyright}>{t('footer.copyright', { year: new Date().getFullYear() })}</p>
          <span className={styles.separator}>|</span>
          <a href="https://github.com/WebXR-JP/xrqr" target="_blank" rel="noopener noreferrer" className={styles.repoLink}>
            {t('footer.github')}
          </a>
        </div>
      </footer>
    </div>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <ToastDispatcherProvider>
      <App />
    </ToastDispatcherProvider>
  </React.StrictMode>,
)
