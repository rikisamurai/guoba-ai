/**
 * Wait for the given number of milliseconds.
 *
 * @param ms - The number of milliseconds to wait
 * @returns A promise that resolves after `ms` milliseconds
 * @example
 * ```ts
 * await sleep(100) // resolves after ~100ms
 *
 * await sleep(0) // yields to a later timer tick
 *
 * await Promise.all([sleep(50), fetchData()])
 * ```
 *
 * @warning Timer resolution depends on the JavaScript runtime and event loop load, so the delay is not exact.
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}
