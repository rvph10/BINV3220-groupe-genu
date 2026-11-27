# Copilot instructions

## Project commands

Run commands from the repository root unless a workspace is specified.

- Install the locked dependencies: `npm ci`
- First-time local setup (creates `backend/.env` and initializes the demo database): `npm run setup`
- Start API and frontend together: `npm run dev`
- Run the complete validation pipeline: `npm run check` (lint, typecheck, tests, build)
- Run an individual workspace check: `npm run lint --workspace=backend`, `npm run typecheck --workspace=frontend`, etc.
- Run all tests: `npm test`
- Run one test file: `npm test --workspace=backend -- tests/auth.test.ts` or `npm test --workspace=frontend -- tests/LoginPage.test.tsx`
- Run one named test within a file: `npm test --workspace=backend -- tests/auth.test.ts -t "test name"`
- Build both workspaces: `npm run build`

The project requires Node.js 22.14 or newer. The root npm package manages `backend` and `frontend` as workspaces.

## Architecture

Gesta is a React/TypeScript frontend and Express/TypeScript API backed by a local SQLite database. In development the frontend calls `/api/...`; Vite proxies these requests to the API on port 3000 and removes the `/api` prefix.

The backend is assembled in `backend/src/app.ts` from factories that receive database/config dependencies. Requests flow through controllers, services, repositories and mappers: controllers validate HTTP input and format responses, services own business rules and permissions, repositories perform SQL and return database rows, and mappers convert rows into domain objects and API DTOs. Keep Express `Request`/`Response` handling in controllers, not services. Report expected HTTP failures with `HttpError`; the central error middleware formats the API error response.

The frontend follows `pages → hooks → services/utils → models`, with reusable components below pages. `App` calls `useAuth` once and passes the session token and unauthorized callback to protected pages. Services make HTTP requests; hooks own loading/error/data state and effects; pages compose hooks and components.

For examples of complete vertical features, follow the company list or offer list across the files referenced in `docs/architecture.md`. `backend/API.md` documents the current API contract, and `docs/cdc_gesta_developpement.md` describes the intended product requirements.

## Repository-specific conventions

- Add schema changes as a new numbered SQL file in `backend/src/db/migrations/`; never edit an already-applied migration. SQLite enforces relational constraints, while services enforce business rules and state transitions.
- Keep authorization on the backend. The demo token carries only user identity; authentication reloads the account, roles and companies from SQLite for each request. The demo login is local-development only and must not be enabled in production.
- Backend services should receive repositories/dependencies through the existing factory pattern. Tests use `createTestApp` and an isolated in-memory SQLite database; do not use or reset the developer database in tests. Seed IDs from `backend/src/db/seed/seedIds.ts` are stable test fixtures.
- Validate request values explicitly in controllers using type guards/guards already used by the codebase; return the documented `400` error shape for invalid input. When changing a route or response, update `backend/API.md` and relevant `backend/http/*.http` examples.
- Frontend API responses are untrusted: validate parsed JSON with guards from `frontend/src/utils/guards.ts` and use the shared API utilities rather than casting response data to model types. Send the session token as the raw `Authorization` header value (no `Bearer` prefix); handle `401` through the page hook's unauthorized callback.
- Keep API/status codes in their established English enum values; user-facing labels are French and belong in the frontend label utilities.
- Use explicit TypeScript import extensions (`.ts`/`.tsx`) as in existing source files. Lint runs Oxlint with warnings denied.
- Treat the existing demo data and incomplete feature set as intentional; check the README and product requirements before assuming a listed-but-unimplemented capability already exists.
