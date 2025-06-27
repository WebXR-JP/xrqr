import { useTranslation } from 'react-i18next'
import { Button } from "~/components/Button"
import styles from "./styles.module.css"

interface Props {
  qrCodeUrl: string
  onClickResetQRCode: () => void
}

export const QRView = ({ qrCodeUrl, onClickResetQRCode }: Props) => {
  const { t } = useTranslation();
  
  return (
    <div className={styles.qrDisplayWrapper}>
      <div className={styles.qrContainer}>
        <img src={qrCodeUrl} alt={t('sender.generatedQRTitle')} />
      </div>
      <div className={styles.qrInstructions}>
        <p>{t('sender.qrInstructions')}</p>
      </div>
      <Button
        variant="secondary"
        size="medium"
        onClick={onClickResetQRCode}
      >
        {t('sender.recreateQR')}
      </Button>
    </div>
  )
}