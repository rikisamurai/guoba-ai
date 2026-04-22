import { createConfig } from '../../eslint.base'

export default createConfig({
  type: 'app',
  react: true,
  ignores: ['content/docs/utils/**', 'content/docs/hooks/**'],
})
