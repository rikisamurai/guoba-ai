# @guoba-ai/hook

[![npm](https://img.shields.io/npm/v/@guoba-ai/hook.svg)](https://www.npmjs.com/package/@guoba-ai/hook)
[![License: MIT](https://img.shields.io/badge/license-MIT-blue.svg)](https://github.com/rikisamurai/guoba-ai/blob/main/LICENSE)

A small collection of React hooks — ESM-only, fully typed.

## Installation

```bash
pnpm add @guoba-ai/hook
```

Requires **React 18+** as a peer dependency.

## Usage

```tsx
import { useDebounce, useToggle } from '@guoba-ai/hook'
import { useState } from 'react'

function Example() {
  const [on, toggle] = useToggle(false)
  const [q, setQ] = useState('')
  const debouncedQ = useDebounce(q, 300)
  // ...
}
```

## Available Hooks

- `useDebounce` — debounce a value
- `useThrottle` — throttle a value
- `useToggle` — boolean state with toggle
- `usePrevious` — read the previous render's value
- `useMount` — run callback on mount
- `useUnmount` — run callback on unmount
- `useSyncState` — state with ref-sync access

📖 **Full API reference** → [guoba-ai.vercel.app/docs/hooks](https://guoba-ai.vercel.app/docs/hooks)

## License

[MIT](https://github.com/rikisamurai/guoba-ai/blob/main/LICENSE)
