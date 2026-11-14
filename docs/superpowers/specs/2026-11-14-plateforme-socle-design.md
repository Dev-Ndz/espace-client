# Espace client photographe — Vision et notes de travail

> **⚠️ Notes de travail, pas un document validé.**
> Ce document rassemble tout ce qui a été dit sur le projet, pour ne pas faire de choix qui obligeraient à revenir en arrière.
> **Seuls sont décidés** : l'intention (§1–3), les contraintes (§4), le choix Angular + NestJS en monorepo (§5) et un VPS avec Coolify pour l'hébergement (§5).
> Tout le reste (base de données, ORM, connexion, modèle de données, écrans, déploiement, CI) est une **piste** qui sera rediscutée à son étape, dans cet ordre : squelette local → base de données et ORM → connexion → première fonctionnalité → déploiement.

- **Date :** 2026-11-14
- **Statut :** notes de travail
- **Portée de ce document :** le socle technique et fonctionnel (comptes, clients, projets, étapes datées, hébergement, CI/CD, tests). Les fonctionnalités suivantes (questionnaires, échange de documents, etc.) auront chacune leur propre document de conception.

Légende : les éléments marqués **[choix Claude]** sont des propositions faites pendant la conception, pas des décisions explicites du porteur de projet. Ils sont à relire en priorité.

---

## 1. Intention

Créer un espace client pour une photographe (la compagne du porteur de projet) afin de **faciliter les échanges avec ses clients** autour de chaque séance.

Son parcours client actuel :

1. Elle envoie un **questionnaire stratégique** (objectif de la séance, esthétique attendue), basé sur un modèle qu'elle adapte à chaque client.
2. Le client fournit des **documents d'inspiration** (charte graphique, moodboard, exemples).
3. Elle prépare un **moodboard** (hors plateforme, c'est son travail créatif).
4. Elle organise un **rendez-vous de préparation** pour valider le moodboard avec le client.
5. Puis vient le **shooting**, et plus tard la sélection et la livraison des photos.

Aujourd'hui ces échanges sont dispersés. La plateforme les centralise et donne au client une vue claire de ce qu'il doit faire et quand.

C'est aussi un **projet personnel du porteur pour tester le développement entièrement agentique** : le code sera écrit en grande partie par des agents. Cela pèse sur les choix techniques (voir §5).

## 2. Utilisateurs

- **La photographe** (une seule, rôle `photographer`) : gère clients, projets, étapes, modèles. Elle voit tout.
- **Les utilisateurs clients** (rôle `client`) : une ou plusieurs personnes rattachées à un client. Ils ne voient que les données de leur client.

Il n'y a **qu'une seule photographe**. Ce n'est pas un SaaS multi-photographes, et ça n'a pas vocation à le devenir.

## 3. Objectifs, non-objectifs, anti-objectifs

**Objectifs du socle**

- Une plateforme déployée, accessible en ligne, avec connexion sécurisée pour la photographe et ses clients.
- Le modèle Client → Utilisateurs → Projets → Étapes en place, gérable par la photographe.
- Une page d'accueil client qui montre, par projet, la **frise des étapes datées** (questionnaire à remplir pour telle date, appel de préparation, shooting…).
- Une base saine pour enchaîner les fonctionnalités : monorepo, types partagés, CI qui bloque les régressions, déploiement automatique.

**Non-objectifs du socle** (prévus plus tard, hors de ce document)

- Questionnaires (fonctionnalité n°1 après le socle).
- Échange de documents (fonctionnalité n°2), sauf l'envoi du logo du client.
- Prise de rendez-vous, rappels et notifications automatiques.
- Galerie de sélection, hébergement et livraison des photos.
- Facturation : une facture sera un simple document déposé (fonctionnalité documents), pas un module de facturation.

**Anti-objectifs** (rendraient le projet raté même s'il fonctionne)

- Automatiser le travail créatif de la photographe (par exemple générer le moodboard).
- Des coûts récurrents significatifs : l'objectif est de rester sur des offres gratuites, en dehors du VPS (voir §7).
- Un parcours client compliqué : le client se connecte rarement, souvent sur téléphone. Il doit comprendre immédiatement quoi faire.
- Fuite de données entre clients : un client qui voit les données d'un autre est le pire bug possible.

## 4. Contraintes

- **Budget :** offres gratuites autant que possible. Dépenses acceptées : un VPS personnel (~4–6 €/mois, qui servira aussi à d'autres projets) et un nom de domaine. Le porteur accepte de faire des choses à la main plutôt que de payer un fournisseur.
- **Compétences du porteur :** TypeScript, architecture client-serveur, Angular (apprécié), Node.js (AdonisJS surtout, NestJS un peu). Il veut **posséder et comprendre tout le code**, sans gérer toute l'infrastructure lui-même.
- **Habitudes :** GitHub Actions pour la CI, Coolify sur VPS pour le déploiement.
- **Développement agentique :** le code doit être structuré et testé de façon à ce qu'un agent puisse vérifier lui-même son travail (types stricts, tests automatisés, CI).
- **Données personnelles :** données de clients (coordonnées, documents, plus tard photos). Hébergement dans l'UE **[choix Claude]**.

## 5. Approches envisagées

| Approche                           | Résumé                                              | Arbitrage                                                                                                                                                                                                                                                           |
| ---------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Angular + NestJS** ✅ retenue | Monorepo, API NestJS, front Angular, types partagés | NestJS reprend la logique d'Angular (modules, injection de dépendances, décorateurs). Sa structure imposée garde le code cohérent quand il est écrit par des agents. Plus de code « cadre » qu'un serveur minimaliste.                                              |
| B. Angular + Express ou Hono       | API minimaliste                                     | Contrôle total, peu de code, mais structure à inventer. C'est là que le code agentique dérive le plus sur un projet qui grossit.                                                                                                                                    |
| C. Angular + Supabase              | Pas de back-end, BaaS                               | Le plus rapide, mais la logique métier part dans des règles SQL, ce n'est plus une architecture client-serveur, le stockage gratuit ne suffit pas pour des photos, et le projet se met en pause après une semaine d'inactivité. Contraire aux objectifs du porteur. |

**Choix du porteur : A.**

Hébergement envisagé :

| Option                                     | Arbitrage                                                                                                                                                                             |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **VPS + Coolify** ✅ retenue               | ~4–6 €/mois, pas de démarrage à froid, outil connu, VPS réutilisable pour d'autres projets. En contrepartie : mises à jour du VPS et de Coolify, sauvegardes de la base à surveiller. |
| Cloudflare Pages + Google Cloud Run + Neon | 0 €, presque rien à maintenir, mais démarrage à froid, configuration GCP plus lourde, nouvel environnement.                                                                           |

**Choix du porteur : un nouveau VPS personnel avec Coolify** (le VPS du travail n'est pas utilisable pour un projet privé).

## 6. Architecture technique

### 6.1 Monorepo

Gestionnaire : **pnpm workspaces**. Pas de Nx pour l'instant. On garde les CLI officiels Angular et Nest, et on pourra ajouter Nx si le dépôt grossit.

```
espace-client/
├── apps/
│   ├── web/        ← Angular (CLI Angular)
│   └── api/        ← NestJS (CLI Nest)
├── packages/
│   └── shared/     ← types et contrats d'API partagés (DTO, enums, schémas)
├── docker-compose.yml   ← services de développement local
├── .github/workflows/   ← CI/CD
└── docs/
```

- Versions : dernières versions stables d'Angular, NestJS, Node LTS et TypeScript au moment de la mise en place.
- TypeScript en mode `strict` partout.
- Un changement de contrat dans `packages/shared` doit casser la compilation du front **et** de l'API s'ils ne sont pas à jour. C'est le principal garde-fou pour le travail agentique.

### 6.2 Composants

| Composant       | Choix                                                                 | Détail                                                                                                                                                                                                                                                                                                                                                                                    |
| --------------- | --------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Front           | Angular (composants standalone, signals)                              | Application unique. L'interface change selon le rôle (photographe ou client).                                                                                                                                                                                                                                                                                                             |
| API             | NestJS, REST JSON                                                     | Un module Nest par domaine : `auth`, `users`, `clients`, `projects`, `steps`, `templates`, `storage`, `mail`.                                                                                                                                                                                                                                                                             |
| Base de données | PostgreSQL (sur le VPS via Coolify)                                   |                                                                                                                                                                                                                                                                                                                                                                                           |
| ORM             | **Prisma** **[choix Claude]**                                         | Très répandu, typage généré, migrations versionnées, bien maîtrisé par les agents. Alternative crédible : Drizzle.                                                                                                                                                                                                                                                                        |
| Fichiers        | **Cloudflare R2** (compatible S3)                                     | Bucket privé. Accès par URL signées à durée limitée générées par l'API. Gratuit jusqu'à 10 Go, sans frais de téléchargement (important pour la future galerie). Dans le socle, sert seulement au logo du client.                                                                                                                                                                          |
| E-mails         | **Resend** (offre gratuite : 3 000/mois, 100/jour) **[choix Claude]** | Envoi depuis le domaine du projet (DNS vérifié). Alternative : Brevo (300/jour). Le module `mail` passe par une interface, pour pouvoir changer de fournisseur.                                                                                                                                                                                                                           |
| UI              | **Angular Material** **[choix Claude]**                               | Composants officiels, accessibles, responsive. Thème sobre adapté à la photographe. Son logo, ses couleurs et le nom de son activité sont fixés **dans la configuration du front** (fichier de thème + asset statique), pas modifiables depuis l'application **[choix Claude]**. Un seul photographe, ça change rarement : pas besoin de table de paramètres ni d'écran d'administration. |

### 6.3 Développement local

`docker compose up` lance tout ce dont l'API a besoin, sans service externe :

- PostgreSQL ;
- **MinIO** (stockage compatible S3, remplace R2 en local) ;
- **Mailpit** (capture les e-mails envoyés, avec interface web, pour tester les liens de connexion).

La configuration passe par des variables d'environnement, validées au démarrage de l'API (l'API refuse de démarrer si une variable manque). Un fichier `.env.example` documente chaque variable.

## 7. Hébergement et déploiement

### 7.1 Infrastructure

- **VPS :** un petit serveur dans l'UE, par exemple Hetzner (2 vCPU, 4 Go de RAM, ~4–6 €/mois). 4 Go laissent de la place pour Coolify, ce projet et d'autres projets.
- **Coolify** installé sur le VPS. Il gère :
  - `web` : le build statique Angular servi par un conteneur léger (nginx ou équivalent) ;
  - `api` : le conteneur Docker NestJS ;
  - `postgres` : base de données gérée par Coolify ;
  - les certificats HTTPS (automatiques).
- **Nom de domaine** (~10 €/an) avec DNS chez **Cloudflare** (gratuit).
  - `app.<domaine>` → front ;
  - `api.<domaine>` → API.
  - Le même domaine parent permet un cookie de session simple et sûr (voir §8).
- **Sauvegardes :** sauvegarde quotidienne de PostgreSQL par Coolify vers un **bucket R2 séparé**, conservée 30 jours **[choix Claude]**. Une procédure de restauration est documentée dans `docs/` et testée une fois avant la mise en production réelle.

### 7.2 CI/CD (GitHub Actions)

**À chaque pull request**, et la fusion est bloquée si ça échoue :

1. installation (pnpm, avec cache) ;
2. lint et formatage ;
3. vérification des types sur tout le monorepo ;
4. tests unitaires (API et front) ;
5. tests d'intégration de l'API contre un vrai PostgreSQL (conteneur de service GitHub Actions) ;
6. build du front et de l'API ;
7. tests de bout en bout (Playwright) sur les parcours critiques (§10).

**À chaque fusion sur `main`** :

1. même pipeline ;
2. build des images Docker `api` et `web`, poussées sur **GitHub Container Registry** (gratuit) ;
3. déclenchement du déploiement Coolify par webhook ;
4. les migrations Prisma s'appliquent avant que la nouvelle version de l'API ne reçoive du trafic.

**Environnements :** local et production uniquement pour le socle **[choix Claude]**. Pas d'environnement de prévisualisation par PR pour l'instant : il faudrait une base par prévisualisation, ce qui complique le socle sans grand bénéfice. À reconsidérer plus tard.

### 7.3 Mise en place manuelle (par le porteur)

Les agents ne peuvent pas créer de comptes ni acheter de services. Le plan doit prévoir ces étapes comme une **liste de vérification pour le porteur**, à faire avant la première mise en production. Le développement local (§6.3) n'en dépend pas et peut avancer avant.

- [ ] Louer le VPS et installer Coolify
- [ ] Nom de domaine + DNS chez Cloudflare (`app.` et `api.`)
- [ ] Compte Cloudflare R2 : bucket `files` et bucket `backups`, clés d'accès
- [ ] Compte Resend + vérification DNS du domaine d'envoi
- [ ] Dépôt GitHub + secrets CI (webhook Coolify)
- [ ] Création du compte photographe via la CLI en production

## 8. Authentification et autorisations

### 8.1 Connexion **[choix Claude]**

- **Lien de connexion par e-mail (magic link)** pour tout le monde, sans mot de passe.
  - Raison : les clients se connectent rarement et oublieraient un mot de passe. Pour la photographe, une session longue rend la connexion rare.
  - Implémentation maison dans le module `auth`, petite et lisible, conformément au souhait de posséder tout le code. Règles :
    - jeton aléatoire fort, **stocké haché** en base, **usage unique**, expiration **15 minutes** ;
    - demande de lien limitée en fréquence (par e-mail et par IP) ;
    - réponse identique que l'e-mail existe ou non (pas de fuite de l'existence d'un compte) ;
    - aucun compte n'est créé par une demande de lien : seule la photographe crée des comptes.
- **Sessions** stockées en base (révocables), identifiées par un **cookie `HttpOnly`, `Secure`, `SameSite=Lax`**, posé sur le domaine parent. Durée : 30 jours glissants.
- Protection CSRF : `SameSite=Lax` plus une vérification de l'en-tête `Origin` sur les requêtes qui modifient des données.
- Déconnexion : supprime la session courante.

### 8.2 Création des comptes

- **Photographe :** créée par une commande CLI de l'API (`create-photographer <email>`), lancée une fois en production.
- **Utilisateurs clients :** la photographe ajoute un utilisateur (nom, e-mail) sur la fiche d'un client. Un **e-mail d'invitation** part avec un lien de première connexion (mêmes règles que le magic link, expiration plus longue : 7 jours). Elle peut renvoyer l'invitation ou désactiver un utilisateur.
- Le modèle accepte **plusieurs utilisateurs par client** dès le départ. L'interface pour en ajouter plusieurs fait partie du socle, puisqu'elle sert déjà au premier utilisateur.

### 8.3 Autorisations

- Deux rôles : `photographer` et `client`.
- Un utilisateur client appartient à **un seul client** **[choix Claude]**. Pas de rôle à l'intérieur d'un client : tous ses utilisateurs voient tous ses projets.
- Contrôle **côté API, systématiquement** : un _guard_ Nest vérifie le rôle, et toute requête d'un utilisateur client est filtrée sur son `clientId`. Le front n'est jamais une barrière de sécurité.
- **Tests obligatoires :** pour chaque route accessible aux clients, un test vérifie qu'un utilisateur du client A ne peut ni lire ni modifier les données du client B (réponse 404, pour ne pas révéler l'existence des données).

## 9. Modèle de données (socle)

```
User ──┐
       │ n..1 (null pour la photographe)
Client ┴── 1..n ── Project ── 1..n ── Step
   │
   └── logo (clé R2)

StepTemplate (modèle de parcours) ── 1..n ── StepTemplateItem
Session, LoginToken (auth)
```

**Client**

- `id`, `name` (nom affiché : entreprise ou particulier), `type` (`company` | `individual`)
- `logoKey` (clé du fichier dans R2, optionnelle)
- coordonnées : `contactEmail`, `phone`
- facturation : `billingName`, `billingAddress` (rue, code postal, ville, pays), `vatNumber` (optionnel), `billingEmail`
- `notes` (privées, visibles seulement par la photographe)
- `createdAt`, `updatedAt`, `archivedAt` (archivage plutôt que suppression). Archiver un client **désactive ses utilisateurs et supprime leurs sessions** **[choix Claude]**. Le désarchiver les réactive.

**User**

- `id`, `email` (unique), `firstName`, `lastName`, `role`, `clientId` (null pour la photographe)
- `status` (`invited` | `active` | `disabled`), `lastLoginAt`, horodatages

**Project** (une séance ou une prestation pour un client)

- `id`, `clientId`, `title`, `description`
- `status` (`draft` | `active` | `completed` | `archived`). Visibilité côté client **[choix Claude]** :
  - `draft` : invisible ;
  - `active` : visible, affiché sur l'accueil ;
  - `completed` : visible en lecture seule, dans une section « Projets terminés » ;
  - `archived` : invisible.
    Ce filtre est appliqué par l'API sur toutes les routes client, et les tests d'isolation le vérifient.
- horodatages

**Step** (étape datée d'un projet)

- `id`, `projectId`, `position` (ordre d'affichage), `title`, `description` (texte riche simple ou markdown, au choix du constructeur)
- `kind` : `client_action` (le client doit faire quelque chose), `meeting` (appel ou rendez-vous), `milestone` (repère, par exemple le shooting)
- `dueAt` : date, avec heure optionnelle (`dueAt` + `hasTime`). **Nullable** **[choix Claude]** : les étapes copiées d'un modèle n'ont pas de date. Une étape sans date s'affiche « date à venir ». Un projet peut passer en `active` avec des étapes non datées.
- **Ordre d'affichage = `position`**, choisi par la photographe **[choix Claude]**. Les dates ne réordonnent pas la frise. Côté photographe, un avertissement discret signale une étape datée plus tôt que la précédente.
- « Prochaine échéance » = première étape `todo` dans l'ordre de `position`, qu'elle soit datée ou non.
- `location` / `meetingUrl` (optionnels, utiles pour `meeting`)
- `status` : `todo` | `done`, plus `completedAt`
- `linkedResourceType` + `linkedResourceId` (nullables) : **point d'accroche pour les fonctionnalités suivantes** (une étape « Remplir le questionnaire » pointera vers le questionnaire). Inutilisés dans le socle, mais prévus pour éviter une migration lourde.
- Statut dérivé à l'affichage (pas stocké) : « en retard » si `todo` et `dueAt` dépassée.

**StepTemplate / StepTemplateItem** (modèles de parcours) **[choix Claude]**

- Un modèle = un nom + une liste ordonnée d'étapes (titre, description, `kind`) **sans dates**.
- Appliquer un modèle à un projet copie ses étapes dans le projet. La photographe saisit ensuite les dates. Modifier un modèle plus tard ne touche pas les projets existants.
- Amélioration possible plus tard : dates relatives (« J-14 avant le shooting »).

**Notifications futures :** `dueAt` et `status` suffisent pour qu'un futur planificateur sélectionne les étapes à rappeler. Rien d'autre à prévoir dans le socle.

**Fuseau horaire :** les dates sont stockées en UTC et affichées dans le fuseau de la photographe, défini par une variable de configuration (par défaut `Europe/Brussels`, à confirmer).

**Langue :** interface en **français uniquement** **[choix Claude]**, sans système de traduction.

## 10. Écrans du socle

Tous les écrans sont **responsives**. Le côté client est pensé d'abord pour le téléphone.

### 10.1 Côté client

- **Connexion :** saisie de l'e-mail → « Un lien vous a été envoyé ».
- **Accueil :** liste de ses projets actifs, avec pour chacun la prochaine échéance. S'il n'y a qu'un projet actif, on arrive directement dessus.
- **Projet :** frise des étapes dans l'ordre :

  ```
  Séance portrait — Marie Dupont
  ─────────────────────────────────────────────
  ✔  12 nov.          Questionnaire stratégique      fait
  ●  20 nov.          Envoi des inspirations         à faire
  ○  25 nov. 14:00    Appel de préparation (moodboard)   lien visio
  ○  03 déc.          Shooting                       lieu
  ```

  L'étape suivante à faire est mise en avant. Les étapes en retard sont signalées sans être alarmantes.

- **Mon compte / mon entreprise :** voir les infos du client. Le client peut **modifier ses coordonnées de facturation et son logo** **[choix Claude]**, pour éviter à la photographe de les ressaisir. Il voit aussi les autres utilisateurs de son client (lecture seule).

Dans le socle, le client **ne coche pas** les étapes : c'est la photographe qui les marque comme faites **[choix Claude]**. Plus tard, certaines étapes se compléteront automatiquement (par exemple quand un questionnaire est envoyé).

### 10.2 Côté photographe

- **Tableau de bord :** prochaines échéances tous projets confondus, et étapes en retard.
- **Clients :** liste avec recherche, création, archivage.
- **Fiche client :** infos et facturation, logo, notes privées, utilisateurs (inviter, renvoyer l'invitation, désactiver), liste des projets.
- **Fiche projet :** infos, statut, étapes (ajouter, modifier, réordonner, supprimer, marquer comme faite), « appliquer un modèle de parcours ».
- **Modèles de parcours :** liste, création et modification.
- **Aperçu « vu par le client »** sur la fiche projet **[choix Claude]** : pour vérifier ce que le client verra avant de passer le projet en `active`.

## 11. Tests et qualité

Objectif : qu'un agent puisse savoir seul si son travail est correct.

- **API**
  - tests unitaires des services ;
  - **tests d'intégration contre un vrai PostgreSQL** (pas de mock de la base), y compris les tests d'isolation entre clients (§8.3) ;
  - tests du flux d'authentification (jeton expiré, réutilisé, inexistant ; limitation de fréquence).
- **Front :** tests de composants sur la logique non triviale (frise des étapes, statut en retard, affichage selon le rôle).
- **Bout en bout (Playwright)**, sur la pile locale (docker compose) :
  1. la photographe se connecte (lien récupéré dans Mailpit), crée un client, invite un utilisateur, crée un projet, applique un modèle, date les étapes, active le projet ;
  2. l'utilisateur client se connecte via l'invitation et voit la frise de son projet ;
  3. un utilisateur d'un autre client ne voit pas ce projet.
- Lint et formatage automatiques, types stricts, aucune erreur tolérée en CI.
- Des données de démonstration (_seed_) permettent de lancer l'application en local avec une photographe, deux clients et quelques projets.

## 12. Sécurité et données personnelles

- HTTPS partout (Coolify), en-têtes de sécurité standard (helmet), CORS restreint à `app.<domaine>`.
- Validation de toutes les entrées de l'API.
- Fichiers dans un bucket R2 privé, URL signées courtes. Envoi du logo limité en type (images) et en taille.
- Hébergement UE : VPS dans l'UE, bucket R2 en juridiction UE si disponible, fournisseur d'e-mail avec région UE si possible.
- Aucune donnée client dans les logs au-delà de l'identifiant.
- Archivage plutôt que suppression dans l'interface. La suppression définitive d'un client (droit à l'effacement) pourra se faire à la main par une commande CLI dans un premier temps.

## 13. Laissé au constructeur

- Organisation interne des dossiers dans `apps/web` et `apps/api`, conventions de nommage.
- Outils de test précis (runner de tests front, configuration Playwright).
- Format de la description des étapes (markdown ou texte simple).
- Détails visuels du thème Material, dans le respect d'un ton sobre et élégant.
- Choix du conteneur qui sert le front statique.
- Mécanisme exact pour lancer les migrations au déploiement.

## 14. Feuille de route après le socle

1. **Questionnaires** : modèles, adaptation par client, réponses, lien avec une étape.
2. **Échange de documents** : au niveau client (factures, charte transversale) et au niveau projet (inspirations, moodboard), dans les deux sens.
3. **Rendez-vous et rappels** : rappels automatiques par e-mail sur les échéances, éventuellement prise de rendez-vous.
4. **Galerie de sélection.**
5. **Hébergement et livraison des photos choisies.**
