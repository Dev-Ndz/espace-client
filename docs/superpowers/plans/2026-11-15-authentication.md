# Accounts and sign-in Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A person with an account (created by a CLI command) signs in with email + password, stays signed in, and signs out; every API route and every front-end page is reserved to signed-in users unless marked public.

**Architecture:** The API uses Nest's first-party `@nestjs/authentication`: its global guard protects every route, a Prisma store keeps the sessions, a `SessionCookieProvider` loads the user, and `SignInService` sets and clears the cookie. `@nestjs/throttler` limits sign-in attempts. The Angular app gets a router with a sign-in page, a guard, and an interceptor that sends 401s back to the sign-in page.

**Tech Stack:** NestJS 12.5, `@nestjs/authentication` 0.1.6 (exact), `@nestjs/throttler` 6.7, Prisma 7, PostgreSQL 18, Angular 22 (Signal Forms, functional guards and interceptors), Vitest.

**Spec:** `docs/superpowers/specs/2026-11-15-authentication-design.md`

## Global Constraints

- Run `fnm use` from the repo root before any command (otherwise an older Node is picked up).
- Before writing code against a library, check its current docs with context7 or `docs.nestjs.com/security/authentication.md` (`CLAUDE.md` rule). The typings of `@nestjs/authentication` (`node_modules/@nestjs/authentication/dist/**/*.d.ts`) are the reference for its API.
- `@nestjs/authentication` pinned to exactly `0.1.6` (no caret). Prisma stays `7.x`.
- Code, comments, test names and commits in English; UI text in French, exactly as written in this plan.
- Front-end names follow the Angular 2025 style guide: `sign-in-page.ts` / `SignInPage`, no `.component` suffix.
- `@espace-client/shared` is imported with `import type` only. A provider injected through a constructor is imported as a value.
- Front-end tests: answer HTTP requests (`expectOne(...).flush(...)`) **before** awaiting `whenStable()`.
- Session lifetimes: `idleTtl: '30d'`, `absoluteTtl: '90d'`. Password minimum: 12 characters. Sign-in limits: 5 per 15 minutes per email + IP, 30 per 15 minutes per IP.
- The API never returns `passwordHash`. Wrong password and unknown email give the same 401 body.
- Done means, from the root: `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build`.

## Review Focus

1. **Open redirect through the remembered page**: `/connexion?retour=//evil.example` or `?retour=https://evil.example` must land on `/` after sign-in, never off-site. (Task 6, `safeReturnUrl` tests.)
2. **Email typed differently at sign-in**: an account created as `ada@example.com` signs in with `Ada@Example.COM`, and both spellings share one rate-limit counter. (Task 1 `normalizeEmail` tests, Task 3 e2e, Task 4 tracker test.)
3. **Odd sign-in bodies**: `{ email: 42 }`, a missing password, an empty string give 400; a 5 KB password gives 401, never 500. (Task 3.)
4. **Session gone while a page is open**: a 401 on any request other than sign-in and `me` clears the user and opens `/connexion` with the current page remembered; a double click on « Se connecter » sends one request. (Tasks 6 and 7.)
5. **API unreachable when the app opens**: the guard's `me` request fails with a network error; the app shows `/connexion` (not a blank page), and the sign-in page then shows « Le serveur est injoignable. » on submit. (Tasks 6 and 7.)

## Deviations from the spec decided while planning

- **No foreign key from `Session.userId` to `User`** (the spec had a cascade delete, marked as Claude's choice). The module's store contract suite (`authenticationStoreContract`) creates sessions for random user ids, which a foreign key would reject. A deleted user's session still ends at its next request, because `SessionAuth.validate()` returns `null`. The module's reference schemas have no foreign key either. Recorded in the spec in Task 1.
- **"The same email from another IP still gets through"** is tested on the tracker function (Task 4 unit test), not over HTTP: supertest always comes from `127.0.0.1`, and trusting `X-Forwarded-For` is a deployment-step decision.
- **e2e test files run one at a time** (`fileParallelism: false` on the `e2e` Vitest project): they share the `espace_client_test` database, and the auth tests empty its tables.

---

### Task 1: User and Session tables, users service

**Files:**

- Modify: `apps/api/prisma/schema.prisma`
- Create: `apps/api/prisma/migrations/<timestamp>_users_and_sessions/migration.sql` (generated)
- Create: `apps/api/src/users/email.ts`, `apps/api/src/users/email.spec.ts`
- Create: `apps/api/src/users/users.service.ts`, `apps/api/src/users/users.module.ts`
- Create: `apps/api/test/support/reset-database.ts`
- Create: `apps/api/test/users.e2e-spec.ts`
- Create: `packages/shared/src/auth.ts`; Modify: `packages/shared/src/index.ts`
- Modify: `apps/api/vitest.config.ts`
- Modify: `docs/superpowers/specs/2026-11-15-authentication-design.md` (deviation note)

**Interfaces:**

- Produces:
  - `packages/shared`: `interface CurrentUser { id: string; email: string }`, `interface SignInRequest { email: string; password: string }`.
  - `normalizeEmail(raw: string): string` — `raw.trim().normalize('NFC').toLowerCase()`.
  - `UsersService` (in `UsersModule`, exported):
    - `findById(id: string): Promise<CurrentUser | null>`
    - `findCredentials(email: string): Promise<{ user: CurrentUser; passwordHash: string } | null>` (normalizes `email`)
    - `create(email: string, passwordHash: string): Promise<CurrentUser>` (normalizes `email`; throws `EmailTakenError` on a duplicate)
    - `updatePasswordHash(id: string, passwordHash: string): Promise<void>`
  - `class EmailTakenError extends Error` exported from `users.service.ts`.
  - `resetDatabase(prisma: PrismaService): Promise<void>` — empties `Session` and `User`.

- [ ] **Step 1: Write the `normalizeEmail` unit tests** (`email.spec.ts`)

```ts
expect(normalizeEmail('  Ada@Example.COM ')).toBe('ada@example.com');
expect(normalizeEmail('élise@example.com')).toBe('élise@example.com'); // NFC
expect(normalizeEmail('ada@example.com')).toBe('ada@example.com');
```

- [ ] **Step 2: Run** `pnpm --filter @espace-client/api test:unit` — Expected: FAIL, `normalizeEmail` not found.
- [ ] **Step 3: Implement `normalizeEmail` in `apps/api/src/users/email.ts`.**
- [ ] **Step 4: Run** the unit tests — Expected: PASS.
- [ ] **Step 5: Add the models to `schema.prisma`**, Prisma default naming (models `User` and `Session`, camelCase columns):

```prisma
model User {
  id           String   @id @default(uuid(7))
  /// Trimmed, NFC, lower-cased (see src/users/email.ts).
  email        String   @unique
  passwordHash String
  createdAt    DateTime @default(now()) @db.Timestamptz
  updatedAt    DateTime @updatedAt @db.Timestamptz
}

/// Sessions of @nestjs/authentication. No foreign key to User: see the step 3 spec, deviations.
model Session {
  /// SHA-256 of the cookie token, never the token itself.
  id           String   @id
  userId       String
  createdAt    DateTime @db.Timestamptz
  expiresAt    DateTime @db.Timestamptz
  lastActiveAt DateTime @db.Timestamptz
  mfa          String?
  metadata     Json?

  @@index([userId])
  @@index([expiresAt])
}
```

- [ ] **Step 6: Create the migration**: from `apps/api`, `pnpm db:migrate --name users_and_sessions`. Expected: a new folder under `prisma/migrations`, applied to the dev database. Remove the `// Models arrive with the authentication step.` comment from the schema header.
- [ ] **Step 7: Set `fileParallelism: false` on the `e2e` project** in `apps/api/vitest.config.ts`, with a comment saying the e2e files share the test database.
- [ ] **Step 8: Write `test/users.e2e-spec.ts`** (Nest testing module importing `ConfigModule.forRoot({ isGlobal: true, validate: validateEnv })`, `PrismaModule`, `UsersModule`; `resetDatabase` in `beforeEach`):
  - `create('  Ada@Example.com ', 'hash')` resolves `{ id: <string>, email: 'ada@example.com' }` and the result has no `passwordHash` key;
  - `create` a second time with `'ADA@example.com'` rejects with `EmailTakenError`;
  - `findCredentials(' ADA@example.com')` resolves `{ user: { id, email: 'ada@example.com' }, passwordHash: 'hash' }`; `findCredentials('nobody@example.com')` resolves `null`;
  - `findById(id)` resolves `{ id, email }`; `findById('unknown')` resolves `null`;
  - `updatePasswordHash(id, 'new')` then `findCredentials` shows `passwordHash: 'new'`.
- [ ] **Step 9: Run** `pnpm --filter @espace-client/api test` — Expected: FAIL, `UsersService` not found.
- [ ] **Step 10: Implement `UsersService`, `UsersModule`, `EmailTakenError`, `resetDatabase`, and the shared types.** `create` maps Prisma's `P2002` to `EmailTakenError`. Every read selects `id` and `email` only, plus `passwordHash` in `findCredentials`.
- [ ] **Step 11: Run** `pnpm --filter @espace-client/api test` — Expected: PASS (health tests included).
- [ ] **Step 12: Add the first deviation note** to the spec (new section "Deviations adopted during implementation", same style as the step 2 spec): no foreign key, with the reason above.
- [ ] **Step 13: Commit**: `feat(api): user and session tables` (schema, migration, users module, shared types, vitest config, spec note).

---

### Task 2: Prisma session store

**Files:**

- Create: `apps/api/src/auth/prisma-session.store.ts`
- Create: `apps/api/test/prisma-session-store.e2e-spec.ts`
- Modify: `apps/api/package.json` (dependency)

**Interfaces:**

- Consumes: `PrismaService`, the `Session` model (Task 1).
- Produces: `@Injectable() class PrismaSessionStore implements SessionStore`, constructor `(prisma: PrismaService, storage: AuthenticationStorage)`, which calls `storage.registerSource({ sessions: this })`. Task 3 adds it to `AuthModule`'s providers.

- [ ] **Step 1: Install** `pnpm --filter @espace-client/api add -E @nestjs/authentication@0.1.6`. Check `package.json` reads `"@nestjs/authentication": "0.1.6"`.
- [ ] **Step 2: Write `test/prisma-session-store.e2e-spec.ts`** running the module's contract suite against a store on the real test database:

```ts
import { authenticationStoreContract } from '@nestjs/authentication/testing';
// One PrismaService for the file (built from inject('testDatabaseUrl') through a ConfigService
// stub or a testing module), closed in afterAll.
const cases = authenticationStoreContract(
  () => ({ sessions: new PrismaSessionStore(prisma, { registerSource: () => {} } as never) }),
  { contracts: ['sessions'], concurrent: true },
);
for (const c of cases) it(c.name, () => c.run());
```

The builder may build the store through a Nest testing module instead of `new`, as long as the factory returns `{ sessions: store }`.

- [ ] **Step 3: Run** `pnpm --filter @espace-client/api test` — Expected: FAIL, `PrismaSessionStore` not found.
- [ ] **Step 4: Implement `PrismaSessionStore`**, following the rules in the `SessionStore` typings and the docs' Prisma notes:
  - `getSession`: `findUnique`; turn `null` columns into absent fields (`mfa`, `metadata`); do not set `extra`.
  - `createSession`: `create`, then `deleteMany({ where: { expiresAt: { lte: record.createdAt } } })`.
  - `touchSession`: `updateMany({ where: { id, lastActiveAt: { lt: lastActiveAt } }, data: { lastActiveAt } })`. Never `upsert`.
  - `deleteSession`: `deleteMany({ where: { id } })`, resolve `count > 0`.
  - `listUserSessions`, `deleteUserSessions`: `findMany` / `deleteMany` on `userId`.
- [ ] **Step 5: Run** the tests — Expected: every contract case PASS.
- [ ] **Step 6: Commit**: `feat(api): Prisma session store for @nestjs/authentication`.

---

### Task 3: Sign-in, sign-out, "who am I", routes protected by default

**Files:**

- Create: `apps/api/src/auth/auth.module.ts`, `auth.controller.ts`, `session-auth.ts`, `credentials.service.ts`, `sign-in-body.ts`, `sign-in-body.spec.ts`, `authentication-types.ts`
- Modify: `apps/api/src/app.module.ts`, `apps/api/src/app.setup.ts`, `apps/api/src/health/health.controller.ts`
- Create: `apps/api/test/support/auth-test-app.ts`, `apps/api/test/auth.e2e-spec.ts`
- Modify: `apps/api/AGENTS.md`, `docs/superpowers/specs/2026-11-14-platform-foundation-design.md` (§8 pointer)

**Interfaces:**

- Consumes: `UsersService`, `normalizeEmail`, `PrismaSessionStore`, `CurrentUser`, `SignInRequest`, `resetDatabase`.
- Produces:
  - `AuthModule` imports `UsersModule`; provides `PrismaSessionStore`, `SessionAuth`, `CredentialsService`; declares `AuthController` (`@Controller('auth')`).
  - `AppModule` imports `AuthenticationModule.forRoot({ session: { idleTtl: '30d', absoluteTtl: '90d' } })` and `AuthModule`.
  - `authentication-types.ts`: `declare module '@nestjs/authentication' { interface AuthenticationTypes { user: CurrentUser } }`.
  - `parseSignInBody(body: unknown): SignInRequest` — throws `BadRequestException` unless `body` is an object whose `email` and `password` are non-empty strings. Returns them unchanged.
  - `CredentialsService.verify(email: string, password: string): Promise<CurrentUser | null>`.
  - Routes: `POST /api/auth/sign-in` → 200 `CurrentUser`; `POST /api/auth/sign-out` → 204; `GET /api/auth/me` → 200 `CurrentUser`.
  - `createAuthTestApp(options?: { logN?: number }): Promise<{ app: INestApplication<App>; prisma: PrismaService; createUser(email: string, password: string): Promise<CurrentUser> }>` in `test/support/auth-test-app.ts`: compiles `AppModule` with `PasswordHasher` overridden by `new PasswordHasher({ logN: options?.logN ?? 10 })`, runs `configureApp`, `init()`, `resetDatabase`; `createUser` hashes with the same hasher and calls `UsersService.create`. Task 4 reuses it.

- [ ] **Step 1: Write `sign-in-body.spec.ts`**:
  - `parseSignInBody({ email: 'a@b.c', password: 'secret' })` returns `{ email: 'a@b.c', password: 'secret' }`;
  - throws `BadRequestException` for `undefined`, `'text'`, `{}`, `{ email: 42, password: 'x' }`, `{ email: 'a@b.c' }`, `{ email: '', password: 'x' }`, `{ email: 'a@b.c', password: '' }`.
- [ ] **Step 2: Run** `pnpm --filter @espace-client/api test:unit` — Expected: FAIL.
- [ ] **Step 3: Implement `parseSignInBody`.** Run — Expected: PASS.
- [ ] **Step 4: Write `test/auth.e2e-spec.ts`** with `createAuthTestApp()` and a user `ada@example.com` / `correct horse battery` created in `beforeEach`. `cookieOf(res)` keeps `set-cookie[0]` up to the first `;`. Tests:
  - **sign-in success**: 200, body `{ id, email: 'ada@example.com' }` with no `passwordHash`; `set-cookie[0]` starts with `__Host-sid=` and contains `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`, `Max-Age=7776000`; `prisma.session.count({ where: { userId: id } })` is `1`.
  - **email typed differently**: `' Ada@Example.COM '` signs in (200).
  - **me**: `GET /api/auth/me` with the cookie → 200 `{ id, email }`, no `passwordHash`.
  - **wrong password and unknown email**: both 401, and `res.body` of the two is deep-equal.
  - **odd bodies**: `{ email: 42, password: 'x' }` and `{ email: 'ada@example.com' }` → 400; password of 5000 characters → 401.
  - **protected without a session**: `GET /api/auth/me` with no cookie, with `__Host-sid=unknown` → 401.
  - **expired**: after sign-in, `prisma.session.updateMany({ data: { expiresAt: new Date(Date.now() - 1000) } })` → `me` gives 401; same with `lastActiveAt` set 31 days ago → 401.
  - **health stays public**: `GET /api/health` without cookie → 200.
  - **sign-out**: 204; the session count is `0`; `me` with the old cookie → 401; `set-cookie` clears `__Host-sid` (`Max-Age=0`).
  - **sign-out without a session**: 401.
  - **sign-in again replaces the session**: sign in, sign in again sending the first cookie → the first cookie gives 401 on `me`, the second 200, session count `1`.
  - **cross-origin sign-in**: with headers `Origin: https://evil.example` and `Sec-Fetch-Site: cross-site` → 403, session count `0`.
  - **cross-origin sign-out**: with the cookie and the same two headers → not 204 (the cookie is ignored or the write refused), the session still exists.
  - **deleted user**: sign in, `prisma.user.deleteMany()`, `me` → 401.
  - **rehash**: in its own `describe` with `createAuthTestApp({ logN: 11 })`, a user whose hash was made with `new PasswordHasher({ logN: 10 })` (insert through `UsersService.create` directly); after a successful sign-in, the stored `passwordHash` differs from the original.
- [ ] **Step 5: Run** `pnpm --filter @espace-client/api test` — Expected: FAIL (no auth module).
- [ ] **Step 6: Implement**:
  - `SessionAuth extends SessionCookieProvider<CurrentUser>`: `validate(session)` returns `usersService.findById(session.userId)`. Register it as the docs show (`registry.registerProvider(this)` in the constructor, or the property-injected form the typings describe; follow whatever the typings require).
  - `CredentialsService.verify`: `findCredentials(email)`, then `passwordHasher.verify(password, found?.passwordHash)`; `null` unless valid; when `passwordHasher.needsRehash(found.passwordHash)`, `updatePasswordHash(found.user.id, await passwordHasher.hash(password))`; returns `found.user`.
  - `AuthController`:
    - `signIn` (`@Public()`, `@HttpCode(200)`): `parseSignInBody`, `verify`, `UnauthorizedException('Invalid email or password.')` when `null`, then `signInService.signIn(user.id, { method: 'password' })`, returns the user;
    - `signOut` (`@HttpCode(204)`): `signInService.signOut()`;
    - `me`: returns `@CurrentUser()`.
  - `HealthController`: `@Public()` on the class.
  - `configureApp`: add `app.enableCsrfProtection()` after the global prefix.
- [ ] **Step 7: Run** `pnpm --filter @espace-client/api test` — Expected: PASS, health tests included.
- [ ] **Step 8: Docs**:
  - `apps/api/AGENTS.md`, new "Authentication" section:
    - `@nestjs/authentication` pinned to `0.1.6`, upgrade as a dedicated step;
    - every route needs a session, `@Public()` opens one;
    - `@CurrentUser()` gives a `CurrentUser`;
    - sessions live in `PrismaSessionStore`, which follows the store rules (conditional writes, never `upsert` in `touchSession`; the contract suite in `test/prisma-session-store.e2e-spec.ts` checks them);
    - e2e tests use `createAuthTestApp()`, which lowers the hasher cost.
  - Vision §8.1: add a first line « Replaced by `2026-11-15-authentication-design.md`: email + password, not a magic link. »
- [ ] **Step 9: Commit**: `feat(api): sign in, sign out and current user with @nestjs/authentication`.

---

### Task 4: Sign-in rate limit

**Files:**

- Create: `apps/api/src/auth/account-tracker.ts`, `account-tracker.spec.ts`
- Modify: `apps/api/src/app.module.ts`, `apps/api/src/auth/auth.controller.ts`, `apps/api/package.json`
- Modify: `apps/api/test/auth.e2e-spec.ts`

**Interfaces:**

- Consumes: `normalizeEmail`, `createAuthTestApp`.
- Produces: `accountTracker(req: { body?: unknown; ip?: string }): string` → `` `${normalizeEmail(email)}|${normalizeIp(req.ip)}` `` when `body.email` is a string, else `` `|${normalizeIp(req.ip)}` ``. `normalizeIp` comes from `@nestjs/throttler`.

- [ ] **Step 1: Install** `pnpm --filter @espace-client/api add @nestjs/throttler@^6.7.1`.
- [ ] **Step 2: Write `account-tracker.spec.ts`**:
  - `{ body: { email: ' Ada@Example.com ' }, ip: '1.2.3.4' }` and `{ body: { email: 'ada@example.com' }, ip: '1.2.3.4' }` give the same key;
  - the same email with `ip: '5.6.7.8'` gives a different key;
  - `{ body: { email: 42 }, ip: '1.2.3.4' }` and `{ ip: '1.2.3.4' }` do not throw.
- [ ] **Step 3: Run** unit tests — Expected: FAIL. **Implement**, run — Expected: PASS.
- [ ] **Step 4: Add the e2e tests** to `auth.e2e-spec.ts` (`describe('sign-in rate limit')`):
  - 5 wrong-password attempts for `ada@example.com` → 401 each; the 6th → 429, **even with the right password**;
  - after 5 attempts on `ada@example.com`, a sign-in as `bob@example.com` (created in the test) → 200;
  - 30 attempts with 30 different unknown emails → 401 each; the 31st (another new email) → 429;
  - `GET /api/auth/me` is never throttled: 40 requests with a cookie all answer 200.
- [ ] **Step 5: Run** — Expected: FAIL (no 429).
- [ ] **Step 6: Implement**: `ThrottlerModule.forRoot([{ name: 'ip', ttl: minutes(15), limit: 30 }, { name: 'account', ttl: minutes(15), limit: 5, getTracker: accountTracker }])` in `AppModule`; `@UseGuards(ThrottlerGuard)` on `signIn` only (no global throttler guard).
- [ ] **Step 7: Run** `pnpm --filter @espace-client/api test` — Expected: PASS.
- [ ] **Step 8: Commit**: `feat(api): rate-limit sign-in per email and IP`.

---

### Task 5: `user:create` CLI command

**Files:**

- Create: `apps/api/src/cli/new-account.ts`, `new-account.spec.ts`
- Create: `apps/api/src/cli/cli.module.ts`, `apps/api/src/cli/create-user.ts`
- Modify: `apps/api/package.json` (script), `README.md`

**Interfaces:**

- Consumes: `UsersService.create`, `EmailTakenError`, `normalizeEmail`, `PasswordHasher`.
- Produces:
  - `validateNewAccount(input: { email: string; password: string; confirmation: string }): string[]` — the list of problems, empty when valid. Messages (English, CLI output): `'Invalid email address.'`, `'The password must be at least 12 characters long.'`, `'The two passwords differ.'`.
  - `MIN_PASSWORD_LENGTH = 12`, exported from `new-account.ts`.
  - Script `"user:create": "nest build && node dist/cli/create-user.js"`.

- [ ] **Step 1: Write `new-account.spec.ts`**:
  - valid `{ email: 'ada@example.com', password: 'x'.repeat(12), confirmation: 'x'.repeat(12) }` → `[]`;
  - `email: 'not-an-email'` → contains `'Invalid email address.'` (rule: after `normalizeEmail`, matches `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`);
  - 11-character password → contains the length message; the length counts characters (`[...password].length`), so 12 emoji pass;
  - different confirmation → contains `'The two passwords differ.'`;
  - several problems at once → all of them.
- [ ] **Step 2: Run** — Expected: FAIL. **Implement**, run — Expected: PASS.
- [ ] **Step 3: Implement the command**:
  - `CliModule` imports `ConfigModule.forRoot({ isGlobal: true, validate: validateEnv })`, `PrismaModule`, `UsersModule`, and provides `PasswordHasher` with `useValue: new PasswordHasher()` (default OWASP cost);
  - `create-user.ts`: email from `process.argv[2]`, password and confirmation read **without echo** (builder's choice of technique, must work in Windows Terminal and on Linux), `validateNewAccount`, then `UsersService.create`;
  - output: `User created: <email>` and exit code 0; any problem, or `EmailTakenError` (`'An account already exists for this email.'`), on stderr with exit code 1. Close the application context in every case.
- [ ] **Step 4: Check by hand**:
  - `pnpm --filter @espace-client/api user:create ada@example.com` with a 12+ character password → `User created`, a row in the dev database;
  - the same command again → the duplicate message, exit code 1;
  - a short password → the length message;
  - typed characters never appear on screen.
  - Then `pnpm dev`: `curl -i -X POST localhost:3000/api/auth/sign-in -H 'content-type: application/json' -d '{"email":"ada@example.com","password":"..."}'` → 200 with `set-cookie`.
- [ ] **Step 5: README**: a "Create an account" section (the command, the 12-character rule, that it also runs in production with `node dist/cli/create-user.js <email>`), and in "Run in development", that every page now needs a signed-in account.
- [ ] **Step 6: Commit**: `feat(api): user:create CLI command`.

---

### Task 6: Front end session, guard, interceptor, home page

**Files:**

- Create: `apps/web/src/app/auth/auth-session.ts`, `auth-session.spec.ts`
- Create: `apps/web/src/app/auth/auth-guards.ts`, `auth-guards.spec.ts`
- Create: `apps/web/src/app/auth/redirect-on-unauthorized.ts`, `redirect-on-unauthorized.spec.ts`
- Create: `apps/web/src/app/auth/safe-return-url.ts`, `safe-return-url.spec.ts`
- Create: `apps/web/src/app/home/home-page.ts`, `home-page.spec.ts`
- Create: `apps/web/src/app/app.routes.ts`
- Modify: `apps/web/src/app/app.config.ts`, `app.html`, `app.ts`, `app.spec.ts`

**Interfaces:**

- Consumes: `CurrentUser`, `SignInRequest`; routes `/api/auth/me`, `/api/auth/sign-in`, `/api/auth/sign-out`.
- Produces:
  - `AuthSession` (`providedIn: 'root'`):
    - `readonly user: Signal<CurrentUser | null>`;
    - `refresh(): Promise<CurrentUser | null>` — `GET /api/auth/me`; any error → `null`;
    - `signIn(request: SignInRequest): Promise<void>` — `POST /api/auth/sign-in`, sets `user`; rejects with the `HttpErrorResponse` on failure;
    - `signOut(): Promise<void>` — `POST /api/auth/sign-out`, errors ignored, `user` → `null`;
    - `clear(): void` — `user` → `null`.
  - `requireSignedIn: CanActivateFn` — `true` when `user()` is set, else awaits `refresh()`; signed out → `UrlTree` for `/connexion?retour=<state.url>`.
  - `redirectIfSignedIn: CanActivateFn` — signed in (cached or after `refresh()`) → `UrlTree` for `/`.
  - `redirectOnUnauthorized: HttpInterceptorFn` — on a 401 for any URL other than `/api/auth/sign-in` and `/api/auth/me`: `clear()`, navigate to `/connexion` with `retour` = `router.url`, rethrow.
  - `safeReturnUrl(value: string | null): string` — `value` when it starts with `/` and not with `//` or `/\`; otherwise `'/'`.
  - Routes: `{ path: 'connexion', canActivate: [redirectIfSignedIn], loadComponent: SignInPage }` (Task 7; until then a placeholder export in `sign-in/sign-in-page.ts` is fine), `{ path: '', canActivate: [requireSignedIn], component: HomePage }`, `{ path: '**', redirectTo: '' }`.

- [ ] **Step 1: Write the tests**:
  - `safe-return-url.spec.ts`: `'/'`, `'/projets?x=1'` kept; `null`, `''`, `'//evil.example'`, `'/\\evil.example'`, `'https://evil.example'`, `'javascript:alert(1)'` → `'/'`.
  - `auth-session.spec.ts`: `refresh()` with `me` flushed `{ id: '1', email: 'ada@example.com' }` → resolves it and `user()` equals it; `me` answered 401 → `null`; network error → `null`; `signIn` flushed 200 → `user()` set; `signIn` answered 401 → rejects with `status: 401`, `user()` stays `null`; `signOut` answered 204 or 500 → `user()` is `null`.
  - `auth-guards.spec.ts` (with `RouterTestingHarness` and two dummy routes): signed out, navigating to `/projets` lands on `/connexion?retour=%2Fprojets`; `me` network error → also `/connexion`; signed in (`me` flushed) → stays on `/projets`; signed in, navigating to `/connexion` lands on `/`.
  - `redirect-on-unauthorized.spec.ts`: a 401 on `/api/anything` while on `/projets` → `user()` null, router URL `/connexion?retour=%2Fprojets`, the caller's observable errors with 401; a 401 on `/api/auth/sign-in` or `/api/auth/me` → no navigation; a 500 → no navigation.
  - `home-page.spec.ts`: with `user()` set to `ada@example.com`, shows « Connecté en tant que ada@example.com »; clicking « Se déconnecter » posts to `/api/auth/sign-out` (flush 204) and navigates to `/connexion`. The health status request (`/api/health`) is answered in each test.
  - `app.spec.ts`: update to the router (renders a `router-outlet`).
- [ ] **Step 2: Run** `pnpm --filter @espace-client/web test` — Expected: FAIL.
- [ ] **Step 3: Implement** the files above. `app.config.ts`: `provideRouter(routes)`, `provideHttpClient(withInterceptors([redirectOnUnauthorized]))`. `app.html`: `<router-outlet />` (the `<h1>Espace client</h1>` moves into the pages). `HomePage` template: `<h1>Espace client</h1>`, `<p>Connecté en tant que {{ email }}</p>`, `<button type="button">Se déconnecter</button>`, `<app-health-status />`.
- [ ] **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Commit**: `feat(web): session state, route guards and the signed-in home page`.

---

### Task 7: Sign-in page

**Files:**

- Create (or replace the placeholder): `apps/web/src/app/sign-in/sign-in-page.ts`, `sign-in-page.spec.ts`
- Modify: `apps/web/src/styles.scss` (a few rules, readable at 360 px wide)

**Interfaces:**

- Consumes: `AuthSession.signIn`, `safeReturnUrl`, the `retour` query parameter.
- Produces: `SignInPage`, default or named export matching the `loadComponent` in `app.routes.ts`.

- [ ] **Step 1: Write `sign-in-page.spec.ts`** (`RouterTestingHarness`, navigate to `/connexion?retour=%2Fprojets`):
  - the form has an input labelled « Adresse e-mail » (`type="email"`, `autocomplete="username"`), an input labelled « Mot de passe » (`type="password"`, `autocomplete="current-password"`), and a « Se connecter » submit button;
  - submitting with both fields empty sends no request and shows « Champ obligatoire. » under each field;
  - filled and submitted: one `POST /api/auth/sign-in` with body `{ email, password }` as typed; flushed 200 → router URL `/projets`;
  - without `retour`, or with `retour=//evil.example` → router URL `/` after success;
  - answered 401 → « Adresse e-mail ou mot de passe incorrect. »; 429 → « Trop de tentatives. Réessayez dans quelques minutes. »; network error or 500 → « Le serveur est injoignable. »;
  - while the request is pending the button is disabled, and a second submit sends no second request;
  - after an error, the password field is emptied and the email kept.
- [ ] **Step 2: Run** — Expected: FAIL.
- [ ] **Step 3: Implement `SignInPage`** with Signal Forms (`form`, `FormField` / `[formField]`, `required`, `submit` from `@angular/forms/signals`, stable since 22.0): heading « Connexion », the messages above in an element with `role="alert"`, no UI library.
- [ ] **Step 4: Run** — Expected: PASS.
- [ ] **Step 5: Check in the browser**: `pnpm dev`, open `http://localhost:4200` → `/connexion`; sign in with the account from Task 5 → home page with the email; reload → still signed in; « Se déconnecter » → `/connexion`; a wrong password shows the message; the browser offers to save the password. Check the layout in the devtools phone mode (360 px).
- [ ] **Step 6: Full verification** from the root: `pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build` — Expected: all pass.
- [ ] **Step 7: Update the spec** status line to `implemented on branch feat/authentication`, and complete "Deviations adopted during implementation" with the other two planning deviations and any others.
- [ ] **Step 8: Commit**: `feat(web): sign-in page`.
