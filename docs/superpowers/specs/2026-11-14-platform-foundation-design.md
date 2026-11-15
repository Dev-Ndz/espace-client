# Photographer client portal — Vision and working notes

> **⚠️ Working notes, not a validated document.**
> This document gathers everything that has been said about the project, so that no choice is made that would force us to backtrack later.
> **Only these are decided**: the intent (§1–3), the constraints (§4), the choice of Angular + NestJS in a monorepo (§5) and a VPS with Coolify for hosting (§5).
> Everything else (database, ORM, authentication, data model, screens, deployment, CI) is a **lead** that will be discussed again at its own step, in this order: local skeleton → database and ORM → authentication → first feature → deployment.

- **Date:** 2026-11-14
- **Status:** working notes
- **Scope of this document:** the technical and functional foundation (accounts, clients, projects, dated steps, hosting, CI/CD, tests). The following features (questionnaires, document exchange, etc.) will each have their own design document.

Legend: items marked **[Claude's choice]** are proposals made during design, not explicit decisions of the project owner. They should be reviewed first.

The application UI is in French: quoted UI texts below (« … ») are kept in French.

---

## 1. Intent

Build a client portal for a photographer (the project owner's partner) to **make exchanges with her clients easier** around each session.

Her current client journey:

1. She sends a **strategic questionnaire** (goal of the session, expected aesthetic), based on a template she adapts to each client.
2. The client provides **inspiration documents** (brand guidelines, moodboard, examples).
3. She prepares a **moodboard** (outside the platform, it is her creative work).
4. She organizes a **preparation meeting** to validate the moodboard with the client.
5. Then comes the **shoot**, and later the selection and delivery of the photos.

Today these exchanges are scattered. The platform centralizes them and gives the client a clear view of what they have to do, and when.

It is also the **project owner's personal project to try fully agentic development**: most of the code will be written by agents. This weighs on the technical choices (see §5).

## 2. Users

- **The photographer** (only one, role `photographer`): manages clients, projects, steps, templates. She sees everything.
- **Client users** (role `client`): one or more people attached to a client. They only see their client's data.

There is **only one photographer**. This is not a multi-photographer SaaS, and it is not meant to become one.

## 3. Goals, non-goals, anti-goals

**Foundation goals**

- A deployed platform, available online, with secure sign-in for the photographer and her clients.
- The Client → Users → Projects → Steps model in place, manageable by the photographer.
- A client home page that shows, for each project, the **timeline of dated steps** (questionnaire to fill in by a given date, preparation call, shoot…).
- A sound base to build features on: monorepo, shared types, CI that blocks regressions, automatic deployment.

**Foundation non-goals** (planned later, outside this document)

- Questionnaires (feature #1 after the foundation).
- Document exchange (feature #2), except uploading the client's logo.
- Appointment booking, automatic reminders and notifications.
- Selection gallery, photo hosting and delivery.
- Invoicing: an invoice will be a simple uploaded document (documents feature), not an invoicing module.

**Anti-goals** (would make the project a failure even if it works)

- Automating the photographer's creative work (for example generating the moodboard).
- Significant recurring costs: the goal is to stay on free tiers, apart from the VPS (see §7).
- A complicated client journey: clients sign in rarely, often on their phone. They must understand immediately what to do.
- Data leaking between clients: a client seeing another client's data is the worst possible bug.

## 4. Constraints

- **Budget:** free tiers as much as possible. Accepted expenses: a personal VPS (~€4–6/month, which will also host other projects) and a domain name. The owner accepts doing things by hand rather than paying a vendor.
- **Owner's skills:** TypeScript, client-server architecture, Angular (liked), Node.js (mostly AdonisJS, some NestJS). He wants to **own and understand all the code**, without managing all the infrastructure himself.
- **Habits:** GitHub Actions for CI, Coolify on a VPS for deployment.
- **Agentic development:** the code must be structured and tested so that an agent can verify its own work (strict types, automated tests, CI).
- **Personal data:** client data (contact details, documents, later photos). Hosting in the EU **[Claude's choice]**.

## 5. Approaches considered

| Approach                          | Summary                                               | Trade-off                                                                                                                                                                                                                           |
| --------------------------------- | ----------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **A. Angular + NestJS** ✅ chosen | Monorepo, NestJS API, Angular front end, shared types | NestJS follows Angular's logic (modules, dependency injection, decorators). Its imposed structure keeps the code consistent when it is written by agents. More "framework" code than a minimalist server.                           |
| B. Angular + Express or Hono      | Minimalist API                                        | Full control, little code, but the structure has to be invented. That is where agent-written code drifts the most on a growing project.                                                                                             |
| C. Angular + Supabase             | No back end, BaaS                                     | The fastest, but business logic moves into SQL rules, it is no longer a client-server architecture, the free storage is not enough for photos, and the project is paused after a week of inactivity. Contrary to the owner's goals. |

**Owner's choice: A.**

Hosting considered:

| Option                                     | Trade-off                                                                                                                                           |
| ------------------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| **VPS + Coolify** ✅ chosen                | ~€4–6/month, no cold start, a known tool, a VPS reusable for other projects. On the downside: VPS and Coolify updates, database backups to monitor. |
| Cloudflare Pages + Google Cloud Run + Neon | €0, almost nothing to maintain, but cold starts, heavier GCP configuration, a new environment.                                                      |

**Owner's choice: a new personal VPS with Coolify** (the work VPS cannot be used for a private project).

## 6. Technical architecture

### 6.1 Monorepo

Manager: **pnpm workspaces**. No Nx for now. We keep the official Angular and Nest CLIs, and Nx can be added if the repository grows.

```
espace-client/
├── apps/
│   ├── web/        ← Angular (Angular CLI)
│   └── api/        ← NestJS (Nest CLI)
├── packages/
│   └── shared/     ← shared types and API contracts (DTOs, enums, schemas)
├── docker-compose.yml   ← local development services
├── .github/workflows/   ← CI/CD
└── docs/
```

- Versions: latest stable versions of Angular, NestJS, Node LTS and TypeScript at setup time.
- TypeScript in `strict` mode everywhere.
- A contract change in `packages/shared` must break the compilation of the front end **and** the API if they are not up to date. This is the main safeguard for agentic work.

### 6.2 Components

| Component | Choice                                                             | Detail                                                                                                                                                                                                                                                                                                                                                |
| --------- | ------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Front end | Angular (standalone components, signals)                           | A single application. The interface changes with the role (photographer or client).                                                                                                                                                                                                                                                                   |
| API       | NestJS, JSON REST                                                  | One Nest module per domain: `auth`, `users`, `clients`, `projects`, `steps`, `templates`, `storage`, `mail`.                                                                                                                                                                                                                                          |
| Database  | PostgreSQL (on the VPS through Coolify)                            |                                                                                                                                                                                                                                                                                                                                                       |
| ORM       | **Prisma** **[Claude's choice]**                                   | Widely used, generated types, versioned migrations, well known by agents. Credible alternative: Drizzle.                                                                                                                                                                                                                                              |
| Files     | **Cloudflare R2** (S3-compatible)                                  | Private bucket. Access through time-limited signed URLs generated by the API. Free up to 10 GB, with no egress fees (important for the future gallery). In the foundation, it only stores the client's logo.                                                                                                                                          |
| Emails    | **Resend** (free tier: 3,000/month, 100/day) **[Claude's choice]** | Sent from the project's domain (verified DNS). Alternative: Brevo (300/day). The `mail` module goes through an interface, so the provider can be changed.                                                                                                                                                                                             |
| UI        | **Angular Material** **[Claude's choice]**                         | Official, accessible, responsive components. A sober theme suited to the photographer. Her logo, colors and business name are set **in the front-end configuration** (theme file + static asset), not editable from the application **[Claude's choice]**. A single photographer, it rarely changes: no need for a settings table or an admin screen. |

### 6.3 Local development

`docker compose up` starts everything the API needs, with no external service:

- PostgreSQL;
- **MinIO** (S3-compatible storage, replaces R2 locally);
- **Mailpit** (captures sent emails, with a web UI, to test sign-in links).

Configuration goes through environment variables, validated when the API starts (the API refuses to start if a variable is missing). A `.env.example` file documents each variable.

## 7. Hosting and deployment

### 7.1 Infrastructure

- **VPS:** a small server in the EU, for example Hetzner (2 vCPUs, 4 GB of RAM, ~€4–6/month). 4 GB leave room for Coolify, this project and other projects.
- **Coolify** installed on the VPS. It manages:
  - `web`: the static Angular build served by a lightweight container (nginx or equivalent);
  - `api`: the NestJS Docker container;
  - `postgres`: a database managed by Coolify;
  - HTTPS certificates (automatic).
- **Domain name** (~€10/year) with DNS at **Cloudflare** (free).
  - `app.<domain>` → front end;
  - `api.<domain>` → API.
  - The shared parent domain allows a simple and safe session cookie (see §8).
- **Backups:** daily PostgreSQL backup by Coolify to a **separate R2 bucket**, kept 30 days **[Claude's choice]**. A restore procedure is documented in `docs/` and tested once before the real production launch.

### 7.2 CI/CD (GitHub Actions)

**On every pull request**, and merging is blocked if it fails:

1. install (pnpm, with cache);
2. lint and formatting;
3. type checking across the whole monorepo;
4. unit tests (API and front end);
5. API integration tests against a real PostgreSQL (GitHub Actions service container);
6. front-end and API builds;
7. end-to-end tests (Playwright) on the critical journeys (§10).

**On every merge to `main`**:

1. the same pipeline;
2. build of the `api` and `web` Docker images, pushed to **GitHub Container Registry** (free);
3. Coolify deployment triggered by webhook;
4. Prisma migrations are applied before the new API version receives traffic.

**Environments:** local and production only for the foundation **[Claude's choice]**. No per-PR preview environment for now: it would need one database per preview, which complicates the foundation for little benefit. To reconsider later.

### 7.3 Manual setup (by the owner)

Agents cannot create accounts or buy services. The plan must include these steps as a **checklist for the owner**, to be done before the first production launch. Local development (§6.3) does not depend on it and can move forward before.

- [ ] Rent the VPS and install Coolify
- [ ] Domain name + DNS at Cloudflare (`app.` and `api.`)
- [ ] Cloudflare R2 account: `files` bucket and `backups` bucket, access keys
- [ ] Resend account + DNS verification of the sending domain
- [ ] GitHub repository + CI secrets (Coolify webhook)
- [ ] Creation of the photographer account through the CLI in production

## 8. Authentication and authorization

### 8.1 Sign-in **[Claude's choice]**

> Replaced by `2026-11-15-authentication-design.md`: email + password, not a magic link.

- **Sign-in link by email (magic link)** for everyone, with no password.
  - Reason: clients sign in rarely and would forget a password. For the photographer, a long session makes sign-ins rare.
  - Home-made implementation in the `auth` module, small and readable, in line with the wish to own all the code. Rules:
    - strong random token, **stored hashed** in the database, **single use**, expires after **15 minutes**;
    - link requests are rate-limited (per email and per IP);
    - identical response whether the email exists or not (no leak of whether an account exists);
    - no account is created by a link request: only the photographer creates accounts.
- **Sessions** stored in the database (revocable), identified by an **`HttpOnly`, `Secure`, `SameSite=Lax` cookie** set on the parent domain. Duration: 30 sliding days.
- CSRF protection: `SameSite=Lax` plus an `Origin` header check on requests that modify data.
- Sign-out: deletes the current session.

### 8.2 Account creation

- **Photographer:** created by an API CLI command (`create-photographer <email>`), run once in production.
- **Client users:** the photographer adds a user (name, email) on a client's page. An **invitation email** is sent with a first sign-in link (same rules as the magic link, longer expiry: 7 days). She can resend the invitation or disable a user.
- The model accepts **several users per client** from the start. The interface to add several of them is part of the foundation, since it already serves the first user.

### 8.3 Authorization

- Two roles: `photographer` and `client`.
- A client user belongs to **a single client** **[Claude's choice]**. No roles inside a client: all its users see all its projects.
- Checks happen **on the API side, systematically**: a Nest _guard_ checks the role, and every request from a client user is filtered on its `clientId`. The front end is never a security barrier.
- **Mandatory tests:** for every route available to clients, a test checks that a user of client A can neither read nor modify client B's data (404 response, so as not to reveal that the data exists).

## 9. Data model (foundation)

```
User ──┐
       │ n..1 (null for the photographer)
Client ┴── 1..n ── Project ── 1..n ── Step
   │
   └── logo (R2 key)

StepTemplate (journey template) ── 1..n ── StepTemplateItem
Session, LoginToken (auth)
```

**Client**

- `id`, `name` (display name: company or individual), `type` (`company` | `individual`)
- `logoKey` (key of the file in R2, optional)
- contact details: `contactEmail`, `phone`
- billing: `billingName`, `billingAddress` (street, postal code, city, country), `vatNumber` (optional), `billingEmail`
- `notes` (private, visible only to the photographer)
- `createdAt`, `updatedAt`, `archivedAt` (archiving rather than deletion). Archiving a client **disables its users and deletes their sessions** **[Claude's choice]**. Unarchiving re-enables them.

**User**

- `id`, `email` (unique), `firstName`, `lastName`, `role`, `clientId` (null for the photographer)
- `status` (`invited` | `active` | `disabled`), `lastLoginAt`, timestamps

**Project** (a session or a service for a client)

- `id`, `clientId`, `title`, `description`
- `status` (`draft` | `active` | `completed` | `archived`). Visibility on the client side **[Claude's choice]**:
  - `draft`: hidden;
  - `active`: visible, shown on the home page;
  - `completed`: visible read-only, in a « Projets terminés » (completed projects) section;
  - `archived`: hidden.
    The API applies this filter on every client route, and the isolation tests check it.
- timestamps

**Step** (a dated step of a project)

- `id`, `projectId`, `position` (display order), `title`, `description` (simple rich text or markdown, the implementer's choice)
- `kind`: `client_action` (the client has to do something), `meeting` (call or appointment), `milestone` (a marker, for example the shoot)
- `dueAt`: date, with an optional time (`dueAt` + `hasTime`). **Nullable** **[Claude's choice]**: steps copied from a template have no date. A step without a date shows « date à venir » (date to come). A project can become `active` with undated steps.
- **Display order = `position`**, chosen by the photographer **[Claude's choice]**. Dates do not reorder the timeline. On the photographer's side, a discreet warning flags a step dated earlier than the previous one.
- "Next deadline" = the first `todo` step in `position` order, whether it is dated or not.
- `location` / `meetingUrl` (optional, useful for `meeting`)
- `status`: `todo` | `done`, plus `completedAt`
- `linkedResourceType` + `linkedResourceId` (nullable): **hook for the following features** (a "Fill in the questionnaire" step will point to the questionnaire). Unused in the foundation, but planned to avoid a heavy migration.
- Status derived at display time (not stored): "overdue" if `todo` and `dueAt` has passed.

**StepTemplate / StepTemplateItem** (journey templates) **[Claude's choice]**

- A template = a name + an ordered list of steps (title, description, `kind`) **without dates**.
- Applying a template to a project copies its steps into the project. The photographer then enters the dates. Changing a template later does not affect existing projects.
- Possible later improvement: relative dates ("D-14 before the shoot").

**Future notifications:** `dueAt` and `status` are enough for a future scheduler to select the steps to remind. Nothing else to plan in the foundation.

**Time zone:** dates are stored in UTC and displayed in the photographer's time zone, set by a configuration variable (default `Europe/Brussels`, to be confirmed).

**Language:** interface in **French only** **[Claude's choice]**, with no translation system.

## 10. Foundation screens

All screens are **responsive**. The client side is designed for phones first.

### 10.1 Client side

- **Sign-in:** enter the email → « Un lien vous a été envoyé » (a link has been sent to you).
- **Home:** list of their active projects, each with its next deadline. If there is only one active project, they land directly on it.
- **Project:** the timeline of steps, in order:

  ```
  Séance portrait — Marie Dupont
  ─────────────────────────────────────────────
  ✔  12 nov.          Questionnaire stratégique      fait
  ●  20 nov.          Envoi des inspirations         à faire
  ○  25 nov. 14:00    Appel de préparation (moodboard)   lien visio
  ○  03 déc.          Shooting                       lieu
  ```

  The next step to do is highlighted. Overdue steps are flagged without being alarming.

- **My account / my company:** see the client's information. The client can **edit their billing details and their logo** **[Claude's choice]**, so the photographer does not have to type them again. They also see the other users of their client (read-only).

In the foundation, the client **does not tick** steps: the photographer marks them as done **[Claude's choice]**. Later, some steps will complete automatically (for example when a questionnaire is submitted).

### 10.2 Photographer side

- **Dashboard:** upcoming deadlines across all projects, and overdue steps.
- **Clients:** list with search, creation, archiving.
- **Client page:** information and billing, logo, private notes, users (invite, resend the invitation, disable), list of projects.
- **Project page:** information, status, steps (add, edit, reorder, delete, mark as done), "apply a journey template".
- **Journey templates:** list, creation and editing.
- **"As seen by the client" preview** on the project page **[Claude's choice]**: to check what the client will see before switching the project to `active`.

## 11. Tests and quality

Goal: an agent can tell on its own whether its work is correct.

- **API**
  - unit tests of the services;
  - **integration tests against a real PostgreSQL** (no database mocks), including the isolation tests between clients (§8.3);
  - tests of the authentication flow (expired, reused, unknown token; rate limiting).
- **Front end:** component tests on non-trivial logic (step timeline, overdue status, role-based display).
- **End-to-end (Playwright)**, on the local stack (docker compose):
  1. the photographer signs in (link retrieved from Mailpit), creates a client, invites a user, creates a project, applies a template, dates the steps, activates the project;
  2. the client user signs in through the invitation and sees their project's timeline;
  3. a user of another client does not see this project.
- Automatic linting and formatting, strict types, no error tolerated in CI.
- Demo data (_seed_) makes it possible to run the application locally with a photographer, two clients and a few projects.

## 12. Security and personal data

- HTTPS everywhere (Coolify), standard security headers (helmet), CORS restricted to `app.<domain>`.
- Validation of every API input.
- Files in a private R2 bucket, short-lived signed URLs. Logo upload restricted by type (images) and size.
- EU hosting: VPS in the EU, R2 bucket in the EU jurisdiction if available, email provider with an EU region if possible.
- No client data in the logs beyond the identifier.
- Archiving rather than deletion in the interface. Permanently deleting a client (right to erasure) can be done by hand through a CLI command at first.

## 13. Left to the implementer

- Internal folder layout in `apps/web` and `apps/api`, naming conventions.
- Exact test tools (front-end test runner, Playwright configuration).
- Format of step descriptions (markdown or plain text).
- Visual details of the Material theme, keeping a sober and elegant tone.
- Choice of the container that serves the static front end.
- Exact mechanism to run migrations at deployment.

## 14. Roadmap after the foundation

1. **Questionnaires**: templates, per-client adaptation, answers, link with a step.
2. **Document exchange**: at client level (invoices, cross-project brand guidelines) and at project level (inspirations, moodboard), in both directions.
3. **Appointments and reminders**: automatic email reminders about deadlines, possibly appointment booking.
4. **Selection gallery.**
5. **Hosting and delivery of the selected photos.**
