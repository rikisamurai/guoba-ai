import { describe, expect, it } from 'vitest'
import {
  isBoolean,
  isDef,
  isEmpty,
  isFunction,
  isNull,
  isNullOrUndef,
  isNumber,
  isObject,
  isString,
  isUndef,
  notNullish,
} from '../src'

describe('guard', () => {
  describe('isString', () => {
    it('should return true for strings', () => {
      expect(isString('hello')).toBe(true)
      expect(isString('')).toBe(true)
    })
    it('should return false for non-strings', () => {
      expect(isString(123)).toBe(false)
      expect(isString(null)).toBe(false)
      expect(isString(undefined)).toBe(false)
    })
  })

  describe('isNumber', () => {
    it('should return true for numbers', () => {
      expect(isNumber(42)).toBe(true)
      expect(isNumber(0)).toBe(true)
      expect(isNumber(Number.NaN)).toBe(true)
    })
    it('should return false for non-numbers', () => {
      expect(isNumber('42')).toBe(false)
      expect(isNumber(null)).toBe(false)
    })
  })

  describe('isBoolean', () => {
    it('should return true for booleans', () => {
      expect(isBoolean(true)).toBe(true)
      expect(isBoolean(false)).toBe(true)
    })
    it('should return false for non-booleans', () => {
      expect(isBoolean(0)).toBe(false)
      expect(isBoolean('true')).toBe(false)
    })
  })

  describe('isObject', () => {
    it('should return true for plain objects', () => {
      expect(isObject({})).toBe(true)
      expect(isObject({ a: 1 })).toBe(true)
    })
    it('should return false for arrays, null, and primitives', () => {
      expect(isObject([])).toBe(false)
      expect(isObject(null)).toBe(false)
      expect(isObject('string')).toBe(false)
    })
  })

  describe('isFunction', () => {
    it('should return true for functions', () => {
      expect(isFunction(() => {})).toBe(true)
      expect(isFunction(Math.round)).toBe(true)
    })
    it('should return false for non-functions', () => {
      expect(isFunction({})).toBe(false)
      expect(isFunction(42)).toBe(false)
    })
  })

  describe('isDef', () => {
    it('should return true for defined values', () => {
      expect(isDef(0)).toBe(true)
      expect(isDef(null)).toBe(true)
      expect(isDef('')).toBe(true)
    })
    it('should return false for undefined', () => {
      expect(isDef(undefined)).toBe(false)
    })
  })

  describe('isUndef', () => {
    it('should return true for undefined', () => {
      expect(isUndef(undefined)).toBe(true)
    })
    it('should return false for defined values', () => {
      expect(isUndef(null)).toBe(false)
      expect(isUndef(0)).toBe(false)
    })
  })

  describe('isNull', () => {
    it('should return true for null', () => {
      expect(isNull(null)).toBe(true)
    })
    it('should return false for non-null', () => {
      expect(isNull(undefined)).toBe(false)
      expect(isNull(0)).toBe(false)
    })
  })

  describe('isNullOrUndef', () => {
    it('should return true for null and undefined', () => {
      expect(isNullOrUndef(null)).toBe(true)
      expect(isNullOrUndef(undefined)).toBe(true)
    })
    it('should return false for other values', () => {
      expect(isNullOrUndef(0)).toBe(false)
      expect(isNullOrUndef('')).toBe(false)
    })
  })

  describe('isEmpty', () => {
    it('should return true for empty values', () => {
      expect(isEmpty([])).toBe(true)
      expect(isEmpty({})).toBe(true)
      expect(isEmpty('')).toBe(true)
    })
    it('should return true for null and undefined', () => {
      expect(isEmpty(null)).toBe(true)
      expect(isEmpty(undefined)).toBe(true)
    })
    it('should return false for non-empty values', () => {
      expect(isEmpty([1])).toBe(false)
      expect(isEmpty({ a: 1 })).toBe(false)
      expect(isEmpty('hello')).toBe(false)
      expect(isEmpty(0)).toBe(false)
    })
  })

  describe('notNullish', () => {
    it('should return true for non-nullish values', () => {
      expect(notNullish(0)).toBe(true)
      expect(notNullish('')).toBe(true)
      expect(notNullish(false)).toBe(true)
    })
    it('should return false for null and undefined', () => {
      expect(notNullish(null)).toBe(false)
      expect(notNullish(undefined)).toBe(false)
    })
  })
})
