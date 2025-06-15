import { useCallback, useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { useLocalStorage } from '~/hooks/useLocalStorage'
import { useQRScanner } from '~/hooks/useQRScanner'
import { EncryptionService } from '~/services/EncryptionService'
import { Button } from '~/components/Button'
import type { HistoryItem } from '~/types'
import styles from './styles.module.css'

type Tab = 'camera' | 'history'

interface QRData {
  content: string
  isSecret: boolean
  timestamp: string
  encrypted?: boolean
}

export const ReceiverScreen = () => {
  const [activeTab, setActiveTab] = useState<Tab>('camera')
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [showToast, setShowToast] = useState(false)
  const {
    encryptionKey,
    history,
    setEncryptionKey,
    addHistoryItem,
    removeHistoryItem,
    clearHistory,
  } = useLocalStorage()

  const handleScan = useCallback(
    async (data: string) => {
      try {
        // データが空または短すぎる場合は無視
        if (!data || data.trim().length < 10) {
          return
        }

        let qrData: QRData

        try {
          // まず暗号化されていないJSONとしてパースを試みる
          qrData = JSON.parse(data)
          if (!qrData.encrypted) {
            await navigator.clipboard.writeText(qrData.content)

            const historyItem: HistoryItem = {
              id: crypto.randomUUID(),
              content: qrData.content,
              preview: qrData.content.slice(0, 50),
              timestamp: qrData.timestamp,
            }
            addHistoryItem(historyItem)
            setError(null)
            setSuccessMessage('QRコードを読み取りました！クリップボードにコピーしました')
            setShowToast(true)
            // 3秒後にメッセージを消す
            setTimeout(() => {
              setSuccessMessage(null)
              setShowToast(false)
            }, 3000)
            return
          }
        } catch {
          // JSONパースに失敗した場合は暗号化されたデータとして処理
          if (!encryptionKey) {
            setError('暗号化キーが設定されていません')
            return
          }

          try {
            const decrypted = EncryptionService.decrypt(data, encryptionKey)
            await navigator.clipboard.writeText(decrypted.content)

            if (!decrypted.isSecret) {
              const historyItem: HistoryItem = {
                id: crypto.randomUUID(),
                content: decrypted.content,
                preview: decrypted.content.slice(0, 50),
                timestamp: decrypted.timestamp,
              }
              addHistoryItem(historyItem)
            }
            setSuccessMessage('暗号化されたQRコードを読み取りました！クリップボードにコピーしました')
            setShowToast(true)
            // 3秒後にメッセージを消す
            setTimeout(() => {
              setSuccessMessage(null)
              setShowToast(false)
            }, 3000)
            setError(null)
          } catch (decryptError) {
            // 暗号化解除に失敗した場合は、無効なQRコードとして無視
            console.warn('Invalid QR code data detected and ignored:', data.slice(0, 50))
            return
          }
        }
      } catch (err) {
        console.error('QR code scanning unexpected error:', err)
        // 予期しないエラーの場合のみエラー表示
        setError('QRコードの読み取りに失敗しました')
      }
    },
    [encryptionKey, addHistoryItem],
  )

  const {
    videoRef,
    canvasRef,
    startScanning,
    isScanning,
    error: scanError,
    debugInfo,
  } = useQRScanner(handleScan, { keepScanning: true })

  // カメラタブがアクティブかつ暗号化キーが設定されている場合、自動でスキャンを開始
  useEffect(() => {
    if (activeTab === 'camera' && encryptionKey && !isScanning) {
      startScanning()
    }
  }, [activeTab, encryptionKey, isScanning])

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content)
    } catch (err) {
      setError('クリップボードへのコピーに失敗しました')
    }
  }

  if (!encryptionKey) {
    return (
      <div className={styles.container}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>暗号化キーを設定してください（4桁の数字）</label>
          <input
            type="text"
            className={styles.pinInput}
            maxLength={4}
            pattern="\d*"
            inputMode="numeric"
            onChange={(e) => {
              const value = e.target.value.replace(/[^\d]/g, '')
              if (value.length === 4) {
                setEncryptionKey(value)
              }
            }}
          />
        </div>
      </div>
    )
  }

  return (
    <>
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
          <div className={styles.historyContainer}>
            {history.length > 0 && (
              <Button variant="secondary" size="small" onClick={clearHistory} className={styles.clearAllButton}>
                履歴を全て削除
              </Button>
            )}
            {history.map((item) => (
              <div key={item.id} className={styles.historyItem}>
                <div className={styles.historyItemHeader}>
                  <span className={styles.historyItemTime}>
                    {new Date(item.timestamp).toLocaleString()}
                  </span>
                  <Button variant="ghost" size="small" onClick={() => removeHistoryItem(item.id)} className={styles.deleteButton}>
                    削除
                  </Button>
                </div>
                <div
                  className={styles.historyItemPreview}
                  onClick={() => copyToClipboard(item.content)}
                >
                  {item.preview}
                </div>
              </div>
            ))}
          </div>
        )}

        {(error || scanError) && <div className={styles.error}>{error || scanError}</div>}
      </div>

      {/* デバッグ情報を Portal で body に直接配置 */}
      {import.meta.env.DEV && debugInfo.length > 0 && createPortal(
        <div className={styles.debugContainer}>
          <h4>📊 デバッグ情報</h4>
          {debugInfo.map((info, index) => (
            <div key={index} className={styles.debugItem}>
              {info}
            </div>
          ))}
        </div>,
        document.body
      )}

      {/* トーストメッセージ */}
      {showToast && successMessage && (
        <div className={styles.toast}>
          <div className={styles.toastIcon}>✓</div>
          <div className={styles.toastMessage}>{successMessage}</div>
        </div>
      )}
    </>
  )
}