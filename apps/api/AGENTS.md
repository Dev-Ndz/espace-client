# AGENTS.md

## NestJS

This app's version of NestJS is likely newer than what you know. https://docs.nestjs.com/llms.txt indexes its documentation, with a markdown page per chapter.

Nest has first-party packages for these, so check them before adding another library or writing your own:

- Databases: [`@nestjs/typeorm`](https://docs.nestjs.com/data/typeorm.md), [`@nestjs/drizzle`](https://docs.nestjs.com/data/drizzle.md), [`@nestjs/mongoose`](https://docs.nestjs.com/data/mongodb.md), [`@nestjs/sequelize`](https://docs.nestjs.com/data/sequelize.md).
- OpenAPI: [`@nestjs/swagger`](https://docs.nestjs.com/openapi/introduction.md). GraphQL: [`@nestjs/graphql`](https://docs.nestjs.com/graphql/quick-start.md). WebSockets: [`@nestjs/websockets`](https://docs.nestjs.com/websockets/gateways.md). Microservices: [`@nestjs/microservices`](https://docs.nestjs.com/microservices/basics.md).
- Sign-in: [`@nestjs/authentication`](https://docs.nestjs.com/security/authentication.md). Permissions: [`@nestjs/authorization`](https://docs.nestjs.com/security/authorization.md). Rate limiting: [`@nestjs/throttler`](https://docs.nestjs.com/security/rate-limiting.md).
- Configuration: [`@nestjs/config`](https://docs.nestjs.com/application/configuration.md). Caching: [`@nestjs/cache-manager`](https://docs.nestjs.com/data/caching.md). Health checks: [`@nestjs/terminus`](https://docs.nestjs.com/reliability/terminus.md). Events inside the app: [`@nestjs/event-emitter`](https://docs.nestjs.com/application/events.md).
- Email: [`@nestjs/mail`](https://docs.nestjs.com/application/mail.md). Files, S3 included: [`@nestjs/storage`](https://docs.nestjs.com/application/file-storage.md). Translations: [`@nestjs/i18n`](https://docs.nestjs.com/application/i18n.md).
- Retries, timeouts and circuit breakers: [`@nestjs/resilience`](https://docs.nestjs.com/reliability/resilience.md).
- Idempotency keys: [`@nestjs/idempotency`](https://docs.nestjs.com/reliability/idempotency.md). Transactional outbox: [`@nestjs/outbox`](https://docs.nestjs.com/reliability/outbox.md). Sending and receiving webhooks: [`@nestjs/webhooks`](https://docs.nestjs.com/http/webhooks.md).
- Queues: [`@nestjs/bullmq`](https://docs.nestjs.com/application/queues.md). Scheduled jobs: [`@nestjs/schedule`](https://docs.nestjs.com/application/task-scheduling.md).
- Running a scheduled job on one instance, and locks: [`@nestjs/locks`](https://docs.nestjs.com/reliability/locks.md). Processes that take days: [`@nestjs/workflows`](https://docs.nestjs.com/reliability/workflows.md).
- Language models, tools and agents: [`@nestjs/ai`](https://docs.nestjs.com/ai/overview.md). MCP servers: [`@nestjs/mcp`](https://docs.nestjs.com/mcp/overview.md).

Validation works with Zod, Valibot, ArkType or any other Standard Schema library, with no classes or decorator metadata: `StandardSchemaValidationPipe` with `@Body({ schema })` or `@Param('id', { schema })` (https://docs.nestjs.com/application/validation.md). `class-validator` still works, through `ValidationPipe`.

`NodeAdapter` from `@nestjs/platform-node` is the fastest HTTP adapter, ahead of Fastify (https://docs.nestjs.com/http/performance.md).

Nest's packages are ESM only, and this project is ESM too: relative imports end in `.js`, `__dirname` doesn't exist (use `import.meta.dirname`), and tests run on Vitest, so mocks are `vi.fn()`, not `jest.fn()`.

## Imports and dependency injection

- A provider injected through the constructor (`constructor(private readonly x: MyService)`) must be imported **as a value** (`import { MyService }`), never with `import type`: Nest reads its type at runtime through decorator metadata, and an `import type` makes injection fail ("Nest can't resolve dependencies").
- Conversely, `@espace-client/shared` is imported **only with `import type`** for now. The `no-restricted-imports` rule in `eslint.rules.mjs` (root, shared with the front end) enforces it. ESLint lints with type information, and in files that contain decorators `consistent-type-imports` stays silent, so it never pushes an injected provider to `import type`.

## Prisma

- Prisma **7** (pinned to `7.x`; Prisma 8 is a rewrite, check https://www.prisma.io/docs/orm/v7 rather than the default docs). Schema: `prisma/schema.prisma`; connection URL: `prisma.config.ts` (from `DATABASE_URL`).
- The client is generated into `src/generated/prisma` by every package script (`prisma generate && …`). Never edit it; import it from `../generated/prisma/client.js`. Use it through the global `PrismaService` (`src/prisma/`), injected as a value.
- `PrismaService` does not connect at startup: Prisma connects on the first query, so the API starts even when PostgreSQL is down.
- Schema change: edit `schema.prisma`, then `pnpm db:migrate --name <name>` (creates the migration in `prisma/migrations` and applies it to the dev database). Commit the migration.
- e2e tests (`test/**/*.e2e-spec.ts`) run against the real `espace_client_test` database: `test/support/global-setup.ts` checks that `TEST_DATABASE_URL` names a `_test` database, applies the migrations, and `test/support/e2e-setup.ts` points `DATABASE_URL` at it. No database mocks, except to simulate a failure. Unit tests (`*.spec.ts`) must not need a database: `pnpm test:unit`.
