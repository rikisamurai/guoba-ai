import type { Arrayable, NestedArray } from './types'

/**
 * Wrap a value as an array. If the value is already an array, return it as-is.
 *
 * @param value - The value to wrap
 * @returns The value wrapped in an array, or the original array
 * @example
 * ```ts
 * toArray(1) // [1]
 * toArray([1, 2]) // [1, 2]
 * ```
 */
export function toArray<T>(value: Arrayable<T>): T[] {
  return Array.isArray(value) ? value : [value]
}

/**
 * Remove duplicate elements from an array.
 *
 * @param array - The input array
 * @returns A new array with duplicates removed, preserving order
 * @example
 * ```ts
 * uniq([1, 2, 2, 3]) // [1, 2, 3]
 * ```
 */
export function uniq<T>(array: T[]): T[] {
  return [...new Set(array)]
}

/**
 * Deeply flatten a nested array.
 *
 * @param array - The nested array to flatten
 * @returns A new flat array
 * @example
 * ```ts
 * flattenDeep([1, [2, [3, [4]]]]) // [1, 2, 3, 4]
 * ```
 */
export function flattenDeep<T>(array: NestedArray<T>): T[] {
  const result: T[] = []
  for (const item of array) {
    if (Array.isArray(item))
      result.push(...flattenDeep(item as NestedArray<T>))
    else
      result.push(item)
  }
  return result
}

/**
 * Split an array into chunks of the given size.
 *
 * @param array - The array to split
 * @param size - The size of each chunk
 * @returns An array of chunks
 * @example
 * ```ts
 * chunk([1, 2, 3, 4, 5], 2) // [[1, 2], [3, 4], [5]]
 * ```
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const result: T[][] = []
  for (let i = 0; i < array.length; i += size)
    result.push(array.slice(i, i + size))
  return result
}

/**
 * Randomly shuffle an array. Returns a new array.
 *
 * @param array - The array to shuffle
 * @returns A new shuffled array
 * @example
 * ```ts
 * shuffle([1, 2, 3, 4, 5]) // [3, 1, 5, 2, 4] (random order)
 * ```
 */
export function shuffle<T>(array: T[]): T[] {
  const result = [...array]
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [result[i], result[j]] = [result[j]!, result[i]!]
  }
  return result
}

/**
 * Get the last element of an array.
 *
 * @param array - The input array
 * @returns The last element, or `undefined` if empty
 * @example
 * ```ts
 * last([1, 2, 3]) // 3
 * last([]) // undefined
 * ```
 */
export function last<T>(array: T[]): T | undefined {
  return array.at(-1)
}

/**
 * Remove elements from an array in-place that match the predicate.
 *
 * @param array - The array to modify
 * @param predicate - Function that returns `true` for elements to remove
 * @returns An array of removed elements
 * @example
 * ```ts
 * const arr = [1, 2, 3, 4, 5]
 * remove(arr, v => v % 2 === 0) // [2, 4]
 * // arr is now [1, 3, 5]
 * ```
 */
export function remove<T>(array: T[], predicate: (v: T) => boolean): T[] {
  const removed: T[] = []
  for (let i = array.length - 1; i >= 0; i--) {
    if (predicate(array[i]!)) {
      removed.unshift(array.splice(i, 1)[0]!)
    }
  }
  return removed
}
