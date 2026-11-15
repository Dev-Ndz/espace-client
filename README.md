# Espace client

Client portal for a photographer: an Angular front end and a NestJS API in a pnpm monorepo.

## Prerequisites

- **pnpm** (`npm i -g pnpm`), on any recent Node. The pnpm version is pinned by the `packageManager` field of the root `package.json`.
- **Node 26** is provided by pnpm itself: `devEngines.runtime` in the root `package.json` pins it (exact version and checksums in `pnpm-lock.yaml`), `pnpm install` downloads it, and every `pnpm` script and `pnpm exec` runs on it, whatever Node is installed and from any subfolder. A bare `node` outside pnpm still uses the system Node.
- `.nvmrc` (26) remains for version managers such as [fnm](https://github.com/Schniz/fnm) and for CI.

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
  api/        NestJS API (Nest CLI, ESM, Vitest, ESLint)
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
