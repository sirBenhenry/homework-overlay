import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { SAMPLE_LESSONS, SAMPLE_TASKS } from '../../shared/sampleData.ts'
import type { Task } from '../../shared/types.ts'
import { Calendar } from './index.ts'

const TODAY = '2026-09-23'

function task(id: string, title: string, due: string, done = false, subject: string | null = 'Mathe'): Task {
  return { id, title, subject, due, time: null, notes: '', typed: '', addedAt: '2026-09-20T10:00:00.000Z', done }
}

function renderCalendar(tasks: Task[] = SAMPLE_TASKS) {
  return render(<Calendar tasks={tasks} lessons={SAMPLE_LESSONS} today={TODAY} now="11:10" />)
}

const cell = (name: string) => screen.getByRole('region', { name })

describe('Calendar', () => {
  it('shows the two weeks that start with the week of today', () => {
    renderCalendar()
    expect(screen.getByText('21 Sep – 4 Oct 2026')).toBeInTheDocument()
    expect(screen.getByText('W39')).toBeInTheDocument()
    expect(screen.getByText('W40')).toBeInTheDocument()
    expect(within(cell('Wed 23.09.')).getByText('TODAY')).toBeInTheDocument()
    expect(screen.getAllByText('TODAY')).toHaveLength(1)
  })

  it('moves one week with › and ‹, and Today returns', async () => {
    const user = userEvent.setup()
    renderCalendar()
    await user.click(screen.getByRole('button', { name: 'Next week' }))
    expect(screen.getByText('28 Sep – 11 Oct 2026')).toBeInTheDocument()
    expect(screen.getByText('W41')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Today' }))
    expect(screen.getByText('21 Sep – 4 Oct 2026')).toBeInTheDocument()
    await user.click(screen.getByRole('button', { name: 'Previous week' }))
    expect(screen.getByText('14 Sep – 27 Sep 2026')).toBeInTheDocument()
  })

  it('shows Exercise 2 in the cell of Thu 24.09. and in no other cell', () => {
    renderCalendar()
    expect(within(cell('Thu 24.09.')).getByText('Exercise 2 · Englisch')).toBeInTheDocument()
    expect(screen.getAllByText(/Exercise 2/)).toHaveLength(1)
  })

  it('shows only the title when a task has no subject', () => {
    renderCalendar([task('x', 'Bring form', '2026-09-24', false, null)])
    expect(within(cell('Thu 24.09.')).getByText('Bring form')).toBeInTheDocument()
  })

  it('shows tasks due on Saturday or Sunday in the weekend cell of that week', () => {
    renderCalendar([task('sat', 'Saturday task', '2026-09-26'), task('sun', 'Sunday task', '2026-10-04')])
    expect(within(cell('Sat–Sun 26.–27.09.')).getByText('Saturday task')).toBeInTheDocument()
    expect(within(cell('Sat–Sun 03.–04.10.')).getByText('Sunday task')).toBeInTheDocument()
  })

  it('stacks several tasks due on the same day', () => {
    renderCalendar([task('a', 'First', '2026-09-24'), task('b', 'Second', '2026-09-24')])
    const thursday = cell('Thu 24.09.')
    expect(within(thursday).getByText('First · Mathe')).toBeInTheDocument()
    expect(within(thursday).getByText('Second · Mathe')).toBeInTheDocument()
  })

  it('does not show done tasks', () => {
    renderCalendar()
    // 'Essay outline' is done and due on Tue 22.09., which is in view.
    expect(screen.queryByText(/Essay outline/)).not.toBeInTheDocument()
    expect(screen.queryByText(/Exercise 1/)).not.toBeInTheDocument()
  })

  it('draws two lessons of the same subject in a row as one block', () => {
    renderCalendar()
    // Monday: Mathe, Deutsch, Englisch, then Informatik twice in a row.
    const monday = cell('Mon 21.09.')
    expect(within(monday).getAllByText('Informatik')).toHaveLength(1)
    expect(within(monday).getAllByText('Mathe')).toHaveLength(1)
    expect(within(monday).getAllByText('Deutsch')).toHaveLength(1)
  })
})
