/**
 * A value that can be either a single item or an array of items.
 *
 * @example
 * ```ts
 * type Input = Arrayable<string> // string | string[]
 * ```
 */
export type Arrayable<T> = T | T[]

/**
 * A value that can be null.
 *
 * @example
 * ```ts
 * type MaybeNull = Nullable<string> // string | null
 * ```
 */
export type Nullable<T> = T | null

/**
 * A value that can be null or undefined.
 *
 * @example
 * ```ts
 * type MaybeNullish = Nullish<string> // string | null | undefined
 * ```
 */
export type Nullish<T> = T | null | undefined

/**
 * Recursively makes all properties optional.
 *
 * @example
 * ```ts
 * type Partial = DeepPartial<{ a: { b: number } }> // { a?: { b?: number } }
 * ```
 */
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

/**
 * A nested array type that can contain values or other nested arrays.
 *
 * @example
 * ```ts
 * const nested: NestedArray<number> = [1, [2, [3, 4]], 5]
 * ```
 */
export type NestedArray<T> = (T | NestedArray<T>)[]
