/**
 * Wait for the given number of milliseconds.
 *
 * @param ms - The number of milliseconds to wait
 * @returns A promise that resolves after `ms` milliseconds
 * @example
 * ```ts
 * await sleep(100) // resolves after ~100ms
 * ```
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
