import { describe, expect, it } from 'vitest'
import { addDays, fromIsoDate, toIsoDate, weekdayOf } from './dates.ts'
import { SAMPLE_LESSONS, SAMPLE_TASKS, SAMPLE_TODAY } from './sampleData.ts'

describe('dates', () => {
  it('keeps the local day when converting a Date at midnight', () => {
    expect(toIsoDate(new Date(2026, 8, 23))).toBe('2026-09-23')
    expect(toIsoDate(fromIsoDate('2026-09-23'))).toBe('2026-09-23')
  })

  it('adds days across month and year ends', () => {
    expect(addDays('2026-09-23', 1)).toBe('2026-09-24')
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01')
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
    expect(addDays('2026-09-23', -2)).toBe('2026-09-21')
  })

  it('numbers weekdays from Monday = 1 to Sunday = 7', () => {
    expect(weekdayOf('2026-09-21')).toBe(1)
    expect(weekdayOf('2026-09-23')).toBe(3)
    expect(weekdayOf('2026-09-27')).toBe(7)
  })
})

describe('sample data', () => {
  it('pretends today is a Wednesday', () => {
    expect(weekdayOf(SAMPLE_TODAY)).toBe(3)
  })

  it('has the six lessons the wireframe shows on that Wednesday', () => {
    const wednesday = SAMPLE_LESSONS.filter((lesson) => lesson.weekday === 3)
    expect(wednesday.map((lesson) => lesson.subject)).toEqual([
      'Mathe',
      'Mathe',
      'Englisch',
      'Informatik',
      'Deutsch',
      'Wirtschaft',
    ])
    expect(wednesday[0]).toMatchObject({ start: '08:20', end: '09:05', room: 'R204' })
  })

  it('has five open tasks and two finished ones with valid due dates', () => {
    expect(SAMPLE_TASKS.filter((task) => !task.done)).toHaveLength(5)
    expect(SAMPLE_TASKS.filter((task) => task.done)).toHaveLength(2)
    for (const task of SAMPLE_TASKS) {
      expect(toIsoDate(fromIsoDate(task.due))).toBe(task.due)
    }
  })
})
