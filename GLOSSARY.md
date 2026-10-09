# CONTEXT

Project-specific vocabulary. Use these terms exactly when discussing the domain, in code, types, configs, and conversation. Add a term here the moment it becomes load-bearing — don't let undocumented concepts spread.

## Docs site

The docs site (`apps/guoba-docs`) renders generated API reference for each published package. Every package picks one of two layouts:

**`topical`**
A package is a set of topical modules; each module renders as its own docs page. The reader navigates by topic.
Today: `@guoba-ai/utils` (one page each for array, async, guard, object, string, types).
TypeDoc input: one `entryPoint` per source file.

**`flat`**
A package is a single surface; all exports render as one flat list. The reader scans, doesn't navigate.
Today: `@guoba-ai/hook` (every hook in one list).
TypeDoc input: a single barrel `entryPoint` (`src/index.ts`).

The layout choice is a UX decision per package, not a technical accident. It belongs to the package, not to the docs build.
