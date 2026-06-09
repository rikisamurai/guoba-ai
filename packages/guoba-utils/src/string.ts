import { joinCapitalized, joinLower, splitWords } from './internal/string'

/**
 * Capitalize the first letter of a string.
 *
 * @param str - The string to capitalize
 * @returns The string with its first letter uppercased
 * @example
 * ```ts
 * capitalize('hello') // 'Hello'
 *
 * capitalize('Hello') // 'Hello'
 *
 * capitalize('') // ''
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
 *
 * ensurePrefix('path', '/') // '/path'
 *
 * ensurePrefix('api/users', '/v1/') // '/v1/api/users'
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
 *
 * ensureSuffix('file', '.ts') // 'file.ts'
 *
 * ensureSuffix('/api/users', '/') // '/api/users/'
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
 *
 * template('{a} + {b} = {c}', { a: '1', b: '2', c: '3' }) // '1 + 2 = 3'
 *
 * template('Hello {name}!', {}) // 'Hello {name}!'
 * ```
 *
 * @warning Only `{word}` placeholders are replaced. Keys containing dots or hyphens are left unchanged.
 */
export function template(str: string, data: Record<string, string>): string {
  return str.replace(/\{(\w+)\}/g, (match, key: string) => (key in data ? data[key]! : match))
}

/**
 * Convert backslashes to forward slashes.
 *
 * @param str - The input string
 * @returns The string with all backslashes replaced by forward slashes
 * @example
 * ```ts
 * slash('foo\\bar\\baz') // 'foo/bar/baz'
 *
 * slash('foo/bar/baz') // 'foo/bar/baz'
 *
 * slash('C:\\Users\\me/file.txt') // 'C:/Users/me/file.txt'
 * ```
 */
export function slash(str: string): string {
  return str.replace(/\\/g, '/')
}

/**
 * Convert a string to camelCase.
 *
 * @param str - The string to convert
 * @returns The camelCase version of the string
 * @example
 * ```ts
 * camel('foo-bar') // 'fooBar'
 *
 * camel('FooBar') // 'fooBar'
 *
 * camel('foo_bar') // 'fooBar'
 * ```
 *
 * @warning Conversion follows the current word-splitting rules for separators, casing, and acronyms.
 */
export function camel(str: string): string {
  const words = splitWords(str)
  return words.map((w, i) => (i === 0 ? w.toLowerCase() : capitalize(w.toLowerCase()))).join('')
}

/**
 * Convert a string to snake_case.
 *
 * @param str - The string to convert
 * @returns The snake_case version of the string
 * @example
 * ```ts
 * snake('fooBar') // 'foo_bar'
 *
 * snake('FooBar') // 'foo_bar'
 *
 * snake('foo-bar') // 'foo_bar'
 *
 * snake('HTMLParser') // 'html_parser'
 * ```
 *
 * @warning Conversion follows the current word-splitting rules for separators, casing, and acronyms.
 */
export function snake(str: string): string {
  return joinLower(str, '_')
}

/**
 * Convert a string to PascalCase.
 *
 * @param str - The string to convert
 * @returns The PascalCase version of the string
 * @example
 * ```ts
 * pascal('foo-bar') // 'FooBar'
 *
 * pascal('fooBar') // 'FooBar'
 *
 * pascal('foo_bar') // 'FooBar'
 * ```
 *
 * @warning Conversion follows the current word-splitting rules for separators, casing, and acronyms.
 */
export function pascal(str: string): string {
  return joinCapitalized(str, '')
}

/**
 * Convert a string to kebab-case (dash-case).
 *
 * @param str - The string to convert
 * @returns The kebab-case version of the string
 * @example
 * ```ts
 * dash('fooBar') // 'foo-bar'
 *
 * dash('FooBar') // 'foo-bar'
 *
 * dash('foo_bar') // 'foo-bar'
 *
 * dash('HTMLParser') // 'html-parser'
 * ```
 *
 * @warning Conversion follows the current word-splitting rules for separators, casing, and acronyms.
 */
export function dash(str: string): string {
  return joinLower(str, '-')
}

/**
 * Convert a string to Title Case. Each word is capitalized
 * and joined with a space.
 *
 * @param str - The string to convert
 * @returns The Title Case version of the string
 * @example
 * ```ts
 * title('foo bar') // 'Foo Bar'
 *
 * title('foo-bar') // 'Foo Bar'
 *
 * title('fooBar') // 'Foo Bar'
 *
 * title('foo_bar') // 'Foo Bar'
 * ```
 *
 * @warning Conversion follows the current word-splitting rules for separators, casing, and acronyms.
 */
export function title(str: string): string {
  return joinCapitalized(str, ' ')
}
