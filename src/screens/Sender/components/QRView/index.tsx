import { Button } from "~/components/Button"
import styles from "./styles.module.css"

interface Props {
  qrCodeUrl: string
  onClickResetQRCode: () => void
}

export const QRView = ({ qrCodeUrl, onClickResetQRCode }: Props) => {
  return (
    <div className={styles.qrDisplayWrapper}>
      <div className={styles.qrContainer}>
        <img src={qrCodeUrl} alt="生成されたQRコード" />
      </div>
      <div className={styles.qrInstructions}>
        <p>VRゴーグルで xrqr.net を開いてこのQRコードをスキャンすると、クリップボードにコピーされます</p>
      </div>
      <Button
        variant="secondary"
        size="medium"
        onClick={onClickResetQRCode}
      >
        QRを作り直す
      </Button>
    </div>
  )
}