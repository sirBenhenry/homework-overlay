import { render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import App from './App.tsx'
import { CalendarPage } from './ContentPage.tsx'
import { HomePage } from './HomePage.tsx'
import { PAGES } from './pages.ts'

function nav() {
  return screen.getByRole('navigation', { name: 'Main navigation' })
}

function currentNavItem() {
  return within(nav()).getByRole('button', { current: 'page' })
}

describe('App frame', () => {
  it('starts on Home and marks Home as the current page', () => {
    render(<App />)

    expect(screen.getByRole('heading', { level: 1, name: 'Home' })).toBeInTheDocument()
    expect(currentNavItem()).toHaveTextContent('Home')
    expect(screen.getByRole('region', { name: "Today's timetable" })).toBeInTheDocument()
  })

  it('shows each page and moves the highlight when a nav item is clicked', async () => {
    const user = userEvent.setup()
    render(<App />)

    for (const page of PAGES) {
      await user.click(within(nav()).getByRole('button', { name: page.label }))

      expect(screen.getByRole('heading', { level: 1, name: page.title })).toBeInTheDocument()
      expect(currentNavItem()).toHaveTextContent(page.label)
    }
  })

  it('shows every empty place by its prop name', async () => {
    const user = userEvent.setup()
    render(<App />)

    for (const page of PAGES.filter((entry) => entry.id === 'applets' || entry.id === 'settings')) {
      await user.click(within(nav()).getByRole('button', { name: page.label }))
      expect(screen.getByText('content')).toBeInTheDocument()
    }
  })

  it('shows the timetable and the upcoming tasks on Home', () => {
    render(<App />)

    expect(screen.getByRole('region', { name: "Today's timetable" })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Upcoming tasks' })).toBeInTheDocument()
    expect(screen.queryByText('timetable')).not.toBeInTheDocument()
    expect(screen.queryByText('upcomingTasks')).not.toBeInTheDocument()
  })

  it("opens the Calendar page from the timetable's Calendar button", async () => {
    const user = userEvent.setup()
    render(<App />)

    const timetable = screen.getByRole('region', { name: "Today's timetable" })
    await user.click(within(timetable).getByRole('button', { name: 'Calendar' }))

    expect(screen.getByRole('heading', { level: 1, name: 'Calendar' })).toBeInTheDocument()
  })

  it('shows the add-task box on Home and parses with the input formatter', async () => {
    const user = userEvent.setup()
    render(<App />)

    expect(screen.queryByText('addTask')).not.toBeInTheDocument()
    await user.type(screen.getByLabelText('Add task'), 'eng ex.2 tomorrow{Enter}')

    const dialog = screen.getByRole('dialog', { name: 'New task' })
    expect(within(dialog).getByLabelText('Title')).toHaveValue('Exercise 2')
    expect(within(dialog).getByLabelText('Subject')).toHaveValue('Englisch')
  })

  it('shows the calendar on the Calendar page', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.click(within(nav()).getByRole('button', { name: 'Calendar' }))

    expect(screen.getByText('2 weeks · weekend combined')).toBeInTheDocument()
    expect(screen.queryByText('content')).not.toBeInTheDocument()
  })

  it('shows handed Home content instead of the empty outlines', () => {
    render(
      <HomePage
        timetable={<p>filled timetable</p>}
        upcomingTasks={<p>filled upcoming</p>}
        addTask={<p>filled add</p>}
      />,
    )

    expect(screen.getByText('filled timetable')).toBeInTheDocument()
    expect(screen.getByText('filled upcoming')).toBeInTheDocument()
    expect(screen.getByText('filled add')).toBeInTheDocument()
    expect(screen.queryByText('timetable')).not.toBeInTheDocument()
    expect(screen.queryByText('upcomingTasks')).not.toBeInTheDocument()
    expect(screen.queryByText('addTask')).not.toBeInTheDocument()
  })

  it('shows handed page content instead of the empty outline', () => {
    render(<CalendarPage content={<p>filled calendar</p>} />)

    expect(screen.getByText('filled calendar')).toBeInTheDocument()
    expect(screen.queryByText('content')).not.toBeInTheDocument()
  })

  // Kept last: the task storage keeps its list in memory for the whole test file.
  it('shows a saved task on Home and on the Tasks page', async () => {
    const user = userEvent.setup()
    render(<App />)

    await user.type(screen.getByLabelText('Add task'), 'eng ex.2 tomorrow{Enter}')
    await user.click(screen.getByRole('button', { name: 'Save task' }))

    const upcoming = screen.getByRole('region', { name: 'Upcoming tasks' })
    expect(within(upcoming).getByText('Exercise 2')).toBeInTheDocument()
    expect(within(upcoming).getByText('Tomorrow')).toBeInTheDocument()

    await user.click(within(nav()).getByRole('button', { name: 'Tasks' }))
    expect(screen.queryByText('content')).not.toBeInTheDocument()
    expect(screen.getByText('Exercise 2')).toBeInTheDocument()
  })

  it('shows a saved task in the calendar', async () => {
    const user = userEvent.setup()
    render(<App />)

    // The task "Exercise 2", due tomorrow, was saved by the test above.
    await user.click(within(nav()).getByRole('button', { name: 'Calendar' }))
    expect(screen.getByText(/Exercise 2/)).toBeInTheDocument()
  })
})
