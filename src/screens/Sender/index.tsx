import QRCode from 'qrcode'
import { useCallback, useState } from 'react'
import { EncryptionService } from '~/services/EncryptionService'
import { Button } from '~/components/Button'
import styles from './styles.module.css'

export const SenderScreen = () => {
  const [content, setContent] = useState('')
  const [pin, setPin] = useState('')
  const [isEncrypted, setIsEncrypted] = useState(false)
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const validatePin = (pin: string) => {
    return /^\d{4}$/.test(pin)
  }

  const generateQRCode = useCallback(async () => {
    try {
      if (!content.trim()) {
        setError('テキストを入力してください')
        return
      }

      if (isEncrypted && !validatePin(pin)) {
        setError('4桁の数字を入力してください')
        return
      }

      let qrData: string
      if (isEncrypted) {
        qrData = EncryptionService.encrypt(content, pin, true)
      } else {
        qrData = JSON.stringify({
          content,
          isSecret: false,
          timestamp: new Date().toISOString(),
          encrypted: false,
        })
      }

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
  }, [content, pin, isEncrypted])

  const resetQRCode = () => {
    setQrCodeUrl(null)
    setError(null)
  }

  const handlePinChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d]/g, '').slice(0, 4)
    setPin(value)
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

              <div className={styles.checkboxGroup}>
                <input
                  id="isEncrypted"
                  type="checkbox"
                  className={styles.checkbox}
                  checked={isEncrypted}
                  onChange={(e) => {
                    setIsEncrypted(e.target.checked)
                    if (!e.target.checked) {
                      setPin('')
                    }
                  }}
                />
                <div>
                  <label className={styles.label} htmlFor="isEncrypted">
                    パスワード等の秘匿情報（暗号化）
                  </label>
                  <div className={styles.description}>
                    テキストを暗号化してQRコードに保存し、履歴に残さない設定にします
                  </div>
                </div>
              </div>

              {isEncrypted && (
                <div className={styles.inputGroup}>
                  <label className={styles.label} htmlFor="pin">
                    暗号化キー（4桁の数字）
                  </label>
                  <input
                    id="pin"
                    type="text"
                    className={styles.pinInput}
                    value={pin}
                    onChange={handlePinChange}
                    placeholder="0000"
                    inputMode="numeric"
                  />
                </div>
              )}

              <Button
                variant="primary"
                size="medium"
                onClick={generateQRCode}
                disabled={!content.trim() || (isEncrypted && !validatePin(pin))}
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
