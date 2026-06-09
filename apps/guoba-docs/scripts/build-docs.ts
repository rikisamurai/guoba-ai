import { buildAllDocs } from '../lib/docs-pipeline'
import { packages } from '../lib/packages'

await buildAllDocs(packages)
console.warn('✅ TypeDoc + postprocess complete.')
