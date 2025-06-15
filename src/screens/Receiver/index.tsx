import { useCallback, useState, useEffect } from 'react'
import { useLocalStorage } from '~/hooks/useLocalStorage'
import { useQRScanner } from '~/hooks/useQRScanner'
import { Button } from '~/components/Button'
import type { HistoryItem } from '~/types'
import styles from './styles.module.css'
import { HistoryList } from './components/HistoryList'
import { useToastDispatcher } from '~/providers/ToastDispatcher'
import { copyToClipboard } from '~/utils'

type Tab = 'camera' | 'history'

interface QRData {
  content: string
  isSecret: boolean
  timestamp: string
  encrypted?: boolean
}

export const ReceiverScreen = () => {
  const [activeTab, setActiveTab] = useState<Tab>('camera')
  const { addHistoryItem } = useLocalStorage()
  const { dispatch } = useToastDispatcher()

  const handleScan = useCallback(
    async (data: string) => {
      try {
        // データが空または短すぎる場合は無視
        if (!data || data.trim().length < 10) return

        const qrData = JSON.parse(data) as QRData
        await copyToClipboard(qrData.content)

        const historyItem: HistoryItem = {
          id: crypto.randomUUID(),
          content: qrData.content,
          preview: qrData.content.slice(0, 50),
          timestamp: qrData.timestamp,
        }
        addHistoryItem(historyItem)

        dispatch({
          message: 'QRコードを読み取りました！クリップボードにコピーしました',
          type: 'success',
        })
        return
      } catch (err) {
        dispatch({
          message: 'QRコードの読み取りに失敗しました。無効なデータかもしれません。',
          type: 'error',
        })
        return
      }
    },
    [addHistoryItem],
  )

  const {
    videoRef,
    canvasRef,
    startScanning,
    isScanning,
  } = useQRScanner(handleScan, { keepScanning: true })

  // カメラタブがアクティブかつ暗号化キーが設定されている場合、自動でスキャンを開始
  useEffect(() => {
    if (activeTab === 'camera' && !isScanning) {
      startScanning()
    }
  }, [activeTab, isScanning])

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
        <div>
          <div className={styles.cameraContainer}>
            <video
              ref={videoRef}
              className={styles.video}
              playsInline
              autoPlay
            />
            <canvas ref={canvasRef} className={styles.canvas} />
            <div className={styles.scanOverlay} />
          </div>
        </div>
      ) : (
        <HistoryList />
      )}
    </div>
  )
}