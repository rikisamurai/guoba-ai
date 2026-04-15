/**
 * Capitalize the first letter of a string.
 *
 * @param str - The string to capitalize
 * @returns The string with its first letter uppercased
 * @example
 * ```ts
 * capitalize('hello') // 'Hello'
 * ```
 */
export function capitalize<T extends string>(str: T): Capitalize<T> {
  return (str.charAt(0).toUpperCase() + str.slice(1)) as Capitalize<T>
}

/**
 * Ensure a string starts with a given prefix.
 *
 * @param str - The input string
 * @param prefix - The prefix to ensure
 * @returns The string with the prefix prepended if it was missing
 * @example
 * ```ts
 * ensurePrefix('/path', '/') // '/path'
 * ensurePrefix('path', '/') // '/path'
 * ```
 */
export function ensurePrefix(str: string, prefix: string): string {
  return str.startsWith(prefix) ? str : prefix + str
}

/**
 * Ensure a string ends with a given suffix.
 *
 * @param str - The input string
 * @param suffix - The suffix to ensure
 * @returns The string with the suffix appended if it was missing
 * @example
 * ```ts
 * ensureSuffix('file.ts', '.ts') // 'file.ts'
 * ensureSuffix('file', '.ts') // 'file.ts'
 * ```
 */
export function ensureSuffix(str: string, suffix: string): string {
  return str.endsWith(suffix) ? str : str + suffix
}

/**
 * Simple template string replacement. Replaces `{key}` placeholders
 * with values from the data object.
 *
 * @param str - The template string with `{key}` placeholders
 * @param data - Object with replacement values
 * @returns The string with placeholders replaced
 * @example
 * ```ts
 * template('Hello {name}!', { name: 'World' }) // 'Hello World!'
 * ```
 */
export function template(str: string, data: Record<string, string>): string {
  return str.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in data ? data[key]! : match)
}

/**
 * Convert backslashes to forward slashes.
 *
 * @param str - The input string
 * @returns The string with all backslashes replaced by forward slashes
 * @example
 * ```ts
 * slash('foo\\bar\\baz') // 'foo/bar/baz'
 * ```
 */
export function slash(str: string): string {
  return str.replace(/\\/g, '/')
}
