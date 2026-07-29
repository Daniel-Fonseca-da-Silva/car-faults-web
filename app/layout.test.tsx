import { render } from '@testing-library/react'
import RootLayout from './layout'

jest.mock('next/font/google', () => ({
  Geist: () => ({ variable: '--font-geist-sans' }),
  Geist_Mono: () => ({ variable: '--font-geist-mono' }),
}))

// React 19 treats <html> as a singleton and renders it to document.documentElement,
// not inside the RTL container div. Suppress the expected nesting warning.
beforeAll(() => {
  jest.spyOn(console, 'error').mockImplementation(() => {})
})

afterAll(() => {
  jest.restoreAllMocks()
})

describe('RootLayout', () => {
  it('renders children', () => {
    const { getByText } = render(
      <RootLayout>
        <p>page content</p>
      </RootLayout>,
    )
    expect(getByText('page content')).toBeInTheDocument()
  })

  it('sets lang="en-GB" on the html element', () => {
    render(<RootLayout><span /></RootLayout>)
    expect(document.documentElement).toHaveAttribute('lang', 'en-GB')
  })

  it('applies font variables to html className', () => {
    render(<RootLayout><span /></RootLayout>)
    expect(document.documentElement.className).toContain('--font-geist-sans')
    expect(document.documentElement.className).toContain('--font-geist-mono')
  })
})
