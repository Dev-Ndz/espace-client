# Squelette du monorepo — Plan de mise en place

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** un monorepo pnpm où un front Angular appelle `GET /api/health` d'une API NestJS et affiche « API connectée », la réponse étant typée par un package partagé.

**Architecture:** workspaces pnpm avec trois packages : `apps/api` (NestJS, créé avec le CLI Nest), `apps/web` (Angular, créé avec le CLI Angular), `packages/shared` (types TypeScript, compilé en `dist` avec déclarations). En local, le serveur de dev Angular relaie `/api` vers NestJS. Des scripts racine (`dev`, `build`, `test`, `lint`, `typecheck`) pilotent tous les packages.

**Tech Stack:** Node 22, pnpm, TypeScript strict, NestJS (dernière stable, Jest + supertest), Angular (dernière stable, runner de test par défaut du CLI), ESLint (config générée par chaque CLI), Prettier (racine).

**Spec:** `docs/superpowers/specs/2026-11-14-squelette-monorepo-design.md`

## Global Constraints

- Travailler sur la branche `feat/squelette-monorepo`, pas sur `main`.
- Noms de packages : `@espace-client/shared`, `@espace-client/api`, `@espace-client/web`. Le package racine s'appelle `espace-client` et est `private: true`.
- Dépendance au partagé : `"@espace-client/shared": "workspace:*"` dans les deux apps.
- TypeScript `strict: true` dans chaque package.
- Les apps importent le partagé **uniquement en `import type`** à cette étape (règle ESLint `@typescript-eslint/consistent-type-imports` activée dans les deux apps).
- Node `>=22`, `packageManager` épinglé sur la version de pnpm installée.
- Versions : dernières stables d'Angular et NestJS, via `@angular/cli@latest` et `@nestjs/cli@latest`.
- Fins de ligne LF partout (`.gitattributes` + Prettier `endOfLine: "lf"`).
- Ports : API `3000` (surchargeable par `PORT`), front `4200`.
- Le chemin du projet contient un espace (`Espace client`) : aucun script ne doit le casser.
- Hors périmètre : base de données, ORM, Docker, authentification, CI, déploiement.

## Review Focus

1. **API éteinte au chargement du front** → le front affiche « API injoignable », pas une page blanche ni un chargement infini. _(Task 3, test `affiche une erreur si l'API ne répond pas`)_
2. **Réponse inattendue** (404 si le proxy est mal configuré, par exemple) → traitée comme une erreur. _(Task 3, test `affiche une erreur sur une réponse 404`)_
3. **Route sans préfixe** : `GET /health` ne doit pas répondre. Le préfixe `/api` est appliqué en test comme en production. _(Task 2, test `GET /health sans préfixe renvoie 404`)_
4. **Build de production de l'API** : `node dist/main.js` doit démarrer. L'import du partagé ne doit pas déplacer la sortie de compilation ni exiger du `.ts` à l'exécution. _(Task 4, étape de vérification du build de production)_
5. **Chemin avec espace et Windows** : toutes les commandes racine tournent dans `C:\…\Espace client`. _(Task 4, étapes de vérification lancées depuis la racine)_

---

### Task 1: Racine du workspace et package partagé

**Files:**

- Create: `package.json`, `pnpm-workspace.yaml`, `.gitignore`, `.gitattributes`, `.editorconfig`, `.prettierrc.json`, `.prettierignore`, `.nvmrc`
- Create: `packages/shared/package.json`, `packages/shared/tsconfig.json`, `packages/shared/src/index.ts`, `packages/shared/src/health.ts`

**Interfaces:**

- Produces:
  - `export interface HealthResponse { status: 'ok'; timestamp: string /* ISO 8601 */ }`, exporté depuis `@espace-client/shared`
  - Package compilé : `main: "dist/index.js"`, `types: "dist/index.d.ts"`, scripts `build` (`tsc -p tsconfig.json`), `dev` (`tsc -p tsconfig.json --watch --preserveWatchOutput`), `typecheck` (`tsc -p tsconfig.json --noEmit`)
  - Scripts racine (utilisés par toutes les tâches suivantes) :
    - `build:shared` = `pnpm --filter @espace-client/shared build`
    - `build` = `pnpm -r build` (ordre topologique)
    - `typecheck` / `test` / `lint` = `pnpm build:shared && pnpm -r <script>`
    - `dev` = `pnpm build:shared && pnpm -r --parallel dev`
    - `format` = `prettier --write .` et `format:check` = `prettier --check .`

- [ ] **Step 1: Installer pnpm** — `npm i -g pnpm`, puis `pnpm --version` affiche une version. Reporter cette version dans `packageManager` (`"pnpm@<version>"`).

- [ ] **Step 2: Créer les fichiers racine**
  - `pnpm-workspace.yaml` : `packages: ["apps/*", "packages/*"]`.
  - `.gitignore` : `node_modules`, `dist`, `.angular`, `coverage`, `.env`, `*.log`.
  - `.gitattributes` : `* text=auto eol=lf`.
  - `.nvmrc` : `22`.
  - `.prettierrc.json` : `{ "singleQuote": true, "printWidth": 100, "endOfLine": "lf" }`.
  - `.prettierignore` : `dist`, `.angular`, `coverage`, `pnpm-lock.yaml`.
  - Prettier en `devDependency` racine.

- [ ] **Step 3: Créer `packages/shared`**
  - `tsconfig.json` : `strict`, `declaration: true`, `module: "commonjs"`, `target: "ES2022"`, `outDir: "dist"`, `rootDir: "src"`.
  - Mettre `HealthResponse` dans `src/health.ts`, ré-exporté par `src/index.ts`.
  - TypeScript en `devDependency` du package.

- [ ] **Step 4: Vérifier**
  - Run : `pnpm install && pnpm build:shared && pnpm --filter @espace-client/shared typecheck`
  - Expected : aucune erreur, et `packages/shared/dist/index.d.ts` contient `HealthResponse`.

- [ ] **Step 5: Commit** — `chore: initialise le workspace pnpm et le package partagé`

---

### Task 2: API NestJS avec `GET /api/health`

**Files:**

- Create (via CLI) : `apps/api/**`. Lancer depuis la racine : `pnpm dlx @nestjs/cli@latest new api --directory apps/api --package-manager pnpm --skip-git --skip-install --strict`.
- Supprimer : `apps/api/.prettierrc` (on utilise celui de la racine), ainsi que `app.controller.ts`, `app.service.ts` et leur spec générés.
- Create : `apps/api/src/app.setup.ts`, `apps/api/src/health/health.controller.ts`, `apps/api/src/health/health.module.ts`
- Modify : `apps/api/src/main.ts`, `apps/api/src/app.module.ts`, `apps/api/package.json`, `apps/api/eslint.config.mjs`
- Test : `apps/api/test/health.e2e-spec.ts` (remplace `app.e2e-spec.ts`)

**Interfaces:**

- Consumes : `HealthResponse` (Task 1), en `import type`.
- Produces :
  - `configureApp(app: INestApplication): void` dans `app.setup.ts`, qui applique `app.setGlobalPrefix('api')`. Utilisé par `main.ts` et par les tests e2e.
  - `GET /api/health` → `200`, corps `HealthResponse`, avec `timestamp = new Date().toISOString()`.
  - Écoute sur `process.env.PORT ?? 3000`.
  - Scripts de `apps/api/package.json` :
    - `name: "@espace-client/api"` ;
    - `dev` = `nest start --watch` ;
    - `build` = `nest build` ;
    - `test` = `jest && jest --config ./test/jest-e2e.json` ;
    - `lint` = `eslint "{src,test}/**/*.ts"` (sans `--fix`) ;
    - `typecheck` = `tsc --noEmit -p tsconfig.json`.

- [ ] **Step 1: Générer l'app, renommer le package, ajouter la dépendance partagée, `pnpm install` à la racine.** Ajouter la règle `@typescript-eslint/consistent-type-imports: "error"` dans `eslint.config.mjs`.

- [ ] **Step 2: Écrire le test qui échoue** — `apps/api/test/health.e2e-spec.ts`. L'app de test passe par `configureApp(app)` avant `app.init()`.

```ts
it('GET /api/health renvoie le statut', async () => {
  const res = await request(app.getHttpServer()).get('/api/health').expect(200);
  expect(res.body.status).toBe('ok');
  expect(new Date(res.body.timestamp).toISOString()).toBe(res.body.timestamp);
});

it('GET /health sans préfixe renvoie 404', async () => {
  await request(app.getHttpServer()).get('/health').expect(404);
});
```

- [ ] **Step 3: Lancer le test pour vérifier qu'il échoue**
  - Run : `pnpm --filter @espace-client/api exec jest --config ./test/jest-e2e.json`
  - Expected : FAIL (module `app.setup` introuvable ou 404 sur `/api/health`).

- [ ] **Step 4: Implémenter `configureApp`, `HealthModule` et `HealthController.getHealth(): HealthResponse`.** Brancher `HealthModule` dans `AppModule`, et appeler `configureApp` dans `main.ts`.

- [ ] **Step 5: Vérifier**
  - Run : `pnpm --filter @espace-client/api test && pnpm --filter @espace-client/api lint && pnpm --filter @espace-client/api typecheck`
  - Expected : tous les tests PASS, aucune erreur de lint ni de types.

- [ ] **Step 6: Commit** — `feat(api): ajoute l'API NestJS avec la route /api/health`

---

### Task 3: Front Angular qui affiche le statut de l'API

**Files:**

- Create (via CLI) : `apps/web/**`. Lancer depuis la racine : `pnpm dlx @angular/cli@latest new web --directory apps/web --package-manager pnpm --skip-git --skip-install --style scss --ssr false --routing false`. Répondre aux autres questions par défaut, sans configuration d'outil IA.
- Ajouter ESLint : `pnpm --filter @espace-client/web exec ng add angular-eslint --skip-confirmation`.
- Create : `apps/web/src/app/health/health-client.ts`, `apps/web/src/app/health/health-status.ts`
- Modify : `apps/web/src/app/app.config.ts`, le composant racine (fichier généré par le CLI), `apps/web/package.json`, `apps/web/eslint.config.js`
- Test : `apps/web/src/app/health/health-status.spec.ts`

**Interfaces:**

- Consumes : `HealthResponse` (Task 1), en `import type`.
- Produces :
  - `HealthClient` (service `providedIn: 'root'`) avec `getHealth(): Observable<HealthResponse>`, qui fait `GET /api/health` (URL relative).
  - Composant `HealthStatus` (sélecteur `app-health-status`, standalone). Il affiche un `<p data-testid="health-status">` avec exactement :
    - `Vérification de l'API…` pendant l'appel ;
    - `API connectée` si la réponse a `status === 'ok'` ;
    - `API injoignable` sur toute erreur HTTP ou réseau.
  - Le composant racine affiche un titre `Espace client` et `<app-health-status />`.
  - `app.config.ts` fournit `provideHttpClient(withFetch())`.
  - Scripts de `apps/web/package.json` :
    - `name: "@espace-client/web"` ;
    - `dev` = `ng serve` ;
    - `build` = `ng build` ;
    - `test` = `ng test --watch=false` ;
    - `lint` = `ng lint` ;
    - `typecheck` = `tsc --noEmit -p tsconfig.app.json && tsc --noEmit -p tsconfig.spec.json`.

- [ ] **Step 1: Générer l'app, ajouter ESLint, renommer le package, ajouter la dépendance partagée, `pnpm install` à la racine.** Ajouter `@typescript-eslint/consistent-type-imports: "error"` pour les fichiers `.ts`. Supprimer le `.prettierrc` ou la config Prettier locale si le CLI en génère une.

- [ ] **Step 2: Écrire les tests qui échouent** — `health-status.spec.ts`, avec `provideHttpClient()` + `provideHttpClientTesting()` et `HttpTestingController` :

```ts
it("affiche « Vérification de l'API… » pendant l'appel", () => {
  // créer le composant, detectChanges, ne pas répondre à la requête
  expect(text()).toBe("Vérification de l'API…");
});

it("affiche « API connectée » quand l'API répond ok", () => {
  const body: HealthResponse = { status: 'ok', timestamp: '2026-11-14T10:00:00.000Z' };
  http.expectOne('/api/health').flush(body);
  expect(text()).toBe('API connectée');
});

it("affiche une erreur si l'API ne répond pas", () => {
  http.expectOne('/api/health').error(new ProgressEvent('error'));
  expect(text()).toBe('API injoignable');
});

it('affiche une erreur sur une réponse 404', () => {
  http.expectOne('/api/health').flush('Not Found', { status: 404, statusText: 'Not Found' });
  expect(text()).toBe('API injoignable');
});
```

`text()` lit le contenu (trimé) de `[data-testid="health-status"]` après `fixture.detectChanges()` (ou `await fixture.whenStable()` si l'app est sans zone). Ajouter `http.verify()` en `afterEach`. Remplacer le test du composant racine généré par un seul test : le titre `Espace client` s'affiche.

- [ ] **Step 3: Lancer les tests pour vérifier qu'ils échouent**
  - Run : `pnpm --filter @espace-client/web test`
  - Expected : FAIL (`HealthStatus` introuvable).

- [ ] **Step 4: Implémenter `HealthClient` et `HealthStatus`.** L'état est porté par un signal (`'loading' | 'ok' | 'error'`), et les libellés sont dérivés de cet état.

- [ ] **Step 5: Vérifier**
  - Run : `pnpm --filter @espace-client/web test && pnpm --filter @espace-client/web lint && pnpm --filter @espace-client/web typecheck`
  - Expected : tous les tests PASS, aucune erreur.

- [ ] **Step 6: Commit** — `feat(web): ajoute le front Angular qui affiche le statut de l'API`

---

### Task 4: Branchement local de bout en bout et documentation

**Files:**

- Create : `apps/web/proxy.conf.json`, `README.md`
- Modify : `apps/web/angular.json` (option `proxyConfig` de la cible `serve`)

**Interfaces:**

- Consumes : scripts racine (Task 1), `GET /api/health` sur le port 3000 (Task 2), `HealthStatus` (Task 3).
- Produces : `pnpm dev` lance l'API sur `:3000` et le front sur `:4200`. `http://localhost:4200/api/health` est relayé vers l'API.

- [ ] **Step 1: Configurer le proxy** — `proxy.conf.json` : `{ "/api": { "target": "http://localhost:3000", "secure": false } }`, référencé par `serve.options.proxyConfig` dans `angular.json`.

- [ ] **Step 2: Vérifier l'ensemble depuis la racine**
  - Run : `pnpm install && pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build`
  - Expected : tout passe. Si `format:check` échoue, lancer `pnpm format`, puis relancer.

- [ ] **Step 3: Vérifier le parcours réel**
  - Lancer `pnpm dev` en arrière-plan.
  - `curl -s http://localhost:4200/api/health` → JSON avec `"status":"ok"`.
  - Ouvrir `http://localhost:4200` → la page affiche `Espace client` et `API connectée`.
  - Arrêter l'API seule (ou lancer seulement `pnpm --filter @espace-client/web dev`) → la page affiche `API injoignable`.

- [ ] **Step 4: Vérifier le build de production de l'API**
  - Run : `pnpm --filter @espace-client/api build`, puis `PORT=3100 node apps/api/dist/main.js` en arrière-plan, puis `curl -s http://localhost:3100/api/health`.
  - Expected : `dist/main.js` existe à cet emplacement exact, le serveur démarre, la réponse contient `"status":"ok"`.

- [ ] **Step 5: Vérifier que le contrat partagé protège les deux côtés**
  - Renommer temporairement `timestamp` en `time` dans `packages/shared/src/health.ts`, puis lancer `pnpm typecheck`.
  - Expected : erreurs de type dans `apps/api` (le contrôleur renvoie `timestamp`) **et** dans `apps/web` (le test construit une réponse typée `HealthResponse` avec `timestamp`).
  - Annuler le changement (`git checkout packages/shared/src/health.ts`) et vérifier que `pnpm typecheck` repasse.

- [ ] **Step 6: Écrire `README.md`** (en français) :
  - prérequis (Node 22, pnpm) ;
  - installation (`pnpm install`) ;
  - lancer en dev (`pnpm dev`, URLs `:4200` et `:3000`) ;
  - scripts de vérification (`lint`, `typecheck`, `test`, `build`, `format`) ;
  - structure des dossiers ;
  - règle : le partagé s'importe en `import type` à ce stade.

- [ ] **Step 7: Commit** — `chore: branche le front sur l'API en local et documente le démarrage`
