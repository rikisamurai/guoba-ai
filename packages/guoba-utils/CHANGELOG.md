# @guoba-ai/utils

## 0.1.0

### Minor Changes

- c4ebee4: Add array, number, and guard utility helpers.

## 0.0.4

### Patch Changes

- 9ca1472: Ship dual ESM + CJS build so Metro / React Native and other resolvers that don't honor the `exports` field can resolve the package via `main`. Adds `./dist/index.cjs` + `./dist/index.d.cts` outputs alongside the existing `.mjs` / `.d.mts`, plus a `require` exports condition. No API changes.

## 0.0.3

### Patch Changes

- Add `sleep(ms)` async helper — a Promise-based delay so consumers can `await sleep(100)` instead of hand-rolling `new Promise(r => setTimeout(r, ms))`.
- 69b3f63: init package
