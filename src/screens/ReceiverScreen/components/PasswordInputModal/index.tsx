import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '~/components/Button'
import { decryptText } from '~/utils/crypto'
import styles from './styles.module.css'

interface Props {
  encryptedData: string
  onDecryptSuccess: (decryptedContent: string) => void
  onCancel: () => void
}

export const PasswordInputModal = ({ encryptedData, onDecryptSuccess, onCancel }: Props) => {
  const { t } = useTranslation();
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isDecrypting, setIsDecrypting] = useState(false)

  const handlePasswordChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4)
    setPassword(value)
    setError('')
  }, [])

  const handleDecrypt = useCallback(async () => {
    if (password.length !== 4) {
      setError(t('receiver.passwordValidationError'))
      return
    }

    setIsDecrypting(true)
    setError('')

    try {
      const decryptedContent = decryptText(encryptedData, password)
      onDecryptSuccess(decryptedContent)
    } catch (err) {
      setError(t('receiver.passwordError'))
    } finally {
      setIsDecrypting(false)
    }
  }, [password, encryptedData, onDecryptSuccess])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleDecrypt()
    } else if (e.key === 'Escape') {
      onCancel()
    }
  }, [handleDecrypt, onCancel])

  return (
    <div className={styles.overlay}>
      <div className={styles.modal}>
        <h3 className={styles.title}>{t('receiver.passwordModalTitle')}</h3>
        <p className={styles.description}>
          {t('receiver.passwordModalDescription')}
        </p>

        <div className={styles.inputGroup}>
          <input
            type="password"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={4}
            className={styles.passwordInput}
            value={password}
            onChange={handlePasswordChange}
            onKeyDown={handleKeyDown}
            placeholder={t('receiver.passwordPlaceholder')}
            autoComplete="one-time-code"
            data-1p-ignore
            data-lpignore="true"
            data-form-type="other"
            autoFocus
          />
        </div>

        {error && (
          <div className={styles.error}>{error}</div>
        )}

        <div className={styles.actions}>
          <Button
            variant="secondary"
            size="medium"
            onClick={onCancel}
            disabled={isDecrypting}
          >
            {t('common.cancel')}
          </Button>
          <Button
            variant="primary"
            size="medium"
            onClick={handleDecrypt}
            disabled={password.length !== 4 || isDecrypting}
          >
            {isDecrypting ? t('receiver.decrypting') : t('receiver.decrypt')}
          </Button>
        </div>
      </div>
    </div>
  )
}