import jsQR from 'jsqr'
import { useCallback, useRef, useState } from 'react'
import { useAsync, useInterval } from 'react-use'
import { findBackCamera, getCameraDevices, getImageDataByVideo, requestCameraPermission, startPlayVideo, stopPlayingVideo } from '~/utils'

const DEFAULT_AVAILABLE_CAMERAS: MediaDeviceInfo[] = []
const INTERVAL_TIME = 3000 // QRコードのスキャン間隔（ミリ秒）

export const useQRScanner = () => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [codeData, setCodeData] = useState<string>('')
  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>(DEFAULT_AVAILABLE_CAMERAS)

  // 使用可能なカメラデバイスを取得する
  useAsync(async () => {
    if (availableCameras.length > 0) return
    try {
      const allowed = await requestCameraPermission()
      // カメラの許可を得るために一度アクセス
      if (allowed) {
        // デバイス一覧を取得
        const cameras = await getCameraDevices()

        setAvailableCameras(prev => {
          // デバイスに変更があった場合のみ更新
          if (prev.length === cameras.length && prev.every((cam, index) => cam.deviceId === cameras[index].deviceId)) {
            return prev
          }
          return cameras
        })
      }
    } catch (error) {
      throw new Error('カメラデバイスの取得に失敗しました: ' + error)
    }
  }, [availableCameras])

  useInterval(() => {
    if (!videoRef.current) return

    const imageData = getImageDataByVideo(videoRef.current)
    if (imageData) {
      const code = jsQR(imageData.data, imageData.width, imageData.height)
      if (code && code.data && code.data.trim().length >= 10) {
        setCodeData(code.data)
      } else {
        setCodeData('')
      }
    }
  }, INTERVAL_TIME)

  useAsync(async () => {
    if (!videoRef.current || !availableCameras.length) return
    const defaultCameraId = findBackCamera(availableCameras)?.deviceId || availableCameras[0].deviceId
    await startPlayVideo(videoRef.current, defaultCameraId)

    return () => {
      if (!videoRef.current) return
      stopPlayingVideo(videoRef.current)
    }
  }, [availableCameras])

    // 指定したカメラIDでカメラを切り替える関数
  const switchCamera = useCallback((deviceId: string) => {
    if (!videoRef.current) return
    startPlayVideo(videoRef.current, deviceId)
  }, [])

  return {
    videoRef,
    codeData,
    availableCameras,
    switchCamera,
  }
}
