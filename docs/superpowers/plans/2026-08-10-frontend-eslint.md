# Frontend ESLint Configuration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make ESLint validate the frontend's React, TypeScript, accessibility, hooks, refresh, and imports with type information.

**Architecture:** Compose maintained ESLint 9 flat presets locally and scope them by runtime: shared type-aware rules for all TypeScript, browser/React rules for `src`, Vitest globals for tests, and Node globals for tool configuration. Keep formatting outside ESLint and fix only behavior-preserving findings exposed by the new checks.

**Tech Stack:** ESLint 9, TypeScript 5.9, typescript-eslint, React 19, eslint-plugin-react, eslint-plugin-react-hooks, eslint-plugin-react-refresh, eslint-plugin-jsx-a11y, eslint-plugin-import-x, eslint-import-resolver-typescript, Yarn 4.

## Global Constraints

- Keep changes limited to lint configuration, required development dependencies, and focused fixes for violations exposed by the new rules.
- Do not introduce formatting rules, change TypeScript strictness, or alter application behavior.
- Do not weaken rule categories merely to obtain a passing command.
- Do not modify backend files or unrelated concurrent frontend work.

## File Structure

- Modify `frontend/package.json` and `frontend/yarn.lock`: record maintained ESLint 9-compatible tooling.
- Modify `frontend/eslint.config.js`: own all lint scopes, presets, resolver settings, and narrow project-specific overrides.
- Modify `frontend/tsconfig.node.json`: include both Vite and Vitest config files in the Node TypeScript project.
- Modify existing `frontend/src/**/*.{ts,tsx}` only when a new rule identifies a legitimate violation; changes must preserve behavior.

---

### Task 1: Install and Configure the Lint Toolchain

**Files:**
- Modify: `frontend/package.json`
- Modify: `frontend/yarn.lock`
- Modify: `frontend/eslint.config.js`
- Modify: `frontend/tsconfig.node.json`

**Interfaces:**
- Consumes: existing `yarn lint` script and TypeScript projects.
- Produces: `yarn lint` coverage for JavaScript, TypeScript, TSX, React, accessibility, hooks, refresh, and imports.

- [ ] **Step 1: Capture the ineffective baseline**

Run:

```bash
cd frontend
yarn lint
yarn eslint src/App.tsx
```

Expected: commands exit successfully without validating TSX because the current config only targets `js` and `jsx` files.

- [ ] **Step 2: Add required development dependencies**

Run:

```bash
cd frontend
yarn add --dev typescript-eslint eslint-plugin-react eslint-plugin-jsx-a11y eslint-plugin-import-x eslint-import-resolver-typescript
```

Expected: `package.json` and `yarn.lock` contain the new lint packages with ESLint 9-compatible resolved versions.

- [ ] **Step 3: Replace the flat config with runtime-specific scopes**

Implement this structure in `frontend/eslint.config.js`:

```js
import js from '@eslint/js'
import { defineConfig, globalIgnores } from 'eslint/config'
import importX from 'eslint-plugin-import-x'
import jsxA11y from 'eslint-plugin-jsx-a11y'
import react from 'eslint-plugin-react'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import globals from 'globals'
import tseslint from 'typescript-eslint'

const typescriptFiles = ['**/*.{ts,tsx}']

export default defineConfig([
  globalIgnores(['dist', 'coverage']),
  {
    files: ['**/*.{js,mjs,cjs}'],
    extends: [js.configs.recommended],
    languageOptions: { globals: globals.node },
  },
  {
    files: typescriptFiles,
    extends: [
      js.configs.recommended,
      tseslint.configs.recommendedTypeChecked,
      tseslint.configs.stylisticTypeChecked,
      importX.flatConfigs.recommended,
      importX.flatConfigs.typescript,
    ],
    languageOptions: {
      parserOptions: {
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    settings: {
      'import-x/resolver': { typescript: true },
    },
    rules: {
      'import-x/order': [
        'error',
        {
          alphabetize: { order: 'asc', caseInsensitive: true },
          groups: ['builtin', 'external', 'internal', 'parent', 'sibling', 'index', 'type'],
          'newlines-between': 'always',
        },
      ],
    },
  },
  {
    files: ['src/**/*.{ts,tsx}'],
    extends: [
      react.configs.flat.recommended,
      react.configs.flat['jsx-runtime'],
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
      jsxA11y.flatConfigs.recommended,
    ],
    languageOptions: { globals: globals.browser },
    settings: { react: { version: 'detect' } },
    rules: { 'react/prop-types': 'off' },
  },
  {
    files: ['src/**/*.test.{ts,tsx}', 'src/test/**/*.{ts,tsx}'],
    languageOptions: { globals: globals.vitest },
  },
  {
    files: ['*.config.ts'],
    languageOptions: { globals: globals.node },
  },
])
```

If an installed plugin exposes the same documented flat preset under a slightly different property name, use that documented property without changing the intended coverage.

- [ ] **Step 4: Include Vitest config in the Node TypeScript project**

Change `frontend/tsconfig.node.json` to:

```json
"include": ["vite.config.ts", "vitest.config.ts"]
```

Expected: type-aware ESLint can associate both top-level TypeScript configuration files with a project.

- [ ] **Step 5: Run ESLint and retain its findings**

Run:

```bash
cd frontend
yarn lint
```

Expected: ESLint parses TS/TSX and reports actionable existing findings rather than ignored files or parser-project errors.

### Task 2: Resolve Findings and Verify the Frontend

**Files:**
- Modify: only the `frontend/src/**/*.{ts,tsx}` files named by ESLint, plus config files if a rule/preset integration needs a narrow correction.

**Interfaces:**
- Consumes: the expanded lint configuration from Task 1.
- Produces: a lint-clean frontend with unchanged runtime behavior.

- [ ] **Step 1: Auto-fix deterministic import ordering**

Run:

```bash
cd frontend
yarn lint --fix
```

Expected: ESLint fixes safe import ordering and reports any semantic findings that require review.

- [ ] **Step 2: Fix remaining findings narrowly**

For each remaining error, inspect the owning code and make the smallest type-safe, behavior-preserving correction. Do not add blanket `eslint-disable` comments or turn off a recommended preset. Run after each focused batch:

```bash
cd frontend
yarn lint
```

Expected: zero ESLint errors.

- [ ] **Step 3: Run regression and production checks**

Run:

```bash
cd frontend
yarn lint
yarn test --run
yarn build
```

Expected: all commands exit with status 0.

- [ ] **Step 4: Review the final diff**

Run:

```bash
git diff --check
git status --short
git diff -- frontend/package.json frontend/yarn.lock frontend/eslint.config.js frontend/tsconfig.node.json frontend/src
```

Expected: no whitespace errors, no backend changes, no unrelated files added, and source edits are limited to findings from the new rules.
