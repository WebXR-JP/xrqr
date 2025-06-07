import styles from './App.module.css';

type DeviceType = 'sender' | 'receiver' | null;

export const App = () => {
  // const [deviceType, setDeviceType] = useState<DeviceType>('sender');

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>XRQR</h1>
      </header>
      <main className={styles.main}>

      </main>
    </div>
  );
};
