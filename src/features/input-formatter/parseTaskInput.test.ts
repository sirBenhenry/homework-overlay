import { describe, expect, it } from 'vitest'
import { SAMPLE_SUBJECTS, SAMPLE_TODAY } from '../../shared/sampleData.ts'
import { type Abbreviation, DEFAULT_ABBREVIATIONS, mergeAbbreviations } from './abbreviations.ts'
import { type ParseOptions, parseTaskInput } from './parseTaskInput.ts'

// SAMPLE_TODAY is Wednesday 2026-09-23.
const options: ParseOptions = {
  today: SAMPLE_TODAY,
  subjects: SAMPLE_SUBJECTS,
  abbreviations: DEFAULT_ABBREVIATIONS,
}

const parse = (text: string, overrides: Partial<ParseOptions> = {}) =>
  parseTaskInput(text, { ...options, ...overrides })

describe('parseTaskInput: the examples of the brief', () => {
  it.each([
    ['eng ex.2 tomorrow', 'Exercise 2', 'Englisch', '2026-09-24'],
    ['math worksheet fractions fri', 'Worksheet fractions', 'Mathe', '2026-09-25'],
    ['de read ch3 monday', 'Read chapter 3', 'Deutsch', '2026-09-28'],
    ['fr vocab test tue 29.9', 'Vocab test', 'Französisch', '2026-09-29'],
    ['inf project draft 1.10', 'Project draft', 'Informatik', '2026-10-01'],
    ['wr presentation slides thu', 'Presentation slides', 'Wirtschaft', '2026-09-24'],
    ['fr grammar sheet wed', 'Grammar sheet', 'Französisch', '2026-09-30'],
    ['Mathe ex.5 today', 'Exercise 5', 'Mathe', '2026-09-23'],
    ['buy calculator', 'Buy calculator', null, null],
  ])('%s', (typed, title, subject, due) => {
    expect(parse(typed)).toEqual({ title, subject, due, time: null, notes: '', typed })
  })
})

describe('parseTaskInput: words and case', () => {
  it('ignores upper and lower case when matching', () => {
    expect(parse('ENG Ex.2 TOMORROW')).toMatchObject({
      title: 'Exercise 2',
      subject: 'Englisch',
      due: '2026-09-24',
    })
    expect(parse('mathe sheet FrIdAy')).toMatchObject({ subject: 'Mathe', due: '2026-09-25' })
  })

  it('treats several spaces as one and keeps typed exactly', () => {
    const draft = parse('  eng   read  ')
    expect(draft.title).toBe('Read')
    expect(draft.typed).toBe('  eng   read  ')
  })

  it('returns an empty draft for empty text or only spaces', () => {
    for (const typed of ['', '   ']) {
      expect(parse(typed)).toEqual({ title: '', subject: null, due: null, time: null, notes: '', typed })
    }
  })
})

describe('parseTaskInput: subject', () => {
  it('takes the first subject word, later ones stay in the title', () => {
    expect(parse('eng compare with de text')).toMatchObject({
      subject: 'Englisch',
      title: 'Compare with de text',
    })
  })

  it('recognises a full subject name from subjects', () => {
    expect(parse('sport bring shoes')).toMatchObject({ subject: 'Sport', title: 'Bring shoes' })
  })

  it('is null without a subject word', () => {
    expect(parse('read book').subject).toBeNull()
  })

  it('uses a subject abbreviation even if its full name is not in subjects', () => {
    const own: Abbreviation = { short: 'bio', full: 'Biologie', kind: 'subject' }
    expect(parse('bio cells', { abbreviations: [...DEFAULT_ABBREVIATIONS, own] }).subject).toBe('Biologie')
  })
})

describe('parseTaskInput: due date', () => {
  it('reads today and tomorrow', () => {
    expect(parse('x today').due).toBe('2026-09-23')
    expect(parse('x tomorrow').due).toBe('2026-09-24')
  })

  it('reads every weekday, short and long, as the next one after today', () => {
    const expected: Record<string, string> = {
      thu: '2026-09-24', fri: '2026-09-25', sat: '2026-09-26', sun: '2026-09-27',
      mon: '2026-09-28', tue: '2026-09-29', wed: '2026-09-30',
    }
    const long: Record<string, string> = {
      thu: 'thursday', fri: 'friday', sat: 'saturday', sun: 'sunday',
      mon: 'monday', tue: 'tuesday', wed: 'wednesday',
    }
    for (const [short, due] of Object.entries(expected)) {
      expect(parse(`x ${short}`).due).toBe(due)
      expect(parse(`x ${long[short]}`).due).toBe(due)
    }
  })

  it('reads D.M, D.M. and D.M.YYYY', () => {
    expect(parse('x 29.9').due).toBe('2026-09-29')
    expect(parse('x 1.10.').due).toBe('2026-10-01')
    expect(parse('x 24.09.2026').due).toBe('2026-09-24')
  })

  it('counts today for a date without a year', () => {
    expect(parse('x 23.9').due).toBe('2026-09-23')
  })

  it('moves a date without a year that has passed to next year', () => {
    expect(parse('x 22.9').due).toBe('2027-09-22')
    expect(parse('x 1.1').due).toBe('2027-01-01')
  })

  it('takes 29.2 without a year as the next 29 February that exists', () => {
    expect(parse('x 29.2').due).toBe('2028-02-29')
  })

  it('lets the date decide over a weekday and removes both', () => {
    expect(parse('test wed 29.9')).toMatchObject({ title: 'Test', due: '2026-09-29' })
    expect(parse('test 29.9 wed')).toMatchObject({ title: 'Test', due: '2026-09-29' })
  })

  it('keeps a date that does not exist in the title', () => {
    expect(parse('x 31.2')).toMatchObject({ title: 'X 31.2', due: null })
    expect(parse('x 29.2.2027')).toMatchObject({ title: 'X 29.2.2027', due: null })
    expect(parse('x 5.13')).toMatchObject({ title: 'X 5.13', due: null })
  })

  it('takes the first of several day words, later ones stay in the title', () => {
    expect(parse('x today fri')).toMatchObject({ title: 'X fri', due: '2026-09-23' })
    expect(parse('x mon tue')).toMatchObject({ title: 'X tue', due: '2026-09-28' })
    expect(parse('x 1.10 2.10')).toMatchObject({ title: 'X 2.10', due: '2026-10-01' })
  })

  it('is null without a date word', () => {
    expect(parse('eng read').due).toBeNull()
  })
})

describe('parseTaskInput: word abbreviations', () => {
  it('replaces a word abbreviation and keeps a following number', () => {
    expect(parse('ex2').title).toBe('Exercise 2')
    expect(parse('ex.2').title).toBe('Exercise 2')
    expect(parse('do ch12').title).toBe('Do chapter 12')
  })

  it('replaces a word abbreviation with or without a dot at the end', () => {
    expect(parse('do ex').title).toBe('Do exercise')
    expect(parse('do ex.').title).toBe('Do exercise')
  })

  it('leaves words alone that only start like an abbreviation', () => {
    expect(parse('exam check').title).toBe('Exam check')
    expect(parse('ex2b').title).toBe('Ex2b')
  })
})

describe('parseTaskInput: own abbreviations', () => {
  it('uses an own abbreviation', () => {
    const abbreviations = mergeAbbreviations([{ short: 'ws', full: 'worksheet', kind: 'word' }])
    expect(parse('math ws3', { abbreviations }).title).toBe('Worksheet 3')
  })

  it('uses an own abbreviation instead of a built-in one with the same short', () => {
    const abbreviations = mergeAbbreviations([{ short: 'ex', full: 'exam', kind: 'word' }])
    expect(parse('ex.2', { abbreviations }).title).toBe('Exam 2')
  })
})
