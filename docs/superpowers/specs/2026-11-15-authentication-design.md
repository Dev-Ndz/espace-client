# Step 3: accounts and sign-in (email + password)

- **Date:** 2026-11-15
- **Status:** design approved, not implemented
- **Overall context:** `2026-11-14-platform-foundation-design.md` (vision, §8 described a magic link: **replaced** by this document), `2026-11-15-database-orm-design.md` (step 2)

## Intent

Let a person with an account sign in to the portal with an email and a password, stay signed in for weeks, and sign out. This is the base that the next steps (roles, client management, invitations) build on.

Why email + password rather than the magic link planned in the vision: clients come back a few times, months apart (several sessions spread over the year). With a password, the browser or the password manager fills it in and coming back takes one click; with a magic link, every expired session means a trip through the mailbox. The owner's decision.

## Goals, non-goals, anti-goals

- **Goals:**
  - `User` and `Session` tables;
  - a CLI command that creates an account;
  - API: sign in, sign out, "who am I", every route protected by default;
  - front end: sign-in page, pages reserved to signed-in users, sign-out button.
- **Non-goals** (later steps, possibly several):
  - roles (`photographer` / `client`), the `Client` model, client management, invitations, the isolation between clients;
  - "forgot password", email sending, email verification;
  - a public sign-up page, an API endpoint that creates accounts;
  - a UI library (Angular Material is still only a lead in the vision);
  - Docker, CI, deployment.
- **Anti-goals:**
  - an account-creation endpoint left open "to secure later" (the repo is public);
  - a response that reveals whether an email has an account (message or response time);
  - sessions kept only in memory (a restart would sign everyone out, and the tests would not prove the store works).

## Approaches

### Sign-in method

| Approach                       | Trade-off                                                                                                                                                                                 |
| ------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Email + password** ✅ chosen | Familiar; the browser remembers it, so coming back months later is one click. Cost: a "forgot password" flow (by email) will be needed, at a later step.                                  |
| Magic link                     | No password to forget, but every new session goes through the mailbox, and the session lands in the browser where the link is clicked (often the mail app's built-in browser on a phone). |
| Magic link + 6-digit code      | Fixes the device problem of the magic link, but still a trip through the mailbox at each new session.                                                                                     |

### Session mechanism

| Approach                                       | Trade-off                                                                                                                                                                                                                   |
| ---------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Session in the database + cookie** ✅ chosen | Revocable immediately (disabling a user or archiving a client must cut access at once, see the vision). Little code. The cookie is `HttpOnly`, so JavaScript cannot read it.                                                |
| JWT + refresh token                            | Useful for a native mobile app, several services, or a public API: none of these here. Revoking needs the refresh tokens in the database anyway, so it ends up as a session table plus signing, rotation and refresh logic. |

### Implementation

| Approach                                                          | Trade-off                                                                                                                                                                                                                                                                                                                                                                                                      |
| ----------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **`@nestjs/authentication`, Nest's first-party module** ✅ chosen | Global guard, `@Public()`, `@CurrentUser()`, password hashing (scrypt, constant-time, same timing for unknown emails), database sessions with hashed tokens, cookie flags, idle and absolute expiry, session rotation at sign-in, refusal of cross-origin writes. Later it also covers "forgot password". Cost: very young (`0.1.6`, first release 2026-09-29), its API may still change: **pin the version**. |
| Home-made                                                         | ~200–300 lines fully owned, no young dependency, but security code where mistakes are subtle (timing, session fixation, sliding expiry), and "forgot password" to write by hand later.                                                                                                                                                                                                                         |
| Passport (`passport-local` + `express-session`)                   | Dropped: the former classic, superseded by the first-party module.                                                                                                                                                                                                                                                                                                                                             |

### How accounts are created in this step

| Approach                              | Trade-off                                                                                                                                                                                       |
| ------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **CLI command** ✅ chosen             | Needed anyway: the future "create a user" endpoint will be reserved to the signed-in photographer, so the very first account (hers, in production) needs another way in. Nothing to throw away. |
| API endpoint secured at the next step | Usable from the browser sooner, but temporary code, and an open endpoint in a public repo if the next step slips.                                                                               |
| Public sign-up page                   | Anyone could create an account; would have to be removed when invitations arrive.                                                                                                               |

## What gets built

### Dependencies

- `@nestjs/authentication`, **pinned to an exact version** (`0.1.x`, no caret), like Prisma: an upgrade is a deliberate step.
- `@nestjs/throttler` for the sign-in rate limit (the authentication module does not limit rates itself).

### Data model (Prisma, first real migration)

**User**

- `id` (UUID), `email` (unique), `passwordHash`, `createdAt`, `updatedAt`.
- The email is stored **trimmed and lower-cased**, and looked up the same way **[Claude's choice]**.
- No name, no role, no `clientId`, no status: they arrive with user management.

**Session**: the columns of the module's `SessionRecord` (`id`, `userId`, `createdAt`, `expiresAt`, `lastActiveAt`, `mfa`, `metadata`), with indexes on `userId` and `expiresAt`. The docs have no Prisma reference schema: column types and indexes follow the Drizzle and TypeORM ones (`timestamptz`, `jsonb`, `text` ids). `userId` is a foreign key to `User`, deleted in cascade **[Claude's choice]**. The `id` is the SHA-256 of the cookie token (the module hashes it; the raw token never reaches the database).

No other table: the module only needs the `sessions` contract for what is configured here (no MFA, magic link, OIDC, refresh tokens, password reset).

### API

- `AuthenticationModule` registered in `AppModule`, with a **Prisma session store** that implements only the `sessions` contract (`SessionStore`) and registers it with `AuthenticationStorage` (`registerSource({ sessions: this })`). The module's store-contract table confirms that a `SessionCookieProvider` needs only `sessions`. It follows the module's Prisma rules: conditional `updateMany()` / `deleteMany()` with their `count`, never `upsert()` in `touchSession()`.
- A `SessionCookieProvider` that loads the user from the session, and returns `null` when the user no longer exists (which ends the session).
- **Session duration** **[Claude's choice]**: `idleTtl` **30 days** (each visit pushes it back, as in the vision), `absoluteTtl` **90 days** (signed in again at most every three months, even when active).
- **Every route is protected by default** (the module's global guard). `GET /api/health` becomes `@Public()`.
- Routes, under `/api/auth` **[Claude's choice]**:
  - `POST /api/auth/sign-in` (`@Public()`), body `{ email, password }`:
    - success: **200**, the module creates the session and sets the cookie, the body is the current user;
    - wrong password, unknown email: **401** with the **same message** in both cases; the module's `PasswordHasher.verify()` checks a dummy hash for an unknown email, so the response time is the same;
    - invalid body (missing field, not a string): **400**;
    - when the stored hash `needsRehash()`, it is replaced after a successful sign-in.
  - `POST /api/auth/sign-out`: deletes the current session and clears the cookie, **204**.
  - `GET /api/auth/me`: the current user, **401** without a valid session.
- The user returned by the API never contains `passwordHash`. The shape is a shared contract in `packages/shared` (`CurrentUser`: `id`, `email`), plus the sign-in request type, imported with `import type`.
- **Body validation by hand** **[Claude's choice]**, like the environment validation at step 2: no Zod, so the `packages/shared` runtime-code question stays parked.
- **Rate limit on sign-in** (`@nestjs/throttler`) **[Claude's choice]**, following the Nest docs: an abuse ceiling that cannot be used to lock someone out.
  - per **email + IP** pair: 5 attempts per 15 minutes (someone who knows the photographer's public address cannot block her from another IP);
  - per **IP**: 30 attempts per 15 minutes, all emails together;
  - every attempt counts, success included (simplest, and 5 is far above what a real user needs);
  - beyond: **429**. Guessing spread over many IPs is not stopped; the 12-character minimum and scrypt make it impractical.
- **CSRF**: the session cookie is `SameSite=Lax`, and the module ignores the cookie on cross-origin writes and refuses a cross-origin sign-in (403). `app.enableCsrfProtection()` is called in the shared app setup (Nest 12.1+), so every cross-origin write is refused.
- **Cookie**: the module's defaults (`__Host-sid`, `HttpOnly`, `Secure`, `SameSite=Lax`, `Path=/`). Browsers accept `Secure` cookies on `http://localhost`, and the Angular dev proxy keeps the front end and the API on one origin. Signing in from another device on the local network (`http://192.168.x.x`) is **not supported**: the browser drops a `Secure` cookie over plain HTTP. The owner does not plan to test on a phone locally (see the staging note below), so there is no `COOKIE_SECURE` setting.
- No new environment variable is expected (tokens are random, there is no signing secret). If one turns out to be needed, it is declared in `validateEnv`.

### CLI command

- `pnpm --filter @espace-client/api user:create <email>` **[Claude's choice for the name]**: boots a Nest application context (no HTTP server), asks for the password **interactively** (so it stays out of the shell history), asks for it twice, hashes it with the module's `PasswordHasher`, and creates the user.
- Refuses: an invalid email, an email that already has an account, a password shorter than **12 characters** **[Claude's choice]**, or two entries that differ. Exits with a non-zero code and a clear message.
- The same 12-character minimum is the rule for any future place that sets a password.
- Works in production the same way (run once inside the API container, at the deployment step).

### Front end

- Routes **[Claude's choice for the paths]**:
  - `/connexion`: the sign-in page;
  - `/`: the home page, reserved to signed-in users. For now it shows « Connecté en tant que <email> », a « Se déconnecter » button, and the existing health status.
- A **route guard** asks `GET /api/auth/me`: without a session, it redirects to `/connexion` and remembers the requested page, which opens after sign-in **[Claude's choice]**.
- An **HTTP interceptor**: a 401 from the API (session expired or revoked while the page is open) redirects to `/connexion`. A 401 from the sign-in request itself does not.
- The sign-in form:
  - fields « Adresse e-mail » and « Mot de passe », with the `autocomplete` attributes (`email` / `username`, `current-password`) that let browsers and password managers remember and fill them in;
  - error messages: « Adresse e-mail ou mot de passe incorrect. » (401), « Trop de tentatives. Réessayez dans quelques minutes. » (429), « Le serveur est injoignable. » (network or 5xx);
  - the button is disabled while the request runs.
- Signed in and visiting `/connexion`: redirected to `/`.
- Plain HTML and a few lines of CSS, readable on a phone. No UI library at this step.

### Tests

- **API e2e**, against the real `espace_client_test` database, with `PasswordHasher` overridden to a low cost (`logN: 10`) so the tests stay fast:
  - sign-in success: 200, the cookie is set with its flags, a `Session` row exists in the database (proves the Prisma store is used, not memory);
  - `GET /api/auth/me` with the cookie: the user, without `passwordHash`;
  - wrong password and unknown email: 401 with the same body;
  - invalid body: 400;
  - a protected route without a cookie, with an unknown cookie, with an expired session: 401;
  - `/api/health` stays reachable without a cookie;
  - sign-out: 204, the row is gone, the old cookie gives 401;
  - signing in again replaces the browser's previous session;
  - a cross-origin sign-in (`Origin` of another site): 403;
  - the rate limit: 429 after 5 attempts for one email + IP, while the same email from another IP still gets through; 429 after the per-IP threshold;
  - a user deleted in the database: their session no longer works.
- **API unit tests**: the CLI's validation (email, length, mismatch, existing email), the email normalization, the body validation.
- **Front-end tests**: the sign-in form (success redirects, each error message, button disabled while pending), the guard (redirect with the remembered page), the interceptor (401 redirects, except on sign-in), the sign-out button. HTTP requests are answered before awaiting `whenStable()` (project rule).

### Documentation

- README: creating an account with the CLI, signing in locally.
- `apps/api/AGENTS.md`: `@nestjs/authentication` pinned, routes protected by default (`@Public()` to open one), the Prisma store rules, the test hasher override.
- The vision document's §8 gets a line pointing here: the magic link is replaced by email + password.

## Left to the builder

- Exact APIs of `@nestjs/authentication`, `@nestjs/throttler` and the Angular router, interceptors and forms (Signal Forms or reactive forms): check with context7 and the Nest docs (`docs.nestjs.com/security/authentication.md`) before writing code.
- How the throttler keys requests by email + IP (the tracker).
- How the CLI reads a hidden password on Windows and on Linux.
- Internal folder layout (`apps/api/src/auth`, `apps/api/src/users`, `apps/web/src/app/auth`, …), within the naming rules of `CLAUDE.md`.
- How the e2e tests clean the `User` and `Session` tables between tests.

## Deferred to later steps

- **Production cookie and domains** (deployment step): the vision has `app.<domain>` and `api.<domain>`. A `__Host-` cookie cannot be shared across subdomains; the simplest fit is to serve the API under the front end's origin (`app.<domain>/api`, as the dev proxy does). To decide at deployment, with the cookie name and `trustedOrigins`.
- **Online staging environment** (deployment step): the owner wants a test/staging environment online, in HTTPS, to try the app on a real phone before production. This revisits the vision's "local and production only" (§7.2).
- Roles, users attached to a client, disabling a user, and the isolation tests (next step).
- "Forgot password" and email sending (with invitations).

## Deviations adopted during implementation

- The `Session` table has **no foreign key** to `User`: `@nestjs/authentication` owns the session store and writes its rows itself, so the schema stays a plain mirror of what the store reads and writes. Orphan sessions are harmless (the user lookup returns `null`) and expire on their own.
