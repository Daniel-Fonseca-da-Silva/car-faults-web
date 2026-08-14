import { render } from '@testing-library/react'
import RootLayout from './layout'

jest.mock('next/font/google', () => ({
  Geist: () => ({ variable: '--font-geist-sans' }),
  Geist_Mono: () => ({ variable: '--font-geist-mono' }),
}))

jest.mock('next-intl/server', () => ({
  getLocale: jest.fn(async () => 'en-GB'),
}))

jest.mock('next/script', () => ({
  __esModule: true,
  default: (props: { id?: string; dangerouslySetInnerHTML?: { __html: string } }) => (
    <script
      id={props.id}
      data-testid="google-consent-mode-script"
      dangerouslySetInnerHTML={props.dangerouslySetInnerHTML}
    />
  ),
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

  it('renders the Google Consent Mode default script with denied defaults', async () => {
    const jsx = await RootLayout({ children: <span /> })
    const { getByTestId } = render(jsx)
    const script = getByTestId('google-consent-mode-script')

    expect(script).toHaveAttribute('id', 'google-consent-mode-default')
    expect(script.innerHTML).toContain("ad_storage: 'denied'")
    expect(script.innerHTML).toContain("analytics_storage: 'denied'")
    expect(script.innerHTML).toContain('cookie_consent')
  })
})
