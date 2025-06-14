import React, { useEffect, useState } from 'react'
import { useXRDetection } from '~/hooks/useXRDetection'
import { Button } from '~/components/Button'
import styles from './styles.module.css'

type DeviceType = 'sender' | 'receiver' | null

interface DeviceDetectorViewProps {
  onDeviceTypeSelect: (type: DeviceType) => void
}

export const DeviceDetectorView: React.FC<DeviceDetectorViewProps> = ({ onDeviceTypeSelect }) => {
  const isXRDevice = useXRDetection()
  const [manualSelect, setManualSelect] = useState(false)
  
  // 開発用フラグ：URLパラメータで dev=true が指定されている場合
  const urlParams = new URLSearchParams(window.location.search)
  const devParam = urlParams.get('dev')
  const isDevMode = devParam === 'true'

  console.log('DeviceDetectorView rendered')
  console.log('URL search:', window.location.search)
  console.log('dev param:', devParam)
  console.log('isXRDevice:', isXRDevice)
  console.log('isDevMode:', isDevMode)
  console.log('Button disabled:', !isXRDevice && !isDevMode)

  useEffect(() => {
    // 開発モードの場合は自動遷移を無効にする
    if (isXRDevice !== null && !manualSelect && !isDevMode) {
      onDeviceTypeSelect(isXRDevice ? 'receiver' : 'sender')
    }
  }, [isXRDevice, manualSelect, onDeviceTypeSelect, isDevMode])

  if (isXRDevice === null) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>デバイスを確認中...</div>
      </div>
    )
  }

  return (
    <div className={styles.container}>
      {isXRDevice ? null : (
        <div className={styles.info}>このデバイスは送信側として利用可能です</div>
      )}
      {isDevMode && (
        <div className={styles.info}>開発モード: PCでもReceiver画面を確認できます</div>
      )}
      <div className={styles.manualSelect}>
        <Button
          variant="primary"
          size="large"
          onClick={() => {
            setManualSelect(true)
            onDeviceTypeSelect('sender')
          }}
        >
          送信側として使用
        </Button>
        <Button
          variant="primary"
          size="large"
          onClick={() => {
            setManualSelect(true)
            onDeviceTypeSelect('receiver')
          }}
          disabled={!isXRDevice && !isDevMode}
        >
          受信側として使用{isDevMode && ' (開発モード)'}
        </Button>
      </div>
    </div>
  )
}
