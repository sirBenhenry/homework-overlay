import { addDays, fromIsoDate, toIsoDate, weekdayOf } from '../../shared/dates.ts'
import type { IsoDate, TaskDraft } from '../../shared/types.ts'
import { type Abbreviation, sameShort } from './abbreviations.ts'

export interface ParseOptions {
  /** The current day. The parser never reads the clock itself. */
  today: IsoDate
  /** Subject names the user may type in full, for example 'Mathe'. */
  subjects: string[]
  abbreviations: Abbreviation[]
}

const WEEKDAYS: Record<string, number> = {
  mon: 1, monday: 1,
  tue: 2, tuesday: 2,
  wed: 3, wednesday: 3,
  thu: 4, thursday: 4,
  fri: 5, friday: 5,
  sat: 6, saturday: 6,
  sun: 7, sunday: 7,
}

// 'D.M', 'D.M.' or 'D.M.YYYY'.
const DATE_PATTERN = /^(\d{1,2})\.(\d{1,2})(?:\.|\.(\d{4}))?$/

// A word abbreviation followed directly by a number, with or without a dot: 'ex2', 'ex.2'.
const NUMBER_SUFFIX = /^\.?(\d+)$/

/**
 * The day for the given parts, or `null` if it does not exist (like 31.2).
 * A Date rolls 31.2 over to 3.3, so the parts are compared after building it.
 */
function existingDay(year: number, month: number, day: number): IsoDate | null {
  const date = new Date(year, month - 1, day)
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null
  }
  return toIsoDate(date)
}

/** Reads 'D.M', 'D.M.' or 'D.M.YYYY'. Without a year: the next such day, counting today. */
function parseDate(word: string, today: IsoDate): IsoDate | null {
  const match = DATE_PATTERN.exec(word)
  if (!match) return null
  const day = Number(match[1])
  const month = Number(match[2])
  if (match[3] !== undefined) return existingDay(Number(match[3]), month, day)

  // IsoDate strings compare in date order. Look up to 8 years ahead,
  // so 29.2 finds the next leap year.
  const thisYear = fromIsoDate(today).getFullYear()
  for (let year = thisYear; year <= thisYear + 8; year++) {
    const candidate = existingDay(year, month, day)
    if (candidate !== null && candidate >= today) return candidate
  }
  return null
}

/** 'today', 'tomorrow' or a weekday name. A weekday means the next one after today. */
function parseDayWord(word: string, today: IsoDate): IsoDate | null {
  if (word === 'today') return today
  if (word === 'tomorrow') return addDays(today, 1)
  const weekday = WEEKDAYS[word]
  if (weekday === undefined) return null
  // 1..7 days ahead: typed on a Wednesday, 'wed' is next week's Wednesday.
  return addDays(today, ((weekday - weekdayOf(today) + 6) % 7) + 1)
}

function findSubject(word: string, options: ParseOptions): string | null {
  const abbreviation = options.abbreviations.find((a) => a.kind === 'subject' && sameShort(a.short, word))
  if (abbreviation) return abbreviation.full
  return options.subjects.find((s) => sameShort(s, word)) ?? null
}

/** 'ex' or 'ex.' -> 'exercise', 'ex2' or 'ex.2' -> 'exercise 2'. `null` if no word abbreviation fits. */
function expandWord(word: string, abbreviations: Abbreviation[]): string | null {
  const lower = word.toLowerCase()
  for (const a of abbreviations) {
    if (a.kind !== 'word') continue
    const short = a.short.toLowerCase()
    if (lower === short || lower === `${short}.`) return a.full
    if (lower.startsWith(short)) {
      const number = NUMBER_SUFFIX.exec(lower.slice(short.length))
      if (number) return `${a.full} ${number[1]}`
    }
  }
  return null
}

/**
 * Turns short text like 'eng ex.2 tomorrow' into a task draft.
 * Always returns a complete draft: what it cannot work out is `null`
 * and the user fills it in the "New task" dialog.
 */
export function parseTaskInput(text: string, options: ParseOptions): TaskDraft {
  const words = text.split(/\s+/).filter((w) => w !== '')

  let subject: string | null = null
  // A date ('29.9') and a day word ('today', 'fri') are kept apart: when both
  // are typed, the date decides. Of several of the same kind the first counts
  // and the later ones stay in the title, so the user sees them.
  let date: IsoDate | null = null
  let dayWord: IsoDate | null = null
  const titleWords: string[] = []

  for (const word of words) {
    const lower = word.toLowerCase()

    if (subject === null) {
      const found = findSubject(lower, options)
      if (found !== null) {
        subject = found
        continue
      }
    }

    if (date === null) {
      const found = parseDate(lower, options.today)
      if (found !== null) {
        date = found
        continue
      }
    }

    if (dayWord === null) {
      const found = parseDayWord(lower, options.today)
      if (found !== null) {
        dayWord = found
        continue
      }
    }

    titleWords.push(expandWord(word, options.abbreviations) ?? word)
  }

  const title = titleWords.join(' ')
  return {
    title: title.charAt(0).toUpperCase() + title.slice(1),
    subject,
    due: date ?? dayWord,
    time: null,
    notes: '',
    typed: text,
  }
}
