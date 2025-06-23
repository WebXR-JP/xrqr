import { Button } from "~/components/Button"
import { copyToClipboard } from "~/utils"
import { Card } from "~/components/Card"
import { useHistory } from "~/providers/HistoryProvider"
import { useToastDispatcher } from "~/providers/ToastDispatcher"
import styles from "./styles.module.css"

export const HistoryCard = () => {
  const { history, removeHistoryItem } = useHistory()
  const { dispatch } = useToastDispatcher()

  const handleCopyToClipboard = async (content: string) => {
    try {
      await copyToClipboard(content)
      dispatch({
        message: 'クリップボードにコピーしました',
        type: 'success'
      })
    } catch (error) {
      dispatch({
        message: 'コピーに失敗しました',
        type: 'error'
      })
    }
  }

  return (
    <Card title="読み込み履歴" className={styles.container}>
      <div className={styles.historyList}>
        {history.map((item) => (
          <div key={item.id} className={styles.historyItem}>
            <div className={styles.historyItemHeader}>
              <span className={styles.historyItemTime}>
                {new Date(item.timestamp).toLocaleString('ja-JP', {
                  year: 'numeric',
                  month: '2-digit',
                  day: '2-digit',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </span>
              <Button variant="ghost" size="small" onClick={() => removeHistoryItem(item.id)} className={styles.deleteButton}>
                削除
              </Button>
            </div>
            <div
              className={styles.historyItemPreview}
              onClick={() => handleCopyToClipboard(item.content)}
            >
              {item.preview}
            </div>
          </div>
        ))}
        {history.length === 0 && (
          <div className={styles.emptyMessage}>
            履歴はありません
          </div>
        )}
      </div>
      <p className={styles.copyHint}>
        クリックで内容をコピーできます。
      </p>
    </Card>
  )
}