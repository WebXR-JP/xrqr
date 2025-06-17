import styles from './styles.module.css'

interface Props {
  children?: React.ReactNode
  title?: string
  description?: string
}

export const Card = ({ children, title, description }: Props) => {
  return (
    <div className={styles.container}>
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