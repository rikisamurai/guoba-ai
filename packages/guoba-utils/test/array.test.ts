import { describe, expect, it } from 'vitest'
import { chunk, flattenDeep, last, remove, shuffle, toArray, uniq } from '../src'

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
})
