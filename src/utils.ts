export const checkHMDBrowser = () => {
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
    console.error('Failed to copy to clipboard', err)
  }
}

export const validatePin = (pin: string) => {
  return /^\d{4}$/.test(pin)
}
