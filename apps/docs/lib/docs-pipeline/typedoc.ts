import { Application, TSConfigReader } from 'typedoc'
import type { MarkdownApplication } from 'typedoc-plugin-markdown'
import { MarkdownPageEvent } from 'typedoc-plugin-markdown'

import { resolveEntryPoints } from './layout'
import type { PackageMeta } from './types'

export async function runTypedoc(pkg: PackageMeta): Promise<void> {
  const app = (await Application.bootstrapWithPlugins(
    {
      entryPoints: resolveEntryPoints(pkg),
      tsconfig: pkg.tsconfig,
      plugin: ['typedoc-plugin-markdown', 'typedoc-plugin-frontmatter'],
      out: `content/docs/${pkg.outSlug}`,
      publicPath: `/docs/${pkg.outSlug}/`,
      cleanOutputDir: true,
      fileExtension: '.mdx',
      entryFileName: 'index',
      flattenOutputFiles: false,
      hidePageHeader: true,
      hidePageTitle: false,
      useCodeBlocks: true,
      sanitizeComments: true,
      gitRevision: 'main',
      sourceLinkTemplate:
        'https://github.com/rikisamurai/guoba-ai/blob/{gitRevision}/{path}#L{line}',
      excludeScopesInPaths: true,
      frontmatterGlobals: { layout: 'docs' },
    } as Parameters<typeof Application.bootstrapWithPlugins>[0],
    [new TSConfigReader()],
  )) as MarkdownApplication

  app.renderer.on(MarkdownPageEvent.BEGIN, page => {
    page.frontmatter = {
      ...page.frontmatter,
      title: page.model?.name ?? 'API Reference',
    }
  })

  const project = await app.convert()
  if (!project) throw new Error(`TypeDoc failed to convert package "${pkg.name}"`)
  await app.generateOutputs(project)
}
