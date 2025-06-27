import { useCallback, useState } from "react"
import { Button } from "~/components/Button"
import styles from "./styles.module.css"

interface Props {
  onSubmit: (content: string, passcode?: string) => void
}

export const FormView = ({ onSubmit }: Props) => {
  const [content, setContent] = useState('')
  const [passcode, setPasscode] = useState('')
  const [isSecure, setIsSecure] = useState(false)

  const handleSubmit = useCallback(() => {
    onSubmit(content, isSecure ? passcode : undefined)
  }, [content, passcode, isSecure, onSubmit])

  const handleChangeContent = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value)
  }, [])

  const handleChangePasscode = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
    setPasscode(value)
  }, [])

  const handleToggleSecure = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSecure(e.target.checked)
    if (!e.target.checked) {
      setPasscode('')
    }
  }, [])

  return (
    <div className={styles.form}>
      <div className={styles.inputGroup}>
        <label className={styles.label} htmlFor="content">
          テキスト
        </label>
        <textarea
          id="content"
          className={styles.textArea}
          value={content}
          onChange={handleChangeContent}
          placeholder="VRヘッドセットのクリップボードに送信したいテキストを入力してください"
        />
      </div>

      <div className={styles.inputGroup}>
        <label className={styles.checkboxLabel}>
          <input
            type="checkbox"
            checked={isSecure}
            onChange={handleToggleSecure}
            className={styles.checkbox}
          />
          セキュアな共有（4桁パスコード）
        </label>
        <small className={styles.description}>
          重要な情報を暗号化してQRコードに含めます。受信側で同じパスコードが必要になります。
        </small>
      </div>

      {isSecure && (
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="passcode">
            4桁パスコード
          </label>
          <input
            id="passcode"
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            className={styles.passcodeInput}
            value={passcode}
            onChange={handleChangePasscode}
            placeholder="1234"
            autoComplete="off"
            data-1p-ignore
          />
        </div>
      )}

      <Button
        variant="primary"
        size="medium"
        onClick={handleSubmit}
        disabled={!content.trim() || (isSecure && passcode.length !== 4)}
      >
        QRコード生成
      </Button>
    </div>
  )
}