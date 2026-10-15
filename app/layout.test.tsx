import RootLayout from './layout'

jest.mock('next-intl/server', () => ({
  getLocale: jest.fn(async () => 'en-GB'),
}))

describe('RootLayout', () => {
  it('renders the children without an html document of its own', () => {
    const children = <p>page content</p>

    expect(RootLayout({ children })).toBe(children)
  })

  // Reading the locale here falls back to the request headers, which fails
  // every cached page with DYNAMIC_SERVER_USAGE.
  it('does not resolve the locale from the request', async () => {
    const { getLocale } = jest.requireMock('next-intl/server')

    RootLayout({ children: <span /> })

    expect(getLocale).not.toHaveBeenCalled()
  })
})
