// @ts-check
import { readdirSync, renameSync, rmSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { join, basename } from 'path'

const API_DIR = 'content/docs/api'

/**
 * Post-process TypeDoc output:
 * 1. Move files from functions/ and type-aliases/ up to the module directory
 * 2. Fix links in all generated .mdx files
 * 3. Add meta.json for each module directory with capitalized title
 */

const modules = readdirSync(API_DIR, { withFileTypes: true })
  .filter((d) => d.isDirectory())

for (const mod of modules) {
  const modDir = join(API_DIR, mod.name)
  const subdirs = ['functions', 'type-aliases']

  for (const sub of subdirs) {
    const subDir = join(modDir, sub)
    if (!existsSync(subDir)) continue

    const files = readdirSync(subDir)
    for (const file of files) {
      renameSync(join(subDir, file), join(modDir, file))
    }
    rmSync(subDir, { recursive: true })
  }

  // Add meta.json with capitalized title
  const title = mod.name.charAt(0).toUpperCase() + mod.name.slice(1)
  writeFileSync(
    join(modDir, 'meta.json'),
    JSON.stringify({ title }, null, 2) + '\n',
  )
}

// Fix links in all .mdx files: remove /functions/ and /type-aliases/ from paths
const allFiles = []
function collectMdx(dir) {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = join(dir, entry.name)
    if (entry.isDirectory()) collectMdx(full)
    else if (entry.name.endsWith('.mdx')) allFiles.push(full)
  }
}
collectMdx(API_DIR)

for (const file of allFiles) {
  let content = readFileSync(file, 'utf-8')
  const updated = content
    .replace(/\/functions\//g, '/')
    .replace(/\/type-aliases\//g, '/')
    .replace(/\.mdx\)/g, ')')
    .replace(/\/index\)/g, ')')
  if (updated !== content) {
    writeFileSync(file, updated)
  }
}

console.log('TypeDoc post-processing complete.')
