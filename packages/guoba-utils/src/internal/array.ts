/**
 * Build a membership predicate for `b`, optionally mapping items via `fn`
 * before comparison. Used by set-style array helpers (`diff`, `intersects`).
 *
 * Internal helper — not part of the public API.
 */
export function buildLookup<T>(b: T[], fn?: (item: T) => unknown): (item: T) => boolean {
  if (fn) {
    const bSet = new Set(b.map(fn))
    return item => bSet.has(fn(item))
  }
  const bSet = new Set(b)
  return item => bSet.has(item)
}
