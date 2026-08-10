# Job Search UI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a public, backend-powered job search interface whose applied filters are stored in the listing route URL.

**Architecture:** `JobList` reads and writes supported filters with React Router’s `useSearchParams`. A typed API helper serializes only supported filters, while an abortable `useJobs` hook owns request state. Focused Welcome UI components render controls and results without duplicating job cards.

**Tech Stack:** React 19, React Router 7, TypeScript 5.9, Welcome UI 10, Tailwind CSS 4, Vitest, Testing Library.

## Global Constraints

- Preserve the existing Welcome UI appearance; do not redesign the application.
- Keep search public and perform filtering through `GET /api/jobs`.
- Use only `title`, `location`, and `work_mode` URL/query parameters.
- Treat the URL as the applied-filter source of truth.
- Add no dependencies and do not modify backend-owned files.
- Keep detail and application links working.
- Use test-driven development and stop after each task for review.

---

## File Structure

- `frontend/src/types.ts`: shared `WorkMode` and `JobSearchParams` contracts.
- `frontend/src/api/jobs.ts`: query normalization, URL serialization, response validation, and job-list request.
- `frontend/src/hooks/useJobs.ts`: abortable loading/success/error state for a filter set.
- `frontend/src/components/JobSearchForm/index.tsx`: URL-derived filter form using Welcome UI.
- `frontend/src/components/JobResults/index.tsx`: loading, error, empty, and existing job-card rendering.
- `frontend/src/pages/JobList.tsx`: route composition, URL updates, authentication header, and create-job action.
- Colocated `*.test.ts(x)` files: focused regression coverage.

### Task 1: Typed Search Contract and Data Layer

**Files:**
- Modify: `frontend/src/types.ts`
- Create: `frontend/src/api/jobs.ts`
- Create: `frontend/src/api/jobs.test.ts`
- Create: `frontend/src/hooks/useJobs.ts`
- Create: `frontend/src/hooks/useJobs.test.tsx`

**Interfaces:**
- Produces: `type WorkMode = "onsite" | "remote" | "hybrid"`.
- Produces: `interface JobSearchParams { title?: string; location?: string; work_mode?: WorkMode }`.
- Produces: `buildJobsSearchParams(filters: JobSearchParams): URLSearchParams`.
- Produces: `fetchJobs(filters: JobSearchParams, signal?: AbortSignal): Promise<Job[]>`.
- Produces: `useJobs(filters: JobSearchParams): { jobs: Job[]; status: "loading" | "success" | "error"; error: string | null; retry: () => void }`.

- [ ] **Step 1: Write failing API tests**

Cover trimming/omitting empty values, preserving all supported values, requesting the expected `/api/jobs?...` URL, returning validated data, and throwing a stable message for non-OK responses.

- [ ] **Step 2: Run the API tests and verify expected failures**

Run: `cd frontend && yarn test src/api/jobs.test.ts --run`

Expected: FAIL because `src/api/jobs.ts` does not exist.

- [ ] **Step 3: Add minimal shared types and API implementation**

Normalize with `URLSearchParams`; do not serialize blank values. Parse JSON as `unknown` and use a small `isJob` type guard before returning `Job[]`. Throw `Unable to load jobs. Please try again.` for an unsuccessful response or invalid payload.

- [ ] **Step 4: Run API tests and verify they pass**

Run: `cd frontend && yarn test src/api/jobs.test.ts --run`

Expected: all API tests PASS.

- [ ] **Step 5: Write failing hook tests**

Use `renderHook` to cover initial loading, successful results, error state, retry, and aborting the previous request when primitive filter values change.

- [ ] **Step 6: Run hook tests and verify expected failures**

Run: `cd frontend && yarn test src/hooks/useJobs.test.tsx --run`

Expected: FAIL because `useJobs` does not exist.

- [ ] **Step 7: Implement the minimal abortable hook**

Destructure `title`, `location`, and `work_mode` so the effect depends only on primitive filter values plus a retry counter. Abort cleanup must not set an error state.

- [ ] **Step 8: Verify checkpoint 1**

Run:

```bash
cd frontend
yarn test src/api/jobs.test.ts src/hooks/useJobs.test.tsx --run
yarn build
```

Expected: focused tests and TypeScript production build PASS.

- [ ] **Step 9: Commit checkpoint 1**

```bash
git add frontend/src/types.ts frontend/src/api/jobs.ts frontend/src/api/jobs.test.ts frontend/src/hooks/useJobs.ts frontend/src/hooks/useJobs.test.tsx
git commit -m "feat(frontend): add typed job search data layer"
```

### Task 2: Welcome UI Search and Result Components

**Files:**
- Create: `frontend/src/components/JobSearchForm/index.tsx`
- Create: `frontend/src/components/JobSearchForm/index.test.tsx`
- Create: `frontend/src/components/JobResults/index.tsx`
- Create: `frontend/src/components/JobResults/index.test.tsx`

**Interfaces:**
- Consumes: `JobSearchParams`, `WorkMode`, and the `useJobs` state shape.
- Produces: `JobSearchForm({ filters, loading, onSubmit, onClear })`.
- Produces: `JobResults({ jobs, status, error, hasFilters, onClear, onRetry })`.

- [ ] **Step 1: Write failing search-form tests**

Cover URL-derived initial values, accessible labels, submitting the three supported filters, synchronizing after prop changes, loading-disabled submission, and clear visibility/behavior.

- [ ] **Step 2: Verify form tests fail because the component is missing**

Run: `cd frontend && yarn test src/components/JobSearchForm/index.test.tsx --run`

- [ ] **Step 3: Implement the minimal Welcome UI form**

Use `Field`, `InputText`, `Select`, and `Button`. Keep draft values local, synchronize them from `filters`, and submit a normalized `JobSearchParams` object. Use a normal semantic `<form>`.

- [ ] **Step 4: Verify search-form tests pass**

Run: `cd frontend && yarn test src/components/JobSearchForm/index.test.tsx --run`

- [ ] **Step 5: Write failing result-state tests**

Cover loading status, error with retry, empty feedback with conditional clear action, and successful cards retaining job detail/application links.

- [ ] **Step 6: Implement one result renderer**

Use existing `Text`, `Loader`, `Hint`, `Button`, `Card`, and `Tag` components. Include an `aria-live` status region and preserve the current card routes.

- [ ] **Step 7: Verify checkpoint 2**

Run:

```bash
cd frontend
yarn test src/components/JobSearchForm/index.test.tsx src/components/JobResults/index.test.tsx --run
yarn build
```

- [ ] **Step 8: Commit checkpoint 2**

```bash
git add frontend/src/components/JobSearchForm frontend/src/components/JobResults
git commit -m "feat(frontend): add job search controls and states"
```

### Task 3: Job Listing Integration and Regression Verification

**Files:**
- Modify: `frontend/src/pages/JobList.tsx`
- Create: `frontend/src/pages/JobList.test.tsx`
- Modify: `README.md`
- Modify: `TASK_CHECKLIST.md`

**Interfaces:**
- Consumes: Task 1 data contracts/hook and Task 2 UI components.
- Produces: `/` route behavior driven by `title`, `location`, and `work_mode` URL parameters.

- [ ] **Step 1: Write failing route integration tests**

Render `JobList` in a memory router. Cover initial URL restoration, submit URL updates, clear behavior, back/forward-style location updates, public results, and preserved detail/apply links. Mock only the network boundary.

- [ ] **Step 2: Verify integration tests fail against the current page**

Run: `cd frontend && yarn test src/pages/JobList.test.tsx --run`

- [ ] **Step 3: Integrate URL-derived filters**

Use `useSearchParams`; parse only valid supported values. Submitting replaces the supported query string with `buildJobsSearchParams(filters)`. Clearing removes supported filters. Pass URL-derived filters to `useJobs` and compose the two new components beneath the existing header/authentication controls.

- [ ] **Step 4: Verify route tests pass**

Run: `cd frontend && yarn test src/pages/JobList.test.tsx --run`

- [ ] **Step 5: Document the delivered behavior**

Add concise README sections for supported query parameters, architecture, tests, trade-offs, known limitations, and LLM assistance. Mark only completed frontend checklist items.

- [ ] **Step 6: Run complete frontend verification**

Run:

```bash
cd frontend
yarn test --run
yarn build
yarn lint
```

Expected: all available checks PASS. Note that the existing ESLint config currently targets JavaScript/JSX rather than TypeScript/TSX.

- [ ] **Step 7: Inspect the focused diff and working tree**

Run:

```bash
git diff --check
git diff --stat
git status --short
```

Confirm no backend-owned or unrelated files are included.

- [ ] **Step 8: Commit checkpoint 3**

```bash
git add frontend/src/pages/JobList.tsx frontend/src/pages/JobList.test.tsx README.md TASK_CHECKLIST.md
git commit -m "feat(frontend): integrate URL-driven job search"
```
