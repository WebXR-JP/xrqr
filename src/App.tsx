import { useState } from 'react'
import styles from './App.module.css'
import { HomeScreen } from './screens/Home'
import { ReceiverScreen } from './screens/Receiver'
import { SenderScreen } from './screens/Sender'
import BackgroundShader from '~/components/BackgroundShader'

type DeviceType = 'sender' | 'receiver' | null

export const App = () => {
  const [deviceType, setDeviceType] = useState<DeviceType>(null)

  const renderScreen = () => {
    switch (deviceType) {
      case 'sender':
        return <SenderScreen />
      case 'receiver':
        return <ReceiverScreen />
      default:
        return <HomeScreen onDeviceTypeSelect={setDeviceType} />
    }
  }

  return (
    <div className={styles.container}>
      <BackgroundShader />
      <header className={styles.header}>
        <h1 className={styles.title}>
          <img src="/title.png" alt="XRQR" className={styles.titleImage} />
        </h1>
        <p className={styles.subtitle}>PC・スマホからVRゴーグルへ瞬間転送 - QRコードでかんたんコピー</p>
      </header>
      <main className={styles.main}>{renderScreen()}</main>
      <footer className={styles.footer}>
        <p className={styles.copyright}>© 2024 WebXR-JP</p>
      </footer>
    </div>
  )
}
