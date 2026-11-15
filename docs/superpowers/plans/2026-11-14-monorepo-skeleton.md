# Monorepo skeleton — Implementation plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

> **Status:** implemented (PR #1). The header and the Node version reflect what was built; the task steps are otherwise kept as written before implementation (they still mention Jest for the API). The deviations adopted (Node 26, Vitest on the API, shared ESLint rules, `no-restricted-imports`, `httpResource`…) are listed in the spec, section "Deviations adopted during implementation".

**Goal:** a pnpm monorepo where an Angular front end calls `GET /api/health` on a NestJS API and displays « API connectée », the response being typed by a shared package.

**Architecture:** pnpm workspaces with three packages: `apps/api` (NestJS, created with the Nest CLI), `apps/web` (Angular, created with the Angular CLI), `packages/shared` (TypeScript types, compiled to `dist` with declarations). Locally, the Angular dev server proxies `/api` to NestJS. Root scripts (`dev`, `build`, `test`, `lint`, `typecheck`) drive every package.

**Tech Stack:** Node 26, pnpm, strict TypeScript, NestJS (latest stable, ESM, Vitest + supertest), Angular (latest stable, Vitest), ESLint in both apps with shared rules, Prettier (root).

**Spec:** `docs/superpowers/specs/2026-11-14-monorepo-skeleton-design.md`

## Global Constraints

- Work on the `feat/squelette-monorepo` branch, not on `main`.
- Package names: `@espace-client/shared`, `@espace-client/api`, `@espace-client/web`. The root package is named `espace-client` and is `private: true`.
- Dependency on the shared package: `"@espace-client/shared": "workspace:*"` in both apps.
- TypeScript `strict: true` in every package.
- The apps import the shared package **only with `import type`** at this step (ESLint rule `@typescript-eslint/consistent-type-imports` enabled in both apps).
- Node `>=26`, `packageManager` pinned to the installed pnpm version.
- Versions: latest stable Angular and NestJS, via `@angular/cli@latest` and `@nestjs/cli@latest`.
- LF line endings everywhere (`.gitattributes` + Prettier `endOfLine: "lf"`).
- Ports: API `3000` (overridable with `PORT`), front end `4200`.
- The project path contains a space (`Espace client`): no script may break on it.
- Out of scope: database, ORM, Docker, authentication, CI, deployment.

## Review Focus

1. **API down when the front end loads** → the front end shows « API injoignable », not a blank page or an endless loading state. _(Task 3, test `shows an error when the API is unreachable`)_
2. **Unexpected response** (a 404 if the proxy is misconfigured, for example) → treated as an error. _(Task 3, test `shows an error on a 404 response`)_
3. **Route without the prefix**: `GET /health` must not answer. The `/api` prefix is applied in tests as in production. _(Task 2, test `GET /health without the prefix returns 404`)_
4. **API production build**: `node dist/main.js` must start. Importing the shared package must neither move the build output nor require `.ts` at runtime. _(Task 4, production build verification step)_
5. **Path with a space, and Windows**: every root command runs in `C:\…\Espace client`. _(Task 4, verification steps run from the root)_

---

### Task 1: Workspace root and shared package

**Files:**

- Create: `package.json`, `pnpm-workspace.yaml`, `.gitignore`, `.gitattributes`, `.editorconfig`, `.prettierrc.json`, `.prettierignore`, `.nvmrc`
- Create: `packages/shared/package.json`, `packages/shared/tsconfig.json`, `packages/shared/src/index.ts`, `packages/shared/src/health.ts`

**Interfaces:**

- Produces:
  - `export interface HealthResponse { status: 'ok'; timestamp: string /* ISO 8601 */ }`, exported from `@espace-client/shared`
  - Compiled package: `main: "dist/index.js"`, `types: "dist/index.d.ts"`, scripts `build` (`tsc -p tsconfig.json`), `dev` (`tsc -p tsconfig.json --watch --preserveWatchOutput`), `typecheck` (`tsc -p tsconfig.json --noEmit`)
  - Root scripts (used by every following task):
    - `build:shared` = `pnpm --filter @espace-client/shared build`
    - `build` = `pnpm -r build` (topological order)
    - `typecheck` / `test` / `lint` = `pnpm build:shared && pnpm -r <script>`
    - `dev` = `pnpm build:shared && pnpm -r --parallel dev`
    - `format` = `prettier --write .` and `format:check` = `prettier --check .`

- [ ] **Step 1: Install pnpm** — `npm i -g pnpm`, then `pnpm --version` prints a version. Copy that version into `packageManager` (`"pnpm@<version>"`).

- [ ] **Step 2: Create the root files**
  - `pnpm-workspace.yaml`: `packages: ["apps/*", "packages/*"]`.
  - `.gitignore`: `node_modules`, `dist`, `.angular`, `coverage`, `.env`, `*.log`.
  - `.gitattributes`: `* text=auto eol=lf`.
  - `.nvmrc`: `26`.
  - `.prettierrc.json`: `{ "singleQuote": true, "printWidth": 100, "endOfLine": "lf" }`.
  - `.prettierignore`: `dist`, `.angular`, `coverage`, `pnpm-lock.yaml`.
  - Prettier as a root `devDependency`.

- [ ] **Step 3: Create `packages/shared`**
  - `tsconfig.json`: `strict`, `declaration: true`, `module: "commonjs"`, `target: "ES2022"`, `outDir: "dist"`, `rootDir: "src"`.
  - Put `HealthResponse` in `src/health.ts`, re-exported by `src/index.ts`.
  - TypeScript as a `devDependency` of the package.

- [ ] **Step 4: Verify**
  - Run: `pnpm install && pnpm build:shared && pnpm --filter @espace-client/shared typecheck`
  - Expected: no errors, and `packages/shared/dist/index.d.ts` contains `HealthResponse`.

- [ ] **Step 5: Commit** — `chore: initialize the pnpm workspace and the shared package`

---

### Task 2: NestJS API with `GET /api/health`

**Files:**

- Create (via CLI): `apps/api/**`. Run from the root: `pnpm dlx @nestjs/cli@latest new api --directory apps/api --package-manager pnpm --skip-git --skip-install --strict`.
- Delete: `apps/api/.prettierrc` (the root one is used), plus the generated `app.controller.ts`, `app.service.ts` and their spec.
- Create: `apps/api/src/app.setup.ts`, `apps/api/src/health/health.controller.ts`, `apps/api/src/health/health.module.ts`
- Modify: `apps/api/src/main.ts`, `apps/api/src/app.module.ts`, `apps/api/package.json`, `apps/api/eslint.config.mjs`
- Test: `apps/api/test/health.e2e-spec.ts` (replaces `app.e2e-spec.ts`)

**Interfaces:**

- Consumes: `HealthResponse` (Task 1), with `import type`.
- Produces:
  - `configureApp(app: INestApplication): void` in `app.setup.ts`, which applies `app.setGlobalPrefix('api')`. Used by `main.ts` and by the e2e tests.
  - `GET /api/health` → `200`, body `HealthResponse`, with `timestamp = new Date().toISOString()`.
  - Listens on `process.env.PORT ?? 3000`.
  - Scripts in `apps/api/package.json`:
    - `name: "@espace-client/api"`;
    - `dev` = `nest start --watch`;
    - `build` = `nest build`;
    - `test` = `jest && jest --config ./test/jest-e2e.json`;
    - `lint` = `eslint "{src,test}/**/*.ts"` (without `--fix`);
    - `typecheck` = `tsc --noEmit -p tsconfig.json`.

- [ ] **Step 1: Generate the app, rename the package, add the shared dependency, run `pnpm install` at the root.** Add the rule `@typescript-eslint/consistent-type-imports: "error"` to `eslint.config.mjs`.

- [ ] **Step 2: Write the failing test** — `apps/api/test/health.e2e-spec.ts`. The test app goes through `configureApp(app)` before `app.init()`.

```ts
it('GET /api/health returns the status', async () => {
  const res = await request(app.getHttpServer()).get('/api/health').expect(200);
  expect(res.body.status).toBe('ok');
  expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
});

it('GET /health without the prefix returns 404', async () => {
  await request(app.getHttpServer()).get('/health').expect(404);
});
```

- [ ] **Step 3: Run the test to check that it fails**
  - Run: `pnpm --filter @espace-client/api exec jest --config ./test/jest-e2e.json`
  - Expected: FAIL (`app.setup` module not found, or 404 on `/api/health`).

- [ ] **Step 4: Implement `configureApp`, `HealthModule` and `HealthController.getHealth(): HealthResponse`.** Register `HealthModule` in `AppModule`, and call `configureApp` in `main.ts`.

- [ ] **Step 5: Verify**
  - Run: `pnpm --filter @espace-client/api test && pnpm --filter @espace-client/api lint && pnpm --filter @espace-client/api typecheck`
  - Expected: every test PASSES, no lint or type errors.

- [ ] **Step 6: Commit** — `feat(api): add the NestJS API with the /api/health route`

---

### Task 3: Angular front end that displays the API status

**Files:**

- Create (via CLI): `apps/web/**`. Run from the root: `pnpm dlx @angular/cli@latest new web --directory apps/web --package-manager pnpm --skip-git --skip-install --style scss --ssr false --routing false`. Answer the other prompts with the defaults, without any AI tool configuration.
- Add ESLint: `pnpm --filter @espace-client/web exec ng add angular-eslint --skip-confirmation`.
- Create: `apps/web/src/app/health/health-client.ts`, `apps/web/src/app/health/health-status.ts`
- Modify: `apps/web/src/app/app.config.ts`, the root component (file generated by the CLI), `apps/web/package.json`, `apps/web/eslint.config.js`
- Test: `apps/web/src/app/health/health-status.spec.ts`

**Interfaces:**

- Consumes: `HealthResponse` (Task 1), with `import type`.
- Produces:
  - `HealthClient` (service, `providedIn: 'root'`) with `getHealth(): Observable<HealthResponse>`, which sends `GET /api/health` (relative URL).
  - `HealthStatus` component (selector `app-health-status`, standalone). It renders a `<p data-testid="health-status">` with exactly:
    - `Vérification de l'API…` while the request is pending;
    - `API connectée` if the response has `status === 'ok'`;
    - `API injoignable` on any HTTP or network error.
  - The root component displays an `Espace client` title and `<app-health-status />`.
  - `app.config.ts` provides `provideHttpClient(withFetch())`.
  - Scripts in `apps/web/package.json`:
    - `name: "@espace-client/web"`;
    - `dev` = `ng serve`;
    - `build` = `ng build`;
    - `test` = `ng test --watch=false`;
    - `lint` = `ng lint`;
    - `typecheck` = `tsc --noEmit -p tsconfig.app.json && tsc --noEmit -p tsconfig.spec.json`.

- [ ] **Step 1: Generate the app, add ESLint, rename the package, add the shared dependency, run `pnpm install` at the root.** Add `@typescript-eslint/consistent-type-imports: "error"` for `.ts` files. Delete the local `.prettierrc` or Prettier config if the CLI generates one.

- [ ] **Step 2: Write the failing tests** — `health-status.spec.ts`, with `provideHttpClient()` + `provideHttpClientTesting()` and `HttpTestingController`:

```ts
it("shows « Vérification de l'API… » while the request is pending", () => {
  // create the component, detectChanges, do not answer the request
  expect(text()).toBe("Vérification de l'API…");
});

it('shows « API connectée » when the API answers ok', () => {
  const body: HealthResponse = { status: 'ok', timestamp: '2026-11-14T10:00:00.000Z' };
  http.expectOne('/api/health').flush(body);
  expect(text()).toBe('API connectée');
});

it('shows an error when the API is unreachable', () => {
  http.expectOne('/api/health').error(new ProgressEvent('error'));
  expect(text()).toBe('API injoignable');
});

it('shows an error on a 404 response', () => {
  http.expectOne('/api/health').flush('Not Found', { status: 404, statusText: 'Not Found' });
  expect(text()).toBe('API injoignable');
});
```

`text()` reads the (trimmed) content of `[data-testid="health-status"]` after `fixture.detectChanges()` (or `await fixture.whenStable()` if the app is zoneless). Add `http.verify()` in `afterEach`. Replace the generated root component test with a single test: the `Espace client` title is displayed.

- [ ] **Step 3: Run the tests to check that they fail**
  - Run: `pnpm --filter @espace-client/web test`
  - Expected: FAIL (`HealthStatus` not found).

- [ ] **Step 4: Implement `HealthClient` and `HealthStatus`.** The state is held by a signal (`'loading' | 'ok' | 'error'`), and the labels are derived from that state.

- [ ] **Step 5: Verify**
  - Run: `pnpm --filter @espace-client/web test && pnpm --filter @espace-client/web lint && pnpm --filter @espace-client/web typecheck`
  - Expected: every test PASSES, no errors.

- [ ] **Step 6: Commit** — `feat(web): add the Angular front end that displays the API status`

---

### Task 4: Local end-to-end wiring and documentation

**Files:**

- Create: `apps/web/proxy.conf.json`, `README.md`
- Modify: `apps/web/angular.json` (`proxyConfig` option of the `serve` target)

**Interfaces:**

- Consumes: root scripts (Task 1), `GET /api/health` on port 3000 (Task 2), `HealthStatus` (Task 3).
- Produces: `pnpm dev` runs the API on `:3000` and the front end on `:4200`. `http://localhost:4200/api/health` is proxied to the API.

- [ ] **Step 1: Configure the proxy** — `proxy.conf.json`: `{ "/api": { "target": "http://localhost:3000", "secure": false } }`, referenced by `serve.options.proxyConfig` in `angular.json`.

- [ ] **Step 2: Verify everything from the root**
  - Run: `pnpm install && pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build`
  - Expected: everything passes. If `format:check` fails, run `pnpm format`, then run it again.

- [ ] **Step 3: Verify the real flow**
  - Start `pnpm dev` in the background.
  - `curl -s http://localhost:4200/api/health` → JSON with `"status":"ok"`.
  - Open `http://localhost:4200` → the page shows `Espace client` and `API connectée`.
  - Stop only the API (or run only `pnpm --filter @espace-client/web dev`) → the page shows `API injoignable`.

- [ ] **Step 4: Verify the API production build**
  - Run: `pnpm --filter @espace-client/api build`, then `PORT=3100 node apps/api/dist/main.js` in the background, then `curl -s http://localhost:3100/api/health`.
  - Expected: `dist/main.js` exists at that exact location, the server starts, the response contains `"status":"ok"`.

- [ ] **Step 5: Verify that the shared contract protects both sides**
  - Temporarily rename `timestamp` to `time` in `packages/shared/src/health.ts`, then run `pnpm typecheck`.
  - Expected: type errors in `apps/api` (the controller returns `timestamp`) **and** in `apps/web` (the test builds a `HealthResponse`-typed response with `timestamp`).
  - Revert the change (`git checkout packages/shared/src/health.ts`) and check that `pnpm typecheck` passes again.

- [ ] **Step 6: Write `README.md`** (originally in French; now in English):
  - prerequisites (Node 26, pnpm);
  - install (`pnpm install`);
  - run in dev (`pnpm dev`, URLs `:4200` and `:3000`);
  - verification scripts (`lint`, `typecheck`, `test`, `build`, `format`);
  - folder structure;
  - rule: the shared package is imported with `import type` at this stage.

- [ ] **Step 7: Commit** — `chore: wire the front end to the API locally and document how to run it`
