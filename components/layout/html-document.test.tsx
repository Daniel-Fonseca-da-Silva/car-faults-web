import { render, within } from '@testing-library/react'
import { HtmlDocument } from './html-document'

jest.mock('next/font/google', () => ({
  Geist: () => ({ variable: '--font-geist-sans' }),
  Geist_Mono: () => ({ variable: '--font-geist-mono' }),
}))

jest.mock('@/components/scripts/ssr-inline-script', () => ({
  SsrInlineScript: (props: { id: string; html: string }) => (
    <script
      id={props.id}
      data-testid="google-consent-mode-script"
      dangerouslySetInnerHTML={{ __html: props.html }}
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

describe('HtmlDocument', () => {
  it('renders children', () => {
    const { getByText } = render(
      <HtmlDocument lang="en-GB">
        <p>page content</p>
      </HtmlDocument>
    )
    expect(getByText('page content')).toBeInTheDocument()
  })

  it('sets lang on the html element', () => {
    render(
      <HtmlDocument lang="en-GB">
        <span />
      </HtmlDocument>
    )
    expect(document.documentElement).toHaveAttribute('lang', 'en-GB')
  })

  it('applies the dark theme class and font variables to the html element', () => {
    render(
      <HtmlDocument lang="en-GB">
        <span />
      </HtmlDocument>
    )
    expect(document.documentElement.className).toContain('dark')
    expect(document.documentElement.className).toContain('--font-geist-sans')
    expect(document.documentElement.className).toContain('--font-geist-mono')
  })

  it('renders the Google Consent Mode default script with denied defaults', () => {
    render(
      <HtmlDocument lang="en-GB">
        <span />
      </HtmlDocument>
    )
    // The script lives in <head>, outside the RTL container.
    const script = within(document.head).getByTestId('google-consent-mode-script')

    expect(script).toHaveAttribute('id', 'google-consent-mode-default')
    expect(script.innerHTML).toContain("ad_storage: 'denied'")
    expect(script.innerHTML).toContain("analytics_storage: 'denied'")
    expect(script.innerHTML).toContain('cookie_consent')
  })
})
