# Technical Test for Frontend Developer - Application Tracking System

Welcome to the Frontend Developer Job Application Tracking System!

This application is a simplified job board.
An unregistered user is able to list all jobs and can apply to a job.
It provides a platform to manage job offers and track candidate information.

A registered user can create, edit, and delete job offers.
On each job offer, a registered user can see the list of candidates who have applied to the job.

## Repository Structure

This is a monorepo containing both frontend and backend:

- **Frontend (`/frontend`):** React 19 application with TypeScript
- **Backend (root):** Phoenix/Elixir REST API

## Installation

1. Clone the repository
2. Navigate to the project directory: `cd technical-test-fullstack`
3. Install language versions and dependencies:

   We suggest you use asdf (or another version manager) to manage Erlang, Elixir and Node versions.

   To install asdf, visit <http://asdf-vm.com/guide/getting-started.html>.

   Add the required plugins:

   ```bash
   asdf plugin add erlang https://github.com/asdf-vm/asdf-erlang.git
   asdf plugin add elixir https://github.com/asdf-vm/asdf-elixir.git
   asdf plugin add nodejs https://github.com/asdf-vm/asdf-nodejs.git
   ```

   Then install the versions specified in the `.tool-versions` file:

   ```bash
   asdf install
   ```

   You can now install the Elixir dependencies:

   ```bash
   mix deps.get
   ```

4. Set up the database and update the configuration in `config/dev.exs` or start a Docker container with the `docker-compose.yml` file included in the project.
5. Create and migrate the database: `mix ecto.setup`
6. Run the tests: `mix test`
7. Start the Phoenix server: `mix phx.server`
8. Frontend Setup:

   ```bash
   cd frontend
   corepack enable
   yarn install
   yarn dev  # Starts on http://localhost:5173
   ```

## Exercise

We are glad to introduce you to this technical test which will help us better understand your skills and competencies related to our tech stack. In this exercise, we will use our in-house built Applicant Tracking System (ATS) application developed with React and Phoenix Elixir.

The goal of this test is to simulate a real-world scenario where you will need to add a new feature to an existing application.
Your work will be evaluated based on your approach, your understanding of the problem and the quality of your code.

You need to implement a **Job search function** !

That new feature must allow all users to search for jobs. This should allow users to search using various parameters like job title, location, work mode, etc. You can extend this requirement to anything that makes sense for this project. You will have to implement the backend functionality (vibe coding only is ok!).

## Job Search

Job search is available to visitors and registered users on the job-listing page. Submitting the Welcome UI form stores the applied filters in the URL and requests filtered data from the Phoenix API. Browser history therefore restores both the controls and matching results; the frontend does not filter an already-fetched list.

`GET /api/jobs` supports these optional query parameters:

| Parameter | Behavior | Example |
| --- | --- | --- |
| `title` | Case-insensitive partial title match | `title=frontend` |
| `location` | Case-insensitive partial office/location match | `location=paris` |
| `work_mode` | Exact enum match: `onsite`, `remote`, or `hybrid` | `work_mode=remote` |

Filters can be combined, for example:

```text
GET /api/jobs?title=frontend&location=paris&work_mode=hybrid
```

An unfiltered `GET /api/jobs` continues to return all jobs.

### Frontend architecture

- `src/api/jobs.ts` owns query serialization, response validation, and the jobs request.
- `src/hooks/useJobs.ts` owns loading, success, error, retry, abort, and stale-response protection.
- `JobSearchForm` uses React Hook Form with Welcome UI controls for draft input.
- `JobList` treats React Router search parameters as the applied-filter source of truth.
- `JobResults` provides loading, error, empty, and result states while preserving job detail and application routes.

No dependency was added for this feature; React Hook Form, React Router, Welcome UI, Vitest, and Testing Library were already present.

### Verification

Run backend tests from the repository root:

```bash
mix test
```

Run frontend checks from `frontend/`:

```bash
yarn test --run
yarn tsc --noEmit
yarn lint
yarn build
```

### Trade-offs and possible follow-ups

Search is submit-based rather than debounced, which avoids unnecessary requests and keeps the behavior explicit. In development, React Strict Mode starts effects twice and aborts the first jobs request; stale responses are ignored, while production performs the normal single request. Pagination, sorting, visible result counts, and additional filters were intentionally left out to prioritize the required flow. With more time, pagination would be the first addition and would preserve the current URL filters.

### LLM usage

An LLM was used to inspect the repository, draft the implementation plan, assist with the typed API layer, UI integration, tests, documentation, and read-only code-review passes. The author personally reviewed the incremental code checkpoints and refactored the search form to React Hook Form. Backend tests, frontend tests, TypeScript checking, linting, and the production build were run and reviewed; manual browser checks are documented separately when performed.

## Evaluation Criteria

**Frontend**

- React best practices and component architecture
- Proper use of hooks and state management
- Code organization and reusability
- UI/UX quality with welcome-ui
- Testing quality and coverage
- TypeScript usage and type safety
- Search functionality is done on the backend (vibe-code)

**Overall**

- Git commit history and messages
- Code documentation and comments
- Problem-solving approach
- Attention to requirements

## Notes

- Take your time and demonstrate your abilities
- Focus on code quality over quantity
- Don't hesitate to update the readme to explain your decisions and what you would have done if given more time
- Be transparent on LLM usage!
- If you run out of time, prioritize completing the required task over improving it
- You can add additional libraries if needed, but justify your choices

Happy coding and good luck!
