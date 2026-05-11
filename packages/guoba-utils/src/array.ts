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
    if (Array.isArray(item)) result.push(...flattenDeep(item as NestedArray<T>))
    else result.push(item)
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
  for (let i = 0; i < array.length; i += size) result.push(array.slice(i, i + size))
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
    const j = Math.floor(Math.random() * (i + 1))
    ;[result[i], result[j]] = [result[j]!, result[i]!]
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

/**
 * Group array elements by a key derived from each item.
 *
 * @param array - The array to group
 * @param fn - Function that returns a key for each item
 * @returns An object mapping keys to arrays of matching items
 * @example
 * ```ts
 * group([1, 2, 3, 4], v => (v % 2 === 0 ? 'even' : 'odd'))
 * // { odd: [1, 3], even: [2, 4] }
 * ```
 */
export function group<T>(
  array: T[],
  fn: (item: T) => string | number | symbol,
): Partial<Record<string | number | symbol, T[]>> {
  const result: Partial<Record<string | number | symbol, T[]>> = {}
  for (const item of array) {
    const key = fn(item)
    if (!result[key]) result[key] = []
    result[key]!.push(item)
  }
  return result
}

/**
 * Sort an array by a derived numeric value. Returns a new array.
 *
 * @param array - The array to sort
 * @param fn - Function that maps each item to a number for comparison
 * @param desc - If `true`, sort in descending order
 * @returns A new sorted array
 * @example
 * ```ts
 * sort([3, 1, 2], v => v) // [1, 2, 3]
 * sort([3, 1, 2], v => v, true) // [3, 2, 1]
 * ```
 */
export function sort<T>(array: T[], fn: (item: T) => number, desc?: boolean): T[] {
  const result = [...array]
  result.sort((a, b) => {
    const diff = fn(a) - fn(b)
    return desc ? -diff : diff
  })
  return result
}

/**
 * Filter and map an array in one pass.
 *
 * @param array - The array to process
 * @param mapper - Function to transform matching items
 * @param filter - Predicate that decides which items to include
 * @returns A new array of transformed items that passed the filter
 * @example
 * ```ts
 * select(
 *   [1, 2, 3, 4],
 *   v => v * 2,
 *   v => v % 2 === 0
 * )
 * // [4, 8]
 * ```
 */
export function select<T, U>(
  array: T[],
  mapper: (item: T, index: number) => U,
  filter: (item: T, index: number) => boolean,
): U[] {
  const result: U[] = []
  for (let i = 0; i < array.length; i++) {
    const item = array[i]!
    if (filter(item, i)) result.push(mapper(item, i))
  }
  return result
}

/**
 * Remove all falsy values from an array.
 *
 * @param array - The array that may contain falsy values
 * @returns A new array with all falsy values removed
 * @example
 * ```ts
 * sift([1, null, 2, undefined, 3, false, 0, '']) // [1, 2, 3]
 * ```
 */
export function sift<T>(array: (T | null | undefined | false | '' | 0)[]): T[] {
  return array.filter((v): v is T => Boolean(v))
}

/**
 * Split an array into two arrays based on a predicate.
 *
 * @param array - The array to split
 * @param fn - Predicate function
 * @returns A tuple of `[pass, fail]` arrays
 * @example
 * ```ts
 * fork([1, 2, 3, 4], v => v % 2 === 0) // [[2, 4], [1, 3]]
 * ```
 */
export function fork<T>(array: T[], fn: (item: T) => boolean): [T[], T[]] {
  const pass: T[] = []
  const fail: T[] = []
  for (const item of array) {
    if (fn(item)) pass.push(item)
    else fail.push(item)
  }
  return [pass, fail]
}

/**
 * Count occurrences of each key derived from array items.
 *
 * @param array - The array to count
 * @param fn - Function that returns a key for each item
 * @returns An object mapping keys to their occurrence count
 * @example
 * ```ts
 * counting(['a', 'b', 'a', 'c', 'b', 'a'], v => v)
 * // { a: 3, b: 2, c: 1 }
 * ```
 */
export function counting<T>(array: T[], fn: (item: T) => string): Record<string, number> {
  const result: Record<string, number> = {}
  for (const item of array) {
    const key = fn(item)
    result[key] = (result[key] ?? 0) + 1
  }
  return result
}

/**
 * Convert an array to an object by mapping each item to a key-value pair.
 *
 * @param array - The array to convert
 * @param keyFn - Function that returns the key for each item
 * @returns An object built from the key-value pairs
 * @example
 * ```ts
 * objectify([{ id: 1, name: 'Alice' }], v => v.id, v => v.name)
 * // { 1: 'Alice' }
 * ```
 */
export function objectify<T, K extends string | number | symbol>(
  array: T[],
  keyFn: (item: T) => K,
): Record<K, T>
export function objectify<T, K extends string | number | symbol, V>(
  array: T[],
  keyFn: (item: T) => K,
  valueFn: (item: T) => V,
): Record<K, V>
export function objectify<T, K extends string | number | symbol, V>(
  array: T[],
  keyFn: (item: T) => K,
  valueFn?: (item: T) => V,
): Record<K, T | V> {
  const result = {} as Record<K, T | V>
  for (const item of array) result[keyFn(item)] = valueFn ? valueFn(item) : item
  return result
}

/**
 * Return items in the first array that are not in the second array.
 *
 * @param a - The source array
 * @param b - The array of items to exclude
 * @param fn - Optional function to map items before comparison
 * @returns A new array of items in `a` but not in `b`
 * @example
 * ```ts
 * diff([1, 2, 3, 4], [2, 4]) // [1, 3]
 * ```
 */
export function diff<T>(a: T[], b: T[], fn?: (item: T) => unknown): T[] {
  const lookup = _buildLookup(b, fn)
  return a.filter(item => !lookup(item))
}

/**
 * Check if two arrays share any common elements.
 *
 * @param a - The first array
 * @param b - The second array
 * @param fn - Optional function to map items before comparison
 * @returns `true` if the arrays have at least one common element
 * @example
 * ```ts
 * intersects([1, 2], [2, 3]) // true
 * intersects([1, 2], [3, 4]) // false
 * ```
 */
export function intersects<T>(a: T[], b: T[], fn?: (item: T) => unknown): boolean {
  const lookup = _buildLookup(b, fn)
  return a.some(item => lookup(item))
}

function _buildLookup<T>(b: T[], fn?: (item: T) => unknown): (item: T) => boolean {
  if (fn) {
    const bSet = new Set(b.map(fn))
    return item => bSet.has(fn(item))
  }
  const bSet = new Set(b)
  return item => bSet.has(item)
}

/**
 * Combine multiple arrays element-wise into an array of tuples.
 * The resulting length equals the shortest input array.
 *
 * @param a - The first array
 * @param b - The second array
 * @returns An array of tuples combining elements at each index
 * @example
 * ```ts
 * zip([1, 2], ['a', 'b']) // [[1, 'a'], [2, 'b']]
 * zip([1, 2, 3], ['a', 'b']) // [[1, 'a'], [2, 'b']]
 * ```
 */
export function zip<A, B>(a: A[], b: B[]): [A, B][]
export function zip<A, B, C>(a: A[], b: B[], c: C[]): [A, B, C][]
export function zip(...arrays: unknown[][]): unknown[][]
export function zip(...arrays: unknown[][]): unknown[][] {
  if (arrays.length === 0) return []
  const minLen = Math.min(...arrays.map(a => a.length))
  const result: unknown[][] = []
  for (let i = 0; i < minLen; i++) result.push(arrays.map(a => a[i]))
  return result
}
