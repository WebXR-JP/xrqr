import QRCode from 'qrcode'
import { useCallback, useState } from 'react'
import { FormView } from './components/FormView'
import { QRView } from './components/QRView'
import styles from './styles.module.css'

export const SenderScreen = () => {
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)

  const handleSubmit = useCallback(async (content: string) => {
    try {
      const qrData = JSON.stringify({
        content,
        isSecret: false,
        timestamp: new Date().toISOString(),
        encrypted: false,
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
    <div className={styles.container}>
      <h1 className={styles.title}>QRコード生成</h1>

      {!qrCodeUrl ? (
        <FormView onSubmit={handleSubmit} />
      ) : (
        <QRView
          qrCodeUrl={qrCodeUrl}
          onClickResetQRCode={handleClickResetQRCode}
        />
      )}
    </div>
  )
}
