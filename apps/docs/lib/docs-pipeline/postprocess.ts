import type { PackageMeta } from './types'
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { reshapeOutputDirFor } from './layout'

const STALE_TOP_LEVEL_FILES = ['modules.mdx', 'globals.mdx'] as const

export function postprocess(pkg: PackageMeta): void {
  const outDir = `content/docs/${pkg.outSlug}`
  if (!existsSync(outDir))
    return

  removeStaleFiles(outDir)
  reshapeOutputDirFor(pkg, outDir)
  fixLinksRecursively(outDir)
}

function removeStaleFiles(dir: string): void {
  for (const stale of STALE_TOP_LEVEL_FILES) {
    const path = join(dir, stale)
    if (existsSync(path))
      rmSync(path)
  }
}

function fixLinksRecursively(dir: string): void {
  for (const file of collectMdxFiles(dir)) {
    const content = readFileSync(file, 'utf-8')
    const updated = content
      .replace(/\/functions\//g, '/')
      .replace(/\/type-aliases\//g, '/')
      .replace(/\.mdx\)/g, ')')
      .replace(/\/index\)/g, ')')
    if (updated !== content)
      writeFileSync(file, updated)
  }
}

function collectMdxFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory())
      out.push(...collectMdxFiles(full))
    else if (entry.name.endsWith('.mdx'))
      out.push(full)
  }
  return out
}
