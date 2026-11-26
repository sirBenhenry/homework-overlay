import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { SAMPLE_LESSONS } from '../../shared/sampleData.ts'
import { Timetable } from './index.ts'

describe('Timetable', () => {
  it("shows today's heading and only that weekday's lessons", () => {
    // 2026-09-23 is a Wednesday: Mathe, Mathe, Englisch, Informatik, Deutsch, Wirtschaft.
    render(<Timetable lessons={SAMPLE_LESSONS} today="2026-09-23" now="11:10" />)

    expect(screen.getByRole('heading', { name: 'Today · Wednesday 23.09.' })).toBeInTheDocument()
    expect(screen.getAllByText('Mathe')).toHaveLength(2)
    expect(screen.getByText('08:20–09:05')).toBeInTheDocument()
    expect(screen.getByText('Wirtschaft')).toBeInTheDocument()
    // Französisch is on Tuesday and Thursday only.
    expect(screen.queryByText('Französisch')).not.toBeInTheDocument()
  })

  it('marks the lesson running now and shows the now marker', () => {
    render(<Timetable lessons={SAMPLE_LESSONS} today="2026-09-23" now="11:10" />)

    const running = screen.getByText('11:05–11:50').parentElement
    expect(running).toHaveAttribute('data-running', 'true')
    expect(screen.getByText('08:20–09:05').parentElement).toHaveAttribute('data-running', 'false')
    expect(screen.getByLabelText('Current time marker')).toBeInTheDocument()
  })

  it('hides the now marker outside the hour scale', () => {
    render(<Timetable lessons={SAMPLE_LESSONS} today="2026-09-23" now="19:30" />)

    expect(screen.queryByLabelText('Current time marker')).not.toBeInTheDocument()
  })

  it('shows no lessons on a weekend day', () => {
    render(<Timetable lessons={SAMPLE_LESSONS} today="2026-09-26" now="11:10" />)

    expect(screen.getByRole('heading', { name: 'Today · Saturday 26.09.' })).toBeInTheDocument()
    expect(screen.queryByText('Mathe')).not.toBeInTheDocument()
  })

  it('calls onOpenCalendar from the Calendar button, and hides the button without it', async () => {
    const onOpenCalendar = vi.fn()
    const { rerender } = render(<Timetable lessons={[]} today="2026-09-23" now="11:10" onOpenCalendar={onOpenCalendar} />)

    await userEvent.click(screen.getByRole('button', { name: 'Calendar' }))
    expect(onOpenCalendar).toHaveBeenCalledOnce()

    rerender(<Timetable lessons={[]} today="2026-09-23" now="11:10" />)
    expect(screen.queryByRole('button', { name: 'Calendar' })).not.toBeInTheDocument()
  })
})
