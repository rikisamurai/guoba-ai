import { postprocess } from './postprocess'
import { runTypedoc } from './typedoc'
import type { PackageMeta } from './types'

export type { Layout, PackageMeta } from './types'

export async function buildPackageDocs(pkg: PackageMeta): Promise<void> {
  await runTypedoc(pkg)
  postprocess(pkg)
}

export async function buildAllDocs(pkgs: PackageMeta[]): Promise<void> {
  // Packages build in parallel: each runs an isolated TypeDoc program with its
  // own tsconfig and output dir, so there's no shared state to contend over.
  // Verified byte-identical to a sequential build, and faster on average.
  await Promise.all(pkgs.map(pkg => buildPackageDocs(pkg)))
}
