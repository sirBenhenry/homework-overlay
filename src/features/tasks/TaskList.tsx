import { addDays, todayIso, weekdayOf } from '../../shared/dates'
import type { IsoDate, Task } from '../../shared/types'
import styles from './TaskList.module.css'

interface TaskListProps {
  tasks: Task[]
  today?: IsoDate
}

const weekdays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function formatDue(due: IsoDate, today: IsoDate): string {
  if (due === today) return 'Today'
  if (due === addDays(today, 1)) return 'Tomorrow'

  // weekdayOf returns 1 for Monday and 7 for Sunday.
  const weekday = weekdays[weekdayOf(due) - 1]
  const [, month, day] = due.split('-')
  return `${weekday} ${day}.${month}.`
}

export function TaskList({ tasks, today = todayIso() }: TaskListProps) {
  const openTasks = tasks
    .filter((task) => !task.done)
    .sort((a, b) =>
      a.due.localeCompare(b.due) || a.addedAt.localeCompare(b.addedAt)
    )

  return (
    <section className={styles.panel} aria-label="Upcoming tasks">
      <h2>Upcoming tasks</h2>

      {openTasks.length === 0 ? (
        <p>No open tasks.</p>
      ) : (
        <ul>
          {openTasks.map((task) => (
            <li key={task.id}>
              <span>{task.title}</span>
              {task.subject && <span>{task.subject}</span>}
              <time dateTime={task.due}>{formatDue(task.due, today)}</time>
            </li>
          ))}
        </ul>
      )}
    </section>
  )
}
