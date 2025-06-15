import jsQR from 'jsqr'
import { useEffect, useRef, useState, useCallback } from 'react'
import { checkHMDBrowser } from '~/utils'

export const useQRScanner = (onScan: (data: string) => void, options?: { keepScanning?: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const isHMDBrowser = checkHMDBrowser()

  const startScanning = useCallback(async () => {
    try {
      // まず基本的なアクセス権を取得（参考コードのアプローチ）
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true })
      // 権限取得用ストリームを停止
      tempStream.getTracks().forEach(track => track.stop())

      // 利用可能なデバイスを確認
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')

      let stream: MediaStream
      if (isHMDBrowser && videoDevices.length > 0) {
        // TODO: HMD環境でのカメラデバイス選択ロジック
        const backCamera = videoDevices[0]
        stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: backCamera.deviceId } }
        })
      } else {
        // 通常環境では facingMode で背面カメラを指定
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        })
      }

      if (videoRef.current) {
        const video = videoRef.current
        video.autoplay = true
        video.playsInline = true
        video.srcObject = stream
        setIsScanning(true)
      }
    } catch (error) {
      console.error('カメラにアクセスできません', error)
    }
  }, [])

  const stopScanning = () => {
    setIsScanning(false)
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
    }
  }

  const scanFrame = () => {
    const video = videoRef.current
    const canvas = canvasRef.current

    if (!video || !canvas || !isScanning) return
    if (video.readyState !== video.HAVE_ENOUGH_DATA) {
      requestAnimationFrame(scanFrame)
      return
    }

    const context = canvas.getContext('2d')

    // ビデオのアスペクト比を維持しながら、適切なサイズでキャンバスに描画
    const videoAspect = video.videoWidth / video.videoHeight
    const canvasWidth = 640
    const canvasHeight = canvasWidth / videoAspect
    canvas.width = canvasWidth
    canvas.height = canvasHeight
    context?.drawImage(video, 0, 0, canvasWidth, canvasHeight)

    const imageData = context?.getImageData(0, 0, canvasWidth, canvasHeight)
    if (imageData) {
      const code = jsQR(imageData.data, canvasWidth, canvasHeight)
      if (code && code.data && code.data.trim().length >= 10) {
        onScan(code.data)
        if (!options?.keepScanning) {
          stopScanning()
        }
        return
      }
    }

    requestAnimationFrame(scanFrame)
  }

  useEffect(() => {
    if (isScanning && videoRef.current) { scanFrame() }
  }, [isScanning])

  useEffect(() => {
    return () => { stopScanning() }
  }, [])

  return {
    videoRef,
    canvasRef,
    startScanning,
    stopScanning,
    isScanning,
  }
}
