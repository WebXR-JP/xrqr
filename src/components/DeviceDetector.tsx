import { useState, useEffect } from 'react';
import { useXRDetection } from '../hooks/useXRDetection';
import styles from './DeviceDetector.module.css';

type DeviceType = 'sender' | 'receiver' | null;

interface DeviceDetectorProps {
  onDeviceTypeSelect: (type: DeviceType) => void;
}

export const DeviceDetector: React.FC<DeviceDetectorProps> = ({ onDeviceTypeSelect }) => {
  const isXRDevice = useXRDetection();
  const [manualSelect, setManualSelect] = useState(false);

  useEffect(() => {
    if (isXRDevice !== null && !manualSelect) {
      onDeviceTypeSelect(isXRDevice ? 'receiver' : 'sender');
    }
  }, [isXRDevice, manualSelect, onDeviceTypeSelect]);

  if (isXRDevice === null) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>デバイスを確認中...</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {isXRDevice ? (
        <div className={styles.error}>
          このデバイスはXR機能に対応していません
          <br />
          送信側として利用可能です
        </div>
      ) : null}
      <div className={styles.manualSelect}>
        <button
          className={styles.button}
          onClick={() => {
            setManualSelect(true);
            onDeviceTypeSelect('sender');
          }}
        >
          送信側として使用
        </button>
        <button
          className={styles.button}
          onClick={() => {
            setManualSelect(true);
            onDeviceTypeSelect('receiver');
          }}
          disabled={!isXRDevice}
        >
          受信側として使用
        </button>
      </div>
    </div>
  );
};
