import { render } from '@testing-library/react'
import RootLayout from './layout'

jest.mock('next/font/google', () => ({
  Geist: () => ({ variable: '--font-geist-sans' }),
  Geist_Mono: () => ({ variable: '--font-geist-mono' }),
}))

jest.mock('next-intl/server', () => ({
  getLocale: jest.fn(async () => 'en-GB'),
}))

jest.mock('@vercel/analytics/next', () => ({
  Analytics: () => null,
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
  it('renders children', async () => {
    const jsx = await RootLayout({ children: <p>page content</p> })
    const { getByText } = render(jsx)
    expect(getByText('page content')).toBeInTheDocument()
  })

  it('sets lang from the negotiated locale on the html element', async () => {
    const jsx = await RootLayout({ children: <span /> })
    render(jsx)
    expect(document.documentElement).toHaveAttribute('lang', 'en-GB')
  })

  it('applies the dark theme class and font variables to the html element', async () => {
    const jsx = await RootLayout({ children: <span /> })
    render(jsx)
    expect(document.documentElement.className).toContain('dark')
    expect(document.documentElement.className).toContain('--font-geist-sans')
    expect(document.documentElement.className).toContain('--font-geist-mono')
  })
})
