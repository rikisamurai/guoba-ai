import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { postprocess } from '../postprocess'
import type { PackageMeta } from '../types'

const flatPkg: PackageMeta = {
  name: 'hook',
  srcDir: 'x',
  tsconfig: 'y',
  layout: 'flat',
  outSlug: 'hooks',
}

const topicalPkg: PackageMeta = {
  name: 'utils',
  srcDir: 'x',
  tsconfig: 'y',
  layout: 'topical',
  outSlug: 'utils',
}

let tmpRoot: string
let originalCwd: string

beforeEach(() => {
  originalCwd = process.cwd()
  tmpRoot = mkdtempSync(join(tmpdir(), 'docs-pipeline-test-'))
  process.chdir(tmpRoot)
  mkdirSync(join(tmpRoot, 'content', 'docs'), { recursive: true })
})

afterEach(() => {
  process.chdir(originalCwd)
  rmSync(tmpRoot, { recursive: true, force: true })
})

describe('postprocess flat layout', () => {
  it('flattens functions/ and type-aliases/, removes stale top-level files, fixes links', () => {
    const outDir = 'content/docs/hooks'
    mkdirSync(join(outDir, 'functions'), { recursive: true })
    mkdirSync(join(outDir, 'type-aliases'), { recursive: true })
    writeFileSync(
      join(outDir, 'functions', 'useToggle.mdx'),
      'see [useDebounce](/functions/useDebounce.mdx)',
    )
    writeFileSync(
      join(outDir, 'type-aliases', 'ToggleSetter.mdx'),
      'see [Other](/type-aliases/Other.mdx)',
    )
    writeFileSync(join(outDir, 'modules.mdx'), '')
    writeFileSync(join(outDir, 'globals.mdx'), '')

    postprocess(flatPkg)

    expect(existsSync(join(outDir, 'modules.mdx'))).toBe(false)
    expect(existsSync(join(outDir, 'globals.mdx'))).toBe(false)
    expect(existsSync(join(outDir, 'functions'))).toBe(false)
    expect(existsSync(join(outDir, 'type-aliases'))).toBe(false)
    expect(existsSync(join(outDir, 'useToggle.mdx'))).toBe(true)
    expect(existsSync(join(outDir, 'ToggleSetter.mdx'))).toBe(true)
    expect(readFileSync(join(outDir, 'useToggle.mdx'), 'utf-8')).toBe(
      'see [useDebounce](/useDebounce)',
    )
    expect(readFileSync(join(outDir, 'ToggleSetter.mdx'), 'utf-8')).toBe('see [Other](/Other)')
  })
})

describe('postprocess topical layout', () => {
  it('flattens per-module subdirs, writes capitalized meta.json, fixes links', () => {
    const outDir = 'content/docs/utils'
    mkdirSync(join(outDir, 'array', 'functions'), { recursive: true })
    writeFileSync(join(outDir, 'array', 'index.mdx'), 'see [chunk](/array/functions/chunk.mdx)')
    writeFileSync(join(outDir, 'array', 'functions', 'chunk.mdx'), '# chunk')
    writeFileSync(join(outDir, 'modules.mdx'), '')

    postprocess(topicalPkg)

    expect(existsSync(join(outDir, 'modules.mdx'))).toBe(false)
    expect(existsSync(join(outDir, 'array', 'functions'))).toBe(false)
    expect(existsSync(join(outDir, 'array', 'chunk.mdx'))).toBe(true)
    expect(readFileSync(join(outDir, 'array', 'meta.json'), 'utf-8')).toBe(
      '{\n  "title": "Array"\n}\n',
    )
    expect(readFileSync(join(outDir, 'array', 'index.mdx'), 'utf-8')).toBe(
      'see [chunk](/array/chunk)',
    )
  })

  it('is a no-op if outDir does not exist', () => {
    expect(() => postprocess(topicalPkg)).not.toThrow()
  })
})

describe('postprocess generated content', () => {
  it('removes Type Parameters sections and preserves following sections', () => {
    const outDir = 'content/docs/hooks'
    mkdirSync(outDir, { recursive: true })
    writeFileSync(
      join(outDir, 'useValue.mdx'),
      [
        '# Function: useValue()',
        '',
        '## Type Parameters',
        '',
        '### T',
        '',
        'The value type.',
        '',
        '## Parameters',
        '',
        '### value',
        '',
        'The value.',
        '',
        '## Returns',
        '',
        'The same value.',
      ].join('\n'),
    )

    postprocess(flatPkg)

    expect(readFileSync(join(outDir, 'useValue.mdx'), 'utf-8')).toBe(
      [
        '# Function: useValue()',
        '',
        '## Parameters',
        '',
        '### value',
        '',
        'The value.',
        '',
        '## Returns',
        '',
        'The same value.',
      ].join('\n'),
    )
  })

  it('removes nested overload Type Parameters sections only to the next peer section', () => {
    const outDir = 'content/docs/hooks'
    mkdirSync(outDir, { recursive: true })
    writeFileSync(
      join(outDir, 'useValue.mdx'),
      [
        '## Call Signature',
        '',
        '### Type Parameters',
        '',
        '#### T',
        '',
        'The value type.',
        '',
        '### Parameters',
        '',
        '#### value',
        '',
        'The value.',
        '',
        '## Example',
        '',
        '```ts',
        'useValue(1)',
        '```',
      ].join('\n'),
    )

    postprocess(flatPkg)

    expect(readFileSync(join(outDir, 'useValue.mdx'), 'utf-8')).toBe(
      [
        '## Call Signature',
        '',
        '### Parameters',
        '',
        '#### value',
        '',
        'The value.',
        '',
        '## Example',
        '',
        '```ts',
        'useValue(1)',
        '```',
      ].join('\n'),
    )
  })

  it('leaves files without Type Parameters unchanged', () => {
    const outDir = 'content/docs/hooks'
    mkdirSync(outDir, { recursive: true })
    const content = [
      '# Function: useReady()',
      '',
      '## Example',
      '',
      '```ts',
      'useReady()',
      '```',
    ].join('\n')
    writeFileSync(join(outDir, 'useReady.mdx'), content)

    postprocess(flatPkg)

    expect(readFileSync(join(outDir, 'useReady.mdx'), 'utf-8')).toBe(content)
  })

  it('converts generated Warning sections to Fumadocs callouts', () => {
    const outDir = 'content/docs/hooks'
    mkdirSync(outDir, { recursive: true })
    writeFileSync(
      join(outDir, 'useValue.mdx'),
      [
        '# Function: useValue()',
        '',
        '## Example',
        '',
        '```ts',
        'useValue(value)',
        '```',
        '',
        '## Warning',
        '',
        'The first value is returned immediately.',
        'Later changes are delayed.',
        '',
        '## See Also',
        '',
        '[React docs](https://react.dev)',
      ].join('\n'),
    )

    postprocess(flatPkg)

    expect(readFileSync(join(outDir, 'useValue.mdx'), 'utf-8')).toBe(
      [
        '# Function: useValue()',
        '',
        '## Example',
        '',
        '```ts',
        'useValue(value)',
        '```',
        '',
        '## Warning',
        '',
        '<Callout type="warn">',
        '',
        'The first value is returned immediately.',
        'Later changes are delayed.',
        '',
        '</Callout>',
        '',
        '## See Also',
        '',
        '[React docs](https://react.dev)',
      ].join('\n'),
    )
  })
})
