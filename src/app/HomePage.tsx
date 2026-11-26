import type { ReactNode } from 'react'
import { Place } from './Place.tsx'
import styles from './HomePage.module.css'

export type HomePageProps = {
  timetable?: ReactNode
  upcomingTasks?: ReactNode
  addTask?: ReactNode
}

/**
 * Home content area: left half for the timetable, right half split into
 * upcoming tasks (top) and add-task (bottom). Prop names are the contract
 * Ben uses when placing the other parts.
 */
export function HomePage({ timetable, upcomingTasks, addTask }: HomePageProps) {
  return (
    <div className={styles.layout}>
      <Place name="timetable">{timetable}</Place>
      <div className={styles.right}>
        <Place name="upcomingTasks">{upcomingTasks}</Place>
        <Place name="addTask">{addTask}</Place>
      </div>
    </div>
  )
}
