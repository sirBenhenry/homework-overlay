import type { ReactNode } from 'react'
import styles from './Place.module.css'

type PlaceProps = {
  /** Prop name shown while empty (e.g. "timetable"). */
  name: string
  children?: ReactNode
}

/**
 * A named content place for another branch's part.
 * Empty: dashed outline with the prop name. Filled: only the given content.
 */
export function Place({ name, children }: PlaceProps) {
  if (children != null) {
    return <div className={styles.filled}>{children}</div>
  }

  return (
    <div className={styles.empty} data-place={name}>
      {name}
    </div>
  )
}
