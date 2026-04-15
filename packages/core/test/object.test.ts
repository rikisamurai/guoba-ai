import { describe, expect, it } from 'vitest'
import { deepClone, deepMerge, objectEntries, objectKeys, omit, pick } from '../src'

describe('object', () => {
  describe('objectKeys', () => {
    it('should return typed keys', () => {
      const keys = objectKeys({ a: 1, b: 2, c: 3 })
      expect(keys).toEqual(['a', 'b', 'c'])
    })
    it('should handle empty objects', () => {
      expect(objectKeys({})).toEqual([])
    })
  })

  describe('objectEntries', () => {
    it('should return typed entries', () => {
      const entries = objectEntries({ a: 1, b: 2 })
      expect(entries).toEqual([['a', 1], ['b', 2]])
    })
  })

  describe('deepClone', () => {
    it('should deep clone objects', () => {
      const obj = { a: { b: { c: 1 } } }
      const cloned = deepClone(obj)
      expect(cloned).toEqual(obj)
      expect(cloned).not.toBe(obj)
      expect(cloned.a).not.toBe(obj.a)
    })
    it('should clone arrays', () => {
      const arr = [1, [2, [3]]]
      const cloned = deepClone(arr)
      expect(cloned).toEqual(arr)
      expect(cloned).not.toBe(arr)
    })
  })

  describe('omit', () => {
    it('should omit specified keys', () => {
      const result = omit({ a: 1, b: 2, c: 3 }, ['b', 'c'])
      expect(result).toEqual({ a: 1 })
    })
    it('should handle empty keys array', () => {
      const obj = { a: 1, b: 2 }
      expect(omit(obj, [])).toEqual({ a: 1, b: 2 })
    })
  })

  describe('pick', () => {
    it('should pick specified keys', () => {
      const result = pick({ a: 1, b: 2, c: 3 }, ['a', 'c'])
      expect(result).toEqual({ a: 1, c: 3 })
    })
    it('should handle empty keys array', () => {
      expect(pick({ a: 1, b: 2 }, [])).toEqual({})
    })
  })

  describe('deepMerge', () => {
    it('should deeply merge objects', () => {
      const target = { a: 1, b: { c: 2, d: 3 } }
      const source = { b: { c: 4, e: 5 } }
      const result = deepMerge(target, source)
      expect(result).toEqual({ a: 1, b: { c: 4, d: 3, e: 5 } })
    })
    it('should override primitives', () => {
      const result = deepMerge({ a: 1 }, { a: 2 })
      expect(result).toEqual({ a: 2 })
    })
    it('should handle arrays by replacement', () => {
      const result = deepMerge({ a: [1, 2] }, { a: [3, 4, 5] })
      expect(result).toEqual({ a: [3, 4, 5] })
    })
    it('should merge multiple sources', () => {
      const result = deepMerge({ a: 1 }, { b: 2 }, { c: 3 })
      expect(result).toEqual({ a: 1, b: 2, c: 3 })
    })
    it('should not mutate target', () => {
      const target = { a: 1, b: { c: 2 } }
      const result = deepMerge(target, { b: { c: 3 } })
      expect(target.b.c).toBe(2)
      expect(result.b.c).toBe(3)
    })
  })
})
