import { useEffect, useState } from 'react'

/**
 * Debounce a value. The returned value only updates after the specified delay
 * has passed without any new changes.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (defaults to `500`)
 * @returns The debounced value
 * @example
 * ```ts
 * const [text, setText] = useState('')
 * const debouncedText = useDebounce(text, 300)
 * // debouncedText updates 300ms after the last setText call
 * ```
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
