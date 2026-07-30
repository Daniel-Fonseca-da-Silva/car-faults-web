import { cn, formatYearRange, slugify } from './utils'

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
