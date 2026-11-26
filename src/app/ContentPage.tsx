import type { ReactNode } from 'react'
import { Place } from './Place.tsx'
import styles from './ContentPage.module.css'

export type ContentPageProps = {
  content?: ReactNode
}

/** One full-area place named `content` (Calendar, Tasks, Applets, Settings). */
export function ContentPage({ content }: ContentPageProps) {
  return (
    <div className={styles.layout}>
      <Place name="content">{content}</Place>
    </div>
  )
}

export function CalendarPage(props: ContentPageProps) {
  return <ContentPage {...props} />
}

export function TasksPage(props: ContentPageProps) {
  return <ContentPage {...props} />
}

export function AppletsPage(props: ContentPageProps) {
  return <ContentPage {...props} />
}

export function SettingsPage(props: ContentPageProps) {
  return <ContentPage {...props} />
}
