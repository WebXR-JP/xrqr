import jsQR from 'jsqr'
import { useEffect, useRef, useState, useCallback } from 'react'
import { checkHMDBrowser } from '~/utils'

export const useQRScanner = (onScan: (data: string) => void, options?: { keepScanning?: boolean }) => {
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isScanning, setIsScanning] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [debugInfo, setDebugInfo] = useState<string[]>([])
  const hasLoggedScanStart = useRef(false)
  const frameCount = useRef(0)

  const addDebugInfo = (message: string) => {
    setDebugInfo(prev => [...prev.slice(-4), `${new Date().toLocaleTimeString()}: ${message}`])
  }

  const startScanning = useCallback(async () => {
    try {
      addDebugInfo('🔍 QRスキャン開始')
      const hasMediaDevices = !!navigator.mediaDevices
      const hasGetUserMedia = !!(navigator.mediaDevices && navigator.mediaDevices.getUserMedia)
      addDebugInfo(`📱 ブラウザ対応: MediaDevices=${hasMediaDevices}, getUserMedia=${hasGetUserMedia}`)

      // メディアデバイスAPIのポリフィル（HMD対応）
      if (navigator.mediaDevices === undefined) {
        addDebugInfo('⚠️ mediaDevices未定義 - ポリフィル適用')
        ;(navigator as any).mediaDevices = {}
      }

      if (!navigator.mediaDevices.getUserMedia) {
        addDebugInfo('⚠️ getUserMedia未定義 - レガシーAPI使用')
        ;(navigator as any).mediaDevices.getUserMedia = function(constraints: MediaStreamConstraints) {
          const getUserMedia = (navigator as any).webkitGetUserMedia || (navigator as any).mozGetUserMedia
          if (!getUserMedia) {
            return Promise.reject(new Error('getUserMedia is not implemented in this browser'))
          }
          return new Promise(function(resolve, reject) {
            getUserMedia.call(navigator, constraints, resolve, reject)
          })
        }
      }

      // まず基本的なアクセス権を取得（参考コードのアプローチ）
      addDebugInfo('🎥 基本アクセス権取得...')
      const tempStream = await navigator.mediaDevices.getUserMedia({ video: true })
      addDebugInfo('✅ 基本アクセス権取得成功')
      // 権限取得用ストリームを停止
      tempStream.getTracks().forEach(track => track.stop())

      // 利用可能なデバイスを確認
      const devices = await navigator.mediaDevices.enumerateDevices()
      const videoDevices = devices.filter(device => device.kind === 'videoinput')
      addDebugInfo(`📹 カメラデバイス: ${videoDevices.length}個検出`)

      // Quest/HMD環境の検出
      const isHMDBrowser = checkHMDBrowser()

      let stream: MediaStream

      if (isHMDBrowser && videoDevices.length > 0) {
        addDebugInfo('🥽 Quest環境 - デバイス個別指定でアクセス')

        // 後方カメラ（パススルーカメラ）を探す
        const backCamera = videoDevices.find(device =>
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('rear') ||
          device.label.toLowerCase().includes('environment')
        ) || videoDevices[videoDevices.length - 1] // 最後のデバイスを試行

        addDebugInfo(`🎯 選択デバイス: ${backCamera.label || 'Unknown'}`)

        // 参考コードと同じアプローチ：deviceIdで明示的に指定
        stream = await navigator.mediaDevices.getUserMedia({
          video: { deviceId: { exact: backCamera.deviceId } }
        })
      } else {
        addDebugInfo('💻 通常環境 - facingMode指定')
        // 通常環境では facingMode で背面カメラを指定
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: 'environment' }
        })
      }

      addDebugInfo('✅ カメラストリーム取得成功')

      if (videoRef.current) {
        const video = videoRef.current

        // 参考コードと同じ順序：属性設定→ストリーム設定
        addDebugInfo('📺 video属性設定中...')
        video.autoplay = true
        video.playsInline = true

        addDebugInfo('📺 ストリーム設定中...')
        video.srcObject = stream

        // 参考コードのアプローチ：autoplayに任せて、シンプルにスキャン開始
        addDebugInfo('🚀 スキャン処理を開始します')
        setIsScanning(true)

        // scanFrame()はuseEffectで自動実行されるので、ここでは呼ばない
      }
    } catch (error) {
      addDebugInfo(`❌ カメラアクセス失敗: ${error}`)
      setError('カメラにアクセスできません')
    }
  }, [])

  const stopScanning = () => {
    setIsScanning(false)
    hasLoggedScanStart.current = false
    frameCount.current = 0
    if (videoRef.current?.srcObject) {
      const tracks = (videoRef.current.srcObject as MediaStream).getTracks()
      tracks.forEach((track) => track.stop())
    }
  }

  const scanFrame = () => {
    if (!videoRef.current || !canvasRef.current || !isScanning) {
      addDebugInfo(`⚠️ スキャンフレーム条件未満足: video=${!!videoRef.current}, canvas=${!!canvasRef.current}, scanning=${isScanning}`)
      return
    }

    const video = videoRef.current
    const canvas = canvasRef.current
    const context = canvas.getContext('2d')

    // 初回のデバッグ情報を表示
    if (!hasLoggedScanStart.current) {
      addDebugInfo(`🔍 スキャンフレーム開始: readyState=${video.readyState}, HAVE_ENOUGH_DATA=${video.HAVE_ENOUGH_DATA}`)
      addDebugInfo(`📐 Video解像度: ${video.videoWidth}x${video.videoHeight}`)
      addDebugInfo(`📺 Video状態: paused=${video.paused}, ended=${video.ended}`)
      hasLoggedScanStart.current = true
    }

    if (video.readyState === video.HAVE_ENOUGH_DATA) {
      frameCount.current++

      // 30フレームごとにフレーム処理状況を報告
      if (frameCount.current % 30 === 1) {
        addDebugInfo(`🔄 フレーム処理中... (${frameCount.current}フレーム目)`)
      }

      // ビデオのアスペクト比を維持しながら、適切なサイズでキャンバスに描画
      const videoAspect = video.videoWidth / video.videoHeight
      const canvasWidth = 640
      const canvasHeight = canvasWidth / videoAspect

      // キャンバスサイズを設定
      canvas.width = canvasWidth
      canvas.height = canvasHeight

      // ビデオ全体を描画
      context?.drawImage(video, 0, 0, canvasWidth, canvasHeight)

      // グレースケール変換とコントラスト強調
      const imageData = context?.getImageData(0, 0, canvasWidth, canvasHeight)
      if (imageData) {
        const data = imageData.data
        for (let i = 0; i < data.length; i += 4) {
          // グレースケール変換
          const gray = data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114

          // コントラスト強調
          const contrast = 1.5
          const factor = (259 * (contrast + 255)) / (255 * (259 - contrast))
          const newGray = factor * (gray - 128) + 128

          // RGBすべてに同じ値を設定
          data[i] = data[i + 1] = data[i + 2] = Math.max(0, Math.min(255, newGray))
        }
        context?.putImageData(imageData, 0, 0)

        // QRコード検出を複数の向きで試行
        const angles = [0, 90, 180, 270]

        // 60フレームごとにQR検出処理状況を報告
        if (frameCount.current % 60 === 1) {
          addDebugInfo(`🔍 QRコード検出処理実行中...`)
        }

        for (const angle of angles) {
          if (angle > 0) {
            // キャンバスを回転
            const tempCanvas = document.createElement('canvas')
            const tempContext = tempCanvas.getContext('2d')
            if (!tempContext) continue

            if (angle === 90 || angle === 270) {
              tempCanvas.width = canvasHeight
              tempCanvas.height = canvasWidth
            } else {
              tempCanvas.width = canvasWidth
              tempCanvas.height = canvasHeight
            }

            tempContext.translate(tempCanvas.width / 2, tempCanvas.height / 2)
            tempContext.rotate((angle * Math.PI) / 180)
            tempContext.drawImage(canvas, -canvasWidth / 2, -canvasHeight / 2)

            const rotatedImageData = tempContext.getImageData(
              0,
              0,
              tempCanvas.width,
              tempCanvas.height,
            )
            const code = jsQR(rotatedImageData.data, tempCanvas.width, tempCanvas.height)
            if (code && code.data && code.data.trim().length >= 10) {
              addDebugInfo(`✅ QRコード検出成功 (回転角度: ${angle}度)`)
              onScan(code.data)
              if (!options?.keepScanning) {
                stopScanning()
              }
              return
            }
          } else {
            const code = jsQR(data, canvasWidth, canvasHeight)
            if (code && code.data && code.data.trim().length >= 10) {
              addDebugInfo('✅ QRコード検出成功')
              onScan(code.data)
              if (!options?.keepScanning) {
                stopScanning()
              }
              return
            }
          }
        }
      }
    }

    if (isScanning) {
      requestAnimationFrame(scanFrame)
    }
  }

  // isScanning状態が変更されたときにscanFrame()を実行
  useEffect(() => {
    if (isScanning) {
      addDebugInfo('✅ isScanning=true検出 - scanFrame開始')
      scanFrame()
    }
  }, [isScanning])

  useEffect(() => {
    return () => {
      stopScanning()
    }
  }, [])

  return {
    videoRef,
    canvasRef,
    startScanning,
    stopScanning,
    isScanning,
    error,
    debugInfo,
  }
}
