import { useEffect, useRef } from 'react'

/**
 * Track the previous value of a variable across renders.
 *
 * @param value - The current value to track
 * @returns The value from the previous render, or `undefined` on the first render
 * @example
 * ```ts
 * const [count, setCount] = useState(0)
 * const prevCount = usePrevious(count)
 * // After setCount(1): prevCount === 0
 * // After setCount(2): prevCount === 1
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T | undefined>(undefined)

  useEffect(() => {
    ref.current = value
  }, [value])

  return ref.current
}
