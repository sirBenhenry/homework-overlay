import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import PreviewApp from './PreviewApp.tsx'

function Sample() {
  return <p>sample part</p>
}

const loaders = { calendar: () => Promise.resolve({ default: Sample }) }

describe('PreviewApp', () => {
  it('says so when no part has a preview yet', () => {
    render(<PreviewApp loaders={{}} feature={null} />)
    expect(screen.getByText(/No previews yet/)).toBeInTheDocument()
  })

  it('lists the parts that have a preview', () => {
    render(<PreviewApp loaders={loaders} feature={null} />)
    expect(screen.getByRole('link', { name: 'calendar' })).toHaveAttribute('href', '?feature=calendar')
  })

  it('shows the chosen part', async () => {
    render(<PreviewApp loaders={loaders} feature="calendar" />)
    expect(await screen.findByText('sample part')).toBeInTheDocument()
  })

  it('explains when the chosen part has no preview', () => {
    render(<PreviewApp loaders={loaders} feature="tasks" />)
    expect(screen.getByText(/There is no/)).toBeInTheDocument()
  })
})
