import { useCallback, useState } from "react"
import { Button } from "~/components/Button"
import styles from "./styles.module.css"

interface Props {
  onSubmit: (content: string) => void
}

export const FormView = ({ onSubmit }: Props) => {
  const [content, setContent] = useState('')

  const handleSubmit = useCallback(() => {
    onSubmit(content)
  }, [content, onSubmit])

  const handleChangeContent = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
  }, [])

  return (
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
          onChange={handleChangeContent}
          placeholder="送信したいテキストを入力してください"
        />
      </div>

      <Button
        variant="primary"
        size="medium"
        onClick={handleSubmit}
        disabled={!content.trim()}
      >
        QRコード生成
      </Button>
    </div>
  )
}