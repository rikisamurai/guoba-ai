import { createConfig } from '../../eslint.base'

export default createConfig({
  type: 'lib',
  react: true,
}).append({
  name: 'guoba-hook/disable-react-refresh',
  rules: {
    // React Fast Refresh is for HMR in app dev; not relevant to a hook library.
    // Disabling avoids false positives in README tsx code blocks.
    'react-refresh/only-export-components': 'off',
  },
})
