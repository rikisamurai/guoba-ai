import { describe, expect, it } from 'vitest'

import {
  camel,
  capitalize,
  dash,
  ensurePrefix,
  ensureSuffix,
  pascal,
  slash,
  snake,
  template,
  title,
} from '../src'

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

  describe('camel', () => {
    it('should convert dash-case to camelCase', () => {
      expect(camel('foo-bar')).toBe('fooBar')
    })
    it('should convert snake_case to camelCase', () => {
      expect(camel('foo_bar')).toBe('fooBar')
    })
    it('should convert PascalCase to camelCase', () => {
      expect(camel('FooBar')).toBe('fooBar')
    })
    it('should handle empty string', () => {
      expect(camel('')).toBe('')
    })
    it('should handle single word', () => {
      expect(camel('foo')).toBe('foo')
    })
  })

  describe('snake', () => {
    it('should convert camelCase to snake_case', () => {
      expect(snake('fooBar')).toBe('foo_bar')
    })
    it('should convert PascalCase to snake_case', () => {
      expect(snake('FooBar')).toBe('foo_bar')
    })
    it('should convert dash-case to snake_case', () => {
      expect(snake('foo-bar')).toBe('foo_bar')
    })
    it('should handle empty string', () => {
      expect(snake('')).toBe('')
    })
    it('should handle consecutive uppercase', () => {
      expect(snake('HTMLParser')).toBe('html_parser')
    })
  })

  describe('pascal', () => {
    it('should convert dash-case to PascalCase', () => {
      expect(pascal('foo-bar')).toBe('FooBar')
    })
    it('should convert camelCase to PascalCase', () => {
      expect(pascal('fooBar')).toBe('FooBar')
    })
    it('should convert snake_case to PascalCase', () => {
      expect(pascal('foo_bar')).toBe('FooBar')
    })
    it('should handle empty string', () => {
      expect(pascal('')).toBe('')
    })
    it('should handle single word', () => {
      expect(pascal('foo')).toBe('Foo')
    })
  })

  describe('dash', () => {
    it('should convert camelCase to kebab-case', () => {
      expect(dash('fooBar')).toBe('foo-bar')
    })
    it('should convert PascalCase to kebab-case', () => {
      expect(dash('FooBar')).toBe('foo-bar')
    })
    it('should convert snake_case to kebab-case', () => {
      expect(dash('foo_bar')).toBe('foo-bar')
    })
    it('should handle empty string', () => {
      expect(dash('')).toBe('')
    })
    it('should handle consecutive uppercase', () => {
      expect(dash('HTMLParser')).toBe('html-parser')
    })
  })

  describe('title', () => {
    it('should convert space-separated to Title Case', () => {
      expect(title('foo bar')).toBe('Foo Bar')
    })
    it('should convert dash-case to Title Case', () => {
      expect(title('foo-bar')).toBe('Foo Bar')
    })
    it('should convert camelCase to Title Case', () => {
      expect(title('fooBar')).toBe('Foo Bar')
    })
    it('should convert snake_case to Title Case', () => {
      expect(title('foo_bar')).toBe('Foo Bar')
    })
    it('should handle empty string', () => {
      expect(title('')).toBe('')
    })
  })
})
