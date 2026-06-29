import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

import { reshapeOutputDirFor } from './layout'
import type { PackageMeta } from './types'

const STALE_TOP_LEVEL_FILES = ['modules.mdx', 'globals.mdx'] as const

export function postprocess(pkg: PackageMeta): void {
  const outDir = `content/docs/${pkg.outSlug}`
  if (!existsSync(outDir)) return

  removeStaleFiles(outDir)
  reshapeOutputDirFor(pkg, outDir)
  updateMdxFilesRecursively(outDir)
}

function removeStaleFiles(dir: string): void {
  for (const stale of STALE_TOP_LEVEL_FILES) {
    const path = join(dir, stale)
    if (existsSync(path)) rmSync(path)
  }
}

function updateMdxFilesRecursively(dir: string): void {
  for (const file of collectMdxFiles(dir)) {
    const content = readFileSync(file, 'utf-8')
    const updated = transformWarningSections(removeTypeParametersSections(content))
      .replace(/\/functions\//g, '/')
      .replace(/\/type-aliases\//g, '/')
      .replace(/\.mdx\)/g, ')')
      .replace(/\/index\)/g, ')')
    if (updated !== content) writeFileSync(file, updated)
  }
}

function removeTypeParametersSections(content: string): string {
  const lines = content.split('\n')
  const out: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const match = /^(#{2,6}) Type Parameters\s*$/.exec(lines[i]!)
    if (!match) {
      out.push(lines[i]!)
      continue
    }

    const level = match[1]!.length
    i++
    while (i < lines.length) {
      const heading = /^(#{2,6}) /.exec(lines[i]!)
      if (heading && heading[1]!.length <= level) {
        i--
        break
      }
      i++
    }
  }

  return out.join('\n')
}

function transformWarningSections(content: string): string {
  const lines = content.split('\n')
  const out: string[] = []

  for (let i = 0; i < lines.length; i++) {
    const match = /^(#{2,6}) Warning\s*$/.exec(lines[i]!)
    if (!match) {
      out.push(lines[i]!)
      continue
    }

    const headingLine = lines[i]!
    const level = match[1]!.length
    const body: string[] = []
    i++
    while (i < lines.length) {
      const heading = /^(#{2,6}) /.exec(lines[i]!)
      if (heading && heading[1]!.length <= level) {
        i--
        break
      }

      body.push(lines[i]!)
      i++
    }

    while (body[0] === '') body.shift()
    while (body.at(-1) === '') body.pop()

    out.push(headingLine, '', '<Callout type="warn">', '', ...body, '', '</Callout>')
    if (i < lines.length - 1) out.push('')
  }

  return out.join('\n')
}

function collectMdxFiles(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) out.push(...collectMdxFiles(full))
    else if (entry.name.endsWith('.mdx')) out.push(full)
  }
  return out
}
