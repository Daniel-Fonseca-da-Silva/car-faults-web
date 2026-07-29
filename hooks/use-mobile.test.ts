import { act, renderHook } from '@testing-library/react'
import { getIsMobileServerSnapshot, useIsMobile } from './use-mobile'

function mockMatchMedia(initialMatches: boolean) {
  let currentMatches = initialMatches
  const listeners = new Set<(event: MediaQueryListEvent) => void>()

  window.matchMedia = jest.fn().mockImplementation((query: string) => ({
    get matches() {
      return currentMatches
    },
    media: query,
    addEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.add(listener)
    },
    removeEventListener: (_: string, listener: (event: MediaQueryListEvent) => void) => {
      listeners.delete(listener)
    },
  }))

  return {
    fireChange: (nextMatches: boolean) => {
      currentMatches = nextMatches
      listeners.forEach((listener) =>
        listener({ matches: nextMatches } as MediaQueryListEvent)
      )
    },
  }
}

describe('useIsMobile', () => {
  it('returns false when the viewport is wider than the mobile breakpoint', () => {
    mockMatchMedia(false)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)
  })

  it('returns true when the viewport matches the mobile breakpoint', () => {
    mockMatchMedia(true)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(true)
  })

  it('updates when the media query change event fires', () => {
    const { fireChange } = mockMatchMedia(false)
    const { result } = renderHook(() => useIsMobile())
    expect(result.current).toBe(false)

    act(() => {
      fireChange(true)
    })

    expect(result.current).toBe(true)
  })

  it('reports false for the server snapshot regardless of the client viewport', () => {
    expect(getIsMobileServerSnapshot()).toBe(false)
  })
})
