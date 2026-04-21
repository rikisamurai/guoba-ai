import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useThrottle } from '../src'

describe('useThrottle', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useThrottle('hello', 500))
    expect(result.current).toBe('hello')
  })

  it('should not update within the throttle interval', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 500),
      { initialProps: { value: 'a' } },
    )
    rerender({ value: 'b' })
    expect(result.current).toBe('a')
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe('a')
  })

  it('should update after the throttle interval', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 500),
      { initialProps: { value: 'a' } },
    )
    rerender({ value: 'b' })
    act(() => vi.advanceTimersByTime(500))
    expect(result.current).toBe('b')
  })

  it('should use 500ms as the default interval', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value),
      { initialProps: { value: 'a' } },
    )
    rerender({ value: 'b' })
    act(() => vi.advanceTimersByTime(499))
    expect(result.current).toBe('a')
    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe('b')
  })

  it('should take the latest value after interval', () => {
    const { result, rerender } = renderHook(
      ({ value }) => useThrottle(value, 300),
      { initialProps: { value: 'a' } },
    )
    rerender({ value: 'b' })
    act(() => vi.advanceTimersByTime(100))
    rerender({ value: 'c' })
    act(() => vi.advanceTimersByTime(200))
    expect(result.current).toBe('c')
  })
})
