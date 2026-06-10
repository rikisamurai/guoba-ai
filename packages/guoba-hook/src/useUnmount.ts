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
 *
 * function Subscription({ unsubscribe }: { unsubscribe: () => void }) {
 *   useUnmount(unsubscribe)
 *   return null
 * }
 *
 * const { rerender, unmount } = renderHook(({ fn }) => useUnmount(fn), {
 *   initialProps: { fn: firstCleanup },
 * })
 * rerender({ fn: latestCleanup })
 * unmount()
 * // latestCleanup runs
 * ```
 *
 * @warning The callback is not called on mount or re-render; it runs when the component unmounts.
 */
export function useUnmount(fn: () => void): void {
  const fnRef = useRef(fn)
  fnRef.current = fn

  useEffect(() => () => fnRef.current(), [])
}
