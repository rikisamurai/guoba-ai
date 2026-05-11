import { act, renderHook } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { useDebounce } from '../src'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })
  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return the initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 500))
    expect(result.current).toBe('hello')
  })

  it('should debounce value updates', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'a' },
    })
    rerender({ value: 'b' })
    expect(result.current).toBe('a')
    act(() => vi.advanceTimersByTime(500))
    expect(result.current).toBe('b')
  })

  it('should only keep the last value on rapid updates', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value, 300), {
      initialProps: { value: 'a' },
    })
    rerender({ value: 'b' })
    act(() => vi.advanceTimersByTime(100))
    rerender({ value: 'c' })
    act(() => vi.advanceTimersByTime(100))
    rerender({ value: 'd' })
    act(() => vi.advanceTimersByTime(300))
    expect(result.current).toBe('d')
  })

  it('should use 500ms as the default delay', () => {
    const { result, rerender } = renderHook(({ value }) => useDebounce(value), {
      initialProps: { value: 'a' },
    })
    rerender({ value: 'b' })
    act(() => vi.advanceTimersByTime(499))
    expect(result.current).toBe('a')
    act(() => vi.advanceTimersByTime(1))
    expect(result.current).toBe('b')
  })

  it('should cleanup timer on unmount', () => {
    const { result, rerender, unmount } = renderHook(({ value }) => useDebounce(value, 500), {
      initialProps: { value: 'a' },
    })
    rerender({ value: 'b' })
    unmount()
    act(() => vi.advanceTimersByTime(500))
    expect(result.current).toBe('a')
  })
})
