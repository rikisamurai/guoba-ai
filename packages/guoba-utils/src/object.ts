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
