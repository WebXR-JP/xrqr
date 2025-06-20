import { Button } from "~/components/Button"
import { useLocalStorage } from "~/hooks/useLocalStorage"
import { copyToClipboard } from "~/utils"
import { Card } from "~/components/Card"
import styles from "./styles.module.css"

export const HistoryCard = () => {
  const { history, removeHistoryItem, clearHistory } = useLocalStorage()

  return (
    <Card title="読み込み履歴" className={styles.container}>
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
    </Card>
  )
}