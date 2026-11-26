import { addDays, fromIsoDate, weekdayOf } from '../../shared/dates.ts'
import type { IsoDate, Lesson, Task, TimeOfDay } from '../../shared/types.ts'

/*
 * Everything the calendar works out from its props, kept apart from the
 * component so it can be tested without rendering.
 */

/** The hour scale starts at 08:00 ... */
export const SCALE_START = 8 * 60
/** ... and covers 540 minutes, so it ends at 17:00. */
export const SCALE_LENGTH = 9 * 60

const DAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** '08:20' -> 500 (minutes after midnight). */
export function toMinutes(time: TimeOfDay): number {
  const [hours, minutes] = time.split(':').map(Number)
  return hours * 60 + minutes
}

/** Where a time sits on the hour scale, in percent of its height (08:00 = 0, 17:00 = 100). */
export function scalePercent(minutes: number): number {
  return ((minutes - SCALE_START) / SCALE_LENGTH) * 100
}

/** The Monday of the week that contains the given day. */
export function mondayOf(day: IsoDate): IsoDate {
  return addDays(day, 1 - weekdayOf(day))
}

/** ISO 8601 week number: week 1 is the week that contains the year's first Thursday. */
export function isoWeek(day: IsoDate): number {
  const thursday = fromIsoDate(addDays(mondayOf(day), 3))
  // Count days in UTC so a daylight saving change cannot shift the result.
  const dayOfYear =
    (Date.UTC(thursday.getFullYear(), thursday.getMonth(), thursday.getDate()) -
      Date.UTC(thursday.getFullYear(), 0, 1)) /
    86_400_000
  return Math.floor(dayOfYear / 7) + 1
}

/** '21 Sep – 4 Oct 2026'. The first year is only written when the range spans two years. */
export function rangeLabel(first: IsoDate, last: IsoDate): string {
  const a = fromIsoDate(first)
  const b = fromIsoDate(last)
  const firstYear = a.getFullYear() === b.getFullYear() ? '' : ` ${a.getFullYear()}`
  return (
    `${a.getDate()} ${MONTHS[a.getMonth()]}${firstYear} – ` +
    `${b.getDate()} ${MONTHS[b.getMonth()]} ${b.getFullYear()}`
  )
}

/** '21.09.' */
function dayMonth(day: IsoDate): string {
  const date = fromIsoDate(day)
  return `${pad(date.getDate())}.${pad(date.getMonth() + 1)}.`
}

/** 'Mon 21.09.' – only for Monday to Friday. */
export function dayLabel(day: IsoDate): string {
  return `${DAY_NAMES[weekdayOf(day) - 1]} ${dayMonth(day)}`
}

/** '26.–27.09.', or '31.10.–01.11.' when the weekend spans two months. */
export function weekendLabel(saturday: IsoDate): string {
  const sat = fromIsoDate(saturday)
  const sunday = addDays(saturday, 1)
  const sameMonth = sat.getMonth() === fromIsoDate(sunday).getMonth()
  return `${pad(sat.getDate())}.${sameMonth ? '' : `${pad(sat.getMonth() + 1)}.`}–${dayMonth(sunday)}`
}

/** One block on the hour scale: a lesson, or several merged lessons. */
export interface LessonBlock {
  subject: string
  room: string
  /** Minutes after midnight. */
  start: number
  end: number
}

/**
 * The lessons of one weekday as blocks, sorted by time.
 * A lesson joins the block before it when it is the next lesson of the day
 * and has the same subject and room, whatever the break between them.
 */
export function lessonBlocks(lessons: Lesson[], weekday: number): LessonBlock[] {
  const sorted = lessons
    .filter((lesson) => lesson.weekday === weekday)
    .map((lesson) => ({
      subject: lesson.subject,
      room: lesson.room,
      start: toMinutes(lesson.start),
      end: toMinutes(lesson.end),
    }))
    .sort((a, b) => a.start - b.start)

  const blocks: LessonBlock[] = []
  for (const lesson of sorted) {
    const previous = blocks.at(-1)
    if (previous && previous.subject === lesson.subject && previous.room === lesson.room) {
      previous.end = Math.max(previous.end, lesson.end)
    } else {
      blocks.push({ ...lesson })
    }
  }
  return blocks
}

/** The open tasks due on one of the given days, in the order they were given. */
export function openTasksDue(tasks: Task[], days: IsoDate[]): Task[] {
  return tasks.filter((task) => !task.done && days.includes(task.due))
}
