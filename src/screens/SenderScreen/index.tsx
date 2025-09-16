import QRCode from 'qrcode'
import { useCallback, useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { FormView } from './components/FormView'
import { QRView } from './components/QRView'
import { Card } from '~/components/Card'
import { encryptText } from '~/utils/crypto'
import styles from './styles.module.css'

export const SenderScreen = () => {
  const { t } = useTranslation();
  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null)
  const [qrData, setQrData] = useState<string | null>(null)
  const [isSecure, setIsSecure] = useState(false)

  // URLパラメータから共有データを取得して自動的にQRコードを生成
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const sharedData = params.get('share')

    if (sharedData) {
      try {
        const decodedData = decodeURIComponent(sharedData)
        generateQRFromData(decodedData)
      } catch (err) {
        console.error('Failed to decode shared data:', err)
      }
    }
  }, [])

  const generateQRFromData = useCallback(async (data: string) => {
    try {
      const qrCode = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 300,
      })

      setQrData(data)
      setQrCodeUrl(qrCode)

      // 共有されたデータから暗号化フラグを取得
      try {
        const parsedData = JSON.parse(data)
        setIsSecure(parsedData.encrypted || false)
      } catch {
        setIsSecure(false)
      }
    } catch (err) {
      console.error('QR code generation from shared data failed:', err)
    }
  }, [])

  const handleSubmit = useCallback(async (content: string, passcode?: string) => {
    try {
      const secure = !!passcode
      let processedContent = content

      // 秘匿情報の場合は暗号化
      if (secure && passcode) {
        processedContent = encryptText(content, passcode)
      }

      const data = JSON.stringify({
        content: processedContent,
        isSecret: secure,
        timestamp: new Date().toISOString(),
        encrypted: secure,
        // パスワードはQRコードに含めない（セキュリティ向上）
      })

      const qrCode = await QRCode.toDataURL(data, {
        errorCorrectionLevel: 'M',
        margin: 2,
        width: 300,
      })

      setQrData(data)
      setQrCodeUrl(qrCode)
      setIsSecure(secure)
    } catch (err) {
      console.error('QR code generation failed:', err)
    }
  }, [])

  const handleClickResetQRCode = useCallback(() => {
    setQrCodeUrl(null)
    setQrData(null)
    setIsSecure(false)
    // URLパラメータをクリア
    const url = new URL(window.location.href)
    url.searchParams.delete('share')
    window.history.replaceState({}, '', url.toString())
  }, [])

  return (
    <Card title={t('sender.qrGeneratorTitle')} className={styles.container}>
      {!qrCodeUrl ? (
        <FormView onSubmit={handleSubmit} />
      ) : (
        <QRView
          qrCodeUrl={qrCodeUrl}
          qrData={qrData}
          isSecure={isSecure}
          onClickResetQRCode={handleClickResetQRCode}
        />
      )}
    </Card>
  )
}
