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
 * ```
 */
export function useMount(fn: () => void): void {
  // TODO: refactor — pass an inline function instead of opaque dependency
  // eslint-disable-next-line react/exhaustive-deps
  useEffect(fn, [])
}
