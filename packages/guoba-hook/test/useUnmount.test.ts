import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useUnmount } from '../src'

describe('useUnmount', () => {
  it('should not call the callback on mount', () => {
    const fn = vi.fn()
    renderHook(() => useUnmount(fn))
    expect(fn).not.toHaveBeenCalled()
  })

  it('should call the callback on unmount', () => {
    const fn = vi.fn()
    const { unmount } = renderHook(() => useUnmount(fn))
    unmount()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should not call the callback on re-render', () => {
    const fn = vi.fn()
    const { rerender } = renderHook(() => useUnmount(fn))
    rerender()
    rerender()
    expect(fn).not.toHaveBeenCalled()
  })

  it('should use the latest callback reference', () => {
    const fn1 = vi.fn()
    const fn2 = vi.fn()
    const { rerender, unmount } = renderHook(
      ({ fn }) => useUnmount(fn),
      { initialProps: { fn: fn1 } },
    )
    rerender({ fn: fn2 })
    unmount()
    expect(fn1).not.toHaveBeenCalled()
    expect(fn2).toHaveBeenCalledTimes(1)
  })
})
