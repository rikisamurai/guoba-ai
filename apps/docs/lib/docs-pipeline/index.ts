import { postprocess } from './postprocess'
import { runTypedoc } from './typedoc'
import type { PackageMeta } from './types'

export type { Layout, PackageMeta } from './types'

export async function buildPackageDocs(pkg: PackageMeta): Promise<void> {
  await runTypedoc(pkg)
  postprocess(pkg)
}

export async function buildAllDocs(pkgs: PackageMeta[]): Promise<void> {
  for (const pkg of pkgs) await buildPackageDocs(pkg)
}
