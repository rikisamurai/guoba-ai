import { describe, expect, it } from 'vitest'
import { chunk, counting, diff, flattenDeep, fork, group, intersects, last, objectify, remove, select, shuffle, sift, sort, toArray, uniq, zip } from '../src'

describe('array', () => {
  describe('toArray', () => {
    it('should wrap non-array values', () => {
      expect(toArray(1)).toEqual([1])
      expect(toArray('hello')).toEqual(['hello'])
    })
    it('should return arrays as-is', () => {
      const arr = [1, 2, 3]
      expect(toArray(arr)).toBe(arr)
    })
    it('should wrap null and undefined', () => {
      expect(toArray(null)).toEqual([null])
      expect(toArray(undefined)).toEqual([undefined])
    })
  })

  describe('uniq', () => {
    it('should remove duplicates', () => {
      expect(uniq([1, 2, 2, 3, 3, 3])).toEqual([1, 2, 3])
    })
    it('should handle empty arrays', () => {
      expect(uniq([])).toEqual([])
    })
    it('should preserve order', () => {
      expect(uniq([3, 1, 2, 1, 3])).toEqual([3, 1, 2])
    })
  })

  describe('flattenDeep', () => {
    it('should flatten nested arrays', () => {
      expect(flattenDeep([1, [2, [3, [4]]]])).toEqual([1, 2, 3, 4])
    })
    it('should handle flat arrays', () => {
      expect(flattenDeep([1, 2, 3])).toEqual([1, 2, 3])
    })
    it('should handle empty arrays', () => {
      expect(flattenDeep([])).toEqual([])
    })
  })

  describe('chunk', () => {
    it('should split array into chunks', () => {
      expect(chunk([1, 2, 3, 4, 5], 2)).toEqual([[1, 2], [3, 4], [5]])
    })
    it('should handle exact divisions', () => {
      expect(chunk([1, 2, 3, 4], 2)).toEqual([[1, 2], [3, 4]])
    })
    it('should handle empty arrays', () => {
      expect(chunk([], 2)).toEqual([])
    })
    it('should handle chunk size larger than array', () => {
      expect(chunk([1, 2], 5)).toEqual([[1, 2]])
    })
  })

  describe('shuffle', () => {
    it('should return a new array with same elements', () => {
      const arr = [1, 2, 3, 4, 5]
      const result = shuffle(arr)
      expect(result).not.toBe(arr)
      expect(result.sort()).toEqual(arr.sort())
    })
    it('should handle empty arrays', () => {
      expect(shuffle([])).toEqual([])
    })
    it('should handle single element', () => {
      expect(shuffle([1])).toEqual([1])
    })
  })

  describe('last', () => {
    it('should return the last element', () => {
      expect(last([1, 2, 3])).toBe(3)
    })
    it('should return undefined for empty arrays', () => {
      expect(last([])).toBeUndefined()
    })
  })

  describe('remove', () => {
    it('should remove matching elements in-place', () => {
      const arr = [1, 2, 3, 4, 5]
      const removed = remove(arr, v => v % 2 === 0)
      expect(arr).toEqual([1, 3, 5])
      expect(removed).toEqual([2, 4])
    })
    it('should return empty array when nothing matches', () => {
      const arr = [1, 2, 3]
      const removed = remove(arr, v => v > 10)
      expect(arr).toEqual([1, 2, 3])
      expect(removed).toEqual([])
    })
  })

  describe('group', () => {
    it('should group items by key', () => {
      const result = group([1, 2, 3, 4, 5], v => (v % 2 === 0 ? 'even' : 'odd'))
      expect(result).toEqual({ odd: [1, 3, 5], even: [2, 4] })
    })
    it('should handle empty arrays', () => {
      expect(group([], () => 'key')).toEqual({})
    })
    it('should handle numeric keys', () => {
      const result = group([{ age: 20 }, { age: 30 }, { age: 20 }], v => v.age)
      expect(result).toEqual({ 20: [{ age: 20 }, { age: 20 }], 30: [{ age: 30 }] })
    })
  })

  describe('sort', () => {
    it('should sort by derived value ascending', () => {
      expect(sort([3, 1, 2], v => v)).toEqual([1, 2, 3])
    })
    it('should sort descending when desc is true', () => {
      expect(sort([3, 1, 2], v => v, true)).toEqual([3, 2, 1])
    })
    it('should return a new array', () => {
      const arr = [3, 1, 2]
      expect(sort(arr, v => v)).not.toBe(arr)
    })
    it('should handle empty arrays', () => {
      expect(sort([], v => v)).toEqual([])
    })
  })

  describe('select', () => {
    it('should filter and map in one pass', () => {
      const result = select([1, 2, 3, 4], v => v * 2, v => v % 2 === 0)
      expect(result).toEqual([4, 8])
    })
    it('should handle empty arrays', () => {
      expect(select([], v => v, () => true)).toEqual([])
    })
    it('should pass index to both callbacks', () => {
      const result = select(['a', 'b', 'c'], (_v, i) => i, (_v, i) => i !== 1)
      expect(result).toEqual([0, 2])
    })
  })

  describe('sift', () => {
    it('should remove all falsy values', () => {
      expect(sift([1, null, 2, undefined, 3, false, 0, ''])).toEqual([1, 2, 3])
    })
    it('should handle empty arrays', () => {
      expect(sift([])).toEqual([])
    })
    it('should keep truthy values intact', () => {
      expect(sift(['a', 'b', 'c'])).toEqual(['a', 'b', 'c'])
    })
  })

  describe('fork', () => {
    it('should split array by predicate', () => {
      const [pass, fail] = fork([1, 2, 3, 4, 5], v => v % 2 === 0)
      expect(pass).toEqual([2, 4])
      expect(fail).toEqual([1, 3, 5])
    })
    it('should handle empty arrays', () => {
      expect(fork([], () => true)).toEqual([[], []])
    })
    it('should handle all matching', () => {
      const [pass, fail] = fork([1, 2, 3], () => true)
      expect(pass).toEqual([1, 2, 3])
      expect(fail).toEqual([])
    })
  })

  describe('counting', () => {
    it('should count occurrences by key', () => {
      const result = counting(['a', 'b', 'a', 'c', 'b', 'a'], v => v)
      expect(result).toEqual({ a: 3, b: 2, c: 1 })
    })
    it('should handle empty arrays', () => {
      expect(counting([], () => 'key')).toEqual({})
    })
    it('should count by derived key', () => {
      const result = counting([1, 2, 3, 4], v => (v % 2 === 0 ? 'even' : 'odd'))
      expect(result).toEqual({ even: 2, odd: 2 })
    })
  })

  describe('objectify', () => {
    it('should convert array to object with key and value functions', () => {
      const result = objectify(
        [{ id: 1, name: 'Alice' }, { id: 2, name: 'Bob' }],
        v => v.id,
        v => v.name,
      )
      expect(result).toEqual({ 1: 'Alice', 2: 'Bob' })
    })
    it('should use item as value when valueFn is omitted', () => {
      const items = [{ id: 'a' }, { id: 'b' }]
      const result = objectify(items, v => v.id)
      expect(result).toEqual({ a: { id: 'a' }, b: { id: 'b' } })
    })
    it('should handle empty arrays', () => {
      expect(objectify([], (v: any) => v.id)).toEqual({})
    })
  })

  describe('diff', () => {
    it('should return items in a but not in b', () => {
      expect(diff([1, 2, 3, 4], [2, 4])).toEqual([1, 3])
    })
    it('should handle empty arrays', () => {
      expect(diff([], [1, 2])).toEqual([])
      expect(diff([1, 2], [])).toEqual([1, 2])
    })
    it('should support custom comparison function', () => {
      const a = [{ id: 1 }, { id: 2 }, { id: 3 }]
      const b = [{ id: 2 }]
      expect(diff(a, b, v => v.id)).toEqual([{ id: 1 }, { id: 3 }])
    })
  })

  describe('intersects', () => {
    it('should return true when arrays share elements', () => {
      expect(intersects([1, 2], [2, 3])).toBe(true)
    })
    it('should return false when arrays have no common elements', () => {
      expect(intersects([1, 2], [3, 4])).toBe(false)
    })
    it('should handle empty arrays', () => {
      expect(intersects([], [1, 2])).toBe(false)
      expect(intersects([1, 2], [])).toBe(false)
    })
    it('should support custom comparison function', () => {
      const a = [{ id: 1 }, { id: 2 }]
      const b = [{ id: 2 }, { id: 3 }]
      expect(intersects(a, b, v => v.id)).toBe(true)
    })
  })

  describe('zip', () => {
    it('should combine arrays element-wise', () => {
      expect(zip([1, 2], ['a', 'b'])).toEqual([[1, 'a'], [2, 'b']])
    })
    it('should use shortest array length', () => {
      expect(zip([1, 2, 3], ['a', 'b'])).toEqual([[1, 'a'], [2, 'b']])
    })
    it('should handle empty arrays', () => {
      expect(zip([], [])).toEqual([])
    })
    it('should handle more than two arrays', () => {
      expect(zip([1, 2], ['a', 'b'], [true, false])).toEqual([
        [1, 'a', true],
        [2, 'b', false],
      ])
    })
  })
})
