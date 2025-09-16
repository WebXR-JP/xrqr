import { useTranslation } from 'react-i18next'
import { useCallback } from 'react'
import { Button } from "~/components/Button"
import { useToastDispatcher } from '~/providers/ToastDispatcher'
import styles from "./styles.module.css"

interface Props {
  qrCodeUrl: string
  qrData: string | null
  isSecure: boolean
  onClickResetQRCode: () => void
}

export const QRView = ({ qrCodeUrl, qrData, isSecure, onClickResetQRCode }: Props) => {
  const { t } = useTranslation();
  const { dispatch } = useToastDispatcher()

  const handleCopyShareLink = useCallback(() => {
    if (!qrData) return

    const encodedData = encodeURIComponent(qrData)
    const shareUrl = `${window.location.origin}?share=${encodedData}`

    navigator.clipboard.writeText(shareUrl)
      .then(() => {
        dispatch({
          message: t('sender.shareUrlCopied'),
          type: 'success'
        })
      })
      .catch(() => {
        dispatch({
          message: t('sender.shareUrlCopyFailed'),
          type: 'error'
        })
      })
  }, [qrData, dispatch, t])

  return (
    <div className={styles.qrDisplayWrapper}>
      <div className={styles.qrContainer}>
        <img src={qrCodeUrl} alt={t('sender.generatedQRTitle')} />
      </div>
      <div className={styles.qrInstructions}>
        <p>{t('sender.qrInstructions')}</p>
      </div>
      <div className={styles.buttonGroup}>
        {!isSecure && (
          <Button
            variant="primary"
            size="medium"
            onClick={handleCopyShareLink}
          >
            {t('sender.copyShareLink')}
          </Button>
        )}
        <Button
          variant="secondary"
          size="medium"
          onClick={onClickResetQRCode}
        >
          {t('sender.recreateQR')}
        </Button>
      </div>
    </div>
  )
}