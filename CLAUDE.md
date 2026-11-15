# CLAUDE.md

Espace client d'une photographe : un front Angular (`apps/web`) et une API NestJS (`apps/api`) dans un monorepo pnpm, avec des types partagés (`packages/shared`). Démarrage et scripts : voir `README.md`. Vision et conception : `docs/superpowers/specs/`.

## Documentation des librairies : context7 obligatoire

Avant de concevoir, de planifier ou d'écrire du code qui dépend d'Angular, de NestJS ou d'une autre librairie ou d'un autre outil (pnpm, Vitest, oxlint, ESLint, Prisma…), consulter la documentation **à jour** avec le serveur MCP **context7** (`resolve-library-id`, puis `query-docs`). Ne pas se fier à sa mémoire : les versions utilisées ici (Angular 22, NestJS 12, Node 26) sont plus récentes que ce que les modèles connaissent, et leurs valeurs par défaut ont changé.

Pour NestJS, https://docs.nestjs.com/llms.txt indexe aussi la documentation (voir `apps/api/AGENTS.md`).

## Vérifier son travail

Depuis la racine, tout doit passer avant de déclarer une tâche terminée :

```bash
pnpm format:check && pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

## Règles du projet

- Node 26 (`.nvmrc`), géré avec fnm. Gestionnaire de paquets : pnpm uniquement.
- TypeScript `strict` partout.
- Les contrats d'API sont définis dans `packages/shared`, et ce package s'importe **uniquement en `import type`** à ce stade.
- Côté API, un service injecté par le constructeur s'importe **en valeur**, jamais en `import type`, sinon l'injection de dépendances de Nest échoue (voir `apps/api/AGENTS.md`).
- Le projet avance une étape à la fois : squelette, puis base de données et ORM, puis connexion, puis première fonctionnalité, puis déploiement. Ne pas anticiper les décisions des étapes suivantes.
- Aucun vrai secret dans le dépôt : il est public. En local, `.env` (ignoré par git) ne contient que des valeurs de développement. Les secrets de production vivent dans Coolify et dans les secrets GitHub.
