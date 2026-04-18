# Shamba Records Assessment — SmartSeason Field Monitoring

React (Vite) + Vercel API + Neon PostgreSQL. Two roles (**admin**, **agent**): admins manage fields and assignments; agents record observations on assigned fields.

## Setup Instructions

1. Clone the repository.
2. Run `npm install`.
3. Create a `.env` from `.env.example` and set `DATABASE_URL` and `JWT_SECRET` (do not commit secrets).
4. Run the SQL schema in `DEVELOPMENT_PLAN.md` against your Neon database.
5. Run `npm run dev` for the UI only, or `vercel dev` so the app and `/api` share one origin; set `VITE_API_BASE_URL` accordingly (see `.env.example`).
6. Seed demo users and sample data with `npm run seed` when your database is empty.

## Design Decisions

- Vercel API was chosen over Express to keep deployment simple and serverless.
- Raw `pg` queries are used instead of an ORM for transparency and a small codebase.
- JWT is stored in `localStorage`, which is acceptable for this assessment scope.
- Field status (Active / At Risk / Completed) is computed from stage, planting age, and last activity (latest field update, or field creation when there are no updates), not stored as a column, to avoid stale data.

## Field Status Logic

- **Completed:** stage is `Harvested`.
- **At Risk:** not harvested **and** (age over 120 days **or** no update in 14 days, using last activity from the API).
- **Active:** all other fields.

## Assumptions

- Only admins can create fields and assign agents.
- Agents can only update their assigned fields (observations via `updates-add`; stage-only edits via `fields-update` are restricted server-side).
- Registration defaults new users to the **agent** role.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Vite dev server. |
| `npm run build` | Production build to `dist/`. |
| `npm run lint` | ESLint. |
| `npm test` | Node test runner (`statusLogic`). |
| `npm run seed` | Seed users, fields, and updates (requires `DATABASE_URL`). |

## Demo credentials

| Role | Email | Password |
| --- | --- | --- |
| Admin | admin@smartseason.com | admin123 |
| Agent | agent@smartseason.com | agent123 |

## CI

GitHub Actions runs `npm ci`, lint, tests, and production build on push and pull request (see `.github/workflows/ci.yml`).

## TypeScript note

The reference plan mentions a TypeScript template; this repository uses **JavaScript** for the Vite app and functions to keep the assessment small. Quality is enforced with ESLint, tests for shared status logic, and a production build.
