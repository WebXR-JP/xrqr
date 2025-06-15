import { useCallback, useEffect } from "react"
import { useLocalStorage } from "~/hooks/useLocalStorage"
import { useQRScanner } from "~/hooks/useQRScanner"
import { useToastDispatcher } from "~/providers/ToastDispatcher"
import { HistoryItem } from "~/types"
import { copyToClipboard } from "~/utils"
import styles from "./styles.module.css"

interface QRData {
  content: string
  isSecret: boolean
  timestamp: string
  encrypted?: boolean
}

export const CameraView = () => {
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

  useEffect(() => { startScanning() }, [isScanning])

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>QRコードリーダー</h1>
        <p className={styles.description}>
          スマホやPCのQRコードを読み取って、クリップボードにコピーします。
        </p>
      </div>
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
  )
}
