import { type CSSProperties, useEffect, useState } from 'react'
import { addDays, toIsoDate } from '../../shared/dates.ts'
import type { IsoDate, Lesson, Task, TimeOfDay } from '../../shared/types.ts'
import styles from './Calendar.module.css'
import {
  type LessonBlock,
  dayLabel,
  isoWeek,
  lessonBlocks,
  mondayOf,
  openTasksDue,
  rangeLabel,
  scalePercent,
  SCALE_LENGTH,
  SCALE_START,
  toMinutes,
  weekendLabel,
} from './calendarModel.ts'

export interface CalendarProps {
  /** All tasks. The calendar picks the open ones due in the shown days. */
  tasks: Task[]
  /** The weekly timetable, one entry per lesson. */
  lessons: Lesson[]
  /** The current day. Without it the real current day is used. */
  today?: IsoDate
  /** The current time. Without it the real current time is used. */
  now?: TimeOfDay
}

/** Height of one Due chip and the gap between stacked chips, in px. */
const CHIP_HEIGHT = 22
const CHIP_GAP = 4

/** Full hours from 08:00 to 17:00, for the hour lines and labels. */
const HOURS = Array.from({ length: 10 }, (_, i) => 8 + i)

/** Re-reads the real clock every 30 s, but only while `enabled`. */
function useClock(enabled: boolean): Date {
  const [date, setDate] = useState(() => new Date())
  useEffect(() => {
    if (!enabled) return
    const id = setInterval(() => setDate(new Date()), 30_000)
    return () => clearInterval(id)
  }, [enabled])
  return date
}

/** Two weeks, Monday to Sunday, with lessons and open tasks. Stores nothing itself. */
export function Calendar({ tasks, lessons, today: todayProp, now: nowProp }: CalendarProps) {
  const clock = useClock(todayProp === undefined || nowProp === undefined)
  const today = todayProp ?? toIsoDate(clock)
  const now = nowProp ?? `${String(clock.getHours()).padStart(2, '0')}:${String(clock.getMinutes()).padStart(2, '0')}`

  // The view is stored as a number of weeks away from the week of `today`,
  // so `Today` is simply 0 and the view follows when the day changes.
  const [weekOffset, setWeekOffset] = useState(0)
  const firstMonday = addDays(mondayOf(today), weekOffset * 7)
  const lastDay = addDays(firstMonday, 13)

  return (
    <div className={styles.calendar}>
      <div className={styles.toolbar}>
        <button type="button" className={styles.arrow} aria-label="Previous week" onClick={() => setWeekOffset((w) => w - 1)}>
          ‹
        </button>
        <button type="button" className={styles.arrow} aria-label="Next week" onClick={() => setWeekOffset((w) => w + 1)}>
          ›
        </button>
        <span className={styles.range}>{rangeLabel(firstMonday, lastDay)}</span>
        <span className={styles.hint}>2 weeks · weekend combined</span>
        <button type="button" className={styles.todayButton} onClick={() => setWeekOffset(0)}>
          Today
        </button>
      </div>

      <div className={styles.headings}>
        <span className={styles.weekColumn}>Week</span>
        {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'].map((name) => (
          <span key={name} className={styles.dayHeading}>
            {name}
          </span>
        ))}
        <span className={styles.weekendHeading}>Weekend</span>
      </div>

      <div className={styles.weeks}>
        {[0, 1].map((w) => (
          <WeekRow
            key={w}
            monday={addDays(firstMonday, w * 7)}
            tasks={tasks}
            lessons={lessons}
            today={today}
            now={toMinutes(now)}
          />
        ))}
      </div>
    </div>
  )
}

interface WeekRowProps {
  monday: IsoDate
  tasks: Task[]
  lessons: Lesson[]
  today: IsoDate
  /** Minutes after midnight. */
  now: number
}

function WeekRow({ monday, tasks, lessons, today, now }: WeekRowProps) {
  const weekdays = [0, 1, 2, 3, 4].map((i) => addDays(monday, i))
  const saturday = addDays(monday, 5)
  const dueByDay = weekdays.map((day) => openTasksDue(tasks, [day]))
  const weekendDue = openTasksDue(tasks, [saturday, addDays(saturday, 1)])

  // All cells of a row get the same bottom area, tall enough for the most chips,
  // so every hour scale in the row lines up with the hour labels on the left.
  const chipRows = Math.max(1, weekendDue.length, ...dueByDay.map((due) => due.length))
  const rowStyle = { '--bottom-height': `${chipRows * CHIP_HEIGHT + (chipRows - 1) * CHIP_GAP}px` } as CSSProperties

  return (
    <div className={styles.weekRow} style={rowStyle}>
      <div className={styles.weekColumn}>
        <span className={styles.weekLabel}>W{isoWeek(monday)}</span>
        <div className={styles.weekScale}>
          {HOURS.map((hour) => (
            <span key={hour} className={styles.hourLabel} style={{ top: `${scalePercent(hour * 60)}%` }}>
              {String(hour).padStart(2, '0')}:00
            </span>
          ))}
        </div>
      </div>

      {weekdays.map((day, i) => (
        <DayCell
          key={day}
          day={day}
          blocks={lessonBlocks(lessons, i + 1)}
          due={dueByDay[i]}
          isToday={day === today}
          isPast={day < today}
          now={now}
        />
      ))}

      <section className={styles.weekend} aria-label={`Sat–Sun ${weekendLabel(saturday)}`}>
        <span className={styles.top}>Sat–Sun</span>
        <div className={styles.weekendMiddle}>
          {HOURS.map((hour) => (
            <span key={hour} className={styles.faintLine} style={{ top: `${scalePercent(hour * 60)}%` }} />
          ))}
          <span className={styles.weekendDates}>{weekendLabel(saturday)}</span>
          <span className={styles.noLessons}>No lessons</span>
        </div>
        <div className={styles.bottom}>
          {weekendDue.map((task) => (
            <span key={task.id} className={styles.chip}>
              <span className={styles.chipText}>
                <strong className={styles.due}>Due</strong> {task.title}
              </span>
            </span>
          ))}
        </div>
      </section>
    </div>
  )
}

interface DayCellProps {
  day: IsoDate
  blocks: LessonBlock[]
  due: Task[]
  isToday: boolean
  isPast: boolean
  /** Minutes after midnight. */
  now: number
}

function DayCell({ day, blocks, due, isToday, isPast, now }: DayCellProps) {
  const cellClass = [styles.day, isToday && styles.today, isPast && styles.past].filter(Boolean).join(' ')
  // The now line is only drawn while `now` is on the scale (08:00–17:00).
  const showNow = isToday && now >= SCALE_START && now <= SCALE_START + SCALE_LENGTH

  return (
    <section className={cellClass} aria-label={dayLabel(day)}>
      <span className={styles.top}>
        <span>{dayLabel(day)}</span>
        {isToday && <span className={styles.badge}>TODAY</span>}
      </span>

      <div className={styles.scale}>
        {HOURS.map((hour) => (
          <span key={hour} className={styles.hourLine} style={{ top: `${scalePercent(hour * 60)}%` }} />
        ))}
        {blocks.map((block) => {
          const running = isToday && now >= block.start && now < block.end
          return (
            <div
              key={block.start}
              className={`${styles.lesson} ${running ? styles.running : ''}`}
              style={{
                top: `${scalePercent(block.start)}%`,
                height: `${((block.end - block.start) / SCALE_LENGTH) * 100}%`,
              }}
            >
              <strong className={styles.subject}>{block.subject}</strong>
              <span className={styles.room}>{block.room}</span>
            </div>
          )
        })}
        {showNow && <span aria-hidden="true" className={styles.nowLine} style={{ top: `${scalePercent(now)}%` }} />}
      </div>

      <div className={styles.bottom}>
        {due.map((task) => (
          <span key={task.id} className={styles.chip}>
            <span className={styles.due}>Due</span>
            <span className={styles.chipText}>{task.subject ? `${task.title} · ${task.subject}` : task.title}</span>
          </span>
        ))}
      </div>
    </section>
  )
}
