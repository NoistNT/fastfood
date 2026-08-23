# FastFood — Restaurant Management System

A Next.js 16 (App Router) restaurant management app: admin dashboard, ordering,
products/inventory, customers, and role-based auth.

**Stack:** Next.js 16 · TypeScript (strict) · pnpm 11 · Node 24 · PostgreSQL +
Drizzle ORM (Neon serverless) · Tailwind CSS v4 · shadcn/ui · next-intl ·
Zustand · TanStack React Query + Table · Vitest + jsdom · Playwright · Upstash
Redis · MercadoPago · Resend

---

## Quick start

```bash
pnpm install

# Environment — copy the example and fill in real values
cp .env.development.example .env.development

# Database — apply schema + seed via the canonical SQL pair
# (Neon SQL Editor, or `psql -v ON_ERROR_STOP=1 "$DB_URL" -f scripts/sql/<file>` when
# your network allows direct Postgres access)
psql -v ON_ERROR_STOP=1 "$DB_URL" -f scripts/sql/dev-reset.sql      # ⚠️ destructive reset
psql -v ON_ERROR_STOP=1 "$DB_URL" -f scripts/sql/dev-seed-minimal.sql

pnpm dev
```

Open http://localhost:3000

Seeded logins (password `P4$$W0rD`): admin `john.doe@example.com`,
staff `bob.brown@example.com`, registered buyer `jane.smith@example.com`
(`alice.johnson@example.com` is a record-only person — no password).

> **External configuration** (Neon branches, Vercel dashboard vars, GitHub
> Actions secrets, secret rotation, bootstrap-from-scratch) is documented in
> **[`docs/ENVIRONMENTS.md`](docs/ENVIRONMENTS.md)**.

---

## Commands

| Command                 | What it does                                           |
| ----------------------- | ------------------------------------------------------ |
| `pnpm dev`              | Next.js dev server                                     |
| `pnpm build`            | Production build                                       |
| `pnpm start`            | Start production build                                 |
| `pnpm lint`             | ESLint + `tsc --noEmit` (both must pass)               |
| `pnpm type-check`       | `tsc --noEmit`                                         |
| `pnpm format`           | ESLint --fix + Prettier --write                        |
| `pnpm test`             | Vitest watcher (uses `.env.test` if present)           |
| `pnpm test:run`         | Vitest, single run                                     |
| `pnpm test:e2e`         | Playwright E2E (server auto-boots via config)          |
| `pnpm test:visual`      | Update Playwright visual snapshots                     |
| `pnpm test:visual:ci`   | Run visual tests without updating                      |
| `pnpm db:push`          | Push Drizzle schema to DB                              |
| `pnpm db:studio`        | Drizzle Kit Studio                                     |
| `pnpm db:generate`      | Generate Drizzle migrations                            |
| `pnpm i18n:check`       | Verify en/es locale keys are in sync                   |
| `pnpm test:performance` | Lighthouse CI audit                                    |

---

## Environment variables

Required in production:

- `DB_URL` — PostgreSQL/Neon connection string
- `NEXT_PUBLIC_BASE_URL` — app base URL (with scheme)
- `SESSION_SECRET` — JWT session signing key (`openssl rand -base64 32`)
- `MP_ACCESS_TOKEN` — MercadoPago token (`TEST-` dev, `APP_USR-` prod)

Optional:

- `RESEND_API_KEY` — transactional/notification email
- `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` — Redis rate limiting

Where each lives (local `.env`, Vercel dashboard, GitHub Actions secrets) is in
**[`docs/ENVIRONMENTS.md`](docs/ENVIRONMENTS.md)**.

---

## Project structure

```text
.
├── app/                          # App Router: pages + API routes
│   ├── api/                      #   Route handlers (auth, products, orders, payment, …)
│   ├── dashboard/                #   Admin dashboard (customers, inventory, orders, reports)
│   ├── order/ products/          #   Customer-facing ordering + catalog pages
│   ├── login/ register/          #   Auth pages (+ forgot/reset password)
│   ├── profile/ forbidden/       #   Account + access-denied pages
│   └── components-test/          #   Living style fixture (visual regression)
│
├── modules/                      # Domain logic, grouped by feature
│   ├── core/                     #   Shared UI (shadcn/ui), hooks, components
│   ├── auth/ orders/ products/   #   Feature modules (actions + components per feature)
│   ├── dashboard/ users/         #   Dashboard + user management
│   └── <feature>/actions/        #   Server actions colocated per feature
│
├── db/                           # Drizzle schema (single file) + client (Neon)
├── lib/                          # Utilities: auth session (jose JWT), CSRF, rate limit
├── store/                        # Zustand stores (cart, dashboard state)
├── types/                        # Shared TS types (auth, db)
├── messages/                     # next-intl translations (en.json, es.json)
├── i18n/                         # Locale detection / request config
├── scripts/                      # Ops scripts (i18n check) + sql/ canonical DB reset & seed
├── test/                         # Vitest, mirrored by type (api/, components/, …)
├── e2e/                          # Playwright specs + visual baselines (e2e/visual/)
├── public/                       # Static assets (icons, manifest, service worker)
├── docs/                         # Runbooks (see docs/ENVIRONMENTS.md)
│
├── proxy.ts                      # Middleware: auth + role-based route protection
├── drizzle.config.ts             # Drizzle Kit config
├── next.config.ts                # Next.js config
└── vercel.json                   # Vercel function config (30s API max)
```

---

## Design system

The UI follows a token-based design language defined in `app/globals.css`:
paper-warm light / charcoal dark surfaces, ink primary CTAs, JetBrains Mono as
the sole typeface, and neon status badges (tinted outline chips). The full
rules live in **[`AGENTS.md`](AGENTS.md)** → _Design system & UX rules_;
`app/components-test` renders every primitive and doubles as the Playwright
visual-regression fixture.

---

## Auth & security

- JWT session cookie (`jose`, HS256, 1-day expiry) via `lib/auth/session.ts`
- `proxy.ts` middleware guards routes by role (`/dashboard` → admin+customer,
  `/order`, `/products`, `/profile`)
- CSRF token for state-changing API calls (`x-csrf-token` header)
- Input sanitization (`lib/sanitize.ts`), rate limiting (Upstash Redis with
  in-memory fallback)
- No logger/Sentry by design — `console.error` only, no PII

---

## CI/CD

### Quality pipeline (on push/PR to `main`/`dev`)

`pnpm lint` → `pnpm test:run` → `pnpm build` → start server → Playwright
chromium E2E. A separate `e2e-journey` job runs the database-backed user journey
against the `ci-e2e` Neon branch (skipped until `CI_E2E_DB_URL` +
`CI_E2E_SESSION_SECRET` secrets are configured).

### Workflows

| Workflow                | Purpose                                        |
| ----------------------- | ---------------------------------------------- |
| `ci.yml`                | Lint, unit tests, build, E2E                   |
| `vercel-preview.yml`    | Deploy previews on PR / push-to-`dev`          |
| `vercel-production.yml` | Quality gates + deploy to production on `main` |
| `monitoring.yml`        | Health check every 30 min + email alert        |
| `security.yml`          | `pnpm audit` weekly                            |
| `visual-regression.yml` | Manual visual regression (`workflow_dispatch`) |

### Deployment (Vercel)

- Build `pnpm build`, install `pnpm install --frozen-lockfile`
- API routes capped at 30s max duration
- Preview on PR; production on push to `main` (after quality gates)
- Deploy env vars come from the Vercel dashboard, not the workflows

See **[`docs/ENVIRONMENTS.md`](docs/ENVIRONMENTS.md)** for the full deployment
and environment configuration reference.

---

## Monitoring & logging

- Health check endpoint `/api/health` (checks DB connectivity)
- GitHub Actions `monitoring.yml` pings production health every 30 minutes and
  emails on failure
- **No Sentry/structured logging** — the repo deliberately avoids error
  tracking for privacy

---

## Support

- [Next.js docs](https://nextjs.org/docs)
- [Drizzle ORM](https://orm.drizzle.team)
- [MercadoPago developers](https://www.mercadopago.com/developers)
- [Neon docs](https://neon.tech/docs)
