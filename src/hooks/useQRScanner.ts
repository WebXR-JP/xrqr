import jsQR from 'jsqr'
import { useCallback, useRef, useState } from 'react'
import { useAsync } from 'react-use'
import { getImageDataByVideo, startScanning, stopScanning } from '~/utils'

export const useQRScanner = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [codeData, setCodeData] = useState<string>('')

  const scanFrame = useCallback(() => {
    const video = videoRef.current
    if (!video) return

    // ビデオのアスペクト比を維持しながら、適切なサイズでキャンバスに描画
    const imageData = getImageDataByVideo(video)
    if (imageData) {
      const code = jsQR(imageData.data, imageData.width, imageData.height)
      if (code && code.data && code.data.trim().length >= 10) {
        // 前のコードと同じデータが連続していない場合のみ更新
        if (codeData !== code.data) {
          setCodeData(code.data)
        }
      } else {
        setCodeData('')
      }
    }

    // 3秒間隔でスキャンを実行
    setTimeout(scanFrame, 3000)
  }, [videoRef])

  useAsync(async () => {
    if (!videoRef.current) return
    await startScanning(videoRef.current)
    scanFrame()
    return () => { stopScanning(videoRef.current!) }
  }, [videoRef, scanFrame])

  return {
    videoRef,
    codeData,
  }
}
