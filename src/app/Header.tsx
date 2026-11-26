import { useEffect, useState } from 'react'
import styles from './Header.module.css'

type HeaderProps = {
  title: string
}

/** Hint text as written in the wireframe; the shortcut itself is not built. */
const OVERLAY_HINT = '[SHORTCUT] opens / closes the overlay'

function formatTime(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${hours}:${minutes}`
}

function useClock(): string {
  const [now, setNow] = useState(() => new Date())

  useEffect(() => {
    const id = window.setInterval(() => setNow(new Date()), 1000)
    return () => window.clearInterval(id)
  }, [])

  return formatTime(now)
}

export function Header({ title }: HeaderProps) {
  const time = useClock()

  return (
    <header className={styles.header}>
      <div className={styles.titleGroup}>
        <h1 className={styles.title}>{title}</h1>
        <span className={styles.hint}>{OVERLAY_HINT}</span>
      </div>
      <div className={styles.clock} aria-label="Current time">
        {time}
      </div>
    </header>
  )
}
