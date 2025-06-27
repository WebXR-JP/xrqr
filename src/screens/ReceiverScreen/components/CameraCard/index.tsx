import { useTranslation } from 'react-i18next'
import { Card } from "~/components/Card"
import { PasswordInputModal } from "../PasswordInputModal"
import { useCameraCard } from "./hooks"
import styles from "./styles.module.css"

export const CameraCard = () => {
  const { t } = useTranslation();
  const {
    videoRef,
    availableCameras,
    handleCameraChange,
    encryptedData,
    showPasswordModal,
    handleDecryptSuccess,
    handlePasswordModalCancel
  } = useCameraCard()

  return (
    <>
      <Card title={t('receiver.qrReaderTitle')}>
        <div className={styles.cameraContainer}>
          <video
            ref={videoRef}
            className={styles.video}
            playsInline
            autoPlay
          />
          <div className={styles.scanOverlay} />
          {availableCameras.length > 1 && (
            <select
              className={styles.cameraSelect}
              onChange={handleCameraChange}
            >
              {availableCameras.map((camera) => (
                <option key={camera.deviceId} value={camera.deviceId}>
                  {camera.label}
                </option>
              ))}
            </select>
          )}
        </div>
        <p className={styles.description}>
          {t('receiver.qrReaderDescription')}
        </p>
      </Card>

      {showPasswordModal && encryptedData && (
        <PasswordInputModal
          encryptedData={encryptedData}
          onDecryptSuccess={handleDecryptSuccess}
          onCancel={handlePasswordModalCancel}
        />
      )}
    </>
  )
}
