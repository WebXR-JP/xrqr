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

  console.log('DeviceDetectorView rendered, isXRDevice:', isXRDevice)

  useEffect(() => {
    if (isXRDevice !== null && !manualSelect) {
      onDeviceTypeSelect(isXRDevice ? 'receiver' : 'sender')
    }
  }, [isXRDevice, manualSelect, onDeviceTypeSelect])

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
          disabled={!isXRDevice}
        >
          受信側として使用
        </Button>
      </div>
    </div>
  )
}
