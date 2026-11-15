# Step 2: Database and ORM Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Connect the NestJS API to a local PostgreSQL 18 through Prisma 7, with validated configuration, a health route that reports the database state, and integration tests against a real `_test` database.

**Architecture:** Prisma 7 (`prisma-client` generator, ESM, client generated into `apps/api/src/generated/prisma`, connection through `@prisma/adapter-pg`) wrapped in a global Nest `PrismaModule`. `@nestjs/config` validates the environment at startup. Vitest is split into a `unit` project (no database) and an `e2e` project whose global setup checks the test database URL, applies migrations, and hands the URL to the tests.

**Tech Stack:** Prisma 7.10 (`prisma`, `@prisma/client`, `@prisma/adapter-pg`), `@nestjs/config` 12, PostgreSQL 18 (native Windows service, port 5433), Vitest 4, Angular 22 `httpResource`.

**Spec:** `docs/superpowers/specs/2026-11-15-database-orm-design.md`

## Global Constraints

- Prisma packages pinned to **`^7.10.1`** (stays below 8). Never `pnpm add prisma` without a version: npm `latest` is the Prisma 8 RC.
- Before using an API, check it with context7 (Prisma docs: `/prisma/web`, v7 pages; Vitest; `@nestjs/config`: https://docs.nestjs.com/application/configuration.md). Run `fnm use` at the repo root before any pnpm command.
- No business model in `schema.prisma`. No Docker, no CI, no Zod.
- Local server: PostgreSQL 18, `localhost:5433`. Role `espace_client` (dev password `espace_client`), databases `espace_client` and `espace_client_test`, ICU collation `fr-FR`.
- `apps/api/.env` holds development values only and stays ignored by git; `apps/api/.env.example` is committed.
- `@espace-client/shared` imported only with `import type`; injected providers imported as values (`apps/api/AGENTS.md`).
- UI text in French, everything else in English. Front-end tests flush HTTP requests before `whenStable()`.
- Done means: `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build` passes from the root.

## Review Focus

1. **Fresh clone, no `.env`** (future CI): `prisma generate`, `typecheck`, `lint` and `build` must still succeed; only the e2e tests need a database. Pinned by Task 2 Step 6.
2. **PostgreSQL stopped when the API starts:** the API still starts (Prisma connects lazily, no `$connect()` at init) and `/api/health` answers `database: 'down'` instead of crashing. Pinned by Task 5's "down" e2e test and Task 3's no-connect-at-init rule.
3. **`TEST_DATABASE_URL` pointing at the dev database** (copy-paste mistake): the e2e run refuses to start before touching any database. Pinned by Task 4's guard tests.
4. **Unit tests without PostgreSQL:** `pnpm --filter @espace-client/api test:unit` passes with the service stopped. Pinned by Task 4 Step 7.
5. **Open connection pool after `app.close()`:** tests must not hang at the end. Pinned by `onModuleDestroy` → `$disconnect()` (Task 3) and the e2e run finishing (Task 5).

---

### Task 1: Local databases

**Files:**

- Create: `docs/setup/create-local-databases.sql`
- Create: `apps/api/.env.example`
- Create (not committed): `apps/api/.env`

**Interfaces:**

- Produces: env variables `DATABASE_URL=postgresql://espace_client:espace_client@localhost:5433/espace_client` and `TEST_DATABASE_URL=postgresql://espace_client:espace_client@localhost:5433/espace_client_test`.

- [ ] **Step 1: Write the SQL script**

Idempotence is not needed (run once). Content, with a header comment saying it is run once as `postgres` and that the password is a development value:

```sql
CREATE ROLE espace_client LOGIN PASSWORD 'espace_client' CREATEDB; -- CREATEDB: Prisma's shadow database for `migrate dev`
CREATE DATABASE espace_client OWNER espace_client TEMPLATE template0 LOCALE_PROVIDER icu ICU_LOCALE 'fr-FR';
CREATE DATABASE espace_client_test OWNER espace_client TEMPLATE template0 LOCALE_PROVIDER icu ICU_LOCALE 'fr-FR';
```

Check the `CREATE DATABASE … LOCALE_PROVIDER icu` syntax against the PostgreSQL 18 docs. If Windows rejects the default `LC_COLLATE`/`LC_CTYPE` with `template0`, add `LOCALE 'French_France.1252'` (or the value `SHOW lc_collate` returns on the 5433 server) and say so in the script comment.

- [ ] **Step 2: Write `apps/api/.env.example`** with the two variables above and a comment line per variable; copy it to `apps/api/.env`.

- [ ] **Step 3: Owner runs the script.** Stop and ask the owner to run (Claude does not have the `postgres` password):

```
! psql -h localhost -p 5433 -U postgres -f docs/setup/create-local-databases.sql
```

- [ ] **Step 4: Verify** (password `espace_client`, via `PGPASSWORD`):

Run: `psql "postgresql://espace_client:espace_client@localhost:5433/espace_client_test" -c "SELECT datlocprovider, datlocale FROM pg_database WHERE datname = current_database();"`
Expected: one row `i | fr-FR`. Same for `espace_client`.

- [ ] **Step 5: Commit** `docs/setup/create-local-databases.sql` and `apps/api/.env.example` (`chore(api): script for the local databases`). Check `git status` shows no `.env`.

### Task 2: Prisma installed and generated

**Files:**

- Modify: `apps/api/package.json`, `pnpm-workspace.yaml`, `.gitignore`, `.prettierignore`, `apps/api/eslint.config.mjs`
- Create: `apps/api/prisma/schema.prisma`, `apps/api/prisma.config.ts`

**Interfaces:**

- Produces: `PrismaClient` importable from `apps/api/src/generated/prisma/client.js` (relative path from `src/<module>/`: `../generated/prisma/client.js`); package scripts `db:generate`, `db:migrate` (`prisma migrate dev`), `db:deploy` (`prisma migrate deploy`), `db:status` (`prisma migrate status`).

- [ ] **Step 1: Install** in `apps/api`: `prisma@^7.10.1` (dev), `@prisma/client@^7.10.1`, `@prisma/adapter-pg@^7.10.1`. In `pnpm-workspace.yaml` `allowBuilds`, set `prisma: true` and `'@prisma/engines': true` (their preinstall/postinstall fetch the migration engine). Run `pnpm install` and confirm no "ignored build scripts" warning for them. Check `pnpm-lock.yaml` resolves `prisma@7.x`.

- [ ] **Step 2: Write `prisma/schema.prisma`**: generator `prisma-client`, `output = "../src/generated/prisma"`, `moduleFormat = "esm"`, `importFileExtension = "js"`; datasource `db` with `provider = "postgresql"` and no URL; a comment saying models arrive with the authentication step.

- [ ] **Step 3: Write `prisma.config.ts`**: `defineConfig` from `prisma/config` with `schema`, `migrations.path = "prisma/migrations"`, `datasource.url = process.env['DATABASE_URL']`. Load `.env` with Node's `process.loadEnvFile('.env')` only when the file exists (no `dotenv` dependency **[Claude's choice]**; existing env vars win over the file, which the e2e setup relies on).

- [ ] **Step 4: Wire generation into scripts.** `db:generate` = `prisma generate`; `dev`, `build`, `typecheck`, `lint` and `test` each start with `prisma generate && ` (pnpm does not run `pre*` scripts).

- [ ] **Step 5: Ignore generated code**: `apps/api/src/generated` in `.gitignore` and `.prettierignore`; `globalIgnores(['src/generated/'])` in `apps/api/eslint.config.mjs`.

- [ ] **Step 6: Verify a fresh clone works without `.env`.** Temporarily rename `apps/api/.env`, delete `apps/api/src/generated`, then from the root:

Run: `pnpm lint && pnpm typecheck && pnpm build`
Expected: all pass, `apps/api/dist/generated/prisma/client.js` exists. Restore `.env`.

- [ ] **Step 7: Commit** (`chore(api): add Prisma 7`).

### Task 3: Configuration and PrismaModule

**Files:**

- Create: `apps/api/src/config/env.ts`, `apps/api/src/config/env.spec.ts`
- Create: `apps/api/src/prisma/prisma.module.ts`, `apps/api/src/prisma/prisma.service.ts`
- Modify: `apps/api/src/app.module.ts`, `apps/api/package.json` (add `@nestjs/config@^12.1.1`)

**Interfaces:**

- Produces: `interface Env { DATABASE_URL: string }`; `validateEnv(config: Record<string, unknown>): Env` (throws `Error` whose message names the variable); `PrismaService extends PrismaClient` (`@Injectable`, `OnModuleDestroy`), constructor `(config: ConfigService<Env, true>)`; `PrismaModule` (`@Global`, provides and exports `PrismaService`).

- [ ] **Step 1: Write the failing tests** in `env.spec.ts`:

```ts
describe('validateEnv', () => {
  it('returns the variables when DATABASE_URL is a PostgreSQL URL', () => {
    const url = 'postgresql://u:p@localhost:5433/db';
    expect(validateEnv({ DATABASE_URL: url, OTHER: 'x' })).toEqual({ DATABASE_URL: url });
  });
  it('accepts the postgres:// scheme', () => {
    expect(() => validateEnv({ DATABASE_URL: 'postgres://u:p@localhost/db' })).not.toThrow();
  });
  it('throws when DATABASE_URL is missing', () => {
    expect(() => validateEnv({})).toThrow(/DATABASE_URL/);
  });
  it('throws when DATABASE_URL is not a PostgreSQL URL', () => {
    expect(() => validateEnv({ DATABASE_URL: 'mysql://u:p@localhost/db' })).toThrow(/DATABASE_URL/);
    expect(() => validateEnv({ DATABASE_URL: 'not a url' })).toThrow(/DATABASE_URL/);
  });
});
```

- [ ] **Step 2: Run** `pnpm --filter @espace-client/api exec vitest run src/config` → FAIL (module not found).

- [ ] **Step 3: Implement `validateEnv`** with `URL` parsing and a protocol check (`postgresql:` or `postgres:`); return only the known keys.

- [ ] **Step 4: Run** the same command → PASS.

- [ ] **Step 5: Implement `PrismaService` and `PrismaModule`.** The constructor passes `adapter: new PrismaPg({ connectionString: config.get('DATABASE_URL', { infer: true }) })` to `super`. **No `$connect()` in `onModuleInit`**: Prisma connects on the first query, so the API starts with PostgreSQL stopped (Review Focus 2) **[Claude's choice]**. `onModuleDestroy()` awaits `$disconnect()`. `ConfigService` is imported as a value.

- [ ] **Step 6: Wire `AppModule`**: `ConfigModule.forRoot({ isGlobal: true, validate: validateEnv })`, `PrismaModule`, `HealthModule`. The default `.env` lookup is the process cwd, which is `apps/api` for every package script.

- [ ] **Step 7: Verify** `pnpm --filter @espace-client/api typecheck && pnpm --filter @espace-client/api lint` pass, and that `pnpm --filter @espace-client/api dev` with `DATABASE_URL` removed from `.env` stops at startup with an error naming `DATABASE_URL` (then restore it).

- [ ] **Step 8: Commit** (`feat(api): validated configuration and Prisma module`).

Note: the existing health e2e test now needs `DATABASE_URL`. It is wired in Task 4. Until then, run only `src` tests.

### Task 4: Test database harness

**Files:**

- Create: `apps/api/test/support/test-database-url.ts`, `apps/api/test/support/test-database-url.spec.ts`, `apps/api/test/support/global-setup.ts`, `apps/api/test/support/e2e-setup.ts`
- Modify: `apps/api/vitest.config.ts`, `apps/api/package.json`

**Interfaces:**

- Produces: `resolveTestDatabaseUrl(env: Record<string, string | undefined>): string` (throws if `TEST_DATABASE_URL` is missing, is not a PostgreSQL URL, or its database name does not end with `_test`); the Vitest provided value `testDatabaseUrl: string`; in every e2e test file, `process.env.DATABASE_URL` equals the test URL before `AppModule` is compiled. Scripts: `test` (both projects), `test:unit` (`vitest run --project unit`).

- [ ] **Step 1: Write the failing tests** in `test-database-url.spec.ts`:

```ts
const base = 'postgresql://u:p@localhost:5433/';
it('returns TEST_DATABASE_URL when the database name ends with _test', () => {
  expect(resolveTestDatabaseUrl({ TEST_DATABASE_URL: `${base}espace_client_test` })).toBe(
    `${base}espace_client_test`,
  );
});
it('refuses a database whose name does not end with _test', () => {
  expect(() => resolveTestDatabaseUrl({ TEST_DATABASE_URL: `${base}espace_client` })).toThrow(
    /_test/,
  );
});
it('refuses a missing TEST_DATABASE_URL', () => {
  expect(() => resolveTestDatabaseUrl({})).toThrow(/TEST_DATABASE_URL/);
});
it('ignores query parameters when reading the database name', () => {
  expect(() =>
    resolveTestDatabaseUrl({ TEST_DATABASE_URL: `${base}espace_client?x=_test` }),
  ).toThrow(/_test/);
});
```

- [ ] **Step 2: Run** `pnpm --filter @espace-client/api exec vitest run test/support` → FAIL. (Add `test/**/*.spec.ts` to the include list first if needed.)

- [ ] **Step 3: Implement `resolveTestDatabaseUrl`** (database name = `new URL(url).pathname` without the leading `/`). Run → PASS.

- [ ] **Step 4: Split Vitest into projects** (check Vitest 4 `test.projects` and `provide`/`inject` with context7). `unit`: `src/**/*.spec.ts`, `test/**/*.spec.ts` excluding `*.e2e-spec.ts`. `e2e`: `test/**/*.e2e-spec.ts`, `globalSetup: test/support/global-setup.ts`, `setupFiles: test/support/e2e-setup.ts`. Both keep `globals: true`.

- [ ] **Step 5: Implement the global setup.** Load `apps/api/.env` if it exists (`process.loadEnvFile`), call `resolveTestDatabaseUrl(process.env)`, run `prisma migrate deploy` synchronously with `execFileSync` (`stdio: 'inherit'`, `env: { ...process.env, DATABASE_URL: testUrl }`, the local `prisma` binary through `pnpm exec`), then `project.provide('testDatabaseUrl', testUrl)`. Declare the provided key on `vitest`'s `ProvidedContext` for typing. `e2e-setup.ts` sets `process.env.DATABASE_URL = inject('testDatabaseUrl')`. Confirm that `migrate deploy` succeeds with no `prisma/migrations` folder; if it does not, commit an empty `prisma/migrations/.gitkeep`.

- [ ] **Step 6: Verify the full suite against the real test database.**

Run: `pnpm --filter @espace-client/api test`
Expected: unit and e2e projects pass; the existing health e2e tests pass against `espace_client_test`.

- [ ] **Step 7: Verify that unit tests do not need PostgreSQL.** Ask the owner to stop the `postgresql-x64-18` service (or run with `TEST_DATABASE_URL` pointing at port 1), then:

Run: `pnpm --filter @espace-client/api test:unit`
Expected: PASS. And with `TEST_DATABASE_URL` set to the dev URL, `pnpm --filter @espace-client/api test` fails before any migration with the `_test` message.

- [ ] **Step 8: Commit** (`test(api): run e2e tests against the real test database`).

### Task 5: Health route reports the database

**Files:**

- Modify: `packages/shared/src/health.ts`, `apps/api/src/health/health.controller.ts`, `apps/api/test/health.e2e-spec.ts`, `apps/web/src/app/health/health-status.ts`, `apps/web/src/app/health/health-status.spec.ts`

**Interfaces:**

- Consumes: `PrismaService` (Task 3), e2e harness (Task 4).
- Produces: `HealthResponse = { status: 'ok'; database: 'up' | 'down'; timestamp: string }`. `GET /api/health` always answers 200 **[Claude's choice]**.

- [ ] **Step 1: Change the contract**: add `/** Result of a `SELECT 1` on the database. */ database: 'up' | 'down';` to `HealthResponse`. Run `pnpm typecheck` → FAIL in the API controller and the front-end spec (expected: the contract safeguard).

- [ ] **Step 2: Write the failing API tests** in `health.e2e-spec.ts`. Update the existing test to also assert `expect(res.body.database).toBe('up')` (real test database). Add a `describe` that builds the module with `.overrideProvider(PrismaService).useValue({ $queryRaw: vi.fn().mockRejectedValue(new Error('connection refused')) })`:

```ts
it('GET /api/health reports the database as down when the query fails', async () => {
  const res = await request(app.getHttpServer()).get('/api/health').expect(200);
  expect(res.body).toMatchObject({ status: 'ok', database: 'down' });
});
```

- [ ] **Step 3: Run** `pnpm --filter @espace-client/api test` → FAIL on both.

- [ ] **Step 4: Implement**: `HealthController` injects `PrismaService` (value import) and `getHealth(): Promise<HealthResponse>` runs `` this.prisma.$queryRaw`SELECT 1` ``, mapping success to `'up'` and any rejection to `'down'`. Run → PASS.

- [ ] **Step 5: Write the failing front-end tests** in `health-status.spec.ts`: add `database: 'up'` to the existing « API connectée » body, and:

```ts
it('shows « Base de données injoignable » when the database is down', async () => {
  const body: HealthResponse = {
    status: 'ok',
    database: 'down',
    timestamp: '2026-11-15T10:00:00.000Z',
  };
  http.expectOne('/api/health').flush(body);
  expect(await text()).toBe('Base de données injoignable');
});
```

- [ ] **Step 6: Run** `pnpm --filter @espace-client/web test` → FAIL on the new test.

- [ ] **Step 7: Implement** in the template: after the loading branch, `status === 'ok' && database === 'up'` → « API connectée », `status === 'ok' && database === 'down'` → « Base de données injoignable », else « API injoignable ». Run → PASS.

- [ ] **Step 8: Commit** (`feat: health route reports the database state`).

### Task 6: Documentation and final verification

**Files:**

- Modify: `README.md`, `CLAUDE.md`, `apps/api/AGENTS.md`

- [ ] **Step 1: README**: prerequisites (PostgreSQL 18 on port 5433, the one-time `psql … -f docs/setup/create-local-databases.sql` command, copy `apps/api/.env.example` to `apps/api/.env`); a "Database" section with `db:migrate`, `db:deploy`, `db:status`, `db:generate`, and the fact that `pnpm test` needs PostgreSQL running while `test:unit` does not; `packages`/structure mentions `apps/api/prisma`.

- [ ] **Step 2: CLAUDE.md** (project rules): one line, "Prisma is pinned to 7.x: npm `latest` is Prisma 8, a rewrite; do not upgrade without a dedicated step." **AGENTS.md**: a "Prisma" section: generated client location and import path (`../generated/prisma/client.js`), never edit generated code, migrations with `pnpm db:migrate --name <name>`, e2e tests run on `espace_client_test` and the `_test` guard.

- [ ] **Step 3: Full verification** from the root:

Run: `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build`
Expected: everything passes.

- [ ] **Step 4: Manual check**: `pnpm dev`, open http://localhost:4200 → « API connectée ». Ask the owner to stop the `postgresql-x64-18` service → reload → « Base de données injoignable ». Restart the service.

- [ ] **Step 5: Update the spec status** to "implemented" (with any deviation adopted), then commit (`docs: database setup and Prisma rules`).
