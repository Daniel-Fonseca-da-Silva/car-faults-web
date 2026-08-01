import {
  cn,
  formatLongDate,
  formatRelativeTime,
  formatYearRange,
  getInitials,
  slugify,
} from './utils'

describe('cn', () => {
  it('returns a single class unchanged', () => {
    expect(cn('foo')).toBe('foo')
  })

  it('merges multiple classes', () => {
    expect(cn('foo', 'bar')).toBe('foo bar')
  })

  it('includes class when condition is true', () => {
    expect(cn('foo', true && 'bar')).toBe('foo bar')
  })

  it('excludes class when condition is false', () => {
    expect(cn('foo', false && 'bar')).toBe('foo')
  })

  it('resolves Tailwind conflicts, last wins', () => {
    expect(cn('text-red-500', 'text-blue-500')).toBe('text-blue-500')
  })

  it('handles array inputs', () => {
    expect(cn(['foo', 'bar'])).toBe('foo bar')
  })

  it('ignores undefined and null values', () => {
    expect(cn('foo', undefined, 'bar')).toBe('foo bar')
  })
})

describe('slugify', () => {
  it('lowercases and hyphenates spaces', () => {
    expect(slugify('Model 3')).toBe('model-3')
  })

  it('strips accents', () => {
    expect(slugify('Série 3')).toBe('serie-3')
  })

  it('collapses repeated separators and trims leading/trailing hyphens', () => {
    expect(slugify('Classe C')).toBe('classe-c')
    expect(slugify('Mercedes-Benz')).toBe('mercedes-benz')
    expect(slugify('  Renault!! ')).toBe('renault')
  })
})

describe('formatYearRange', () => {
  it('renders a range when yearTo differs from yearFrom', () => {
    expect(formatYearRange(1994, 1999)).toBe('1994 – 1999')
  })

  it('renders a single year when yearTo matches yearFrom', () => {
    expect(formatYearRange(1994, 1994)).toBe('1994')
  })

  it('renders a single year when yearTo is null', () => {
    expect(formatYearRange(1994, null)).toBe('1994')
  })
})

describe('formatLongDate', () => {
  it('formats an ISO date string in Portuguese', () => {
    expect(formatLongDate('2026-07-17T10:00:00.000Z', 'pt-PT')).toBe(
      '17 de julho de 2026'
    )
  })

  it('formats an ISO date string in British English', () => {
    expect(formatLongDate('2026-07-17T10:00:00.000Z', 'en-GB')).toBe(
      '17 July 2026'
    )
  })

  it('formats an ISO date string in Spanish', () => {
    expect(formatLongDate('2026-07-17T10:00:00.000Z', 'es-ES')).toBe(
      '17 de julio de 2026'
    )
  })
})

describe('formatRelativeTime', () => {
  const now = new Date('2026-07-17T12:00:00.000Z')

  beforeEach(() => {
    jest.useFakeTimers().setSystemTime(now)
  })

  afterEach(() => {
    jest.useRealTimers()
  })

  it('formats minutes in the past', () => {
    const date = new Date(now.getTime() - 5 * 60 * 1000)
    expect(formatRelativeTime(date, 'en-GB')).toBe('5 minutes ago')
  })

  it('formats hours in the past', () => {
    const date = new Date(now.getTime() - 3 * 60 * 60 * 1000)
    expect(formatRelativeTime(date, 'en-GB')).toBe('3 hours ago')
  })

  it('formats days in the past', () => {
    const date = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000)
    expect(formatRelativeTime(date, 'en-GB')).toBe('2 days ago')
  })

  it('formats seconds in the past', () => {
    const date = new Date(now.getTime() - 10 * 1000)
    expect(formatRelativeTime(date, 'en-GB')).toBe('10 seconds ago')
  })

  it('formats dates in Portuguese', () => {
    const date = new Date(now.getTime() - 60 * 60 * 1000)
    expect(formatRelativeTime(date, 'pt-PT')).toBe('há 1 hora')
  })
})

describe('getInitials', () => {
  it('returns the first letter of the first two words', () => {
    expect(getInitials('Ana Silva')).toBe('AS')
  })

  it('returns a single initial for a single-word name', () => {
    expect(getInitials('Ana')).toBe('A')
  })

  it('ignores extra words and repeated spaces', () => {
    expect(getInitials('Ana  Maria Silva Santos')).toBe('AM')
  })
})
