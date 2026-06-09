export type Layout = 'topical' | 'flat'

export interface PackageMeta {
  name: string
  srcDir: string
  tsconfig: string
  layout: Layout
  outSlug: string
}
