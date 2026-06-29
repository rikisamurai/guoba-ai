import { useEffect, useState } from 'react'

/**
 * Debounce a value. The returned value only updates after the specified delay
 * has passed without any new changes.
 *
 * @param value - The value to debounce
 * @param delay - Delay in milliseconds (defaults to `500`)
 * @returns The debounced value
 * @example
 * ```tsx
 * const [text, setText] = useState('')
 * const debouncedText = useDebounce(text, 300)
 * // debouncedText updates 300ms after the last setText call
 *
 * const debouncedValue = useDebounce(value)
 * // Uses the default 500ms delay
 *
 * function SearchBox({ search }: { search: (query: string) => void }) {
 *   const [query, setQuery] = useState('')
 *   const debouncedQuery = useDebounce(query, 300)
 *   useEffect(() => search(debouncedQuery), [debouncedQuery, search])
 *   return <input value={query} onChange={event => setQuery(event.target.value)} />
 * }
 * ```
 *
 * @warning The initial value is returned immediately. Later changes are delayed, and pending updates are cleared on unmount.
 */
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState(value)

  useEffect(() => {
    const timer = setTimeout(setDebouncedValue, delay, value)
    return () => clearTimeout(timer)
  }, [value, delay])

  return debouncedValue
}
