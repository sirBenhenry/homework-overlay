import { render, screen, within } from '@testing-library/react'
import { expect, it } from 'vitest'
import { SAMPLE_TASKS, SAMPLE_TODAY } from '../../shared/sampleData'
import { TaskList } from './index'

it('shows open tasks ordered by due date and then by creation time', () => {
  const tasks = SAMPLE_TASKS.map((task) =>
    task.id === 't4' || task.id === 't5'
      ? { ...task, due: SAMPLE_TODAY }
      : task
  )

  render(<TaskList tasks={tasks} today={SAMPLE_TODAY} />)

  const rows = screen.getAllByRole('listitem')
  const expected = [
    ['Project draft', 'Informatik', 'Today'],
    ['Vocab test prep', 'Französisch', 'Today'],
    ['Exercise 2', 'Englisch', 'Tomorrow'],
    ['Worksheet fractions', 'Mathe', 'Fri 25.09.'],
    ['Read chapter 3', 'Deutsch', 'Mon 28.09.'],
  ]

  expect(rows).toHaveLength(expected.length)
  rows.forEach((row, index) => {
    const [title, subject, due] = expected[index]
    const item = within(row)
    expect(item.getByText(title)).toBeInTheDocument()
    expect(item.getByText(subject)).toBeInTheDocument()
    expect(item.getByText(due)).toBeInTheDocument()
  })

  expect(screen.queryByText('Essay outline')).not.toBeInTheDocument()
  expect(screen.queryByText('Exercise 1')).not.toBeInTheDocument()
})

it('shows the empty message when all tasks are done', () => {
  const completed = SAMPLE_TASKS.filter((task) => task.done)

  render(<TaskList tasks={completed} today={SAMPLE_TODAY} />)

  expect(screen.getByText('No open tasks.')).toBeInTheDocument()
  expect(screen.queryByRole('listitem')).not.toBeInTheDocument()
})
