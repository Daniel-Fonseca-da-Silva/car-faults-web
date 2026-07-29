import { render, screen } from '@testing-library/react'
import Home from './page'

describe('Home', () => {
  it('renders the welcome empty state', () => {
    render(<Home />)
    expect(screen.getByText('Welcome to Car Faults')).toBeInTheDocument()
    expect(
      screen.getByText(
        'Look up known chronic issues by make, model, year and engine.'
      )
    ).toBeInTheDocument()
  })
})
