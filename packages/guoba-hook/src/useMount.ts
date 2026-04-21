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
  useEffect(fn, [])
}
