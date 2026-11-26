import type { JSX } from 'react'
import {
  AppletsIcon,
  CalendarIcon,
  HomeIcon,
  SettingsIcon,
  TasksIcon,
} from './icons.tsx'
import { PAGES, type PageId } from './pages.ts'
import styles from './NavBar.module.css'

type NavBarProps = {
  current: PageId
  onNavigate: (page: PageId) => void
}

const ICONS: Record<PageId, () => JSX.Element> = {
  calendar: CalendarIcon,
  tasks: TasksIcon,
  home: HomeIcon,
  applets: AppletsIcon,
  settings: SettingsIcon,
}

export function NavBar({ current, onNavigate }: NavBarProps) {
  return (
    <nav className={styles.nav} aria-label="Main navigation">
      {PAGES.map((page) => {
        const Icon = ICONS[page.id]
        const isCurrent = page.id === current

        return (
          <button
            key={page.id}
            type="button"
            className={isCurrent ? `${styles.item} ${styles.current}` : styles.item}
            aria-current={isCurrent ? 'page' : undefined}
            onClick={() => onNavigate(page.id)}
          >
            <Icon />
            {page.label}
          </button>
        )
      })}
    </nav>
  )
}
