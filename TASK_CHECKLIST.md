# Job Search Technical Test Checklist

## P0 — Required functionality

- [ ] **Implement backend job search**
  - [ ] Add search/filter parameters to the Phoenix jobs endpoint.
  - [ ] Support job title filtering.
  - [ ] Support location filtering.
  - [ ] Support work mode filtering.
  - [ ] Allow multiple filters to be combined correctly.
  - [ ] Return all jobs when no filters are provided.
  - [ ] Ensure search is available to registered and unregistered users.
  - [ ] Perform filtering on the backend, not on an already-fetched frontend list.

- [ ] **Build the frontend search experience**
  - [ ] Add search controls to the job-listing page.
  - [ ] Connect the controls to the backend search endpoint.
  - [ ] Display filtered jobs.
  - [ ] Add a loading state.
  - [ ] Add an empty/no-results state.
  - [ ] Add an error state.
  - [ ] Add a reset/clear-filters action.
  - [ ] Use `welcome-ui` components and existing project conventions.

- [ ] **Verify the complete user flow**
  - [ ] Confirm visitors can search without signing in.
  - [ ] Confirm registered users can search.
  - [ ] Confirm users can still open and apply to jobs from search results.
  - [ ] Confirm job creation, editing, deletion, and candidate features still work.

## P1 — Highest-impact evaluation criteria

- [ ] **Use strong React component architecture**
  - [ ] Separate search controls, results, and data-fetching responsibilities.
  - [ ] Keep components focused and reusable.
  - [ ] Avoid duplicating job-list rendering logic.

- [ ] **Handle hooks and state correctly**
  - [ ] Keep filter state predictable.
  - [ ] Avoid unnecessary effects and duplicate requests.
  - [ ] Prevent stale responses from replacing newer search results.
  - [ ] Consider URL query parameters to make searches shareable and restorable.

- [ ] **Maintain strict TypeScript safety**
  - [ ] Define types for search parameters.
  - [ ] Define types for API responses.
  - [ ] Reuse existing job types where appropriate.
  - [ ] Define component prop types.
  - [ ] Avoid `any` and unsafe casts.

- [ ] **Deliver good UI/UX**
  - [ ] Use appropriate `welcome-ui` controls.
  - [ ] Provide understandable labels and actions.
  - [ ] Ensure keyboard accessibility and visible focus states.
  - [ ] Support responsive layouts.
  - [ ] Clearly show active filters and no-result feedback.

- [ ] **Add meaningful tests**
  - [ ] Add backend tests for each supported filter.
  - [ ] Add backend tests for combined filters.
  - [ ] Add a backend test for requests without filters.
  - [ ] Add a backend test for searches with no matches.
  - [ ] Test the chosen case-sensitivity and partial-matching behavior.
  - [ ] Add frontend tests for entering and selecting filters.
  - [ ] Verify the frontend sends the correct backend parameters.
  - [ ] Test rendering search results.
  - [ ] Test loading, empty, and error states.
  - [ ] Test clearing filters.

## P2 — Submission quality

- [ ] **Keep code organized and reusable**
  - [ ] Follow existing repository structure and naming conventions.
  - [ ] Avoid unrelated refactors.
  - [ ] Justify any added dependency.

- [ ] **Document important decisions in `README.md`**
  - [ ] Explain how job search works.
  - [ ] List supported filters.
  - [ ] Document the backend endpoint and query parameters.
  - [ ] Explain how to run relevant tests.
  - [ ] Record key architecture decisions.
  - [ ] Describe trade-offs and known limitations.
  - [ ] Explain what would be improved with more time.
  - [ ] Document and justify any added dependencies.

- [ ] **Be transparent about LLM usage**
  - [ ] Explain where and how an LLM was used.
  - [ ] State what was personally reviewed, changed, and verified.

- [ ] **Maintain a clear Git history**
  - [ ] Create focused commits with descriptive messages.
  - [ ] Suggested commit: `test: add backend job search coverage`.
  - [ ] Suggested commit: `feat: implement backend job search filters`.
  - [ ] Suggested commit: `test: add frontend search flow coverage`.
  - [ ] Suggested commit: `feat: add job search interface`.
  - [ ] Suggested commit: `docs: document search design and LLM usage`.

- [ ] **Run final verification**
  - [ ] Run backend tests with `mix test`.
  - [ ] Run the frontend test suite.
  - [ ] Run the frontend type-check command.
  - [ ] Run the frontend lint command.
  - [ ] Run the frontend production build.
  - [ ] Manually verify the complete search flow in the browser.

## P3 — Optional enhancements

Only start these after the required feature is complete and tested.

- [ ] Add pagination compatible with search filters.
- [ ] Add sorting by date, title, or relevance.
- [ ] Debounce text search input.
- [ ] Add employment type or category filters.
- [ ] Add salary-range filtering.
- [ ] Persist filters in the URL.
- [ ] Display search-result counts.
- [ ] Improve the mobile filter presentation.

## Recommended order of effort

- [ ] 1. Complete the working backend search.
- [ ] 2. Complete frontend integration.
- [ ] 3. Refine React architecture and TypeScript safety.
- [ ] 4. Improve UI/UX with `welcome-ui`.
- [ ] 5. Cover behavior and edge cases with tests.
- [ ] 6. Document decisions and LLM usage.
- [ ] 7. Review commit history and messages.
- [ ] 8. Add optional enhancements only if time remains.

> **Critical requirement:** Search must be performed by the backend rather than solely filtering jobs in the frontend.
