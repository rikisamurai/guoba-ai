import { fileURLToPath } from 'node:url'
import antfu from '@antfu/eslint-config'
import oxlint from 'eslint-plugin-oxlint'

type AntfuOptions = Parameters<typeof antfu>[0]

const sharedIgnores = [
  '**/dist/**',
  '**/.next/**',
  '**/.source/**',
  '**/node_modules/**',
  '**/next-env.d.ts',
]

// Resolve the root .oxlintrc.json from this file's location so workspace
// configs that re-export createConfig still pick up the same oxlint rules.
const oxlintConfigPath = fileURLToPath(new URL('./.oxlintrc.json', import.meta.url))

// eslint-plugin-oxlint exposes buildFromOxlintConfigFile to disable every
// ESLint rule that overlaps with what oxlint already checks. Spread it at the
// END of the config array so it wins over earlier enables from @antfu/eslint-config.
const oxlintCompat = oxlint.buildFromOxlintConfigFile(oxlintConfigPath)

export function createConfig(options: AntfuOptions = {}): ReturnType<typeof antfu> {
  return antfu({
    type: 'lib',
    typescript: true,
    ...options,
    ignores: [...sharedIgnores, ...(options.ignores ?? [])],
  }).append(...oxlintCompat)
}
