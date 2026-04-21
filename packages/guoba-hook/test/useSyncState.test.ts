import { act, renderHook } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { useSyncState } from '../src'

describe('useSyncState', () => {
  it('should initialize state with the prop value', () => {
    const { result } = renderHook(() => useSyncState('hello'))
    expect(result.current[0]).toBe('hello')
  })

  it('should sync state when prop changes', () => {
    const { result, rerender } = renderHook(
      ({ prop }) => useSyncState(prop),
      { initialProps: { prop: 'a' } },
    )
    expect(result.current[0]).toBe('a')
    rerender({ prop: 'b' })
    expect(result.current[0]).toBe('b')
  })

  it('should allow local setState independent of prop', () => {
    const { result } = renderHook(() => useSyncState('initial'))
    act(() => result.current[1]('local'))
    expect(result.current[0]).toBe('local')
  })

  it('should override local state when prop changes', () => {
    const { result, rerender } = renderHook(
      ({ prop }) => useSyncState(prop),
      { initialProps: { prop: 'a' } },
    )
    act(() => result.current[1]('local'))
    expect(result.current[0]).toBe('local')
    rerender({ prop: 'b' })
    expect(result.current[0]).toBe('b')
  })

  it('should not reset state when prop stays the same', () => {
    const { result, rerender } = renderHook(
      ({ prop }) => useSyncState(prop),
      { initialProps: { prop: 'a' } },
    )
    act(() => result.current[1]('local'))
    expect(result.current[0]).toBe('local')
    rerender({ prop: 'a' })
    expect(result.current[0]).toBe('local')
  })

  it('should work with numbers', () => {
    const { result, rerender } = renderHook(
      ({ prop }) => useSyncState(prop),
      { initialProps: { prop: 1 } },
    )
    expect(result.current[0]).toBe(1)
    rerender({ prop: 2 })
    expect(result.current[0]).toBe(2)
  })

  it('should use custom comparator', () => {
    const comparator = (pre: { id: number }, cur: { id: number }) => pre.id === cur.id
    const obj1 = { id: 1, name: 'Alice' }
    const obj2 = { id: 1, name: 'Bob' }
    const obj3 = { id: 2, name: 'Charlie' }

    const { result, rerender } = renderHook(
      ({ prop }) => useSyncState(prop, comparator),
      { initialProps: { prop: obj1 } },
    )
    expect(result.current[0]).toBe(obj1)

    // same id → comparator returns true → state should NOT sync
    rerender({ prop: obj2 })
    expect(result.current[0]).toBe(obj1)

    // different id → comparator returns false → state syncs
    rerender({ prop: obj3 })
    expect(result.current[0]).toBe(obj3)
  })

  it('should support functional setState', () => {
    const { result } = renderHook(() => useSyncState(0))
    act(() => result.current[1](prev => prev + 1))
    expect(result.current[0]).toBe(1)
    act(() => result.current[1](prev => prev + 5))
    expect(result.current[0]).toBe(6)
  })
})
