# Espace client

Espace client d'une photographe : un front Angular et une API NestJS dans un monorepo pnpm.

## Prérequis

- **Node 26** (version indiquée dans `.nvmrc`). Avec [fnm](https://github.com/Schniz/fnm) configuré avec `--use-on-cd`, la bonne version est choisie automatiquement en entrant dans le dossier.
- **pnpm** (`npm i -g pnpm`). La version utilisée est fixée par le champ `packageManager` du `package.json` racine.

## Installation

```bash
pnpm install
```

## Lancer en développement

```bash
pnpm dev
```

- Front : http://localhost:4200
- API : http://localhost:3000 (route de test : `GET /api/health`)

Le serveur de développement Angular relaie `/api` vers l'API (`apps/web/proxy.conf.json`). Il n'y a donc pas de CORS à configurer en local.

## Scripts de vérification

À lancer depuis la racine. Ils couvrent tous les packages.

| Commande            | Rôle                                           |
| ------------------- | ---------------------------------------------- |
| `pnpm lint`         | Lint (oxlint pour l'API, ESLint pour le front) |
| `pnpm typecheck`    | Vérification des types TypeScript (strict)     |
| `pnpm test`         | Tests (Vitest pour l'API et le front)          |
| `pnpm build`        | Build de production de tous les packages       |
| `pnpm format`       | Formate le code avec Prettier                  |
| `pnpm format:check` | Vérifie le formatage sans rien modifier        |

## Structure

```
apps/
  api/        API NestJS (CLI Nest, ESM, Vitest, oxlint)
  web/        Front Angular (CLI Angular, composants standalone, Vitest, ESLint)
packages/
  shared/     Types partagés entre le front et l'API
docs/         Notes de conception et plans
```

## Règles

- Les types de l'API (réponses, DTO) sont définis dans `packages/shared`. Si un contrat change, le front et l'API cassent tous les deux à la compilation.
- À ce stade, le package partagé s'importe **uniquement en `import type`**. Le lint le vérifie avec la règle `consistent-type-imports`.
