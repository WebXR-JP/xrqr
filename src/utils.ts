export const checkHMDBrowser = () => {
  // url に dev=true が含まれている場合は HMDBrowser とみなす
  const urlParams = new URLSearchParams(window.location.search)
  if (urlParams.has('dev') && urlParams.get('dev') === 'true') {
    return true
  }

  return (
    navigator.userAgent.toLowerCase().includes('quest') ||
    navigator.userAgent.toLowerCase().includes('oculus') ||
    navigator.userAgent.toLowerCase().includes('meta')
  )
}

export const copyToClipboard = async (content: string) => {
  try {
    await navigator.clipboard.writeText(content)
  } catch (err) {
    throw new Error('クリップボードへのコピーに失敗しました。')
  }
}

export const validatePin = (pin: string) => {
  return /^\d{4}$/.test(pin)
}

export const startScanning = async (video: HTMLVideoElement) => {
  try {
    // まず基本的なカメラの許可を取得
    let stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: 'environment' } // 背面カメラを優先
    })

    // 許可が得られた後、利用可能なデバイスを確認
    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter(device => device.kind === 'videoinput')

    if (videoDevices.length === 0) {
      throw new Error('カメラデバイスが見つかりません')
    }

    // 背面カメラを探す（許可後はラベルが見える）
    const backCamera = videoDevices.find(device =>
      device.label.toLowerCase().includes('back') ||
      device.label.toLowerCase().includes('rear') ||
      device.label.toLowerCase().includes('environment')
    )

    // 背面カメラが見つかった場合は、ストリームを切り替え
    if (backCamera && backCamera.deviceId) {
      // 現在のストリームを停止
      stream.getTracks().forEach(track => track.stop())

      // 背面カメラでストリームを再取得
      stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: { exact: backCamera.deviceId } }
      })
    }

    if (video) {
      video.autoplay = true
      video.playsInline = true
      video.srcObject = stream
    }
  } catch (error) {
    throw new Error('カメラにアクセスできません')
  }
}

export const stopScanning = (video: HTMLVideoElement) => {
  if (video.srcObject) {
    const tracks = (video.srcObject as MediaStream).getTracks()
    tracks.forEach((track) => track.stop())
    video.srcObject = null
  }
}

export const getImageDataByVideo = (video: HTMLVideoElement): ImageData | null => {
  if (!video || !video.videoWidth || !video.videoHeight) {
    return null
  }

  const canvas = document.createElement('canvas')
  canvas.width = video.videoWidth
  canvas.height = video.videoHeight
  const context = canvas.getContext('2d')

  if (!context) {
    return null
  }

  context.drawImage(video, 0, 0, canvas.width, canvas.height)
  return context.getImageData(0, 0, canvas.width, canvas.height)
}
