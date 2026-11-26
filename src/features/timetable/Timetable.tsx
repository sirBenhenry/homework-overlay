import { useEffect, useState } from 'react'
import { toIsoDate } from '../../shared/dates.ts'
import type { IsoDate, Lesson, TimeOfDay } from '../../shared/types.ts'
import styles from './Timetable.module.css'
import { HOURS, isRunning, lessonsOn, SCALE_END, SCALE_START, scalePercent, todayHeading, toMinutes } from './timetableModel.ts'

export interface TimetableProps {
  /** The weekly timetable, one entry per lesson. Only today's lessons are shown. */
  lessons: Lesson[]
  /** The current day. Without it the real current day is used. */
  today?: IsoDate
  /** The current time. Without it the real current time is used. */
  now?: TimeOfDay
  /** Called when the user clicks the Calendar button. Without it the button is not shown. */
  onOpenCalendar?: () => void
}

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

/** The "Today" panel of the home screen: today's lessons on an hour scale with a marker for now. */
export function Timetable({ lessons, today: todayProp, now: nowProp, onOpenCalendar }: TimetableProps) {
  const clock = useClock(todayProp === undefined || nowProp === undefined)
  const today = todayProp ?? toIsoDate(clock)
  const now = nowProp ?? `${String(clock.getHours()).padStart(2, '0')}:${String(clock.getMinutes()).padStart(2, '0')}`

  const nowMinutes = toMinutes(now)
  const showNow = nowMinutes >= SCALE_START && nowMinutes <= SCALE_END

  return (
    <section className={styles.panel} aria-label="Today's timetable">
      <div className={styles.top}>
        <h2>{todayHeading(today)}</h2>
        {onOpenCalendar && (
          <button type="button" className={styles.calendarButton} onClick={onOpenCalendar}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <rect x="3" y="5" width="18" height="16" rx="2" />
              <path d="M3 10h18M8 3v4M16 3v4" />
            </svg>
            Calendar
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <path d="M5 12h14M13 6l6 6-6 6" />
            </svg>
          </button>
        )}
      </div>

      <div className={styles.scale}>
        {HOURS.map((hour) => (
          <div key={hour} className={styles.hour} style={{ top: `${scalePercent(hour * 60)}%` }}>
            <span>{`${String(hour).padStart(2, '0')}:00`}</span>
          </div>
        ))}

        {lessonsOn(lessons, today).map((lesson) => {
          const start = toMinutes(lesson.start)
          const end = toMinutes(lesson.end)
          return (
            <div
              key={`${lesson.start}-${lesson.subject}`}
              className={styles.lesson}
              data-running={isRunning(lesson, now)}
              style={{
                top: `${scalePercent(start)}%`,
                height: `calc(${scalePercent(end) - scalePercent(start)}% - 2px)`,
              }}
            >
              <span className={styles.lessonName}>
                <strong>{lesson.subject}</strong>
                {lesson.room && ` · ${lesson.room}`}
              </span>
              <span className={styles.lessonTime}>{`${lesson.start}–${lesson.end}`}</span>
            </div>
          )
        })}

        {showNow && (
          <div className={styles.now} style={{ top: `${scalePercent(nowMinutes)}%` }} aria-label="Current time marker">
            <span>NOW</span>
          </div>
        )}
      </div>
    </section>
  )
}
