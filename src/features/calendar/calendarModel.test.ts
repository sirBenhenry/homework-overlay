import { describe, expect, it } from 'vitest'
import { SAMPLE_LESSONS } from '../../shared/sampleData.ts'
import type { Lesson } from '../../shared/types.ts'
import { dayLabel, isoWeek, lessonBlocks, mondayOf, rangeLabel, scalePercent, weekendLabel } from './calendarModel.ts'

function lesson(start: string, end: string, subject: string, room = 'R1'): Lesson {
  return { weekday: 1, start, end, subject, room }
}

describe('dates', () => {
  it('finds the Monday of a week', () => {
    expect(mondayOf('2026-09-23')).toBe('2026-09-21')
    expect(mondayOf('2026-09-21')).toBe('2026-09-21')
    expect(mondayOf('2026-09-27')).toBe('2026-09-21')
  })

  it('counts ISO weeks, also around new year', () => {
    expect(isoWeek('2026-09-21')).toBe(39)
    expect(isoWeek('2026-09-28')).toBe(40)
    expect(isoWeek('2026-12-28')).toBe(53)
    expect(isoWeek('2027-01-04')).toBe(1)
    expect(isoWeek('2027-01-01')).toBe(53)
  })

  it('writes labels like the wireframe', () => {
    expect(rangeLabel('2026-09-21', '2026-10-04')).toBe('21 Sep – 4 Oct 2026')
    expect(rangeLabel('2026-12-28', '2027-01-10')).toBe('28 Dec 2026 – 10 Jan 2027')
    expect(dayLabel('2026-09-21')).toBe('Mon 21.09.')
    expect(weekendLabel('2026-09-26')).toBe('26.–27.09.')
    expect(weekendLabel('2026-10-31')).toBe('31.10.–01.11.')
  })

  it('places times on the 08:00–17:00 scale', () => {
    expect(scalePercent(8 * 60)).toBe(0)
    expect(scalePercent(17 * 60)).toBe(100)
  })
})

describe('lessonBlocks', () => {
  it('merges lessons of the same subject that follow each other', () => {
    const blocks = lessonBlocks([lesson('13:15', '14:00', 'Informatik'), lesson('14:05', '14:50', 'Informatik')], 1)
    expect(blocks).toEqual([{ subject: 'Informatik', room: 'R1', start: 13 * 60 + 15, end: 14 * 60 + 50 }])
  })

  it('keeps different subjects apart', () => {
    const blocks = lessonBlocks([lesson('08:20', '09:05', 'Mathe'), lesson('09:10', '09:55', 'Deutsch')], 1)
    expect(blocks.map((b) => b.subject)).toEqual(['Mathe', 'Deutsch'])
  })

  it('keeps the same subject apart when another lesson lies between or the room differs', () => {
    expect(
      lessonBlocks(
        [lesson('08:20', '09:05', 'Mathe'), lesson('09:10', '09:55', 'Deutsch'), lesson('10:15', '11:00', 'Mathe')],
        1,
      ),
    ).toHaveLength(3)
    expect(lessonBlocks([lesson('08:20', '09:05', 'Sport', 'A'), lesson('09:10', '09:55', 'Sport', 'B')], 1)).toHaveLength(2)
  })

  it('sorts by time and only takes the asked weekday', () => {
    const wednesday = lessonBlocks(SAMPLE_LESSONS, 3)
    expect(wednesday.map((b) => b.subject)).toEqual(['Mathe', 'Englisch', 'Informatik', 'Deutsch', 'Wirtschaft'])
  })
})
