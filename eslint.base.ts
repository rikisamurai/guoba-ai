import antfu from '@antfu/eslint-config'

type AntfuOptions = Parameters<typeof antfu>[0]

const sharedIgnores = [
  '**/dist/**',
  '**/.next/**',
  '**/.source/**',
  '**/node_modules/**',
  '**/next-env.d.ts',
]

export function createConfig(options: AntfuOptions = {}): ReturnType<typeof antfu> {
  return antfu({
    type: 'lib',
    typescript: true,
    ...options,
    ignores: [...sharedIgnores, ...(options.ignores ?? [])],
  })
}
