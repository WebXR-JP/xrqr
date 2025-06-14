import React, { useCallback } from 'react'
import { DeviceDetectorView } from './components/DeviceDetectorView'

type DeviceType = 'sender' | 'receiver' | null

interface HomeScreenProps {
  onDeviceTypeSelect: (type: DeviceType) => void
}

export const HomeScreen: React.FC<HomeScreenProps> = ({ onDeviceTypeSelect }) => {
  const handleDeviceSelect = useCallback(
    (type: DeviceType) => {
      onDeviceTypeSelect(type)
    },
    [onDeviceTypeSelect],
  )

  return <DeviceDetectorView onDeviceTypeSelect={handleDeviceSelect} />
}
