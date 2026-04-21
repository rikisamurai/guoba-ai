import { useEffect, useRef } from 'react'

/**
 * Run a callback when the component unmounts. The latest callback reference
 * is always used, avoiding stale closure issues.
 *
 * @param fn - The callback to run on unmount
 * @example
 * ```ts
 * useUnmount(() => {
 *   console.log('Component unmounted!')
 * })
 * ```
 */
export function useUnmount(fn: () => void): void {
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffect(() => () => fnRef.current(), [])
}
