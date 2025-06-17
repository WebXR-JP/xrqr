import { useEffect, useState } from "react"
import { useAsync } from "react-use"
import { useQRScanner } from "~/hooks/useQRScanner"
import { useToastDispatcher } from "~/providers/ToastDispatcher"
import { copyToClipboard } from "~/utils"
import { Card } from "~/components/Card"
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

      const previewText = content.length > 20 ? content.substring(0, 20) + '...' : content
      dispatch({
        message: `QRコードを読み取りました！「${previewText}」をクリップボードにコピーしました`,
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
    <Card title="QRコードリーダー">
      <div className={styles.cameraContainer}>
        <video
          ref={videoRef}
          className={styles.video}
          playsInline
          autoPlay
        />
        <div className={styles.scanOverlay} />
      </div>
      <p className={styles.description}>
        スマホやPCのQRコードを読み取って、クリップボードにコピーします。
      </p>
    </Card>
  )
}
