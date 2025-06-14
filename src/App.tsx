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
        <h1 className={styles.title}>
          <span className="material-icons" style={{ marginRight: '0.5rem', fontSize: '1.8rem' }}>
            qr_code
          </span>
          XRQR
        </h1>
      </header>
      <main className={styles.main}>{renderScreen()}</main>
    </div>
  )
}
