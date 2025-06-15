import { CameraView } from './components/CameraView'
import styles from './styles.module.css'

export const ReceiverScreen = () => {
  return (
    <div className={styles.container}>
      <CameraView />
    </div>
  )
}