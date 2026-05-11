# P1-2 Changesets Release Automation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Replace hand-rolled `pnpm build && pnpm publish` with `@changesets/cli` + GitHub Actions release workflow, enabling versioned CHANGELOG and npm provenance for `@guoba-ai/utils` and `@guoba-ai/hook`.

**Architecture:** Changesets manages per-package versioning via markdown files in `.changeset/`. The `changesets/action@v1` GitHub Action reads them, opens a "Version Packages" PR when changesets exist on `main`, and publishes to npm when that PR merges. `NPM_CONFIG_PROVENANCE=true` + `id-token: write` in the workflow makes npm attach SLSA provenance to each tarball.

**Tech Stack:** `@changesets/cli@^2`, `changesets/action@v1`, GitHub Actions (ubuntu-latest, Node 24, pnpm 10.33), npm (public registry).

**Context:**

- `docs/repo-optimization-review.md` P1-2 is the source requirement
- Current state: both `packages/*/package.json` have `"release": "pnpm build && pnpm publish"`, no `.changeset/` dir, no `release.yml` workflow, `.npmrc` has no auth, CI workflow `permissions: contents: read`
- Public repo `rikisamurai/guoba-ai` (provenance requires public repo ✓)
- `apps/docs` is `"private": true`, so Changesets won't try to version it; still pin with `ignore`
- pnpm workspace at root; current `packageManager` in root `package.json` is `pnpm@10.33.0`

---

## File Structure

| Operation | Path                                | Responsibility                                                             |
| --------- | ----------------------------------- | -------------------------------------------------------------------------- |
| Create    | `.changeset/config.json`            | Changesets behavior (access, baseBranch, ignore)                           |
| Create    | `.changeset/README.md`              | Auto-generated explainer from `changeset init`                             |
| Create    | `.github/workflows/release.yml`     | Release/publish automation                                                 |
| Modify    | `package.json` (root)               | Add `@changesets/cli` devDep + `changeset` / `version` / `release` scripts |
| Modify    | `packages/guoba-utils/package.json` | Add `publishConfig.provenance: true`, remove `release` script              |
| Modify    | `packages/guoba-hook/package.json`  | Same as above                                                              |

---

## Task 1: Install Changesets CLI

**Files:**

- Modify: `package.json` (root, devDependencies)
- Modify: `pnpm-lock.yaml` (auto-updated)

- [ ] **Step 1: Add the dep**

Run: `pnpm add -Dw @changesets/cli`

Expected: root `package.json` `devDependencies` now contains `"@changesets/cli": "^2.x.x"`; `pnpm-lock.yaml` updated.

- [ ] **Step 2: Verify install**

Run: `pnpm exec changeset --version`
Expected: prints `2.x.x` (e.g. `2.29.8`), exit 0.

- [ ] **Step 3: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "chore: add @changesets/cli"
```

---

## Task 2: Initialize Changesets Config

**Files:**

- Create: `.changeset/config.json`
- Create: `.changeset/README.md`

- [ ] **Step 1: Run init**

Run: `pnpm exec changeset init`
Expected: creates `.changeset/config.json` with defaults and `.changeset/README.md`.

- [ ] **Step 2: Override config**

Write `.changeset/config.json`:

```json
{
  "$schema": "https://unpkg.com/@changesets/config@3.0.0/schema.json",
  "changelog": "@changesets/cli/changelog",
  "commit": false,
  "fixed": [],
  "linked": [],
  "access": "public",
  "baseBranch": "main",
  "updateInternalDependencies": "patch",
  "ignore": ["docs"]
}
```

Rationale for each changed field:

- `access: "public"` — both packages are public npm packages (scoped `@guoba-ai/*`)
- `baseBranch: "main"` — we don't use `master`
- `ignore: ["docs"]` — the `docs` workspace is private but explicit belt-and-suspenders
- `commit: false` — release workflow creates the version commit; don't auto-commit from local `changeset add`

- [ ] **Step 3: Verify status**

Run: `pnpm exec changeset status`
Expected: output like `NO changesets ready to be released.` (exit 0).

- [ ] **Step 4: Commit**

```bash
git add .changeset
git commit -m "chore: init changesets config"
```

---

## Task 3: Wire Root Scripts

**Files:**

- Modify: `package.json` (root, `scripts`)

- [ ] **Step 1: Add three scripts**

In root `package.json`, extend `"scripts"` with (keep existing scripts untouched):

```json
{
  "scripts": {
    "build": "pnpm -r run build",
    "dev": "pnpm -r run dev",
    "lint": "pnpm -r --parallel run lint && eslint . --max-warnings 0",
    "lint:fix": "pnpm -r --parallel run lint:fix && eslint . --fix --max-warnings 0",
    "test": "pnpm -r run test",
    "docs:dev": "pnpm --filter docs dev",
    "docs:build": "pnpm --filter docs build",
    "changeset": "changeset",
    "version": "changeset version",
    "release": "pnpm -r --filter \"./packages/*\" run build && changeset publish"
  }
}
```

Rationale:

- `changeset` — shortcut for interactive `pnpm changeset`
- `version` — consumed by release workflow's `version:` input
- `release` — consumed by workflow's `publish:` input; builds both packages before publishing (tsdown must produce `dist/` first)

- [ ] **Step 2: Sanity-check the scripts exist**

Run: `pnpm run` (lists scripts)
Expected: `changeset`, `version`, `release` visible.

- [ ] **Step 3: Commit**

```bash
git add package.json
git commit -m "chore: add changeset / version / release scripts"
```

---

## Task 4: Update Package Manifests

**Files:**

- Modify: `packages/guoba-utils/package.json`
- Modify: `packages/guoba-hook/package.json`

- [ ] **Step 1: `guoba-utils` — add provenance, drop release script**

In `packages/guoba-utils/package.json`:

- Under `"publishConfig"` change from `{"access": "public"}` to `{"access": "public", "provenance": true}`
- Remove the `"release": "pnpm build && pnpm publish"` line from `"scripts"`

Resulting `publishConfig`:

```json
"publishConfig": {
  "access": "public",
  "provenance": true
}
```

- [ ] **Step 2: `guoba-hook` — same changes**

Mirror Step 1 on `packages/guoba-hook/package.json`.

- [ ] **Step 3: Re-lint**

Run: `pnpm lint`
Expected: both packages pass (possible re-sort by `jsonc/sort-keys` rule; if so, run `pnpm --filter @guoba-ai/utils lint:fix && pnpm --filter @guoba-ai/hook lint:fix` then re-run `pnpm lint`).

- [ ] **Step 4: Verify no script regression**

Run: `pnpm -r --filter './packages/*' run test:type && pnpm test && pnpm build`
Expected: all green, tsdown produces `dist/` for both packages.

- [ ] **Step 5: Commit**

```bash
git add packages/guoba-utils/package.json packages/guoba-hook/package.json
git commit -m "chore(pkg): enable npm provenance, drop hand-rolled release script"
```

---

## Task 5: Add Release Workflow

**Files:**

- Create: `.github/workflows/release.yml`

- [ ] **Step 1: Write the workflow**

Create `.github/workflows/release.yml`:

```yaml
name: Release

on:
  push:
    branches: [main]

concurrency:
  group: release-${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: false

permissions:
  contents: write # create tags + commit the version PR
  pull-requests: write # open / update the "Version Packages" PR
  id-token: write # OIDC token required for npm provenance

jobs:
  release:
    name: Release
    runs-on: ubuntu-latest
    timeout-minutes: 15

    steps:
      - uses: actions/checkout@v6
        with:
          fetch-depth: 0

      - name: Setup pnpm
        uses: pnpm/action-setup@v6

      - name: Setup Node.js
        uses: actions/setup-node@v6
        with:
          node-version: 24
          cache: pnpm
          registry-url: https://registry.npmjs.org

      - name: Install dependencies
        run: pnpm install --frozen-lockfile

      - name: Create Release Pull Request or Publish
        uses: changesets/action@v1
        with:
          publish: pnpm release
          version: pnpm version
          commit: 'chore: version packages'
          title: 'chore: version packages'
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          NPM_TOKEN: ${{ secrets.NPM_TOKEN }}
          NPM_CONFIG_PROVENANCE: 'true'
```

Notes (do NOT paste into the file — these are rationale):

- `fetch-depth: 0` — changesets needs full history to diff against main
- `registry-url: https://registry.npmjs.org` — makes `setup-node` write `~/.npmrc` with `//registry.npmjs.org/:_authToken=${NPM_TOKEN}`, so `pnpm publish` picks up the token
- `cancel-in-progress: false` — never cancel a publish mid-flight
- `changesets/action` internally runs `version:` when pending changesets exist (opens PR), and `publish:` when the version PR merges
- `NPM_CONFIG_PROVENANCE=true` — belt-and-suspenders; `publishConfig.provenance: true` already covers this, but the env var guarantees it under all pnpm/npm version combos

- [ ] **Step 2: Syntax-check the workflow file**

Run: `pnpm dlx yaml-lint .github/workflows/release.yml` (if fails due to missing tool, skip — GitHub will validate on push)
Also run: `git diff --check .github/workflows/release.yml` (catch trailing whitespace)
Expected: no errors.

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/release.yml
git commit -m "ci: add changesets release workflow"
```

---

## Task 6: End-to-End Dry-Run Verification

**Files:** none (local-only, no file changes)

- [ ] **Step 1: Simulate a patch changeset**

Run: `pnpm changeset` and interactively:

- Select both `@guoba-ai/utils` and `@guoba-ai/hook`
- Pick `patch` for both (no need to pick `minor`/`major`)
- Summary: `test: dry-run changeset` (will be thrown away)

Expected: a new `.changeset/*.md` file is written with frontmatter listing both packages.

- [ ] **Step 2: Preview version bump (do not commit)**

Run: `pnpm version`
Expected:

- `packages/guoba-utils/package.json` version → `0.0.3`
- `packages/guoba-hook/package.json` version → `0.0.2`
- `packages/*/CHANGELOG.md` generated with the summary entry
- The `.changeset/*.md` file we just added is deleted

- [ ] **Step 3: Roll back the dry-run**

Run:

```bash
git checkout -- packages/guoba-utils/package.json packages/guoba-hook/package.json
git clean -fd .changeset packages/guoba-utils packages/guoba-hook
```

Expected: `git status` clean except no new tracked changes. Double-check with `git status` and `ls .changeset/` (should only contain `config.json` and `README.md`).

- [ ] **Step 4: Confirm CI still passes locally**

Run: `pnpm lint && pnpm -r --filter './packages/*' run test:type && pnpm test && pnpm build`
Expected: all green.

- [ ] **Step 5: User-side setup reminder (output only, no edit)**

Print to the user:

> Before the first real release, add `NPM_TOKEN` (Automation Token with Publish scope) under GitHub repo Settings → Secrets and variables → Actions. Without it, the `Release` workflow will fail at the publish step but will NOT break the repo.

No commit needed for this step.

---

## Task 7: Update Review Doc

**Files:**

- Modify: `docs/repo-optimization-review.md`

- [ ] **Step 1: Flip P1-2 to ✅**

In `docs/repo-optimization-review.md`, change:

```markdown
### P1-2. 引入 Changesets 自动化发版

- 现状：每个包的 `release` 脚本是 `pnpm build && pnpm publish`，无版本管理、无 CHANGELOG
- 改：`pnpm add -Dw @changesets/cli` → `pnpm changeset init`；新增 `.github/workflows/release.yml`（changesets/action），开启 `--provenance` 提升 npm 信任；删除手写 release 脚本
```

To:

```markdown
### P1-2. 引入 Changesets 自动化发版 ✅

- 已接入 `@changesets/cli` + `.github/workflows/release.yml`（changesets/action）
- 两包 `publishConfig.provenance: true` 已开启，手写 `release` 脚本已删除
- 首次发版前需在仓库 Settings 添加 `NPM_TOKEN` secret
```

- [ ] **Step 2: Commit**

```bash
git add docs/repo-optimization-review.md
git commit -m "docs: mark P1-2 changesets as done"
```

---

## Self-Review Checklist

- **Spec coverage**: every bullet from review P1-2 is covered
  - `@changesets/cli` → Task 1
  - `changeset init` → Task 2
  - `.github/workflows/release.yml` → Task 5
  - `--provenance` → Task 4 (publishConfig) + Task 5 (env var)
  - delete hand-written release → Task 4
- **No placeholders**: all JSON / YAML / shell shown in full, no TBDs
- **Type consistency**: script names (`version`, `release`) match between root `package.json` (Task 3) and workflow `with:` block (Task 5)

---

## Risks & Rollback

| Risk                                           | Mitigation                                                                                         |
| ---------------------------------------------- | -------------------------------------------------------------------------------------------------- |
| `NPM_TOKEN` missing in CI → publish step fails | Release PR still merges fine; workflow fails non-destructively, can retry after adding secret      |
| Provenance fails (OIDC not set up)             | Remove `id-token: write` from `release.yml` and set `publishConfig.provenance: false`; re-run      |
| Changesets accidentally bumps `docs`           | `ignore: ["docs"]` + `private: true` on the app — double safeguard                                 |
| First real version PR looks wrong              | Don't merge the "Version Packages" PR until a human reviews `packages/*/CHANGELOG.md` and versions |

---

## Execution Notes

- Tasks 1-5 can be executed back-to-back; Task 6 is a local-only verification and the only point where we purposefully do NOT commit intermediate state
- Total ~7 commits (Tasks 1, 2, 3, 4, 5, 7 = 6 + possible lint-fix commit if keys re-sort)
- Do NOT `git push` at the end — leave that as an explicit user decision
