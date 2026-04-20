import { describe, expect, expectTypeOf, it } from 'vitest'
import { deepClone, deepMerge, objectEntries, objectKeys, omit, pick, shake } from '../src'

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

  describe('shake', () => {
    it('should remove all undefined values by default', () => {
      const result = shake({
        x: 2,
        y: null,
        z: undefined,
        o: false,
        r: 'x',
      })

      expect(result).toEqual({
        x: 2,
        y: null,
        o: false,
        r: 'x',
      })
    })

    it('should remove values based on a filter function', () => {
      const result = shake(
        {
          x: 2,
          y: null,
          z: undefined,
          o: false,
          r: 'x',
        },
        value => value !== 'x',
      )

      expect(result).toEqual({
        r: 'x',
      })
    })

    it('should handle undefined input', () => {
      expect(shake(undefined!)).toEqual({})
    })

    it('should preserve falsy values that are not undefined', () => {
      const result = shake({
        count: 0,
        empty: '',
        enabled: false,
        missing: undefined,
      })

      expect(result).toEqual({
        count: 0,
        empty: '',
        enabled: false,
      })
    })

    it('should not mutate the source object', () => {
      const source = {
        a: 1,
        b: undefined,
      }

      const result = shake(source)

      expect(result).toEqual({ a: 1 })
      expect(source).toEqual({ a: 1, b: undefined })
    })

    it('should ignore non-enumerable keys', () => {
      const source = { a: 1, b: undefined }

      Object.defineProperty(source, 'hidden', {
        enumerable: false,
        value: undefined,
      })

      expect(shake(source)).toEqual({ a: 1 })
    })

    it('should remove undefined from property types without a filter', () => {
      const result = shake({} as { a: string | undefined })
      expectTypeOf(result).toEqualTypeOf<{ a: string }>()
    })

    it('should preserve optional property optionality', () => {
      const result = shake({} as { a?: string })
      expectTypeOf(result).toEqualTypeOf<{ a?: string }>()

      const resultWithUndefined = shake({} as { a?: string | undefined }, undefined)
      expectTypeOf(resultWithUndefined).toEqualTypeOf<{ a?: string }>()
    })

    it('should remove undefined from record value types', () => {
      const result = shake({} as Record<string, string | undefined>)
      expectTypeOf(result).toEqualTypeOf<Record<string, string>>()

      const resultWithAnyKey = shake({} as Record<keyof any, string | null | undefined>)
      expectTypeOf(resultWithAnyKey).toEqualTypeOf<Record<keyof any, string | null>>()
    })

    it('should preserve source type when a filter function is provided', () => {
      const result = shake({} as { a: string | undefined }, (value) => {
        expectTypeOf(value).toEqualTypeOf<unknown>()

        return value === undefined
      })

      expectTypeOf(result).toEqualTypeOf<{ a: string | undefined }>()
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
      const target: Record<string, number> = { a: 1 }
      const result = deepMerge(target, { b: 2 }, { c: 3 })
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
