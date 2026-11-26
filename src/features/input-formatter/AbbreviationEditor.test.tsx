import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { DEFAULT_ABBREVIATIONS } from './abbreviations.ts'
import { AbbreviationEditor } from './AbbreviationEditor.tsx'
import { STORAGE_KEY } from './useAbbreviations.ts'

function setup() {
  const user = userEvent.setup()
  render(<AbbreviationEditor />)
  const add = async (short: string, full: string, kind: 'Subject' | 'Word' = 'Subject') => {
    if (short) await user.type(screen.getByLabelText('Short'), short)
    if (full) await user.type(screen.getByLabelText('Stands for'), full)
    await user.selectOptions(screen.getByLabelText('Kind'), kind)
    await user.click(screen.getByRole('button', { name: 'Add' }))
  }
  return { user, add }
}

const rows = () => screen.getAllByRole('listitem')
const stored = () => JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]')

describe('AbbreviationEditor', () => {
  it('lists every built-in abbreviation, marked as built-in, without a remove button', () => {
    setup()
    expect(rows()).toHaveLength(DEFAULT_ABBREVIATIONS.length)
    expect(screen.getAllByText('Built-in')).toHaveLength(DEFAULT_ABBREVIATIONS.length)
    expect(screen.queryByRole('button', { name: /remove/i })).toBeNull()
    expect(screen.getByText('Englisch')).toBeInTheDocument()
  })

  it('adds an abbreviation and removes it again', async () => {
    const { user, add } = setup()
    await add('ws', 'worksheet', 'Word')
    expect(stored()).toEqual([{ short: 'ws', full: 'worksheet', kind: 'word' }])
    const row = rows().at(-1)!
    expect(within(row).getByText('ws')).toBeInTheDocument()
    expect(within(row).getByText('Word')).toBeInTheDocument()
    expect(screen.getByLabelText('Short')).toHaveValue('')

    await user.click(screen.getByRole('button', { name: 'Remove ws' }))
    expect(rows()).toHaveLength(DEFAULT_ABBREVIATIONS.length)
    expect(stored()).toEqual([])
  })

  it('replaces a built-in abbreviation and brings it back on removal', async () => {
    const { user, add } = setup()
    await add('eng', 'English')
    expect(rows()).toHaveLength(DEFAULT_ABBREVIATIONS.length)
    expect(screen.queryByText('Englisch')).toBeNull()
    await user.click(screen.getByRole('button', { name: 'Remove eng' }))
    expect(screen.getByText('Englisch')).toBeInTheDocument()
  })

  it.each([
    ['', 'Biologie', 'Enter the short form.'],
    ['   ', 'Biologie', 'Enter the short form.'],
    ['b io', 'Biologie', 'The short form cannot contain a space.'],
    ['bio', '', 'Enter what the short form stands for.'],
  ])('refuses short %j with full %j', async (short, full, message) => {
    const { add } = setup()
    await add(short, full)
    expect(screen.getByRole('alert')).toHaveTextContent(message)
    expect(rows()).toHaveLength(DEFAULT_ABBREVIATIONS.length)
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull()
  })

  it('refuses a short that is already one of the own ones', async () => {
    const { add } = setup()
    await add('bio', 'Biologie')
    await add('BIO', 'Biology')
    expect(screen.getByRole('alert')).toHaveTextContent('You already have "bio". Remove it first.')
    expect(stored()).toEqual([{ short: 'bio', full: 'Biologie', kind: 'subject' }])
  })
})
