import { useState } from 'react'
import { Calendar } from '../features/calendar/index.ts'
import { parseTaskInput, useAbbreviations } from '../features/input-formatter/index.ts'
import { AddTask, TaskList, useTasks } from '../features/tasks/index.ts'
import { Timetable } from '../features/timetable/index.ts'
import { todayIso } from '../shared/dates.ts'
import type { ParseTaskInput } from '../shared/types.ts'
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
 * Parts are handed into the places here. The add-task box turns typed text
 * into a draft with the input formatter and saves to the task storage; the
 * task lists on Home and Tasks show what is stored. There is no timetable
 * data yet, so the timetable and the calendar get no lessons, and the
 * calendar gets no tasks.
 */
export default function App() {
  const [page, setPage] = useState<PageId>(DEFAULT_PAGE)
  const { tasks, addTask } = useTasks()
  const { abbreviations } = useAbbreviations()

  // There is no subject list yet, so the subjects are the ones the input
  // formatter knows. That way every subject it finds is also in the select.
  const subjects = abbreviations.filter((entry) => entry.kind === 'subject').map((entry) => entry.full)
  const parse: ParseTaskInput = (text) => parseTaskInput(text, { today: todayIso(), subjects, abbreviations })

  return (
    <div className={styles.app}>
      <Header title={pageTitle(page)} />

      <main className={styles.content}>
        {page === 'home' && (
          <HomePage
            timetable={<Timetable lessons={[]} onOpenCalendar={() => setPage('calendar')} />}
            upcomingTasks={<TaskList tasks={tasks} />}
            addTask={<AddTask parse={parse} subjects={subjects} onAdd={addTask} />}
          />
        )}
        {page === 'calendar' && <CalendarPage content={<Calendar tasks={[]} lessons={[]} />} />}
        {page === 'tasks' && <TasksPage content={<TaskList tasks={tasks} />} />}
        {page === 'applets' && <AppletsPage />}
        {page === 'settings' && <SettingsPage />}
      </main>

      <NavBar current={page} onNavigate={setPage} />
    </div>
  )
}
