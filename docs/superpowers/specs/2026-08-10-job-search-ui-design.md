# Job Search UI Design

## Scope

Add the required frontend job-search experience to the existing React job-listing route. Search remains public and backend-powered. Preserve the existing Welcome UI appearance and current job details/application links. Do not change backend-owned files or add dependencies.

## Search Contract

The listing route uses these URL query parameters:

- `title`: case-insensitive partial title search performed by the backend.
- `location`: case-insensitive partial office/location search performed by the backend.
- `work_mode`: exact work mode using `onsite`, `remote`, or `hybrid`.

The URL is the applied-filter source of truth. Submitting the form updates the URL, and URL changes trigger `GET /api/jobs` with only non-empty supported parameters. Clearing filters removes all three parameters and reloads all jobs. Browser back/forward navigation restores both controls and results.

## Architecture

- Extend shared frontend types with a strict `JobSearchParams` type.
- Add a focused jobs API helper that serializes supported parameters, validates HTTP responses, and returns typed job data.
- Add an abortable jobs-fetching hook keyed by URL-derived filters so older responses cannot replace newer results.
- Add a controlled Welcome UI search form whose draft values synchronize when URL parameters change and whose submit/reset actions update the route.
- Keep result rendering separate from filter controls while preserving one job-card implementation.
- Leave the existing authentication behavior in the listing page unchanged except where composition requires moving markup.

## Interface

Above the job results, show a compact responsive search form containing:

- A labeled title text input.
- A labeled location text input.
- A labeled work-mode select with an “All work modes” option.
- A primary “Search jobs” submit button.
- A tertiary “Clear filters” button when any filter is active.

Use existing spacing, typography, cards, tags, and button treatments. Do not add decorative elements, animation, result sorting, pagination, or result counts.

## States

- **Initial/loading:** show a clear loading indicator and status text.
- **Searching:** keep controls available, disable duplicate submission, and expose loading status.
- **Success:** render the existing job cards with detail and application routes intact.
- **Empty:** explain that no jobs match and offer a clear-filters action when filters are active.
- **Error:** show an understandable error message and a retry action without discarding the current URL filters.

Status feedback must be available to assistive technology through an appropriate live region.

## Error Handling and Concurrency

The API helper throws a stable user-facing error when the response is not successful or the payload cannot be fetched. The data hook aborts its previous request when filters change or the component unmounts. Aborted requests do not enter the error state.

## Testing

Use Vitest and Testing Library with tests written before implementation. Cover:

- Query serialization omits empty filters and preserves supported values.
- Initial URL parameters populate the controls and produce the matching backend request.
- Submitting title, location, and work mode updates the URL and fetches filtered jobs.
- Browser URL changes restore form values and results.
- Loading, results, empty, and error states render correctly.
- Clearing filters removes supported parameters and requests all jobs.
- Existing job detail and apply links remain available in results.

## Delivery Checkpoints

1. Shared search contract, API helper, URL/data hook, and focused tests.
2. Welcome UI search controls and result-state components with tests.
3. Job-list integration, regression checks, and frontend verification.
