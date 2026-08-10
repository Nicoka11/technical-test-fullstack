# Project Agent Guide

## Purpose

This repository is a technical interview exercise for a simplified Applicant Tracking System (ATS). It is a monorepo with a Phoenix/Elixir JSON API and a React/TypeScript client.

The requested interview feature is **backend-powered job search**. `GET /api/jobs` now supports composable backend filters for job title, location, and work mode. The frontend search interface is not yet implemented. Keep changes focused on the exercise and document meaningful trade-offs rather than broadly rebuilding the application.

## Repository Layout

```text
.
├── lib/                     # Elixir application and Phoenix web layer
│   ├── ats/                 # Domain contexts, Ecto schemas, Repo, OTP application
│   └── ats_web/             # Router, endpoint, controllers, JSON renderers, plugs
├── config/                  # Phoenix/Ecto configuration by environment
├── priv/repo/
│   ├── migrations/          # PostgreSQL schema migrations
│   └── seeds.exs            # Sample jobs, professions, candidates, and applications
├── test/                    # ExUnit tests, support modules, and fixtures
├── frontend/                # React/Vite application
├── docker-compose.yml       # Local PostgreSQL 15 service
├── mix.exs                  # Backend dependencies, aliases, and quality tooling
└── package.json             # Root convenience scripts
```

There is no separate backend directory: the Phoenix backend lives at the repository root.

## Technology

### Backend

- Elixir 1.14.5 and Erlang/OTP 26.2.5.2 (`.tool-versions`)
- Phoenix 1.7
- Ecto SQL with PostgreSQL
- Bcrypt for password hashing
- Signed `Phoenix.Token` bearer tokens for API authentication
- ExUnit, ExCoveralls, Credo, Dialyzer, and mix_audit

### Frontend

- React 19 and TypeScript 5.9
- Vite 7
- React Router 7
- Welcome UI and Tailwind CSS 4
- React Hook Form
- Vitest and Testing Library
- Yarn 4.5.3

## Backend Architecture

The backend follows the standard Phoenix separation:

1. `lib/ats_web/router.ex` maps HTTP methods and paths to controllers.
2. Controllers in `lib/ats_web/controllers/` handle HTTP concerns and call domain contexts.
3. Contexts such as `Ats.Jobs` and `Ats.Accounts` contain application/data-access operations.
4. Ecto schemas such as `Ats.Jobs.Job` define persisted fields, relations, and changesets.
5. `Ats.Repo` executes PostgreSQL queries.
6. JSON modules such as `AtsWeb.Api.JobJSON` define response serialization.

For an Express-style mental model:

- Phoenix router = Express router
- Controller action = route handler
- Context module = service/repository layer
- Ecto schema and changeset = model plus input casting/validation
- Plug = middleware

`Ats.Application` starts the supervision tree: telemetry, Ecto Repo, Phoenix PubSub, Finch, and the Phoenix endpoint.

## Backend HTTP API

All routes are defined in `lib/ats_web/router.ex`.

### Public routes

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/health` | Return server status and a UTC timestamp |
| `GET` | `/api/jobs` | Return jobs, optionally filtered by `title`, `location`, and `work_mode` |
| `GET` | `/api/jobs/:id` | Return one job |
| `POST` | `/api/jobs/:job_id/apply` | Create a candidate and associated application |
| `POST` | `/api/register` | Register a user and return a bearer token |
| `POST` | `/api/login` | Authenticate and return a bearer token |
| `DELETE` | `/api/logout` | Return a logout success response |

### Authenticated routes

These require `Authorization: Bearer <token>`.

| Method | Path | Purpose |
| --- | --- | --- |
| `GET` | `/api/me` | Return the authenticated user's ID and email |
| `POST` | `/api/jobs` | Create a job |
| `PUT` | `/api/jobs/:id` | Update a job |
| `DELETE` | `/api/jobs/:id` | Delete a job |

### Important request and response shapes

Jobs are serialized under a `data` key with:

```text
id, title, description, contract_type, office, status,
work_mode, profession_id, inserted_at, updated_at
```

The public job-list endpoint accepts these optional query parameters:

| Parameter | Matching behavior | Example |
| --- | --- | --- |
| `title` | Case-insensitive partial match against `jobs.title` | `/api/jobs?title=engineer` |
| `location` | Case-insensitive partial match against `jobs.office` | `/api/jobs?location=paris` |
| `work_mode` | Case-insensitive exact match against the work-mode enum | `/api/jobs?work_mode=remote` |

Filters compose with `AND`. Omitting filters returns all jobs, while a valid search with no matches returns `{ "data": [] }`. Search remains available with or without a bearer token and is executed in PostgreSQL through composable Ecto queries in `Ats.Jobs`.

Create/update expects:

```json
{
  "job": {
    "title": "Frontend Engineer",
    "description": "...",
    "contract_type": "FULL_TIME",
    "office": "Paris",
    "status": "published",
    "work_mode": "hybrid"
  }
}
```

Registration/login expects `{ "user": { "email": "...", "password": "..." } }`. Registration passwords must contain 12–72 characters.

Application submission expects:

```json
{
  "apply": {
    "full_name": "Jane Doe",
    "email": "jane@example.com",
    "phone": "+33...",
    "last_known_job": "Frontend Developer",
    "salary_expectation": 60000
  }
}
```

`Ats.Applicants.create_apply/1` uses `Ecto.Multi` so candidate and applicant records are inserted atomically.

## Data Model

- `users`: email, hashed password, confirmation timestamp
- `jobs`: title, description, contract type, office, status, work mode, profession association
- `professions`: name and category
- `candidates`: name, email, phone, and last known job
- `applicants`: application date, status, salary expectation, candidate association, and job association

A candidate can have multiple applicant records, and each applicant belongs to one candidate and one job.

Job enum values currently include:

- Contract types: `FULL_TIME`, `PART_TIME`, `TEMPORARY`, `FREELANCE`, `INTERNSHIP`, `APPRENTICESHIP`, `VIE`
- Statuses: `draft`, `published`, `filled`, `archived`, `cancelled`
- Work modes: `onsite`, `remote`, `hybrid`

## Frontend Architecture

Important frontend paths:

```text
frontend/src/
├── api/                     # Thin fetch wrappers for auth and applications
├── components/              # Forms, colocated hooks, and component tests
├── pages/                   # Route-level components
├── App.tsx                  # Browser route table
├── main.tsx                 # React entry point
├── types.ts                 # Shared API/domain types
└── index.css                # Tailwind and Welcome UI theme imports
```

There is no global state or server-state library. Pages use local `useState`/`useEffect`; forms use React Hook Form. API calls use the browser `fetch` API with relative `/api` URLs. During development, Vite proxies `/api` to Phoenix at `http://localhost:4000`.

### Frontend routes

| Path | Component/purpose |
| --- | --- |
| `/` | Job listing and authentication status |
| `/jobs/:id` | Job details |
| `/jobs/:jobId/apply` | Job application form |
| `/jobs/new` | Create-job form |
| `/signin` | Sign-in form |
| `/signup` | Registration form |
| `/signout` | Logout redirect |

The frontend calls job list/detail/create, apply, register, login, logout, and `/api/me`. It does not currently expose job update or deletion.

## Authentication

Registration and login return a signed token containing the user ID. The frontend stores it in a JavaScript-readable cookie named `user-token`. `AtsWeb.Api.ApiAuth` verifies `Authorization: Bearer <token>`, accepts tokens for up to 30 days, loads the user, and assigns `current_user`.

Logout currently returns success but does not revoke the signed token; the frontend removes its local cookie. Do not assume logout invalidates a captured token server-side.

## Setup and Commands

Recommended initial setup:

```bash
asdf install
mix deps.get
docker compose up -d database
mix ecto.setup
corepack enable
cd frontend && yarn install
```

From the repository root:

```bash
yarn start          # Phoenix and Vite concurrently
yarn start:back     # Phoenix on http://localhost:4000
yarn start:front    # Vite on http://localhost:5173
yarn test:back      # Backend tests
yarn build:front    # Frontend production build
yarn setup          # Backend dependencies/database and frontend install
```

Backend commands:

```bash
mix phx.server
mix test
mix format --check-formatted
mix quality         # format, tests, and Dialyzer
mix coveralls.html
```

Frontend commands from `frontend/`:

```bash
yarn dev
yarn test
yarn build
yarn lint
```

The local development database defaults to PostgreSQL credentials `postgres/postgres`, database `ats_dev`, on port 5432.

## Tests

Backend tests live in:

- `test/ats/`: context tests for accounts, applicants, candidates, jobs, and professions
- `test/ats_web/`: controller and JSON tests
- `test/ats_web/controllers/job_controller_test.exs`: job-list search endpoint coverage
- `test/support/fixtures/`: test data factories

The backend search tests cover unfiltered requests, every supported filter, case-insensitive and partial matching, combined filters, no-match results, and access with a valid bearer token. Frontend tests are colocated under the form component directories. Vitest uses jsdom and Testing Library.

Prefer focused tests at the lowest useful boundary. Backend search behavior should be covered through the public endpoint and real database queries. Frontend search should cover user interaction, request construction, loading/error states, and rendered results.

## Current Baseline and Known Gaps

Be careful not to mistake intended functionality for implemented functionality:

- Backend job search is implemented, but the frontend does not yet provide search controls or send search parameters.
- The create-job frontend request does not currently attach the bearer token even though the endpoint is protected.
- The `/jobs/new` frontend route has no route guard; server authorization must remain the security boundary.
- Job list/detail/create requests do not consistently check `Response.ok` before reading JSON or navigating.
- Job update/delete backend endpoints exist but have no frontend screens.
- `Jobs.get_job!/1` preloads applicants and candidates, but `JobJSON` does not serialize them.
- `profession_id` is serialized but is not cast by the job changeset, so API create/update cannot currently assign it.
- Logout does not revoke bearer tokens.
- Backend endpoint test coverage is limited; frontend tests are currently basic form-render smoke tests.
- The ESLint configuration targets JavaScript/JSX but not TypeScript/TSX.

Treat these as baseline observations, not permission for unrelated cleanup. Fix them only when required by the task or when a small correction is necessary for the requested flow.

## Change Guidelines

- Inspect the router, relevant controller, context, schema, frontend caller, and existing tests before editing.
- Keep backend search and filtering in `Ats.Jobs`; controllers should mainly parse HTTP input and render results.
- Validate and normalize query parameters at the API boundary. Ignore or reject unsupported values intentionally and test the chosen behavior.
- Compose Ecto queries rather than filtering database results in Elixir memory.
- Keep job responses backward-compatible unless a response-contract change is explicitly required.
- Preserve strict TypeScript typing; reuse `frontend/src/types.ts` rather than adding more duplicate page-local types when touching related code.
- Use Welcome UI components and existing Tailwind conventions for UI changes.
- Represent loading, empty, error, and success states explicitly.
- Do not weaken validation, authentication, tests, linting, or type checks to make a change pass.
- Do not modify or delete unrelated working-tree changes. This repository may contain work in progress from the candidate.
- Run the narrowest relevant tests first, followed by broader backend/frontend checks when available.
- If a toolchain command cannot run, report that limitation rather than claiming success.

## Suggested Reading Order

1. `README.md` — exercise requirements and setup
2. `lib/ats_web/router.ex` — complete backend HTTP surface
3. `lib/ats_web/controllers/api/job_controller.ex` — job endpoint parameter handling
4. `lib/ats/jobs.ex` and `lib/ats/jobs/job.ex` — composable search queries and job schema
5. `frontend/src/App.tsx` — frontend routes
6. `frontend/src/pages/JobList.tsx` — primary screen and current job fetch
7. Relevant tests and fixtures under `test/` and `frontend/src/components/`
