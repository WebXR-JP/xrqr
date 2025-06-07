import { useState, useCallback } from 'react';
import { useQRScanner } from '../hooks/useQRScanner';
import { useLocalStorage } from '../hooks/useLocalStorage';
import { EncryptionService } from '../services/EncryptionService';
import { HistoryItem } from '../types';
import styles from './XRInterface.module.css';

type Tab = 'camera' | 'history';

interface QRData {
  content: string;
  isSecret: boolean;
  timestamp: string;
  encrypted?: boolean;
}

export const XRInterface = () => {
  const [activeTab, setActiveTab] = useState<Tab>('camera');
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const {
    encryptionKey,
    history,
    setEncryptionKey,
    addHistoryItem,
    removeHistoryItem,
    clearHistory
  } = useLocalStorage();

  const handleScan = useCallback(async (data: string) => {
    try {
      let qrData: QRData;

      try {
        // まず暗号化されていないJSONとしてパースを試みる
        qrData = JSON.parse(data);
        if (!qrData.encrypted) {
          await navigator.clipboard.writeText(qrData.content);

          const historyItem: HistoryItem = {
            id: crypto.randomUUID(),
            content: qrData.content,
            preview: qrData.content.slice(0, 50),
            timestamp: qrData.timestamp
          };
          addHistoryItem(historyItem);
          setError(null);
          setSuccessMessage('QRコードを読み取りました！クリップボードにコピーしました');
          // 3秒後にメッセージを消す
          setTimeout(() => setSuccessMessage(null), 3000);
          return;
        }
      } catch {
        // JSONパースに失敗した場合は暗号化されたデータとして処理
        if (!encryptionKey) {
          setError('暗号化キーが設定されていません');
          return;
        }

        const decrypted = EncryptionService.decrypt(data, encryptionKey);
        await navigator.clipboard.writeText(decrypted.content);

        if (!decrypted.isSecret) {
          const historyItem: HistoryItem = {
            id: crypto.randomUUID(),
            content: decrypted.content,
            preview: decrypted.content.slice(0, 50),
            timestamp: decrypted.timestamp
          };
          addHistoryItem(historyItem);
        }
        setSuccessMessage('暗号化されたQRコードを読み取りました！クリップボードにコピーしました');
        // 3秒後にメッセージを消す
        setTimeout(() => setSuccessMessage(null), 3000);
      }

      setError(null);
    } catch (err) {
      setError('QRコードの読み取りに失敗しました');
      console.error('QR code scanning failed:', err);
    }
  }, [encryptionKey, addHistoryItem]);

  const { videoRef, canvasRef, startScanning, stopScanning, isScanning, error: scanError } = useQRScanner(handleScan);

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
    } catch (err) {
      setError('クリップボードへのコピーに失敗しました');
    }
  };

  if (!encryptionKey) {
    return (
      <div className={styles.container}>
        <div className={styles.inputGroup}>
          <label className={styles.label}>
            暗号化キーを設定してください（4桁の数字）
          </label>
          <input
            type="text"
            className={styles.pinInput}
            maxLength={4}
            pattern="\d*"
            inputMode="numeric"
            onChange={(e) => {
              const value = e.target.value.replace(/[^\d]/g, '');
              if (value.length === 4) {
                setEncryptionKey(value);
              }
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.tabs}>
        <button
          className={`${styles.tab} ${activeTab === 'camera' ? styles.active : ''}`}
          onClick={() => setActiveTab('camera')}
        >
          カメラ
        </button>
        <button
          className={`${styles.tab} ${activeTab === 'history' ? styles.active : ''}`}
          onClick={() => setActiveTab('history')}
        >
          履歴
        </button>
      </div>

      {activeTab === 'camera' ? (
        <div>
          <div className={styles.cameraContainer}>
            <video ref={videoRef} className={styles.video} />
            <canvas ref={canvasRef} className={styles.canvas} />
            <div className={styles.scanOverlay} />
          </div>
          <button
            className={styles.startButton}
            onClick={isScanning ? stopScanning : startScanning}
          >
            {isScanning ? 'スキャン停止' : 'スキャン開始'}
          </button>
        </div>
      ) : (
        <div className={styles.historyContainer}>
          {history.length > 0 && (
            <button className={styles.clearAllButton} onClick={clearHistory}>
              履歴を全て削除
            </button>
          )}
          {history.map((item) => (
            <div key={item.id} className={styles.historyItem}>
              <div className={styles.historyItemHeader}>
                <span className={styles.historyItemTime}>
                  {new Date(item.timestamp).toLocaleString()}
                </span>
                <button
                  className={styles.deleteButton}
                  onClick={() => removeHistoryItem(item.id)}
                >
                  削除
                </button>
              </div>
              <div
                className={styles.historyItemPreview}
                onClick={() => copyToClipboard(item.content)}
              >
                {item.preview}
              </div>
            </div>
          ))}
        </div>
      )}

      {(error || scanError) && (
        <div className={styles.error}>{error || scanError}</div>
      )}
      {successMessage && (
        <div className={styles.success}>{successMessage}</div>
      )}
    </div>
  );
};
