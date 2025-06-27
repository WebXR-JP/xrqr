import QRCode from 'qrcode'
import { useCallback, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { FormView } from './components/FormView'
import { QRView } from './components/QRView'
import { Card } from '~/components/Card'
import { encryptText } from '~/utils/crypto'
import styles from './styles.module.css'

export const SenderScreen = () => {
  const { t } = useTranslation();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)

  const handleSubmit = useCallback(async (content: string, passcode?: string) => {
    try {
      const isSecure = !!passcode
      let processedContent = content

      // 秘匿情報の場合は暗号化
      if (isSecure && passcode) {
        processedContent = encryptText(content, passcode)
      }

      const qrData = JSON.stringify({
        content: processedContent,
        isSecret: isSecure,
        timestamp: new Date().toISOString(),
        encrypted: isSecure,
        // パスワードはQRコードに含めない（セキュリティ向上）
      })

      const qrCode = await QRCode.toDataURL(qrData, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 300,
      })

      setQrCodeUrl(qrCode)
    } catch (err) {
      console.error('QR code generation failed:', err)
    }
  }, [setQrCodeUrl])

  const handleClickResetQRCode = useCallback(() => {
    setQrCodeUrl(null)
  }, [setQrCodeUrl])

  return (
    <Card title={t('sender.qrGeneratorTitle')} className={styles.container}>
      {!qrCodeUrl ? (
        <FormView onSubmit={handleSubmit} />
      ) : (
        <QRView
          qrCodeUrl={qrCodeUrl}
          onClickResetQRCode={handleClickResetQRCode}
        />
      )}
    </Card>
  )
}
