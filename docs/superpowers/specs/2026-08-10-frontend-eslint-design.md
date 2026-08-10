# Frontend ESLint Configuration Design

## Scope

Replace the frontend's minimal JavaScript-only ESLint configuration with an ESLint 9 flat configuration that understands the existing React 19 and TypeScript 5.9 codebase. Keep the change limited to lint configuration, required development dependencies, and focused fixes for violations exposed by the new rules. Do not introduce formatting rules, change TypeScript strictness, or alter application behavior.

## Configuration Architecture

Compose maintained flat presets directly in `frontend/eslint.config.js` rather than adopting a third-party opinionated shared config. The configuration will use separate scopes so each file receives the correct parser, runtime globals, and rules:

- Ignore generated output and coverage directories globally.
- Apply baseline JavaScript recommendations to JavaScript configuration files.
- Apply type-aware TypeScript recommendations to TypeScript and TSX files using the repository's existing TypeScript project configuration.
- Apply browser globals and React rules to application source files.
- Apply Vitest globals to tests and test setup files.
- Apply Node globals to Vite, Vitest, and ESLint configuration files.

React configuration will support the automatic JSX runtime and detect the installed React version. React Hooks and React Refresh recommendations will remain enabled.

## Rule Coverage

The resulting setup will cover:

- Type-aware TypeScript correctness, including unsafe operations and unnecessary type constructs.
- React component and JSX correctness without requiring legacy `React` imports.
- Rules of Hooks and hook dependency correctness.
- Vite React Refresh export safety.
- JSX accessibility, including semantic elements, labels, keyboard interaction, and ARIA validity.
- TypeScript-aware import resolution, duplicate detection, and deterministic import grouping/order.

Formatting concerns such as quote style, semicolons, and line width remain outside ESLint. Rules will only be overridden when they conflict with the project's runtime, toolchain, or an intentional established pattern; overrides will be narrow and documented by the config structure.

## Dependencies

Add maintained ESLint 9-compatible development dependencies for:

- TypeScript parsing and type-aware lint presets.
- React component linting.
- JSX accessibility linting.
- Import linting and TypeScript module resolution.

Retain the existing ESLint, JavaScript, Hooks, React Refresh, and globals packages. Dependency versions will follow the existing Yarn lockfile and be recorded in `frontend/package.json` and `frontend/yarn.lock`.

## Existing Violations

Run the expanded lint configuration against the current frontend. Fix legitimate findings with the smallest behavior-preserving code changes. Do not disable categories of checks merely to produce a passing command, and do not modify unrelated backend files or overwrite concurrent work.

## Verification

Verification will run from `frontend/`:

1. `yarn lint` to validate the complete ESLint configuration and frontend source.
2. `yarn test --run` to detect regressions in existing component behavior.
3. `yarn build` to confirm TypeScript and Vite production compilation.

Success means all three commands pass with the new rules enabled. Any toolchain limitation or remaining intentional exception will be reported explicitly.
