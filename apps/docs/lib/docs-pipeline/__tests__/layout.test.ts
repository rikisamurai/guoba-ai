import type { PackageMeta } from '../types'
import { describe, expect, it } from 'vitest'
import { resolveEntryPoints } from '../layout'

const utilsPkg: PackageMeta = {
  name: 'utils',
  srcDir: '../../packages/guoba-utils/src',
  tsconfig: '../../packages/guoba-utils/tsconfig.json',
  layout: 'topical',
  outSlug: 'utils',
}

const hookPkg: PackageMeta = {
  name: 'hook',
  srcDir: '../../packages/guoba-hook/src',
  tsconfig: '../../packages/guoba-hook/tsconfig.json',
  layout: 'flat',
  outSlug: 'hooks',
}

describe('resolveEntryPoints', () => {
  it('flat layout returns only the barrel index.ts', () => {
    expect(resolveEntryPoints(hookPkg)).toEqual([
      '../../packages/guoba-hook/src/index.ts',
    ])
  })

  it('topical layout returns every src/*.ts except index.ts, sorted', () => {
    const result = resolveEntryPoints(utilsPkg)
    expect(result.length).toBeGreaterThan(0)
    expect(result.every(f => f.endsWith('.ts'))).toBe(true)
    expect(result.some(f => f.endsWith('/index.ts'))).toBe(false)
    expect(result.some(f => f.endsWith('/array.ts'))).toBe(true)
    expect(result.some(f => f.endsWith('/async.ts'))).toBe(true)
    expect([...result].sort()).toEqual(result)
  })
})
