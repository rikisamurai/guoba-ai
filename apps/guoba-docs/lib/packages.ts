import type { PackageMeta } from './docs-pipeline/types'

export const packages: PackageMeta[] = [
  {
    name: 'utils',
    srcDir: '../../packages/guoba-utils/src',
    tsconfig: '../../packages/guoba-utils/tsconfig.json',
    layout: 'topical',
    outSlug: 'utils',
  },
  {
    name: 'hook',
    srcDir: '../../packages/guoba-hook/src',
    tsconfig: '../../packages/guoba-hook/tsconfig.json',
    layout: 'flat',
    outSlug: 'hooks',
  },
]
