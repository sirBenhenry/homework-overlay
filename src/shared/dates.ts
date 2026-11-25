import type { IsoDate } from './types.ts'

/*
 * Helpers for IsoDate ('YYYY-MM-DD', local time).
 * Use these instead of `date.toISOString().slice(0, 10)`: that converts to UTC
 * first and returns the day before for local midnight in Switzerland.
 */

function pad(n: number): string {
  return String(n).padStart(2, '0')
}

/** The local calendar day of a Date. */
export function toIsoDate(date: Date): IsoDate {
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`
}

/** A Date at local midnight of the given day. */
export function fromIsoDate(iso: IsoDate): Date {
  const [year, month, day] = iso.split('-').map(Number)
  return new Date(year, month - 1, day)
}

/** Today in local time. */
export function todayIso(): IsoDate {
  return toIsoDate(new Date())
}

/** The day `days` after the given day. Negative numbers go back. */
export function addDays(iso: IsoDate, days: number): IsoDate {
  const date = fromIsoDate(iso)
  date.setDate(date.getDate() + days)
  return toIsoDate(date)
}

/** 1 = Monday ... 7 = Sunday. */
export function weekdayOf(iso: IsoDate): 1 | 2 | 3 | 4 | 5 | 6 | 7 {
  const day = fromIsoDate(iso).getDay()
  return (day === 0 ? 7 : day) as 1 | 2 | 3 | 4 | 5 | 6 | 7
}
