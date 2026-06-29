/**
 * Check if a value is a string.
 *
 * @param val - The value to check
 * @returns `true` if the value is a string
 * @example
 * ```ts
 * isString('hello') // true
 *
 * isString('') // true
 *
 * isString(123) // false
 * ```
 */
export function isString(val: unknown): val is string {
  return typeof val === 'string'
}

/**
 * Check if a value is a number.
 *
 * @param val - The value to check
 * @returns `true` if the value is a number
 * @example
 * ```ts
 * isNumber(42) // true
 *
 * isNumber(Number.NaN) // true
 *
 * isNumber('42') // false
 * ```
 *
 * @warning `NaN` is still a JavaScript number, so `isNumber(Number.NaN)` returns `true`.
 */
export function isNumber(val: unknown): val is number {
  return typeof val === 'number'
}

/**
 * Check if a value is a boolean.
 *
 * @param val - The value to check
 * @returns `true` if the value is a boolean
 * @example
 * ```ts
 * isBoolean(true) // true
 *
 * isBoolean(false) // true
 *
 * isBoolean(0) // false
 * ```
 */
export function isBoolean(val: unknown): val is boolean {
  return typeof val === 'boolean'
}

/**
 * Check if a value is an object (not an array or null).
 *
 * @param val - The value to check
 * @returns `true` if the value is an object that is not an array or null
 * @example
 * ```ts
 * isObject({ a: 1 }) // true
 *
 * isObject(new Date()) // true
 *
 * isObject([1, 2]) // false
 *
 * isObject(null) // false
 * ```
 *
 * @warning This includes values such as `Date` and `Map`; it is not a plain-object-only check.
 */
export function isObject(val: unknown): val is Record<string, any> {
  return val !== null && typeof val === 'object' && !Array.isArray(val)
}

/**
 * Check if a value is a function.
 *
 * @param val - The value to check
 * @returns `true` if the value is a function
 * @example
 * ```ts
 * isFunction(() => {}) // true
 *
 * isFunction(Math.round) // true
 *
 * isFunction({}) // false
 * ```
 */
export function isFunction(val: unknown): val is Function {
  return typeof val === 'function'
}

/**
 * Check if a value is defined (not undefined).
 *
 * @param val - The value to check
 * @returns `true` if the value is not undefined
 * @example
 * ```ts
 * isDef(0) // true
 *
 * isDef(null) // true
 *
 * isDef(undefined) // false
 * ```
 */
export function isDef<T>(val: T | undefined): val is T {
  return val !== undefined
}

/**
 * Check if a value is undefined.
 *
 * @param val - The value to check
 * @returns `true` if the value is undefined
 * @example
 * ```ts
 * isUndef(undefined) // true
 *
 * isUndef(null) // false
 *
 * isUndef(0) // false
 * ```
 */
export function isUndef(val: unknown): val is undefined {
  return val === undefined
}

/**
 * Check if a value is null.
 *
 * @param val - The value to check
 * @returns `true` if the value is null
 * @example
 * ```ts
 * isNull(null) // true
 *
 * isNull(undefined) // false
 *
 * isNull(0) // false
 * ```
 */
export function isNull(val: unknown): val is null {
  return val === null
}

/**
 * Check if a value is null or undefined.
 *
 * @param val - The value to check
 * @returns `true` if the value is null or undefined
 * @example
 * ```ts
 * isNullOrUndef(null) // true
 *
 * isNullOrUndef(undefined) // true
 *
 * isNullOrUndef(0) // false
 * ```
 */
export function isNullOrUndef(val: unknown): val is null | undefined {
  return val === null || val === undefined
}

/**
 * Check if a value is empty. Returns `true` for:
 * - `null` and `undefined`
 * - Empty strings (`''`)
 * - Empty arrays (`[]`)
 * - Empty objects (`{}`)
 *
 * @param val - The value to check
 * @returns `true` if the value is considered empty
 * @example
 * ```ts
 * isEmpty([]) // true
 *
 * isEmpty({}) // true
 *
 * isEmpty('') // true
 *
 * isEmpty(null) // true
 *
 * isEmpty(new Map([['key', 'value']])) // true
 *
 * isEmpty([1]) // false
 *
 * isEmpty(0) // false
 * ```
 *
 * @warning `Map`, `Set`, `Date`, and other objects without enumerable own keys are considered empty.
 */
export function isEmpty(val: unknown): boolean {
  if (val === null || val === undefined) return true
  if (typeof val === 'string') return val.length === 0
  if (Array.isArray(val)) return val.length === 0
  if (typeof val === 'object') return Object.keys(val).length === 0
  return false
}

/**
 * Check if a value is not empty according to {@link isEmpty}.
 *
 * @param val - The value to check
 * @returns `true` if the value is not considered empty
 * @example
 * ```ts
 * isNotEmpty([1]) // true
 * isNotEmpty([]) // false
 * isNotEmpty(null) // false
 * ```
 */
export function isNotEmpty(val: unknown): boolean {
  return !isEmpty(val)
}

/**
 * Check if a value is null, undefined, or empty.
 * This uses the same empty-value rules as {@link isEmpty}.
 *
 * @param val - The value to check
 * @returns `true` if the value is null, undefined, or empty
 * @example
 * ```ts
 * isNilOrEmpty(null) // true
 * isNilOrEmpty('') // true
 * isNilOrEmpty('hello') // false
 * ```
 */
export function isNilOrEmpty(val: unknown): boolean {
  return isEmpty(val)
}

/**
 * Check if a value is a non-empty string.
 *
 * @param val - The value to check
 * @returns `true` if the value is a string with length greater than `0`
 * @example
 * ```ts
 * isValidString('hello') // true
 * isValidString('') // false
 * isValidString(null) // false
 * ```
 */
export function isValidString(val: unknown): val is string {
  return typeof val === 'string' && val.length > 0
}

/**
 * Check if a value is not null or undefined (type narrowing).
 *
 * @param val - The value to check
 * @returns `true` if the value is not null or undefined
 * @example
 * ```ts
 * const values = [1, null, 2, undefined, 3]
 * const filtered = values.filter(notNullish) // [1, 2, 3] typed as number[]
 *
 * notNullish(0) // true
 *
 * notNullish(null) // false
 * ```
 */
export function notNullish<T>(val: T | null | undefined): val is NonNullable<T> {
  return val !== null && val !== undefined
}
