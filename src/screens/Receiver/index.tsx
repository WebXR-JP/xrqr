import { useState } from 'react'
import { Button } from '~/components/Button'
import { HistoryList } from './components/HistoryList'
import { CameraView } from './components/CameraView'
import styles from './styles.module.css'

type Tab = 'camera' | 'history'

export const ReceiverScreen = () => {
  const [activeTab, setActiveTab] = useState<Tab>('camera')

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <Button
          variant={activeTab === 'camera' ? 'primary' : 'secondary'}
          size="medium"
          onClick={() => setActiveTab('camera')}
          className={styles.tab}
        >
          カメラ
        </Button>
        <Button
          variant={activeTab === 'history' ? 'primary' : 'secondary'}
          size="medium"
          onClick={() => setActiveTab('history')}
          className={styles.tab}
        >
          履歴
        </Button>
      </div>

      {activeTab === 'camera' ? (
        <CameraView />
      ) : (
        <HistoryList />
      )}
    </div>
  )
}