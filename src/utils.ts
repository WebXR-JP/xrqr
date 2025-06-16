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
    // 利用可能なデバイスを確認
    const devices = await navigator.mediaDevices.enumerateDevices()
    const videoDevices = devices.filter(device => device.kind === 'videoinput')

    if (videoDevices.length === 0) {
      throw new Error('カメラデバイスが見つかりません')
    }

    const camera = videoDevices.find(device => device.label.toLowerCase().includes('back')) || videoDevices[0]
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: camera.deviceId }
    })

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
