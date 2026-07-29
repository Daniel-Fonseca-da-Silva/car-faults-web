import { cn } from './utils'

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
