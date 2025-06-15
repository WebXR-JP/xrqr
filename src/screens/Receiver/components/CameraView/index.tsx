import { useEffect, useState } from "react"
import { useAsync } from "react-use"
import { useQRScanner } from "~/hooks/useQRScanner"
import { useToastDispatcher } from "~/providers/ToastDispatcher"
import { copyToClipboard } from "~/utils"
import styles from "./styles.module.css"

interface QRData {
  content: string
  isSecret: boolean
  timestamp: string
  encrypted?: boolean
}

export const CameraView = () => {
  const [scanable, setScannable] = useState(true)
  const { dispatch } = useToastDispatcher()
  const { videoRef, codeData } = useQRScanner()

  useAsync(async () => {
    if (!scanable) return
    try {
      if (!codeData) return

      let content = ''
      try {
        // QRコードのデータがJSON形式であることを確認
        content = (JSON.parse(codeData) as QRData).content
      } catch (e) {
        // JSON形式でない場合はそのまま使用
        content = codeData
      }

      await copyToClipboard(content)
      setScannable(false)

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
  }, [scanable, codeData, dispatch])

  useEffect(() => {
    // scanableがfalseになったら5秒後に再度スキャン可能にする
    if (!scanable) {
      const timer = setTimeout(() => {
        setScannable(true)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [scanable])

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
        <div className={styles.scanOverlay} />
      </div>
    </div>
  )
}
