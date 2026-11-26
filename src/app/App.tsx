import { useState } from 'react'
import { Calendar } from '../features/calendar/index.ts'
import styles from './App.module.css'
import {
  AppletsPage,
  CalendarPage,
  SettingsPage,
  TasksPage,
} from './ContentPage.tsx'
import { Header } from './Header.tsx'
import { HomePage } from './HomePage.tsx'
import { NavBar } from './NavBar.tsx'
import { DEFAULT_PAGE, PAGES, type PageId } from './pages.ts'

function pageTitle(page: PageId): string {
  const info = PAGES.find((entry) => entry.id === page)
  return info?.title ?? 'Home'
}

/**
 * App frame: header, bottom navigation and pages with named places.
 * Parts are handed into the places here. The calendar gets no tasks and no
 * lessons yet: they come once the task storage and a timetable exist.
 */
export default function App() {
  const [page, setPage] = useState<PageId>(DEFAULT_PAGE)

  return (
    <div className={styles.app}>
      <Header title={pageTitle(page)} />

      <main className={styles.content}>
        {page === 'home' && <HomePage />}
        {page === 'calendar' && <CalendarPage content={<Calendar tasks={[]} lessons={[]} />} />}
        {page === 'tasks' && <TasksPage />}
        {page === 'applets' && <AppletsPage />}
        {page === 'settings' && <SettingsPage />}
      </main>

      <NavBar current={page} onNavigate={setPage} />
    </div>
  )
}
