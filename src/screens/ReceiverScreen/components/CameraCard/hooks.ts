import { useCallback, useState } from "react"
import { useTranslation } from 'react-i18next'
import { useAsync } from "react-use"
import { useQRScanner } from "~/hooks/useQRScanner"
import { useHistory } from "~/providers/HistoryProvider"
import { useToastDispatcher } from "~/providers/ToastDispatcher"
import { copyToClipboard, getContentFromCodeData, getPreviewText } from "~/utils"

export const useCameraCard = () => {
  const { t } = useTranslation();
  const { dispatch } = useToastDispatcher()
  const { addHistoryItem } = useHistory()
  const { videoRef, codeData, availableCameras, switchCamera } = useQRScanner()
  const [encryptedData, setEncryptedData] = useState<string | null>(null)
  const [showPasswordModal, setShowPasswordModal] = useState(false)

  useAsync(async () => {
    if (!codeData) return
    let content
    try {
      content = getContentFromCodeData(codeData)
    } catch (err) {
      if (err instanceof Error && err.message.includes('暗号化されています')) {
        // 暗号化されたデータの場合はパスワード入力モーダルを表示
        try {
          const parsedData = JSON.parse(codeData)
          setEncryptedData(parsedData.content)
          setShowPasswordModal(true)
        } catch (parseErr) {
          dispatch({
            message: t('receiver.qrScanError'),
            type: 'error',
          })
        }
        return
      }
      dispatch({
        message: t('receiver.qrScanError') + (err instanceof Error ? err.message : ''),
        type: 'error',
      })
      return
    }

    try {
      await copyToClipboard(content)
      const previewText = getPreviewText(content)
      dispatch({
        message: t('receiver.qrScanSuccess', { content: previewText }),
        type: 'success',
      })
    } catch (err) {
      dispatch({
        message: t('receiver.clipboardCopyError'),
        type: 'error',
      })
      return
    }

    addHistoryItem({
      id: crypto.randomUUID(),
      content,
      preview: getPreviewText(content),
      timestamp: new Date().toISOString(),
    })
  }, [codeData])

  const handleCameraChange = useCallback((event: React.ChangeEvent<HTMLSelectElement>) => {
    const deviceId = event.target.value
    if (!deviceId) return
    switchCamera(deviceId)
  }, [switchCamera])

  const handleDecryptSuccess = useCallback(async (decryptedContent: string) => {
    const currentEncryptedData = encryptedData
    setEncryptedData(null)
    
    try {
      await copyToClipboard(decryptedContent)
      const previewText = getPreviewText(decryptedContent)
      dispatch({
        message: t('receiver.encryptedQrDecryptSuccess', { content: previewText }),
        type: 'success',
      })
      
      addHistoryItem({
        id: crypto.randomUUID(),
        content: decryptedContent,
        preview: '****',
        timestamp: new Date().toISOString(),
        isSecret: true,
        encryptedContent: currentEncryptedData || undefined,
      })
    } catch (err) {
      dispatch({
        message: t('receiver.clipboardCopyError'),
        type: 'error',
      })
    }
  }, [dispatch, addHistoryItem, encryptedData])

  const handlePasswordModalCancel = useCallback(() => {
    setEncryptedData(null)
  }, [])

  return {
    videoRef,
    availableCameras,
    handleCameraChange,
    encryptedData,
    showPasswordModal,
    handleDecryptSuccess,
    handlePasswordModalCancel,
  }
}