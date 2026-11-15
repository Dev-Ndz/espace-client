# CLAUDE.md

Client portal for a photographer: an Angular front end (`apps/web`) and a NestJS API (`apps/api`) in a pnpm monorepo, with shared types (`packages/shared`). Setup and scripts: see `README.md`. Vision and design: `docs/superpowers/specs/`.

## Library documentation: context7 is mandatory

Before designing, planning or writing code that depends on Angular, NestJS or any other library or tool (pnpm, Vitest, ESLint, Prisma…), look up the **current** documentation with the **context7** MCP server (`resolve-library-id`, then `query-docs`). Do not rely on memory: the versions used here (Angular 22, NestJS 12, Node 26) are newer than what models know, and their defaults have changed.

For NestJS, https://docs.nestjs.com/llms.txt also indexes the documentation (see `apps/api/AGENTS.md`).

## Verify your work

From the root, everything must pass before declaring a task done:

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

## Project rules

- **Language:** documentation, specs and plans, code comments, test names, commit messages and pull requests are written in **English**. The application UI stays in **French** (the photographer's clients are French speakers), so the labels asserted in tests stay in French.
- Node 26 (`.nvmrc`), managed with fnm. Package manager: pnpm only.
- TypeScript `strict` everywhere.
- Front end: naming follows the **Angular 2025 style guide** (the CLI default), without type suffixes. Write `user-profile.ts` / `UserProfile`, not `user-profile.component.ts` / `UserProfileComponent`. The name says what the class does (`HealthStatus`, `ProjectTimeline`), not which decorator it has.
- API contracts are defined in `packages/shared`, and this package is imported **only with `import type`** for now.
- Both apps use ESLint. Rules common to both go in `eslint.rules.mjs` at the root; each app's `eslint.config.mjs` only adds its own.
- On the API side, a service injected through the constructor is imported **as a value**, never with `import type`, otherwise Nest dependency injection fails (see `apps/api/AGENTS.md`).
- The project moves one step at a time: skeleton, then database and ORM, then authentication, then the first feature, then deployment. Do not anticipate the decisions of later steps.
- No real secrets in the repository: it is public. Locally, `.env` (ignored by git) only holds development values. Production secrets live in Coolify and in GitHub secrets.
