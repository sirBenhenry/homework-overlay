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
    expect(screen.getByText('timetable')).toBeInTheDocument()
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

    expect(screen.getByText('timetable')).toBeInTheDocument()
    expect(screen.getByText('upcomingTasks')).toBeInTheDocument()
    expect(screen.getByText('addTask')).toBeInTheDocument()

    for (const page of PAGES.filter((entry) => entry.id !== 'home' && entry.id !== 'calendar')) {
      await user.click(within(nav()).getByRole('button', { name: page.label }))
      expect(screen.getByText('content')).toBeInTheDocument()
    }
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
})

