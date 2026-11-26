import { weekdayOf } from '../../shared/dates.ts'
import type { IsoDate, Lesson, TimeOfDay } from '../../shared/types.ts'

/** The hour scale runs from 08:00 (top edge) to 17:00 (bottom edge). */
export const SCALE_START = 8 * 60
export const SCALE_END = 17 * 60
const SCALE_LENGTH = SCALE_END - SCALE_START

/** The full hours that get a line and a label: 08:00 to 16:00, as in the wireframe. */
export const HOURS = Array.from({ length: 9 }, (_, i) => 8 + i)

const WEEKDAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']

/** "11:05" -> 665 */
export function toMinutes(time: TimeOfDay): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/** Where a time sits on the hour scale, in percent of its height (can be outside 0–100). */
export function scalePercent(minutes: number): number {
  return ((minutes - SCALE_START) / SCALE_LENGTH) * 100
}

/** "2026-09-23" -> "Today · Wednesday 23.09." */
export function todayHeading(today: IsoDate): string {
  const [, month, day] = today.split('-')
  return `Today · ${WEEKDAYS[weekdayOf(today) - 1]} ${day}.${month}.`
}

/** The lessons on the weekday of `day`, earliest first. Saturday and Sunday have none. */
export function lessonsOn(lessons: Lesson[], day: IsoDate): Lesson[] {
  const weekday = weekdayOf(day)
  return lessons
    .filter((lesson) => lesson.weekday === weekday)
    .sort((a, b) => toMinutes(a.start) - toMinutes(b.start))
}

/** True while `now` is inside the lesson (start included, end not). */
export function isRunning(lesson: Lesson, now: TimeOfDay): boolean {
  const minutes = toMinutes(now)
  return minutes >= toMinutes(lesson.start) && minutes < toMinutes(lesson.end)
}
