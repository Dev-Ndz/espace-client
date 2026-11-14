# Étape 1 : squelette du monorepo (front + back en local)

- **Date :** 2026-11-14
- **Statut :** à valider
- **Contexte global :** `2026-11-14-plateforme-socle-design.md` (vision et notes de travail)

## Intention

Poser l'architecture globale et faire tourner en local un projet minimal où le front Angular parle à l'API NestJS. C'est la base sur laquelle viendront ensuite, une étape à la fois : la base de données et l'ORM, la connexion, une première fonctionnalité, puis le déploiement.

## Approches

| Approche | Arbitrage |
|---|---|
| **Angular + NestJS** ✅ retenue | NestJS reprend la logique d'Angular (modules, injection de dépendances). Sa structure imposée garde le code cohérent quand il est écrit par des agents. C'est aussi le framework que le porteur veut essayer. |
| Angular + Express ou Hono | Minimaliste, mais la structure est à inventer, et c'est là que le code agentique dérive. |
| Angular + Supabase | Pas d'API à écrire, mais ce n'est plus une architecture client-serveur et ça ne permet pas de tester un framework back. |

Organisation du dépôt : **workspaces pnpm** avec les CLI officiels, plutôt que Nx (une couche d'outillage de plus, qu'on pourra ajouter si le dépôt grossit) **[choix Claude]**.

## Ce qui est construit

```
espace-client/
├── apps/
│   ├── web/          ← Angular (CLI Angular, composants standalone)
│   └── api/          ← NestJS (CLI Nest)
├── packages/
│   └── shared/       ← types partagés entre front et API
├── package.json      ← workspaces + scripts communs
└── pnpm-workspace.yaml
```

- **Un seul aller-retour front ↔ API** pour prouver que tout est branché : l'API expose `GET /api/health`, qui renvoie un objet typé par une interface de `packages/shared`. La page d'accueil Angular l'appelle et affiche le résultat (« API connectée » ou une erreur).
- **Types partagés :** si l'on change l'interface dans `shared`, le front et l'API cassent tous les deux à la compilation. C'est le garde-fou principal pour la suite.
- **Une commande pour tout lancer :** `pnpm dev` démarre l'API et le front en parallèle. Le serveur de dev Angular relaie `/api` vers NestJS, donc pas de configuration CORS en local **[choix Claude]**.
- **Scripts communs à la racine**, pour qu'un agent puisse vérifier son travail seul : `pnpm build`, `pnpm test`, `pnpm lint`, `pnpm typecheck`.
- **Un test par application** pour amorcer :
  - API : test de bout en bout de `/api/health` ;
  - front : test du composant qui affiche le statut.
- TypeScript en mode `strict` partout. ESLint + Prettier configurés à la racine.
- Versions : dernières versions stables d'Angular et NestJS. Node 22 (déjà installé, compatible). pnpm à installer (`npm i -g pnpm` ou corepack) **[choix Claude]**.

## Hors périmètre de cette étape

Base de données, ORM, Docker, connexion des utilisateurs, fonctionnalités métier, CI/CD, déploiement. Chacun aura son étape.

## Laissé au constructeur

Organisation des dossiers dans chaque application, runner de test du front, détails de configuration ESLint et Prettier, apparence de la page d'accueil (une page simple suffit).
