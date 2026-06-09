import { capitalize } from '../string'

/**
 * Split a string into word segments by detecting camelCase boundaries,
 * consecutive uppercase sequences, and common separators (dash, underscore,
 * dot, space).
 *
 * Internal helper — not part of the public API.
 */
export function splitWords(str: string): string[] {
  return (
    str
      .replace(/([a-z])([A-Z])/g, '$1\0$2')
      .replace(/([A-Z]+)([A-Z][a-z])/g, '$1\0$2')
      // oxlint-disable-next-line no-control-regex -- \0 is an intentional internal delimiter inserted above
      .split(/[\0\-_.\s]+/)
      .filter(Boolean)
  )
}

/** Split into words and join them lowercased with the given separator. Internal helper. */
export function joinLower(str: string, sep: string): string {
  return splitWords(str)
    .map(w => w.toLowerCase())
    .join(sep)
}

/** Split into words and join them capitalized with the given separator. Internal helper. */
export function joinCapitalized(str: string, sep: string): string {
  return splitWords(str)
    .map(w => capitalize(w.toLowerCase()))
    .join(sep)
}
