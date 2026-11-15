# Espace client

Client portal for a photographer: an Angular front end and a NestJS API in a pnpm monorepo.

## Prerequisites

- **Node 26** (version set in `.nvmrc`). pnpm refuses to run `install` or the monorepo scripts with an older version (`engineStrict`). With [fnm](https://github.com/Schniz/fnm) configured with `--use-on-cd`, the right version is selected automatically when entering the folder.
- **pnpm** (`npm i -g pnpm`). The version in use is pinned by the `packageManager` field of the root `package.json`.

## Install

```bash
pnpm install
```

## Run in development

```bash
pnpm dev
```

- Front end: http://localhost:4200
- API: http://localhost:3000 (test route: `GET /api/health`)

The Angular dev server proxies `/api` to the API (`apps/web/proxy.conf.json`), so there is no CORS to configure locally.

## Verification scripts

Run them from the root. They cover every package.

| Command             | Purpose                                           |
| ------------------- | ------------------------------------------------- |
| `pnpm lint`         | Lint (oxlint for the API, ESLint for the front)   |
| `pnpm typecheck`    | TypeScript type checking (strict)                 |
| `pnpm test`         | Tests (Vitest for both the API and the front end) |
| `pnpm build`        | Production build of every package                 |
| `pnpm format`       | Format the code with Prettier                     |
| `pnpm format:check` | Check formatting without changing anything        |

## Structure

```
apps/
  api/        NestJS API (Nest CLI, ESM, Vitest, oxlint)
  web/        Angular front end (Angular CLI, standalone components, Vitest, ESLint)
packages/
  shared/     Types shared by the front end and the API
docs/         Design notes and plans
```

## Rules

- API types (responses, DTOs) are defined in `packages/shared`. When a contract changes, both the front end and the API fail to compile.
- For now, the shared package is imported **only with `import type`**. Linting enforces it: `no-restricted-imports` on the API (oxlint), `consistent-type-imports` on the front end (ESLint).
- On the API side, a service injected through the constructor is imported as a value, never with `import type` (see `apps/api/AGENTS.md`).
- The application UI is in French; documentation, code comments, tests, commits and pull requests are in English.
