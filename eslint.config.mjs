import antfu from '@antfu/eslint-config'

export default antfu({
  type: 'lib',
  typescript: true,
  ignores: ['docs/**', '**/next-env.d.ts'],
})
