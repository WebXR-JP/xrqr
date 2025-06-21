import jsQR from 'jsqr'
import { useCallback, useEffect, useRef, useState } from 'react'
import { useAsync } from 'react-use'
import { getImageDataByVideo, startScanning, stopScanning } from '~/utils'

interface CameraDevice {
  deviceId: string
  label: string
}

export const useQRScanner = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [codeData, setCodeData] = useState<string>('')
  const [availableCameras, setAvailableCameras] = useState<CameraDevice[]>([])
  const [currentCameraId, setCurrentCameraId] = useState<string>('')

  // カメラデバイス一覧を取得する関数
  const getCameraDevices = useCallback(async (): Promise<CameraDevice[]> => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      return videoDevices.map(device => ({
        deviceId: device.deviceId,
        label: device.label || `カメラ ${device.deviceId.substring(0, 8)}`
      }))
    } catch (error) {
      console.error('カメラデバイスの取得に失敗しました:', error)
      return []
    }
  }, [])

  // 指定したカメラIDでカメラを切り替える関数
  const switchCamera = useCallback(async (deviceId: string) => {
    if (!videoRef.current || !deviceId) return

    try {
      // 現在のストリームを停止
      stopScanning(videoRef.current)

      // 新しいカメラでストリームを開始
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: deviceId } }
      })

      videoRef.current.srcObject = stream
      setCurrentCameraId(deviceId)
    } catch (error) {
      console.error('カメラの切り替えに失敗しました:', error)
    }
  }, [])

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
  }, [codeData])

  // カメラデバイス一覧を初期化する
  useEffect(() => {
    const initializeCameras = async () => {
      // カメラの許可を得るために一度アクセス
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true })
        stream.getTracks().forEach(track => track.stop())
        
        // デバイス一覧を取得
        const cameras = await getCameraDevices()
        setAvailableCameras(cameras)
      } catch (error) {
        console.error('カメラの初期化に失敗しました:', error)
      }
    }

    initializeCameras()
  }, [getCameraDevices])

  useAsync(async () => {
    if (!videoRef.current) return
    await startScanning(videoRef.current)
    
    // 現在使用中のカメラIDを取得
    const video = videoRef.current
    if (video.srcObject) {
      const stream = video.srcObject as MediaStream
      const track = stream.getVideoTracks()[0]
      if (track && track.getSettings().deviceId) {
        setCurrentCameraId(track.getSettings().deviceId!)
      }
    }
    
    scanFrame()
    return () => { stopScanning(videoRef.current!) }
  }, [videoRef, scanFrame])

  return {
    videoRef,
    codeData,
    availableCameras,
    currentCameraId,
    switchCamera,
  }
}
