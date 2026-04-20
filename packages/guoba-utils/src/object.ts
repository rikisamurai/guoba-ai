import type { DeepPartial } from './types'
import { isObject } from './guard'

/**
 * Type-safe `Object.keys`.
 *
 * @param obj - The object to get keys from
 * @returns An array of the object's own enumerable keys
 * @example
 * ```ts
 * objectKeys({ a: 1, b: 2 }) // ['a', 'b'] typed as ('a' | 'b')[]
 * ```
 */
export function objectKeys<T extends object>(obj: T): (keyof T)[] {
  return Object.keys(obj) as (keyof T)[]
}

/**
 * Type-safe `Object.entries`.
 *
 * @param obj - The object to get entries from
 * @returns An array of [key, value] pairs
 * @example
 * ```ts
 * objectEntries({ a: 1, b: 2 }) // [['a', 1], ['b', 2]]
 * ```
 */
export function objectEntries<T extends object>(obj: T): [keyof T, T[keyof T]][] {
  return Object.entries(obj) as [keyof T, T[keyof T]][]
}

/**
 * Deep clone a value using `structuredClone`.
 *
 * @param obj - The value to clone
 * @returns A deep copy of the value
 * @example
 * ```ts
 * const original = { a: { b: 1 } }
 * const copy = deepClone(original)
 * copy.a.b = 2
 * original.a.b // still 1
 * ```
 */
export function deepClone<T>(obj: T): T {
  return structuredClone(obj)
}

/**
 * Create a new object with specified keys omitted.
 *
 * @param obj - The source object
 * @param keys - Keys to omit
 * @returns A new object without the specified keys
 * @example
 * ```ts
 * omit({ a: 1, b: 2, c: 3 }, ['b', 'c']) // { a: 1 }
 * ```
 */
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj }
  for (const key of keys)
    delete result[key]
  return result as Omit<T, K>
}

/**
 * Create a new object with only the specified keys.
 *
 * @param obj - The source object
 * @param keys - Keys to pick
 * @returns A new object with only the specified keys
 * @example
 * ```ts
 * pick({ a: 1, b: 2, c: 3 }, ['a', 'c']) // { a: 1, c: 3 }
 * ```
 */
export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  for (const key of keys)
    result[key] = obj[key]
  return result
}

/**
 * Create a new object with matching values removed.
 * Removes `undefined` values by default. An optional filter can remove values
 * by custom evaluation. Non-enumerable keys are never removed or copied.
 *
 * @param obj - The source object
 * @returns A new object without `undefined` values
 * @example
 * ```ts
 * shake({ a: 1, b: undefined, c: null }) // { a: 1, c: null }
 * ```
 */
export function shake<T extends object>(obj: T): {
  [K in keyof T]: Exclude<T[K], undefined>
}

/**
 * Create a new object with values removed by a custom filter.
 *
 * @param obj - The source object
 * @param filter - Function returning `true` for values to remove
 * @returns A new object without values matched by the filter
 * @example
 * ```ts
 * shake({ a: 1, b: 2 }, value => value === 2) // { a: 1 }
 * ```
 */
export function shake<T extends object>(
  obj: T,
  filter: ((value: unknown) => boolean) | undefined,
): T

export function shake<T extends object>(
  obj: T,
  filter: (value: unknown) => boolean = value => value === undefined,
): T {
  if (!obj)
    return {} as T

  return (Object.keys(obj) as (keyof T)[]).reduce((result, key) => {
    if (!filter(obj[key]))
      result[key] = obj[key]

    return result
  }, {} as T)
}

/**
 * Deep merge objects. Arrays are replaced, not merged.
 * Does not mutate the target — returns a new object.
 *
 * @param target - The target object
 * @param sources - Source objects to merge into target
 * @returns A new deeply merged object
 * @example
 * ```ts
 * deepMerge({ a: 1, b: { c: 2 } }, { b: { d: 3 } })
 * // { a: 1, b: { c: 2, d: 3 } }
 * ```
 */
export function deepMerge<T extends object>(target: T, ...sources: DeepPartial<T>[]): T {
  const result = structuredClone(target)

  for (const source of sources) {
    for (const key of Object.keys(source) as (keyof T)[]) {
      const sourceVal = source[key as keyof typeof source]
      const targetVal = result[key]

      if (isObject(sourceVal) && isObject(targetVal)) {
        ;(result as any)[key] = deepMerge(targetVal, sourceVal as any)
      }
      else {
        ;(result as any)[key] = sourceVal
      }
    }
  }

  return result
}

/**
 * Swap the keys and values of an object.
 *
 * @param obj - The object to invert
 * @returns A new object with keys and values swapped
 * @example
 * ```ts
 * invert({ a: '1', b: '2' }) // { '1': 'a', '2': 'b' }
 * ```
 */
export function invert<T extends Record<string, string | number | symbol>>(
  obj: T,
): Record<string, string> {
  const result: Record<string, string> = {}
  for (const key of Object.keys(obj))
    result[String(obj[key])] = key
  return result
}

/**
 * Transform the keys of an object using a mapping function.
 *
 * @param obj - The source object
 * @param fn - Function that receives each key and value, returns the new key
 * @returns A new object with transformed keys
 * @example
 * ```ts
 * mapKeys({ a: 1, b: 2 }, key => key.toUpperCase()) // { A: 1, B: 2 }
 * ```
 */
export function mapKeys<T extends object, K extends string>(
  obj: T,
  fn: (key: keyof T, value: T[keyof T]) => K,
): Record<K, T[keyof T]> {
  const result = {} as Record<K, T[keyof T]>
  for (const key of objectKeys(obj))
    result[fn(key, obj[key])] = obj[key]
  return result
}

/**
 * Transform the values of an object using a mapping function.
 *
 * @param obj - The source object
 * @param fn - Function that receives each value and key, returns the new value
 * @returns A new object with transformed values
 * @example
 * ```ts
 * mapValues({ a: 1, b: 2 }, value => value * 10) // { a: 10, b: 20 }
 * ```
 */
export function mapValues<T extends object, U>(
  obj: T,
  fn: (value: T[keyof T], key: keyof T) => U,
): Record<keyof T extends string ? keyof T : string, U> {
  const result = {} as Record<keyof T extends string ? keyof T : string, U>
  for (const key of objectKeys(obj))
    (result as any)[key] = fn(obj[key], key)
  return result
}

/**
 * Transform both keys and values of an object using a mapping function.
 *
 * @param obj - The source object
 * @param fn - Function that receives each key and value, returns a [newKey, newValue] tuple
 * @returns A new object with transformed keys and values
 * @example
 * ```ts
 * mapEntries({ a: 1, b: 2 }, (key, value) => [key.toUpperCase(), value * 10])
 * // { A: 10, B: 20 }
 * ```
 */
export function mapEntries<T extends object, K extends string, V>(
  obj: T,
  fn: (key: keyof T, value: T[keyof T]) => [K, V],
): Record<K, V> {
  const result = {} as Record<K, V>
  for (const key of objectKeys(obj)) {
    const [newKey, newValue] = fn(key, obj[key])
    result[newKey] = newValue
  }
  return result
}

/**
 * Convert an object to an array by mapping each key-value pair.
 *
 * @param obj - The source object
 * @param fn - Function that receives each key and value, returns the array element
 * @returns An array of mapped values
 * @example
 * ```ts
 * listify({ a: 1, b: 2 }, (key, value) => `${key}=${value}`)
 * // ['a=1', 'b=2']
 * ```
 */
export function listify<T extends object, U>(
  obj: T,
  fn: (key: keyof T, value: T[keyof T]) => U,
): U[] {
  const result: U[] = []
  for (const key of objectKeys(obj))
    result.push(fn(key, obj[key]))
  return result
}

/**
 * Access a nested property by dot path.
 *
 * @param obj - The object to access
 * @param path - Dot-separated path string (e.g. `'a.b.c'`)
 * @param defaultValue - Value to return if the path does not resolve
 * @returns The value at the path, or `defaultValue` if not found
 * @example
 * ```ts
 * get({ a: { b: { c: 42 } } }, 'a.b.c') // 42
 * get({ a: 1 }, 'b.c', 'default') // 'default'
 * ```
 */
export function get<T = unknown>(obj: unknown, path: string, defaultValue?: T): T {
  const segments = path.split('.')
  let current: any = obj
  for (const segment of segments) {
    if (current === null || current === undefined)
      return defaultValue as T
    current = current[segment]
  }
  return (current === undefined ? defaultValue : current) as T
}

/**
 * Set a value at a deep path, creating intermediate objects or arrays as needed.
 * Mutates and returns the original object. If a path segment is a numeric string,
 * an array is created for that level.
 *
 * @param obj - The target object
 * @param path - Dot-separated path string (e.g. `'a.b.c'`)
 * @param value - The value to set
 * @returns The original object (mutated)
 * @example
 * ```ts
 * set({}, 'a.b.c', 42) // { a: { b: { c: 42 } } }
 * set({}, 'a.0.b', 1) // { a: [{ b: 1 }] }
 * ```
 */
export function set<T extends object>(obj: T, path: string, value: unknown): T {
  const segments = path.split('.')
  let current: any = obj
  for (let i = 0; i < segments.length - 1; i++) {
    const segment = segments[i]!
    const nextSegment = segments[i + 1]!
    current[segment] ??= /^\d+$/.test(nextSegment) ? [] : {}
    current = current[segment]
  }
  current[segments[segments.length - 1]!] = value
  return obj
}

/**
 * Flatten a deeply nested object into a single-level object with dot-path keys.
 * Arrays are treated as leaf values and are not flattened.
 *
 * @param obj - The object to flatten
 * @returns A flat object with dot-path keys
 * @example
 * ```ts
 * crush({ a: { b: 1, c: { d: 2 } } })
 * // { 'a.b': 1, 'a.c.d': 2 }
 * ```
 */
export function crush<T extends object>(obj: T): Record<string, unknown> {
  const result: Record<string, unknown> = {}

  function flatten(current: unknown, prefix: string): void {
    if (isObject(current)) {
      for (const key of Object.keys(current)) {
        const newPrefix = prefix ? `${prefix}.${key}` : key
        flatten(current[key], newPrefix)
      }
    }
    else {
      result[prefix] = current
    }
  }

  flatten(obj, '')
  return result
}

/**
 * Build a nested object from a flat object with dot-path keys (reverse of {@link crush}).
 *
 * @param obj - A flat object with dot-path keys
 * @returns A deeply nested object
 * @example
 * ```ts
 * construct({ 'a.b': 1, 'a.c.d': 2 })
 * // { a: { b: 1, c: { d: 2 } } }
 * ```
 */
export function construct<T extends object>(obj: Record<string, unknown>): T {
  const result = {} as Record<string, unknown>
  for (const key of Object.keys(obj))
    set(result, key, obj[key])
  return result as T
}
