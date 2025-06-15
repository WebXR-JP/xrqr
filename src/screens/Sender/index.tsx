import QRCode from 'qrcode'
import { useCallback, useState } from 'react'
import { Button } from '~/components/Button'
import styles from './styles.module.css'

export const SenderScreen = () => {
  const [content, setContent] = useState('')
  const isEncrypted = false // 暫定的に暗号化は無効化
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const generateQRCode = useCallback(async () => {
    try {
      if (!content.trim()) {
        setError('テキストを入力してください')
        return
      }

      let qrData: string
      qrData = JSON.stringify({
        content,
        isSecret: false,
        timestamp: new Date().toISOString(),
        encrypted: false,
      })

      const qrCode = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 300,
      })

      setQrCodeUrl(qrCode)
      setError(null)
    } catch (err) {
      setError('QRコードの生成に失敗しました')
      console.error('QR code generation failed:', err)
    }
  }, [content, isEncrypted])

  const resetQRCode = () => {
    setQrCodeUrl(null)
    setError(null)
  }

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>QRコード生成</h1>

      {!qrCodeUrl ? (
        <div className={styles.contentWrapper}>
          <div className={styles.formSection}>
            <div className={styles.form}>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="content">
                  テキスト
                </label>
                <div className={styles.description}>
                  VRヘッドセットのクリップボードに送信したいテキストを入力してください
                </div>
                <textarea
                  id="content"
                  className={styles.textArea}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder="送信したいテキストを入力してください"
                />
              </div>

              <Button
                variant="primary"
                size="medium"
                onClick={generateQRCode}
                disabled={!content.trim()}
              >
                QRコード生成
              </Button>
            </div>

            {error && <div className={styles.error}>{error}</div>}
          </div>
        </div>
      ) : (
        <div className={styles.qrDisplayWrapper}>
          <div className={styles.qrContainer}>
            <img src={qrCodeUrl} alt="生成されたQRコード" />
          </div>
          <div className={styles.qrInstructions}>
            <p>VRゴーグルで xrqr.net を開いてこのQRコードをスキャンすると、クリップボードにコピーされます</p>
          </div>
          <Button
            variant="secondary"
            size="medium"
            onClick={resetQRCode}
          >
            QRを作り直す
          </Button>
        </div>
      )}
    </div>
  )
}
