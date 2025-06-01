import { useState } from 'react';
import { DeviceDetector } from './components/DeviceDetector';
import { SenderInterface } from './components/SenderInterface';
import { XRInterface } from './components/XRInterface';
import styles from './App.module.css';

type DeviceType = 'sender' | 'receiver' | null;

export const App = () => {
  const [deviceType, setDeviceType] = useState<DeviceType>(null);

  const renderInterface = () => {
    if (!deviceType) {
      return <DeviceDetector onDeviceTypeSelect={setDeviceType} />;
    }

    return deviceType === 'sender' ? <SenderInterface /> : <XRInterface />;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>XRQR</h1>
      </header>
      <main className={styles.main}>
        {renderInterface()}
      </main>
    </div>
  );
};
