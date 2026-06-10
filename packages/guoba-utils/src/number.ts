/**
 * Clamp a number between a minimum and maximum value.
 *
 * @param value - The number to clamp
 * @param min - The lower bound
 * @param max - The upper bound
 * @returns `value` when it is within bounds, otherwise the nearest bound
 * @example
 * ```ts
 * clamp(5, 0, 10) // 5
 * clamp(-1, 0, 10) // 0
 * clamp(11, 0, 10) // 10
 * ```
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max)
}

/**
 * Create a half-open number range from `start` up to, but not including, `end`.
 *
 * @param start - The first number in the range
 * @param end - The exclusive end of the range
 * @param step - The amount to increment by. Use a negative value for descending ranges
 * @returns An array of numbers from `start` toward `end`
 * @example
 * ```ts
 * range(0, 4) // [0, 1, 2, 3]
 * range(0, 6, 2) // [0, 2, 4]
 * range(4, 0, -1) // [4, 3, 2, 1]
 * ```
 */
export function range(start: number, end: number, step = 1): number[] {
  if (step === 0) throw new RangeError('step cannot be 0')

  const result: number[] = []

  if (step > 0) {
    for (let value = start; value < end; value += step) result.push(value)
  } else {
    for (let value = start; value > end; value += step) result.push(value)
  }

  return result
}
