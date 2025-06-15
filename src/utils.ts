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
