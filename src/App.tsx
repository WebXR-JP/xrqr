import styles from './App.module.css'
import { ReceiverScreen } from './screens/Receiver'
import { SenderScreen } from './screens/Sender'
import BackgroundShader from '~/components/BackgroundShader'
import { checkHMDBrowser } from './utils'

export const App = () => {
  const isHMDBrowser = checkHMDBrowser()

  return (
    <div className={styles.container}>
      <BackgroundShader />
      <header className={styles.header}>
        <h1 className={styles.title}>
          <img src="/title.png" alt="XRQR" className={styles.titleImage} />
        </h1>
        <p className={styles.subtitle}>PC・スマホからVRゴーグルへ瞬間転送 - QRコードでかんたんコピー</p>
      </header>
      <main className={styles.main}>
        {isHMDBrowser ? (
          <ReceiverScreen />
        ) : (
          <SenderScreen />
        )}
      </main>
      <footer className={styles.footer}>
        <p className={styles.copyright}>© {new Date().getFullYear()} WebXR-JP</p>
      </footer>
    </div>
  )
}
