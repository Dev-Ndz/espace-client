# Step 2: database and ORM (plumbing only)

- **Date:** 2026-11-15
- **Status:** implemented on branch `feat/database-orm`, see "Deviations adopted during implementation" below
- **Overall context:** `2026-11-14-platform-foundation-design.md` (vision and working notes), `2026-11-14-monorepo-skeleton-design.md` (step 1)

## Intent

Connect the NestJS API to a real PostgreSQL database through an ORM, with migrations and integration tests against a real database, so that the next steps (authentication, then the first feature) only have to add tables.

## Goals, non-goals

- **Goals:** a local dev database and a local test database, the ORM installed and wired into Nest, migration commands ready, configuration validated at startup, the health route reporting the database state, integration tests running against the real test database.
- **Non-goals:** business tables (`User` and `Session` belong to the authentication step, `Project` and `Step` to the first feature), Docker, CI, deployment, the `packages/shared` build question (whether it stops being compiled depends on whether it will hold runtime code such as Zod schemas; parked).
- **Anti-goals:** tests that can wipe the dev database; installing the Prisma 8 release candidate by accident.

## Approaches

### Scope of the step

| Approach                         | Trade-off                                                                                    |
| -------------------------------- | -------------------------------------------------------------------------------------------- |
| **Plumbing only** ✅ chosen      | No table yet. Does not freeze any authentication or data-model decision before its own step. |
| Plumbing + foundation data model | Moves faster, but fixes `User`/`Session` before authentication has been discussed.           |

### ORM

Checked on 2026-11-15 (context7 and npm): the npm `latest` tag of `prisma` points to **Prisma 8 release candidate** (`8.0.0-rc.33`), a full rewrite with a new query API and new migration commands. Prisma 7 (`7.10.1`) is stable and maintained for 18 months after `8.0.0` final, with an incremental migration path.

| Approach                                | Trade-off                                                                                                                                         |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Prisma 7, pinned to `7.x`** ✅ chosen | The tool the owner already knows, stable, well known by agents. Works in ESM. Cost: a migration to Prisma 8 one day, with no hurry.               |
| Prisma 8 RC                             | Recommended by Prisma for new projects, but 33 RCs in three and a half months with possible breaking changes, and a new API for owner and agents. |
| Drizzle (`0.45`)                        | TypeScript schema, SQL-like queries, no generation step, but its 1.0 is also in RC and it is new to the owner.                                    |

TypeORM and MikroORM were dropped: decorator-based entities with weaker typing than Prisma or Drizzle, and strict typing is the main safeguard for agentic work.

### Where PostgreSQL runs locally

| Approach                                     | Trade-off                                                                                                                                                                                       |
| -------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Native install (already there)** ✅ chosen | The owner's usual setup, PostgreSQL 18 already installed and running. Cost: manual setup (documented script), version drift to watch, collation differences with Linux (fixed with ICU, below). |
| Docker (`postgres:18-alpine` + compose)      | Same image as production, reproducible, reset in one command, but Docker Desktop has to run.                                                                                                    |
| Hosted (Neon)                                | Nothing local, but needs internet for development and tests, and a shared database for every test run.                                                                                          |

Running the application code itself in Docker (or a Dev Container) was considered and dropped for development: slow or unreliable file watching on Windows, `node_modules` platform conflicts, heavier editor setup, little gain since `.nvmrc` and the lockfile already pin Node and dependencies. The API Dockerfile belongs to the deployment step.

### Test database

| Approach                                                     | Trade-off                                                                                           |
| ------------------------------------------------------------ | --------------------------------------------------------------------------------------------------- |
| **A separate `_test` database on the same server** ✅ chosen | Simple and fast, no extra dependency. Postgres must be running for `pnpm test`.                     |
| Testcontainers                                               | Fully isolated, nothing to start, but needs Docker, one more dependency and a startup cost per run. |

## What gets built

### Databases

- Local server: **PostgreSQL 18** (owner's machine: 18.6, Windows service, **port 5433**; versions 16 and 17 also run on 5434 and 5432 and are not used).
- A login role `espace_client` and two databases owned by it: `espace_client` (dev) and `espace_client_test` (tests).
- Both databases are created with the **ICU French collation** (`LOCALE_PROVIDER icu`, `ICU_LOCALE 'fr-FR'`), so text sorting (accented names) is the same on Windows and on Linux. Production must use the same collation (to apply at the deployment step).
- A versioned SQL script in `docs/` creates the role and the databases. The owner runs it once as the `postgres` superuser (Claude does not have that password). Dev password only, documented as such.

### Prisma

- `prisma` and `@prisma/client` pinned to **`7.x`** (never the npm `latest` tag), plus `@prisma/adapter-pg`.
- `prisma-client` generator with ESM output, generated client in `apps/api/src/generated/prisma`, ignored by git **[Claude's choice]**.
- Connection URL in `prisma.config.ts` (Prisma 7 no longer puts it in `schema.prisma`).
- The client is generated before `typecheck`, `test` and `build`, so a fresh clone passes the verification command after `pnpm install`.
- No model in the schema. Migration scripts (create a migration in dev, apply migrations) are wired and documented; the first real migration arrives with authentication.

### Nest

- A global `PrismaModule` exposing a `PrismaService`. It does not connect at startup (Prisma connects on the first query), so the API starts even when PostgreSQL is down and the health route can report it **[Claude's choice]**. It disconnects at shutdown.
- `@nestjs/config` with a **hand-written validation function** **[Claude's choice]**: the API refuses to start if `DATABASE_URL` is missing or invalid. No Zod for now, so as not to decide the `packages/shared` question.
- `.env.example` documents each variable with development values; `.env` stays ignored.

### Health route

- `GET /api/health` runs `SELECT 1` and reports the result.
- The shared contract `HealthResponse` gains `database: 'up' | 'down'`.
- The route always answers **200** **[Claude's choice]**; whether production health checks need a 503 when the database is down is decided at the deployment step.
- The front end shows « Base de données injoignable » when `database` is `'down'` (in addition to « API connectée » and « API injoignable »).

### Tests

- API integration tests use the real `espace_client_test` database, through `TEST_DATABASE_URL`.
- A Vitest setup:
  - **refuses to run** if the target database name does not end with `_test`;
  - applies migrations (`prisma migrate deploy`) before the tests.
- Unit tests that do not touch the database do not need it.
- The health e2e test covers the `database: 'up'` case against the real database, and the `'down'` case with a failing query.
- Front-end test of the new « Base de données injoignable » state.

### Documentation

- README: PostgreSQL 18 prerequisite, one-time database creation, the new variables and scripts.
- `CLAUDE.md` / `apps/api/AGENTS.md`: Prisma 7 pinned (do not upgrade to 8 without a dedicated step), how to run migrations.

## Left to the builder

- Exact script names (`db:generate`, `db:migrate`, …) and how the generation hooks into existing scripts.
- How the Vitest setup passes `TEST_DATABASE_URL` to the app and to `prisma migrate deploy`.
- Exact Prisma 7, `@prisma/adapter-pg` and `@nestjs/config` APIs: check with context7 before writing code (Prisma docs live at prisma.io/docs/orm/v7).

## Deviations adopted during implementation

- `pnpm-workspace.yaml` allows the build scripts of `prisma` and `@prisma/engines` (pnpm blocks them by default; `@prisma/engines` downloads the migration engine).
- `.env` is loaded with Node's `process.loadEnvFile` in `prisma.config.ts` and the e2e global setup, instead of the `dotenv` package.
- Vitest is split into two projects, `unit` (no database, `pnpm test:unit`) and `e2e` (global setup: `_test` guard, `prisma migrate deploy`, then the URL is handed to the tests with `provide`/`inject`).
- The local databases were created through pgAdmin; the script header documents how (auto-commit on, one statement at a time).
