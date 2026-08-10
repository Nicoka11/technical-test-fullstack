# Job Search Technical Test Checklist

## P0 — Required functionality

- [x] **Implement backend job search**
  - [x] Add search/filter parameters to the Phoenix jobs endpoint.
  - [x] Support job title filtering.
  - [x] Support location filtering.
  - [x] Support work mode filtering.
  - [x] Allow multiple filters to be combined correctly.
  - [x] Return all jobs when no filters are provided.
  - [x] Ensure search is available to registered and unregistered users.
  - [x] Perform filtering on the backend, not on an already-fetched frontend list.

- [x] **Build the frontend search experience**
  - [x] Add search controls to the job-listing page.
  - [x] Connect the controls to the backend search endpoint.
  - [x] Display filtered jobs.
  - [x] Add a loading state.
  - [x] Add an empty/no-results state.
  - [x] Add an error state.
  - [x] Add a reset/clear-filters action.
  - [x] Use `welcome-ui` components and existing project conventions.

- [ ] **Verify the complete user flow**
  - [x] Confirm visitors can search without signing in.
  - [x] Confirm registered users can search.
  - [x] Confirm users can still open and apply to jobs from search results.
  - [ ] Confirm job creation, editing, deletion, and candidate features still work.

## P1 — Highest-impact evaluation criteria

- [x] **Use strong React component architecture**
  - [x] Separate search controls, results, and data-fetching responsibilities.
  - [x] Keep components focused and reusable.
  - [x] Avoid duplicating job-list rendering logic.

- [ ] **Handle hooks and state correctly**
  - [x] Keep filter state predictable.
  - [ ] Avoid unnecessary effects and duplicate requests.
  - [x] Prevent stale responses from replacing newer search results.
  - [x] Consider URL query parameters to make searches shareable and restorable.

- [x] **Maintain strict TypeScript safety**
  - [x] Define types for search parameters.
  - [x] Define types for API responses.
  - [x] Reuse existing job types where appropriate.
  - [x] Define component prop types.
  - [x] Avoid `any` and unsafe casts.

- [x] **Deliver good UI/UX**
  - [x] Use appropriate `welcome-ui` controls.
  - [x] Provide understandable labels and actions.
  - [x] Ensure keyboard accessibility and visible focus states.
  - [x] Support responsive layouts.
  - [x] Clearly show active filters and no-result feedback.

- [x] **Add meaningful tests**
  - [x] Add backend tests for each supported filter.
  - [x] Add backend tests for combined filters.
  - [x] Add a backend test for requests without filters.
  - [x] Add a backend test for searches with no matches.
  - [x] Test the chosen case-sensitivity and partial-matching behavior.
  - [x] Add frontend tests for entering and selecting filters.
  - [x] Verify the frontend sends the correct backend parameters.
  - [x] Test rendering search results.
  - [x] Test loading, empty, and error states.
  - [x] Test clearing filters.

## P2 — Submission quality

- [x] **Keep code organized and reusable**
  - [x] Follow existing repository structure and naming conventions.
  - [x] Avoid unrelated refactors.
  - [x] Justify any added dependency.

- [x] **Document important decisions in `README.md`**
  - [x] Explain how job search works.
  - [x] List supported filters.
  - [x] Document the backend endpoint and query parameters.
  - [x] Explain how to run relevant tests.
  - [x] Record key architecture decisions.
  - [x] Describe trade-offs and known limitations.
  - [x] Explain what would be improved with more time.
  - [x] Document and justify any added dependencies.

- [x] **Be transparent about LLM usage**
  - [x] Explain where and how an LLM was used.
  - [x] State what was personally reviewed, changed, and verified.

- [x] **Maintain a clear Git history**
  - [x] Create focused commits with descriptive messages.
  - [x] Suggested commit: `test: add backend job search coverage`.
  - [x] Suggested commit: `feat: implement backend job search filters`.
  - [x] Suggested commit: `test: add frontend search flow coverage`.
  - [x] Suggested commit: `feat: add job search interface`.
  - [x] Suggested commit: `docs: document search design and LLM usage`.

- [x] **Run final verification**
  - [x] Run backend tests with `mix test`.
  - [x] Run the frontend test suite.
  - [x] Run the frontend type-check command.
  - [x] Run the frontend lint command.
  - [x] Run the frontend production build.
  - [x] Manually verify the complete search flow in the browser.

## P3 — Optional enhancements

Only start these after the required feature is complete and tested.

- [ ] Add pagination compatible with search filters.
- [ ] Add sorting by date, title, or relevance.
- [x] Debounce text search input.
- [ ] Add employment type or category filters.
- [ ] Add salary-range filtering.
- [x] Persist filters in the URL.
- [x] Display search-result counts.
- [ ] Improve the mobile filter presentation.

## Recommended order of effort

- [x] 1. Complete the working backend search.
- [x] 2. Complete frontend integration.
- [x] 3. Refine React architecture and TypeScript safety.
- [x] 4. Improve UI/UX with `welcome-ui`.
- [x] 5. Cover behavior and edge cases with tests.
- [x] 6. Document decisions and LLM usage.
- [ ] 7. Review commit history and messages.
- [ ] 8. Add optional enhancements only if time remains.

> **Critical requirement:** Search must be performed by the backend rather than solely filtering jobs in the frontend.
