import type { IsoDate, Lesson, Task, TimeOfDay } from './types.ts'

/*
 * The example data the wireframe shows. Use it in your Preview and in tests,
 * so your part can be compared with the wireframe screen by screen.
 * It is not real user data and the finished app does not ship it.
 */

/** The day the wireframe pretends it is: Wednesday 23 September 2026. */
export const SAMPLE_TODAY: IsoDate = '2026-09-23'

/** The time the wireframe pretends it is. */
export const SAMPLE_NOW: TimeOfDay = '11:10'

export const SAMPLE_SUBJECTS: string[] = [
  'Mathe',
  'Englisch',
  'Deutsch',
  'Französisch',
  'Informatik',
  'Wirtschaft',
  'Sport',
]

const ROOMS: Record<string, string> = {
  Mathe: 'R204',
  Englisch: 'R112',
  Deutsch: 'R108',
  Französisch: 'R110',
  Informatik: 'Lab 3',
  Wirtschaft: 'R301',
  Sport: 'Halle',
}

const SLOTS: [TimeOfDay, TimeOfDay][] = [
  ['08:20', '09:05'],
  ['09:10', '09:55'],
  ['10:15', '11:00'],
  ['11:05', '11:50'],
  ['11:55', '12:40'],
  ['13:15', '14:00'],
  ['14:05', '14:50'],
  ['15:05', '15:50'],
  ['15:55', '16:40'],
]

// One row per weekday (Monday first), one entry per lesson slot. '' = free.
const WEEK: string[][] = [
  ['Mathe', 'Deutsch', 'Englisch', '', '', 'Informatik', 'Informatik', '', ''],
  ['Englisch', 'Französisch', 'Mathe', 'Mathe', '', 'Deutsch', 'Sport', '', ''],
  ['Mathe', 'Mathe', 'Englisch', 'Informatik', '', 'Deutsch', 'Wirtschaft', '', ''],
  ['Informatik', 'Informatik', 'Französisch', 'Deutsch', '', '', '', '', ''],
  ['Wirtschaft', 'Englisch', 'Mathe', '', '', 'Sport', 'Sport', '', ''],
]

/** The weekly timetable, one entry per 45-minute lesson. Double lessons are two entries. */
export const SAMPLE_LESSONS: Lesson[] = WEEK.flatMap((day, dayIndex) =>
  day.flatMap((subject, slot) =>
    subject
      ? [
          {
            weekday: (dayIndex + 1) as Lesson['weekday'],
            start: SLOTS[slot][0],
            end: SLOTS[slot][1],
            subject,
            room: ROOMS[subject],
          },
        ]
      : [],
  ),
)

function task(
  id: string,
  title: string,
  subject: string,
  due: IsoDate,
  typed: string,
  addedAt: string,
  done = false,
): Task {
  return { id, title, subject, due, time: null, notes: '', typed, addedAt, done }
}

/** Five open tasks and two finished ones, as on the wireframe's Tasks screen. */
export const SAMPLE_TASKS: Task[] = [
  task('t1', 'Exercise 2', 'Englisch', '2026-09-24', 'eng ex.2 tomorrow', '2026-09-23T09:08:00.000Z'),
  task('t2', 'Worksheet fractions', 'Mathe', '2026-09-25', 'math worksheet fractions fri', '2026-09-21T14:40:00.000Z'),
  task('t3', 'Read chapter 3', 'Deutsch', '2026-09-28', 'de read ch3 monday', '2026-09-22T11:02:00.000Z'),
  task('t4', 'Vocab test prep', 'Französisch', '2026-09-29', 'fr vocab test tue 29.9', '2026-09-22T08:15:00.000Z'),
  task('t5', 'Project draft', 'Informatik', '2026-10-01', 'inf project draft 1.10', '2026-09-17T13:30:00.000Z'),
  task('c1', 'Essay outline', 'Deutsch', '2026-09-22', 'de essay outline tue', '2026-09-14T15:20:00.000Z', true),
  task('c2', 'Exercise 1', 'Englisch', '2026-09-21', 'eng ex.1 monday', '2026-09-17T08:05:00.000Z', true),
]
