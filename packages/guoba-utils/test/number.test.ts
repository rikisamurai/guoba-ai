import { describe, expect, it } from 'vitest'

import { clamp, range } from '../src'

describe('number', () => {
  describe('clamp', () => {
    it('should keep values inside the range', () => {
      expect(clamp(5, 0, 10)).toBe(5)
    })
    it('should return min when value is below range', () => {
      expect(clamp(-1, 0, 10)).toBe(0)
    })
    it('should return max when value is above range', () => {
      expect(clamp(11, 0, 10)).toBe(10)
    })
  })

  describe('range', () => {
    it('should create a half-open ascending range', () => {
      expect(range(0, 4)).toEqual([0, 1, 2, 3])
    })
    it('should support custom positive steps', () => {
      expect(range(0, 6, 2)).toEqual([0, 2, 4])
    })
    it('should support negative steps', () => {
      expect(range(4, 0, -1)).toEqual([4, 3, 2, 1])
    })
    it('should return empty array when step moves away from end', () => {
      expect(range(4, 0)).toEqual([])
      expect(range(0, 4, -1)).toEqual([])
    })
    it('should reject zero step', () => {
      expect(() => range(0, 4, 0)).toThrow(RangeError)
    })
  })
})
