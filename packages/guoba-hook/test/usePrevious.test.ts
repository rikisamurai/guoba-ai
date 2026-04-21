import { describe, expect, it } from 'vitest'
import { renderHook } from '@testing-library/react'
import { usePrevious } from '../src'

describe('usePrevious', () => {
  it('should return undefined on initial render', () => {
    const { result } = renderHook(() => usePrevious('hello'))
    expect(result.current).toBeUndefined()
  })

  it('should return the previous value after update', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 'a' } },
    )
    expect(result.current).toBeUndefined()
    rerender({ value: 'b' })
    expect(result.current).toBe('a')
    rerender({ value: 'c' })
    expect(result.current).toBe('b')
  })

  it('should work with numbers', () => {
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: 1 } },
    )
    rerender({ value: 2 })
    expect(result.current).toBe(1)
    rerender({ value: 3 })
    expect(result.current).toBe(2)
  })

  it('should work with objects', () => {
    const obj1 = { name: 'Alice' }
    const obj2 = { name: 'Bob' }
    const { result, rerender } = renderHook(
      ({ value }) => usePrevious(value),
      { initialProps: { value: obj1 } },
    )
    rerender({ value: obj2 })
    expect(result.current).toBe(obj1)
  })
})
