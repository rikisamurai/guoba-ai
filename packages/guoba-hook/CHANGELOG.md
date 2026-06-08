# @guoba-ai/hook

## 0.0.3

### Patch Changes

- 9ca1472: Ship dual ESM + CJS build so Metro / React Native and other resolvers that don't honor the `exports` field can resolve the package via `main`. Adds `./dist/index.cjs` + `./dist/index.d.cts` outputs alongside the existing `.mjs` / `.d.mts`, plus a `require` exports condition. No API changes.

## 0.0.2

### Patch Changes

- 69b3f63: init package
