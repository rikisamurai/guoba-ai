import { describe, expect, it, vi } from 'vitest'
import { renderHook } from '@testing-library/react'
import { useMount } from '../src'

describe('useMount', () => {
  it('should call the callback on mount', () => {
    const fn = vi.fn()
    renderHook(() => useMount(fn))
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should not call the callback on re-render', () => {
    const fn = vi.fn()
    const { rerender } = renderHook(() => useMount(fn))
    rerender()
    rerender()
    expect(fn).toHaveBeenCalledTimes(1)
  })

  it('should not call the callback after unmount', () => {
    const fn = vi.fn()
    const { unmount } = renderHook(() => useMount(fn))
    unmount()
    expect(fn).toHaveBeenCalledTimes(1)
  })
})
