import { describe, expect, it } from 'vitest'
import { capitalize, ensurePrefix, ensureSuffix, slash, template } from '../src'

describe('string', () => {
  describe('capitalize', () => {
    it('should capitalize first letter', () => {
      expect(capitalize('hello')).toBe('Hello')
    })
    it('should handle empty string', () => {
      expect(capitalize('')).toBe('')
    })
    it('should handle already capitalized', () => {
      expect(capitalize('Hello')).toBe('Hello')
    })
    it('should handle single character', () => {
      expect(capitalize('a')).toBe('A')
    })
  })

  describe('ensurePrefix', () => {
    it('should add prefix if missing', () => {
      expect(ensurePrefix('world', 'hello ')).toBe('hello world')
    })
    it('should not duplicate prefix', () => {
      expect(ensurePrefix('hello world', 'hello ')).toBe('hello world')
    })
  })

  describe('ensureSuffix', () => {
    it('should add suffix if missing', () => {
      expect(ensureSuffix('hello', ' world')).toBe('hello world')
    })
    it('should not duplicate suffix', () => {
      expect(ensureSuffix('hello world', ' world')).toBe('hello world')
    })
  })

  describe('template', () => {
    it('should replace placeholders', () => {
      expect(template('Hello {name}!', { name: 'World' })).toBe('Hello World!')
    })
    it('should handle multiple placeholders', () => {
      expect(template('{a} + {b} = {c}', { a: '1', b: '2', c: '3' })).toBe('1 + 2 = 3')
    })
    it('should leave unmatched placeholders', () => {
      expect(template('Hello {name}!', {})).toBe('Hello {name}!')
    })
  })

  describe('slash', () => {
    it('should convert backslashes to forward slashes', () => {
      expect(slash('foo\\bar\\baz')).toBe('foo/bar/baz')
    })
    it('should leave forward slashes unchanged', () => {
      expect(slash('foo/bar/baz')).toBe('foo/bar/baz')
    })
  })
})
