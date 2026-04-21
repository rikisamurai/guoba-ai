import { describe, expect, it } from 'vitest'
import { act, renderHook } from '@testing-library/react'
import { useToggle } from '../src'

describe('useToggle', () => {
  it('should default to false', () => {
    const { result } = renderHook(() => useToggle())
    expect(result.current[0]).toBe(false)
  })

  it('should accept an initial value', () => {
    const { result } = renderHook(() => useToggle(true))
    expect(result.current[0]).toBe(true)
  })

  it('should toggle the value', () => {
    const { result } = renderHook(() => useToggle())
    act(() => result.current[1]())
    expect(result.current[0]).toBe(true)
    act(() => result.current[1]())
    expect(result.current[0]).toBe(false)
  })

  it('should set a specific value', () => {
    const { result } = renderHook(() => useToggle())
    act(() => result.current[1](true))
    expect(result.current[0]).toBe(true)
    act(() => result.current[1](true))
    expect(result.current[0]).toBe(true)
    act(() => result.current[1](false))
    expect(result.current[0]).toBe(false)
  })
})
