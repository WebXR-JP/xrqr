import { useCallback, useState } from "react"
import { useTranslation } from 'react-i18next'
import { Button } from "~/components/Button"
import styles from "./styles.module.css"

interface Props {
  onSubmit: (content: string, passcode?: string) => void
}

export const FormView = ({ onSubmit }: Props) => {
  const { t } = useTranslation();
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
          {t('sender.textLabel')}
        </label>
        <textarea
          id="content"
          className={styles.textArea}
          value={content}
          onChange={handleChangeContent}
          placeholder={t('sender.textPlaceholder')}
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
          {t('sender.secureShare')}
        </label>
        <small className={styles.description}>
          {t('sender.secureShareDescription')}
        </small>
      </div>

      {isSecure && (
        <div className={styles.inputGroup}>
          <label className={styles.label} htmlFor="passcode">
            {t('sender.passcodeLabel')}
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
        {t('sender.generateQR')}
      </Button>
    </div>
  )
}