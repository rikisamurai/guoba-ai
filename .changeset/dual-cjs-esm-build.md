---
"@guoba-ai/utils": patch
"@guoba-ai/hook": patch
---

Ship dual ESM + CJS build so Metro / React Native and other resolvers that don't honor the `exports` field can resolve the package via `main`. Adds `./dist/index.cjs` + `./dist/index.d.cts` outputs alongside the existing `.mjs` / `.d.mts`, plus a `require` exports condition. No API changes.
