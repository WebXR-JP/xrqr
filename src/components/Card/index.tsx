import styles from './styles.module.css'

interface Props {
  children?: React.ReactNode
  className?: string
  title?: string
  description?: string
}

export const Card = ({ children, title, description, className }: Props) => {
  return (
    <div className={`${styles.container} ${className}`}>
      {title || description ? (
        <div className={styles.header}>
          {title ? (
            <h2 className={styles.title}>
              {title}
            </h2>
          ) : null}
          {description ? (
            <p className={styles.description}>
              {description}
            </p>
          ) : null}
        </div>
      ) : null}
      <div className={styles.content}>
        {children}
      </div>
    </div>
  )
}