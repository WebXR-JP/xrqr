import { createContext, useCallback, useContext, useState } from "react"
import styles from './styles.module.css'

interface Toast {
  message: string
  type: 'success' | 'error'
}

interface ToastDispatcherContextValue {
  toast: Toast | null
  dispatch: (newToast: Toast) => void
}

export const ToastDispatcherContext = createContext<ToastDispatcherContextValue>({
  toast: null,
  dispatch: () => undefined,
})

export const useToastDispatcher = () => {
  return useContext(ToastDispatcherContext)
}

interface Props {
  children?: React.ReactNode
}

export const ToastDispatcher = ({ children }: Props) => {
  const [toast, setToast] = useState<Toast | null>(null)
  const dispatch = useCallback((newToast: Toast) => { setToast(newToast) }, [])

  return (
    <ToastDispatcherContext.Provider value={{ toast, dispatch }}>
      {children}
      {toast ? (
        <div className={styles.toast}>
          <div className={styles.toastIcon}>✓</div>
          <div className={styles.toastMessage}>{toast.message}</div>
        </div>
      ) : null}
    </ToastDispatcherContext.Provider>
  )
}