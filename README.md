# Espace client

Client portal for a photographer: an Angular front end and a NestJS API in a pnpm monorepo.

## Prerequisites

- **Node 26** (version set in `.nvmrc`). pnpm refuses to run `install` or the monorepo scripts with an older version (`engineStrict`). With [fnm](https://github.com/Schniz/fnm) configured with `--use-on-cd`, the right version is selected automatically when entering the folder.
- **pnpm** (`npm i -g pnpm`). The version in use is pinned by the `packageManager` field of the root `package.json`.
- **PostgreSQL 18**, installed locally. The examples below use port 5433; adapt the URLs in `apps/api/.env` to yours.

## Install

```bash
pnpm install
```

### Local databases (once)

Create the `espace_client` role and the `espace_client` (development) and `espace_client_test` (tests) databases, as the `postgres` superuser:

```bash
psql -h localhost -p 5433 -U postgres -f docs/setup/create-local-databases.sql
```

With pgAdmin, turn on "Auto commit?" in the Query Tool and run the statements one at a time. Then copy `apps/api/.env.example` to `apps/api/.env`.

## Database

The API talks to PostgreSQL through **Prisma 7** (schema in `apps/api/prisma/schema.prisma`, config in `apps/api/prisma.config.ts`). The Prisma client is generated into `apps/api/src/generated/prisma` (ignored by git) by every API script, so there is nothing to run by hand after a clone.

Run these from `apps/api` (or with `pnpm --filter @espace-client/api <script>`):

| Command                         | Purpose                                                         |
| ------------------------------- | --------------------------------------------------------------- |
| `pnpm db:migrate --name <name>` | Create a migration from the schema and apply it to the dev base |
| `pnpm db:deploy`                | Apply pending migrations (no new migration)                     |
| `pnpm db:status`                | Show which migrations are applied                               |
| `pnpm db:generate`              | Regenerate the Prisma client                                    |

The e2e tests run against `espace_client_test` (`TEST_DATABASE_URL`): they apply the migrations first, and refuse to run if the database name does not end with `_test`. `pnpm test` therefore needs PostgreSQL running; `pnpm --filter @espace-client/api test:unit` does not.

## Run in development

```bash
pnpm dev
```

- Front end: http://localhost:4200
- API: http://localhost:3000 (test route: `GET /api/health`, which also reports whether the database answers)

The Angular dev server proxies `/api` to the API (`apps/web/proxy.conf.json`), so there is no CORS to configure locally.

## Verification scripts

Run them from the root. They cover every package.

| Command             | Purpose                                            |
| ------------------- | -------------------------------------------------- |
| `pnpm lint`         | Lint (ESLint for the API and the front end)        |
| `pnpm typecheck`    | Type checking (strict, Angular templates included) |
| `pnpm test`         | Tests (Vitest for both the API and the front end)  |
| `pnpm build`        | Production build of every package                  |
| `pnpm format`       | Format the code with Prettier                      |
| `pnpm format:check` | Check formatting without changing anything         |

## Structure

```
apps/
  api/        NestJS API (Nest CLI, ESM, Vitest, ESLint, Prisma 7 in prisma/)
  web/        Angular front end (Angular CLI, standalone components, Vitest, ESLint)
packages/
  shared/     Types shared by the front end and the API
docs/         Design notes and plans
eslint.rules.mjs  ESLint rules shared by both apps
```

## Rules

- API types (responses, DTOs) are defined in `packages/shared`. When a contract changes, both the front end and the API fail to compile.
- For now, the shared package is imported **only with `import type`**. Linting enforces it with `no-restricted-imports`, in the ESLint rules shared by both apps (`eslint.rules.mjs`).
- On the API side, a service injected through the constructor is imported as a value, never with `import type` (see `apps/api/AGENTS.md`).
- The application UI is in French; documentation, code comments, tests, commits and pull requests are in English.
