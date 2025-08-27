import { createContext, useCallback, useContext, useEffect, useState } from "react"
import styles from './styles.module.css'

interface ToastButton {
  text: string
  onClick: () => void
}

interface Toast {
  message: string
  type: 'success' | 'error'
  buttons?: ToastButton[]
}

interface ToastDispatcherContextValue {
  toast: Toast | null
  dispatch: (newToast: Toast) => void
  closeToast: () => void
}

export const ToastDispatcherContext = createContext<ToastDispatcherContextValue>({
  toast: null,
  dispatch: () => undefined,
  closeToast: () => undefined,
})

export const useToastDispatcher = () => {
  return useContext(ToastDispatcherContext)
}

interface Props {
  children?: React.ReactNode
}

export const ToastDispatcherProvider = ({ children }: Props) => {
  const [toast, setToast] = useState<Toast | null>(null)
  const dispatch = useCallback((newToast: Toast) => { setToast(newToast) }, [])
  const closeToast = useCallback(() => { setToast(null) }, [])

  useEffect(() => {
    if (!toast) return
    // ボタンがある場合は自動で消さない
    if (toast.buttons && toast.buttons.length > 0) return
    // トーストを3秒後に自動で消す
    const timer = setTimeout(() => { setToast(null) }, 3000)
    return () => clearTimeout(timer)
  }, [toast])

  return (
    <ToastDispatcherContext.Provider value={{ toast, dispatch, closeToast }}>
      {children}
      {toast ? (
        <div className={styles.toast}>
          <div className={styles.toastContent}>
            <div className={styles.toastIcon}>✓</div>
            <div className={styles.toastMessage}>{toast.message}</div>
          </div>
          {toast.buttons && toast.buttons.length > 0 && (
            <div className={styles.toastButtons}>
              {toast.buttons.map((button, index) => (
                <button
                  key={index}
                  className={styles.toastButton}
                  onClick={button.onClick}
                >
                  {button.text}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </ToastDispatcherContext.Provider>
  )
}