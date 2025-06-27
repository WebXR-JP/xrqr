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

// カメラの許可を取得
export const requestCameraPermission = async () => {
  try {
    // ユーザーにカメラの許可を要求
    const stream = await navigator.mediaDevices.getUserMedia({ video: true })
    // ストリームを停止して、許可が得られたことを確認
    stream.getTracks().forEach(track => track.stop())
    return true
  } catch (error) {
    return false
  }
}

export const getCameraDevices = async () => {
  try {
    // 許可が得られた後、利用可能なデバイスを確認
    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter(device => device.kind === 'videoinput')

    if (videoDevices.length === 0) {
      throw new Error('カメラデバイスが見つかりません')
    }

    return videoDevices
  } catch (error) {
    console.error('カメラデバイスの取得に失敗しました:', error)
    return []
  }
}

export const getCameraStream = async (deviceId: string) => {
  try {
    // 指定されたデバイスIDでカメラストリームを取得
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: { exact: deviceId } }
    })
    return stream
  } catch (error) {
    console.error('カメラストリームの取得に失敗しました:', error)
    throw new Error('カメラストリームの取得に失敗しました')
  }
}

export const findBackCamera = (videoDevices: MediaDeviceInfo[]) => {
    // 背面カメラを探す（許可後はラベルが見える）
    const backCamera = videoDevices.find(device =>
      device.label.toLowerCase().includes('back') ||
      device.label.toLowerCase().includes('rear') ||
      device.label.toLowerCase().includes('environment')
    )
    return backCamera || null
}

export const startPlayVideo = async (video: HTMLVideoElement, deviceId: string) => {
  stopPlayingVideo(video) // 既存のストリームを停止
  try {
    const stream = await getCameraStream(deviceId)
    if (video) {
      video.autoplay = true
      video.playsInline = true
      video.srcObject = stream
    }
  } catch (error) {
    throw new Error('カメラにアクセスできません')
  }
}

export const stopPlayingVideo = (video: HTMLVideoElement) => {
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


export const getContentFromCodeData = (codeData: string): string => {
  try {
    // QRコードのデータがJSON形式であることを確認
    const parsedData = JSON.parse(codeData)
    
    // 暗号化されたデータの場合は復号化が必要
    if (parsedData.encrypted && parsedData.isSecret) {
      // 暗号化されたデータの場合はパスワード入力を促す
      throw new Error('このQRコードは暗号化されています。パスワードが必要です。')
    }
    
    return parsedData.content || codeData // contentフィールドが存在しない場合は元のデータを返す
  } catch (e) {
    if (e instanceof Error && e.message.includes('暗号化されています')) {
      throw e // 暗号化エラーはそのまま投げる
    }
    return codeData // JSONパースに失敗した場合は元のデータを返す
  }
}

export const getPreviewText = (content: string): string => {
  if (content.length > 20) {
    return content.substring(0, 20) + '...'
  }
  return content
}