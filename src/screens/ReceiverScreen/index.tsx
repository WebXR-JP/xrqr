import { HistoryProvider } from '~/providers/HistoryProvider'
import { CameraCard } from './components/CameraCard'
import { HistoryCard } from './components/HistoryCard'
import styles from './styles.module.css'

export const ReceiverScreen = () => {
  return (
    <HistoryProvider>
      <div className={styles.container}>
        <CameraCard />
        <HistoryCard />
      </div>
    </HistoryProvider>
  )
}