# Step 1: monorepo skeleton (front end + back end, local)

- **Date:** 2026-11-14
- **Status:** implemented (PR #1), see "Deviations adopted during implementation" below
- **Overall context:** `2026-11-14-platform-foundation-design.md` (vision and working notes)

## Intent

Lay down the overall architecture and run, locally, a minimal project where the Angular front end talks to the NestJS API. This is the base for what comes next, one step at a time: the database and ORM, authentication, a first feature, then deployment.

## Approaches

| Approach                       | Trade-off                                                                                                                                                                                              |
| ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Angular + NestJS** ✅ chosen | NestJS follows Angular's logic (modules, dependency injection). Its imposed structure keeps the code consistent when it is written by agents. It is also the framework the project owner wants to try. |
| Angular + Express or Hono      | Minimalist, but the structure has to be invented, and that is where agent-written code drifts.                                                                                                         |
| Angular + Supabase             | No API to write, but it is no longer a client-server architecture and it does not allow trying a back-end framework.                                                                                   |

Repository layout: **pnpm workspaces** with the official CLIs, rather than Nx (one more tooling layer, which can be added if the repository grows) **[Claude's choice]**.

## What gets built

```
espace-client/
├── apps/
│   ├── web/          ← Angular (Angular CLI, standalone components)
│   └── api/          ← NestJS (Nest CLI)
├── packages/
│   └── shared/       ← types shared by the front end and the API
├── package.json      ← workspaces + common scripts
└── pnpm-workspace.yaml
```

- **A single front end ↔ API round trip** to prove everything is wired: the API exposes `GET /api/health`, which returns an object typed by an interface from `packages/shared`. The Angular home page calls it and displays the result (« API connectée » or an error).
- **Shared types:** if the interface in `shared` changes, both the front end and the API fail to compile. This is the main safeguard for what follows.
- **One command to run everything:** `pnpm dev` starts the API and the front end in parallel. The Angular dev server proxies `/api` to NestJS, so there is no CORS configuration locally **[Claude's choice]**.
- **Common scripts at the root**, so an agent can verify its own work: `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm typecheck`.
- **One test per application** to get started:
  - API: end-to-end test of `/api/health`;
  - front end: test of the component that displays the status.
- TypeScript in `strict` mode everywhere. ESLint + Prettier configured at the root.
- Versions: latest stable versions of Angular and NestJS. Node 22 (already installed, compatible). pnpm to install (`npm i -g pnpm` or corepack) **[Claude's choice]**.

## Out of scope for this step

Database, ORM, Docker, user authentication, business features, CI/CD, deployment. Each one gets its own step.

## Left to the implementer

Folder layout inside each application, front-end test runner, ESLint and Prettier configuration details, look of the home page (a simple page is enough).

## Deviations adopted during implementation

The text above is the spec as validated before implementation. These deviations were decided while building it (details in PR #1):

- **Node 26** instead of Node 22: Angular CLI 22 requires Node ≥ 22.22.3, and Node 22 reaches end of life in April 2027. Managed with fnm; pnpm `engineStrict` refuses older versions.
- **API tooling:** the Nest 12 CLI now generates an ESM project with **Vitest** and **oxlint** (no Jest, no ESLint); that tooling was kept. The front end uses ESLint (angular-eslint) and Vitest (Angular CLI default).
- **Prettier** is configured at the root; each app keeps the linter its CLI generates.
- **`import type` rule for the shared package:** enforced with `no-restricted-imports` on the API (oxlint) and `consistent-type-imports` on the front end, because `consistent-type-imports` on the API pushes injected providers to `import type`, which breaks Nest dependency injection.
- **Front end:** `HealthStatus` uses `httpResource`, as recommended by the current Angular documentation.
