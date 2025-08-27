import { useState, useCallback } from "react"
import { useTranslation } from 'react-i18next'
import { Button } from "~/components/Button"
import { copyToClipboard, isURL } from "~/utils"
import { Card } from "~/components/Card"
import { useHistory } from "~/providers/HistoryProvider"
import { useToastDispatcher } from "~/providers/ToastDispatcher"
import { PasswordInputModal } from "../PasswordInputModal"
import styles from "./styles.module.css"

export const HistoryCard = () => {
  const { t } = useTranslation();
  const { history, removeHistoryItem } = useHistory()
  const { dispatch, closeToast } = useToastDispatcher()
  const [selectedSecretItem, setSelectedSecretItem] = useState<string | null>(null)

  const handleCopyToClipboard = async (content: string) => {
    try {
      await copyToClipboard(content)
      
      // URLかどうかをチェック
      if (isURL(content)) {
        dispatch({
          message: t('receiver.clipboardCopied'),
          type: 'success',
          buttons: [
            {
              text: t('receiver.openInBrowser'),
              onClick: () => {
                window.open(content, '_blank')
                closeToast()
              }
            },
            {
              text: t('common.cancel'),
              onClick: () => {
                closeToast()
              }
            }
          ]
        })
      } else {
        dispatch({
          message: t('receiver.clipboardCopied'),
          type: 'success'
        })
      }
    } catch (error) {
      dispatch({
        message: t('common.copyFailed'),
        type: 'error'
      })
    }
  }

  const handleItemClick = useCallback((item: any) => {
    if (item.isSecret) {
      // 秘匿情報の場合はパスワード入力モーダルを表示
      // encryptedContentがある場合はそれを使用、なければcontentを使用（後方互換性）
      setSelectedSecretItem(item.encryptedContent || item.content)
    } else {
      // 通常の情報の場合はそのままコピー
      handleCopyToClipboard(item.content)
    }
  }, [])

  const handleDecryptSuccess = useCallback((decryptedContent: string) => {
    setSelectedSecretItem(null)
    handleCopyToClipboard(decryptedContent)
  }, [])

  const handlePasswordModalCancel = useCallback(() => {
    setSelectedSecretItem(null)
  }, [])

  return (
    <>
      <Card title={t('receiver.historyTitle')} className={styles.container}>
        <div className={styles.historyList}>
          {history.map((item) => (
            <div key={item.id} className={styles.historyItem}>
              <div className={styles.historyItemContent} onClick={() => handleItemClick(item)}>
                <div className={styles.historyItemHeader}>
                  <div className={styles.historyItemInfo}>
                    {item.isSecret && <span className={styles.lockIcon}>🔒</span>}
                    <span className={styles.historyItemTime}>
                      {new Date(item.timestamp).toLocaleString('ja-JP', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                </div>
                <div className={styles.historyItemPreview}>
                  {item.preview}
                </div>
              </div>
              <div className={styles.deleteButtonArea}>
                <Button
                  variant="ghost"
                  size="small"
                  onClick={() => removeHistoryItem(item.id)}
                  className={styles.deleteButton}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512" className={styles.deleteIcon}>
                    <path d="M135.2 17.7C140.6 6.8 151.7 0 163.8 0L284.2 0c12.1 0 23.2 6.8 28.6 17.7L320 32l96 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L32 96C14.3 96 0 81.7 0 64S14.3 32 32 32l96 0 7.2-14.3zM32 128l384 0 0 320c0 35.3-28.7 64-64 64L96 512c-35.3 0-64-28.7-64-64l0-320zm96 64c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16zm96 0c-8.8 0-16 7.2-16 16l0 224c0 8.8 7.2 16 16 16s16-7.2 16-16l0-224c0-8.8-7.2-16-16-16z"/>
                  </svg>
                </Button>
              </div>
            </div>
          ))}
          {history.length === 0 && (
            <div className={styles.emptyMessage}>
              {t('receiver.noHistory')}
            </div>
          )}
        </div>
        <p className={styles.copyHint}>
          {t('receiver.historyInstructions')}
        </p>
      </Card>

      {selectedSecretItem && (
        <PasswordInputModal
          encryptedData={selectedSecretItem}
          onDecryptSuccess={handleDecryptSuccess}
          onCancel={handlePasswordModalCancel}
        />
      )}
    </>
  )
}