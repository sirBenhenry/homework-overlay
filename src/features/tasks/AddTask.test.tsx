import { fireEvent, render, screen, within } from '@testing-library/react'
import { expect, it, vi } from 'vitest'
import type { ParseTaskInput } from '../../shared/types'
import { AddTask } from './index'
import userEvent from '@testing-library/user-event'

const plainParse: ParseTaskInput = (text) => ({
  title: text.trim(),
  subject: null,
  due: null,
  time: null,
  notes: '',
  typed: text,
})

it('opens the new task dialog with the title returned by parse', () => {
  const parse = vi.fn(plainParse)
  const onAdd = vi.fn()
  const typed = '  Exercise 2  '

  render(<AddTask parse={parse} subjects={['Englisch']} onAdd={onAdd} />)

  const input = screen.getByRole('textbox', { name: 'Add task' })
  fireEvent.change(input, { target: { value: typed } })
  fireEvent.click(screen.getByRole('button', { name: /enter/i }))

  expect(parse).toHaveBeenCalledTimes(1)
  expect(parse).toHaveBeenCalledWith(typed)

  const dialog = screen.getByRole('dialog', { name: 'New task' })
  const title = within(dialog).getByRole('textbox', { name: 'Title' })
  expect(title).toHaveProperty('value', 'Exercise 2')
  expect(onAdd).not.toHaveBeenCalled()
})

it('saves the edited fields and clears the quick-add input', () => {
  const onAdd = vi.fn()
  const typed = 'fractions friday'

  render(<AddTask parse={plainParse} subjects={['Mathe']} onAdd={onAdd} />)

  fireEvent.change(screen.getByRole('textbox', { name: 'Add task' }), {
    target: { value: typed },
  })
  fireEvent.click(screen.getByRole('button', { name: /enter/i }))

  const dialog = within(screen.getByRole('dialog', { name: 'New task' }))

  fireEvent.change(dialog.getByLabelText('Title'), {
    target: { value: '  Worksheet fractions  ' },
  })
  fireEvent.change(dialog.getByLabelText('Subject'), {
    target: { value: 'Mathe' },
  })
  fireEvent.change(dialog.getByLabelText('Due'), {
    target: { value: '2026-09-25' },
  })
  fireEvent.change(dialog.getByLabelText('Time'), {
    target: { value: '08:20' },
  })
  fireEvent.change(dialog.getByLabelText('Notes'), {
    target: { value: 'Bring the worksheet' },
  })

  fireEvent.click(dialog.getByRole('button', { name: 'Save task' }))

  expect(onAdd).toHaveBeenCalledTimes(1)
  expect(onAdd).toHaveBeenCalledWith({
    title: 'Worksheet fractions',
    subject: 'Mathe',
    due: '2026-09-25',
    time: '08:20',
    notes: 'Bring the worksheet',
    typed,
  })
  expect(screen.queryByRole('dialog')).toBeNull()
  expect(screen.getByRole('textbox', { name: 'Add task' })).toHaveProperty('value', '')
})

it('enables saving only when both title and due date are set', () => {
  render(<AddTask parse={plainParse} subjects={[]} onAdd={vi.fn()} />)

  fireEvent.change(screen.getByRole('textbox', { name: 'Add task' }), {
    target: { value: 'Exercise 2' },
  })
  fireEvent.click(screen.getByRole('button', { name: /enter/i }))

  const dialog = within(screen.getByRole('dialog', { name: 'New task' }))
  const title = dialog.getByRole('textbox', { name: 'Title' })
  const due = dialog.getByLabelText('Due')
  const save = dialog.getByRole('button', { name: 'Save task' })

  // The parser supplied a title, but the due date is still empty.
  expect(save).toHaveProperty('disabled', true)

  fireEvent.change(due, { target: { value: '2026-09-25' } })
  expect(save).toHaveProperty('disabled', false)

  // Whitespace alone counts as an empty title.
  fireEvent.change(title, { target: { value: '   ' } })
  expect(save).toHaveProperty('disabled', true)

  fireEvent.change(title, { target: { value: 'Exercise 3' } })
  expect(save).toHaveProperty('disabled', false)
})

it.each(['Cancel', 'Escape'])(
  'keeps the original input and discards edits on %s',
  (action) => {
    const onAdd = vi.fn()
    const typed = '  eng ex.2 tomorrow  '

    render(<AddTask parse={plainParse} subjects={[]} onAdd={onAdd} />)

    fireEvent.change(screen.getByRole('textbox', { name: 'Add task' }), {
      target: { value: typed },
    })
    fireEvent.click(screen.getByRole('button', { name: /enter/i }))

    const dialog = within(screen.getByRole('dialog', { name: 'New task' }))
    const title = dialog.getByRole('textbox', { name: 'Title' })
    fireEvent.change(title, { target: { value: 'Edited title' } })

    if (action === 'Cancel') {
      fireEvent.click(dialog.getByRole('button', { name: 'Cancel' }))
    } else {
      fireEvent.keyDown(title, { key: 'Escape' })
    }

    expect(screen.queryByRole('dialog')).toBeNull()
    expect(onAdd).not.toHaveBeenCalled()
    expect(screen.getByRole('textbox', { name: 'Add task' })).toHaveProperty('value', typed)
  },
)

it.each([
  ['empty input', ''],
  ['whitespace only', '   '],
])('ignores %s when opening a task', (_description, text) => {
  const parse = vi.fn(plainParse)
  render(<AddTask parse={parse} subjects={[]} onAdd={vi.fn()} />)

  const input = screen.getByRole('textbox', { name: 'Add task' })
  fireEvent.change(input, { target: { value: text } })
  fireEvent.click(screen.getByRole('button', { name: /enter/i }))

  expect(parse).not.toHaveBeenCalled()
  expect(screen.queryByRole('dialog')).toBeNull()
})

it('opens the dialog on Enter and fills the fields from the parsed draft', async () => {
  const user = userEvent.setup()
  const parse = vi.fn((text: string) => ({
    ...plainParse(text),
    title: 'Exercise 2',
    subject: 'Englisch',
    due: '2026-09-24',
    time: '08:20',
    notes: 'Bring the workbook',
  }))

  render(<AddTask parse={parse} subjects={['Englisch']} onAdd={vi.fn()} />)

  const input = screen.getByRole('textbox', { name: 'Add task' })
  await user.type(input, 'eng ex.2 tomorrow')
  await user.keyboard('{Enter}')

  expect(parse).toHaveBeenCalledTimes(1)
  expect(parse).toHaveBeenCalledWith('eng ex.2 tomorrow')

  const dialog = within(screen.getByRole('dialog', { name: 'New task' }))
  expect(dialog.getByLabelText('Title')).toHaveProperty('value', 'Exercise 2')
  expect(dialog.getByLabelText('Subject')).toHaveProperty('value', 'Englisch')
  expect(dialog.getByLabelText('Due')).toHaveProperty('value', '2026-09-24')
  expect(dialog.getByLabelText('Time')).toHaveProperty('value', '08:20')
  expect(dialog.getByLabelText('Notes')).toHaveProperty('value', 'Bring the workbook')
  expect(dialog.getByText('eng ex.2 tomorrow')).toBeTruthy()
})
