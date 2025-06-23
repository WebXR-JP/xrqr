import { useCallback } from "react"
import { useAsync } from "react-use"
import { useQRScanner } from "~/hooks/useQRScanner"
import { useHistory } from "~/providers/HistoryProvider"
import { useToastDispatcher } from "~/providers/ToastDispatcher"
import { copyToClipboard, getContentFromCodeData, getPreviewText } from "~/utils"

export const useCameraCard = () => {
  const { dispatch } = useToastDispatcher()
  const { addHistoryItem } = useHistory()
  const { videoRef, codeData, availableCameras, switchCamera } = useQRScanner()

  useAsync(async () => {
    if (!codeData) return
    let content
    try {
      content = getContentFromCodeData(codeData)
    } catch (err) {
      dispatch({
        message: 'QRコードの読み取りに失敗しました。無効なデータかもしれません。' + (err instanceof Error ? err.message : ''),
        type: 'error',
      })
      return
    }

    try {
      await copyToClipboard(content)
      const previewText = getPreviewText(content)
      dispatch({
        message: `QRコードを読み取りました！「${previewText}」をクリップボードにコピーしました`,
        type: 'success',
      })
    } catch (err) {
      dispatch({
        message: 'クリップボードへのコピーに失敗しました。',
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

  return {
    videoRef,
    availableCameras,
    handleCameraChange,
  }
}