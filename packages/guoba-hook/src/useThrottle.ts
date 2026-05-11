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
  // TODO: rename to lastUpdatedRef and move Date.now() into a useState initializer
  const lastUpdated = useRef(Date.now())
  // TODO: rename to isFirstEffectRef
  const isFirstEffect = useRef(true)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const clearTimer = (): void => {
      if (timerRef.current !== null) {
        clearTimeout(timerRef.current)
        timerRef.current = null
      }
    }

    // Initial value is already published by useState; scheduling a trailing update here would only refresh lastUpdated.
    if (isFirstEffect.current) {
      isFirstEffect.current = false
      return clearTimer
    }

    const updateValue = (): void => {
      lastUpdated.current = Date.now()
      // TODO: refactor throttle to avoid synchronous setState in effect
      setThrottledValue(value)
    }

    const now = Date.now()
    const elapsed = now - lastUpdated.current

    if (elapsed >= interval) {
      updateValue()
    } else {
      timerRef.current = setTimeout(() => {
        updateValue()
        timerRef.current = null
      }, interval - elapsed)
    }

    return clearTimer
  }, [value, interval])

  return throttledValue
}
