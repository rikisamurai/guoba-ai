import { describe, expect, expectTypeOf, it } from 'vitest'
import { construct, crush, deepClone, deepMerge, get, invert, listify, mapEntries, mapKeys, mapValues, objectEntries, objectKeys, omit, pick, set, shake } from '../src'

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

  describe('invert', () => {
    it('should swap keys and values', () => {
      expect(invert({ a: '1', b: '2' })).toEqual({ 1: 'a', 2: 'b' })
    })
    it('should handle numeric values', () => {
      expect(invert({ x: 1, y: 2 })).toEqual({ 1: 'x', 2: 'y' })
    })
    it('should handle empty objects', () => {
      expect(invert({})).toEqual({})
    })
    it('should use last key when values collide', () => {
      const result = invert({ a: 'same', b: 'same' })
      expect(result.same).toBe('b')
    })
  })

  describe('mapKeys', () => {
    it('should transform keys using the mapping function', () => {
      const result = mapKeys({ a: 1, b: 2 }, key => (key as string).toUpperCase())
      expect(result).toEqual({ A: 1, B: 2 })
    })
    it('should pass value as second argument', () => {
      const result = mapKeys({ x: 10, y: 20 }, (key, value) => `${String(key)}_${value}`)
      expect(result).toEqual({ x_10: 10, y_20: 20 })
    })
    it('should handle empty objects', () => {
      expect(mapKeys({}, key => String(key))).toEqual({})
    })
  })

  describe('mapValues', () => {
    it('should transform values using the mapping function', () => {
      const result = mapValues({ a: 1, b: 2 }, value => (value as number) * 10)
      expect(result).toEqual({ a: 10, b: 20 })
    })
    it('should pass key as second argument', () => {
      const result = mapValues({ x: 1, y: 2 }, (value, key) => `${String(key)}=${value}`)
      expect(result).toEqual({ x: 'x=1', y: 'y=2' })
    })
    it('should handle empty objects', () => {
      expect(mapValues({}, v => v)).toEqual({})
    })
  })

  describe('mapEntries', () => {
    it('should transform both keys and values', () => {
      const result = mapEntries(
        { a: 1, b: 2 },
        (key, value) => [(key as string).toUpperCase(), (value as number) * 10],
      )
      expect(result).toEqual({ A: 10, B: 20 })
    })
    it('should handle empty objects', () => {
      expect(mapEntries({}, (k, v) => [String(k), v])).toEqual({})
    })
    it('should allow completely different key-value shapes', () => {
      const result = mapEntries(
        { name: 'alice', age: '30' },
        (key, value) => [String(value), key],
      )
      expect(result).toEqual({ alice: 'name', 30: 'age' })
    })
  })

  describe('listify', () => {
    it('should convert object to array', () => {
      const result = listify({ a: 1, b: 2 }, (key, value) => `${String(key)}=${value}`)
      expect(result).toEqual(['a=1', 'b=2'])
    })
    it('should return values only', () => {
      const result = listify({ x: 10, y: 20 }, (_key, value) => value)
      expect(result).toEqual([10, 20])
    })
    it('should handle empty objects', () => {
      expect(listify({}, (k, v) => [k, v])).toEqual([])
    })
  })

  describe('get', () => {
    it('should access nested properties by dot path', () => {
      expect(get({ a: { b: { c: 42 } } }, 'a.b.c')).toBe(42)
    })
    it('should return defaultValue when path does not resolve', () => {
      expect(get({ a: 1 }, 'b.c', 'fallback')).toBe('fallback')
    })
    it('should return undefined when path does not resolve and no default', () => {
      expect(get({ a: 1 }, 'x.y.z')).toBeUndefined()
    })
    it('should handle top-level keys', () => {
      expect(get({ foo: 'bar' }, 'foo')).toBe('bar')
    })
  })

  describe('set', () => {
    it('should set a value at a deep path', () => {
      const result = set({}, 'a.b.c', 42)
      expect(result).toEqual({ a: { b: { c: 42 } } })
    })
    it('should mutate and return the original object', () => {
      const obj = { x: 1 }
      const result = set(obj, 'y', 2)
      expect(result).toBe(obj)
      expect(obj).toEqual({ x: 1, y: 2 })
    })
    it('should create arrays for numeric path segments', () => {
      const result = set({}, 'a.0.b', 1)
      expect(result).toEqual({ a: [{ b: 1 }] })
    })
    it('should overwrite existing values', () => {
      const obj = { a: { b: 1 } }
      set(obj, 'a.b', 99)
      expect(obj.a.b).toBe(99)
    })
  })

  describe('crush', () => {
    it('should flatten a nested object', () => {
      expect(crush({ a: { b: 1, c: { d: 2 } } })).toEqual({
        'a.b': 1,
        'a.c.d': 2,
      })
    })
    it('should handle flat objects', () => {
      expect(crush({ x: 1, y: 2 })).toEqual({ x: 1, y: 2 })
    })
    it('should treat arrays as leaf values', () => {
      expect(crush({ a: { b: [1, 2, 3] } })).toEqual({ 'a.b': [1, 2, 3] })
    })
    it('should handle empty objects', () => {
      expect(crush({})).toEqual({})
    })
  })

  describe('construct', () => {
    it('should build a nested object from dot-path keys', () => {
      expect(construct({ 'a.b': 1, 'a.c.d': 2 })).toEqual({
        a: { b: 1, c: { d: 2 } },
      })
    })
    it('should handle flat keys', () => {
      expect(construct({ x: 1, y: 2 })).toEqual({ x: 1, y: 2 })
    })
    it('should handle empty objects', () => {
      expect(construct({})).toEqual({})
    })
    it('should be the inverse of crush', () => {
      const original = { a: { b: 1, c: { d: 2 } } }
      expect(construct(crush(original))).toEqual(original)
    })
  })
})
