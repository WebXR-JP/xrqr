import { Card } from "~/components/Card"
import { useCameraCard } from "./hooks"
import styles from "./styles.module.css"

export const CameraCard = () => {
  const { videoRef, availableCameras, handleCameraChange } = useCameraCard()

  return (
    <Card title="QRコードリーダー">
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
        スマホやPCのQRコードを読み取って、クリップボードにコピーします。
      </p>
    </Card>
  )
}
