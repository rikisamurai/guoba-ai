import { useEffect, useRef, useState } from 'react'

/**
 * Throttle a value. The returned value updates at most once per interval.
 *
 * @param value - The value to throttle
 * @param interval - Minimum time between updates in milliseconds (defaults to `500`)
 * @returns The throttled value
 * @example
 * ```ts
 * const [position, setPosition] = useState({ x: 0, y: 0 })
 * const throttledPosition = useThrottle(position, 100)
 * // throttledPosition updates at most once every 100ms
 * ```
 */
export function useThrottle<T>(value: T, interval = 500): T {
  const [throttledValue, setThrottledValue] = useState(value)
  const lastUpdated = useRef(Date.now())

  useEffect(() => {
    const now = Date.now()
    const elapsed = now - lastUpdated.current

    if (elapsed >= interval) {
      lastUpdated.current = now
      setThrottledValue(value)
    }
    else {
      const timer = setTimeout(() => {
        lastUpdated.current = Date.now()
        setThrottledValue(value)
      }, interval - elapsed)
      return () => clearTimeout(timer)
    }
  }, [value, interval])

  return throttledValue
}
