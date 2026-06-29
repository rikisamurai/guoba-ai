import { useEffect } from 'react'

/**
 * Run a callback once when the component mounts.
 *
 * @param fn - The callback to run on mount
 * @example
 * ```ts
 * useMount(() => {
 *   console.log('Component mounted!')
 * })
 *
 * function Page() {
 *   useMount(() => analytics.track('page_view'))
 *   return null
 * }
 *
 * const fn = vi.fn()
 * renderHook(() => useMount(fn)).rerender()
 * // fn was called once
 * ```
 *
 * @warning The callback runs only on mount. Re-renders do not call it again.
 */
export function useMount(fn: () => void): void {
  // TODO: refactor — pass an inline function instead of opaque dependency
  // oxlint-disable-next-line react/exhaustive-deps
  useEffect(fn, [])
}
