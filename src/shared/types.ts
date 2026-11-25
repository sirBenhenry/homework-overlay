/*
 * The data that travels between the parts of the app.
 * Every part reads these types and nobody changes them alone:
 * a change here changes what the other parts receive. Ask Ben first.
 */

/** A calendar day without a time, written 'YYYY-MM-DD' in the user's local time. Example: '2026-09-24'. */
export type IsoDate = string

/** A time of day in 24-hour form, written 'HH:MM'. Example: '08:20'. */
export type TimeOfDay = string

/** One homework task as it is stored. */
export interface Task {
  /** Unique and never changes. */
  id: string
  /** What to do, for example 'Exercise 2'. Never empty. */
  title: string
  /** Subject name, for example 'Englisch'. `null` when the task has no subject. */
  subject: string | null
  /** The day the task is due. */
  due: IsoDate
  /** Optional time on the due day. */
  time: TimeOfDay | null
  /** Free text. Empty string when there are no notes. */
  notes: string
  /** What the user typed into quick-add, for example 'eng ex.2 tomorrow'. Empty string if nothing was typed. */
  typed: string
  /** When the task was created, as an ISO 8601 timestamp (`new Date().toISOString()`). */
  addedAt: string
  /** `false` while the task is open. */
  done: boolean
}

/**
 * What the input formatter makes out of typed text.
 * Anything it could not work out is `null`, and the user fills it in.
 */
export interface TaskDraft {
  title: string
  subject: string | null
  due: IsoDate | null
  time: TimeOfDay | null
  notes: string
  /** The text exactly as the user typed it. */
  typed: string
}

/** A task the user confirmed in the "New task" dialog, before it is stored. */
export type NewTask = Pick<Task, 'title' | 'subject' | 'due' | 'time' | 'notes' | 'typed'>

/** Turns typed text into a draft. The input formatter provides the real one. */
export type ParseTaskInput = (text: string) => TaskDraft

/** One lesson in the weekly timetable. */
export interface Lesson {
  /** 1 = Monday ... 5 = Friday. */
  weekday: 1 | 2 | 3 | 4 | 5
  start: TimeOfDay
  end: TimeOfDay
  subject: string
  room: string
}
