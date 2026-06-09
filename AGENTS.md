# AGENTS.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.


Guidance for Codex and compatible coding agents working from the guoba-ai repo root.

## Scope

This is a pnpm monorepo with:

- `packages/guoba-utils/` - TypeScript utility library, published as `@guoba-ai/utils`
- `packages/guoba-hook/` - React hook library, published as `@guoba-ai/hook`
- `apps/guoba-docs/` - Next.js + fumadocs documentation site

## Root Commands

```bash
pnpm lint        # run oxlint
pnpm lint:fix    # auto-fix lint issues

pnpm fmt         # run oxfmt
pnpm fmt:check   # check formatting

pnpm dev:docs    # generate docs, then start docs dev server
pnpm build:docs  # generate docs, then build docs site
```

## Verification

- Repo-wide config, dependency, or package graph changes: run the relevant root checks, usually `pnpm lint`, `pnpm test -- --run`, and `pnpm build`.
- Package-only changes: follow that package's `AGENTS.md` first, then add root checks only when shared behavior changed.
- Docs app changes: follow `apps/guoba-docs/AGENTS.md`.
- Before publishing PR updates, run `git diff --check`.

## Conventions

- Use pnpm only. Do not add npm or yarn lockfiles.
- Node >= 24 and ESM are the repo defaults.
- Public package exports should have JSDoc because docs are generated from package source.
- Do not manually edit generated docs output unless the task is specifically about generated artifacts.
