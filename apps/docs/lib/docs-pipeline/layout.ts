import type { Layout, PackageMeta } from './types'
import { existsSync, globSync, readdirSync, renameSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const FLATTENABLE_SUBDIRS = ['functions', 'type-aliases'] as const

export function resolveEntryPoints(pkg: PackageMeta): string[] {
  if (pkg.layout === 'flat')
    return [`${pkg.srcDir}/index.ts`]
  return globSync(`${pkg.srcDir}/*.ts`)
    .filter(f => !f.endsWith('/index.ts'))
    .sort()
}

interface LayoutStrategy {
  reshapeOutputDir: (outDir: string) => void
}

const topical: LayoutStrategy = {
  reshapeOutputDir(outDir) {
    const modules = readdirSync(outDir, { withFileTypes: true })
      .filter(d => d.isDirectory())
    for (const mod of modules) {
      const modDir = join(outDir, mod.name)
      flattenSubdirs(modDir)
      writeMetaJson(modDir, capitalize(mod.name))
    }
  },
}

const flat: LayoutStrategy = {
  reshapeOutputDir(outDir) {
    flattenSubdirs(outDir)
  },
}

const strategies: Record<Layout, LayoutStrategy> = { topical, flat }

export function reshapeOutputDirFor(pkg: PackageMeta, outDir: string): void {
  strategies[pkg.layout].reshapeOutputDir(outDir)
}

function flattenSubdirs(dir: string): void {
  for (const sub of FLATTENABLE_SUBDIRS) {
    const subDir = join(dir, sub)
    if (!existsSync(subDir))
      continue
    for (const file of readdirSync(subDir))
      renameSync(join(subDir, file), join(dir, file))
    rmSync(subDir, { recursive: true })
  }
}

function writeMetaJson(dir: string, title: string): void {
  writeFileSync(join(dir, 'meta.json'), `${JSON.stringify({ title }, null, 2)}\n`)
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1)
}
