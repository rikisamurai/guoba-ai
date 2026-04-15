import { defineConfig, defineDocs } from 'fumadocs-mdx/config'
import {
  createFileSystemGeneratorCache,
  createGenerator,
  remarkAutoTypeTable,
} from 'fumadocs-typescript'

const generator = createGenerator({
  cache: createFileSystemGeneratorCache('.next/fumadocs-typescript'),
})

export const docs = defineDocs({
  dir: 'content/docs',
})

export default defineConfig({
  mdxOptions: {
    remarkPlugins: [[remarkAutoTypeTable, { generator }]],
  },
})
