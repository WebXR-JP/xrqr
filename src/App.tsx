import { useState } from 'react'
import styles from './App.module.css'
import { HomeScreen } from './screens/Home'
import { ReceiverScreen } from './screens/Receiver'
import { SenderScreen } from './screens/Sender'

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
      <header className={styles.header}>
        <h1 className={styles.title}>XRQR</h1>
        {deviceType && (
          <button type="button" className={styles.backButton} onClick={() => setDeviceType(null)}>
            戻る
          </button>
        )}
      </header>
      <main className={styles.main}>{renderScreen()}</main>
    </div>
  )
}
