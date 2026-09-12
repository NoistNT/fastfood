# FastFood — Environments & External Configuration Runbook

> **Never paste real credentials, tokens, or connection strings into this file.**
> Document *names and locations* only; actual values live in `.env*` files,
> Vercel, GitHub Actions secrets, or Neon.

Single source of truth for every external service, secret, and environment
variable this project depends on. Use this to bootstrap after a long break, to
rotate secrets, or to figure out *where* any given value lives.

> **Security:** never commit real secrets. Local values go in `.env.*` files
> (gitignored); shared values go in the provider dashboard (Vercel) or GitHub
> Actions secrets. Example files `.env.development.example` / `.env.production.example`
> are tracked.

---

## 1. Environment matrix

| Environment            | Where it runs                        | Database (Neon branch)  | Primary config location          |
| ---------------------- | ------------------------------------ | ----------------------- | -------------------------------- |
| Local dev              | `pnpm dev` on your machine           | `development`           | `.env.development`               |
| Local prod sim         | `pnpm build && pnpm start`           | `production`            | `.env.production`                |
| Vercel preview         | PR / push-to-dev deploy (vercel.app) | `development`           | Vercel dashboard (preview)       |
| Vercel production      | push to `main` (vercel.app)          | `production`            | Vercel dashboard (production)    |
| CI quality gates       | GitHub Actions `ci.yml`              | none (mock DB)          | repo-level env in workflow       |
| CI E2E journey         | GitHub Actions `e2e-journey`         | `ci-e2e`                | GitHub Actions secrets           |

---

## 2. Secrets & variables — exact names and where they live

### 2.1 Local (`.env.development` / `.env.production`)

Copy the matching example and fill in real values:

```bash
cp .env.development.example .env.development
cp .env.production.example .env.production
```

| Variable               | Dev example (value type)                        | Notes                                    |
| ---------------------- | ----------------------------------------------- | ---------------------------------------- |
| `DB_URL`               | Neon `development` branch connection string     | `postgresql://user:pass@host:5432/db`    |
| `NEXT_PUBLIC_BASE_URL` | `http://localhost:3000`                         | Must include scheme                      |
| `SESSION_SECRET`       | `openssl rand -base64 32`                       | Unique per environment; same value is required inside a given env (local, Vercel, CI must each pick one) |
| `MP_ACCESS_TOKEN`      | `TEST-...` (dev) / `APP_USR-...` (prod)         | Dev uses TEST tokens, prod uses APP_USR   |
| `RESEND_API_KEY`       | `re_...`                                        | Optional; email notifications            |
| `UPSTASH_REDIS_REST_URL` | `https://...upstash.io`                       | Optional; separate instance per env      |
| `UPSTASH_REDIS_REST_TOKEN` | token string                                | Optional; see §6 known gotchas (permissions) |

`.env.test` is referenced by `pnpm test` (watcher) but not required — Vitest
runs fine without it.

### 2.2 Vercel dashboard (project: `fastfood`, org `team_PCKSsbuyWNTd9jhVYbPBfMly`)

Env vars for deployed previews/production are set in the **Vercel dashboard →
Project → Settings → Environment Variables**, NOT in workflow files. The CI
workflows use a mock `DB_URL` only to build/test; the deployed app reads its own
vars from Vercel.

| Variable               | Preview (development)        | Production                   |
| ---------------------- | ---------------------------- | ---------------------------- |
| `DB_URL`               | `development` branch         | `production` branch          |
| `NEXT_PUBLIC_BASE_URL` | preview URL                  | production domain            |
| `SESSION_SECRET`       | dev value                    | unique prod value            |
| `MP_ACCESS_TOKEN`      | `TEST-...`                   | `APP_USR-...`                |
| `RESEND_API_KEY`       | optional                     | `re_...`                     |
| `UPSTASH_REDIS_REST_URL` | optional dev instance      | optional prod instance       |
| `UPSTASH_REDIS_REST_TOKEN` | optional                  | optional                     |

### 2.3 GitHub Actions secrets (repo → Settings → Secrets and variables → Actions)

All are **repo-level** (no environment scope) — that is the correct setup: jobs
running on `push`/`pull_request` with no `environment:` read repo-level secrets.
Only `vercel-production.yml`'s `deploy-production` job uses
`environment: production`, and it falls back to repo-level secrets too.

| Secret                        | Used by                          | Purpose                                    |
| ----------------------------- | -------------------------------- | ------------------------------------------ |
| `CI_E2E_DB_URL`               | `ci.yml` e2e-journey             | Neon `ci-e2e` branch connection string     |
| `CI_E2E_SESSION_SECRET`       | `ci.yml` e2e-journey             | Session secret for the CI-started server   |
| `VERCEL_TOKEN`                | vercel-preview / production      | Vercel deploy token                        |
| `VERCEL_ORG_ID`               | vercel-preview / production      | `team_PCKSsbuyWNTd9jhVYbPBfMly`            |
| `VERCEL_PROJECT_ID`           | vercel-preview / production      | `prj_cwSVtzXVCbCULvrM4t7Dq7WyQW2Q`         |
| `VERCEL_URL`                  | `monitoring.yml`                 | Production base URL for health checks      |
| `RESEND_API_KEY`              | `monitoring.yml`, vercel-prod    | Alert/deploy emails                        |
| `DEPLOYMENT_NOTIFICATION_EMAIL` | `monitoring.yml`, vercel-prod  | Recipient for alert/deploy emails          |

### 2.4 Neon (PostgreSQL, 3 branches)

Neon project hosts three branches. Connection strings are per-branch (each has
its own hostname) and are managed in the **Neon dashboard**.

| Branch       | Parent   | Used by                          | Notes                                    |
| ------------ | -------- | -------------------------------- | ---------------------------------------- |
| `production` | —        | Vercel production, local prod sim | Canonical data                          |
| `development`| production | Local dev, Vercel preview       | Main dev branch for development work     |
| `ci-e2e`     | development | GitHub Actions `e2e-journey`   | CI-owned scratch; wiped + reseeded every run |

> **Warning:** `scripts/sql/dev-reset.sql` **drops and recreates every table**,
> then `dev-seed-minimal.sql` re-inserts seed data. Never run them against a
> branch holding data you care about.

---

## 3. Bootstrap after a long break (from scratch)

1. **Install deps:** `pnpm install`
2. **Local env:** `cp .env.development.example .env.development`, fill in real
   values (§2.1). If you no longer have the values, pull them from the Neon
   dashboard (branch `development`) and generate a fresh `SESSION_SECRET` with
   `openssl rand -base64 32`.
3. **Local DB schema + seed:** apply the canonical SQL pair against whatever
   `DB_URL` points at — Neon SQL Editor, or `psql -v ON_ERROR_STOP=1 "$DB_URL" -f
   scripts/sql/dev-reset.sql -f scripts/sql/dev-seed-minimal.sql` when your
   network allows direct Postgres access.
4. **Run:** `pnpm dev` → http://localhost:3000
5. **Seeded logins** (password `P4$$W0rD` unless noted):
   | Role            | Email                        |
   | --------------- | ---------------------------- |
   | admin           | `john.doe@example.com`       |
   | staff           | `bob.brown@example.com`      |
   | registered buyer| `jane.smith@example.com`     |
   | record-only     | `alice.johnson@example.com` (no password — cannot log in) |
6. **CI:** no action needed — workflows run on push/PR. If `e2e-journey` shows
   skipped, the two CI secrets (§2.3) are missing or the `ci-e2e` Neon branch
   doesn't exist.
7. **Deploys:** Vercel deploys previews on PR/push-to-dev and production on
   push-to-`main`. Check the Vercel dashboard for build logs.

---

## 4. Secret rotation

| Secret                          | Regenerate with                          | Must update in                                   |
| ------------------------------- | ---------------------------------------- | ------------------------------------------------ |
| `SESSION_SECRET`                | `openssl rand -base64 32`                | `.env.development`, `.env.production`, Vercel preview+prod, GitHub `CI_E2E_SESSION_SECRET` |
| `MP_ACCESS_TOKEN`               | MercadoPago dashboard (test/app)         | `.env.*`, Vercel dashboard                       |
| `RESEND_API_KEY`                | Resend dashboard                         | `.env.*`, Vercel dashboard, GitHub secret        |
| `UPSTASH_REDIS_REST_TOKEN`      | Upstash console (recreate token)         | `.env.*`, Vercel dashboard                       |
| `VERCEL_TOKEN`                  | Vercel → Account Settings → Tokens       | GitHub secret `VERCEL_TOKEN`                     |
| Neon connection strings         | Reuse branch or create new branch        | Anywhere `DB_URL`/`CI_E2E_DB_URL` is set         |

---

## 5. Workflows reference

| Workflow file                | Triggers                                        | Needs secrets                       |
| ---------------------------- | ----------------------------------------------- | ----------------------------------- |
| `ci.yml`                     | push `main`/`dev`, PR to `main`/`dev`           | `CI_E2E_DB_URL`, `CI_E2E_SESSION_SECRET` (for e2e-journey only) |
| `vercel-preview.yml`         | push `dev`, PR to `main`/`dev`                  | `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID` |
| `vercel-production.yml`      | push `main`, `workflow_dispatch`                | `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `RESEND_API_KEY`, `DEPLOYMENT_NOTIFICATION_EMAIL` |
| `monitoring.yml`             | cron `*/30`, `workflow_dispatch`                | `VERCEL_URL`, `RESEND_API_KEY`, `DEPLOYMENT_NOTIFICATION_EMAIL` |
| `security.yml`               | push `main`/`dev`, weekly cron                   | none (runs `pnpm audit`)            |
| `visual-regression.yml`      | `workflow_dispatch` (manual)                    | none                                |

---

## 6. Known gotchas

- **Upstash token permissions:** the rate limiter uses Lua scripts
  (`EVALSHA`). A read-only or restricted token fails with
  `NOPERM this user has no permissions to run the 'evalsha' command`. The code
  falls back to in-process memory rate limiting in that case (works, but is
  per-instance, not shared). Fix: recreate the Upstash token with full
  read/write/script permissions.
- **Vercel GitHub App is disconnected.** Preview comments on PRs come from the
  repo's own `vercel-preview.yml` (posted as `github-actions[bot]`), not from
  `vercel[bot]`. Deploys still happen through the `amondnet/vercel-action` +
  `VERCEL_TOKEN`/org/project secrets.
- **`scripts/sql/dev-reset.sql` is destructive** — it drops and recreates every
  table. Only run it (plus `dev-seed-minimal.sql`) on the `development`
  (local/preview) or `ci-e2e` branches.
- **`ci-e2e` branch is disposable** — the `e2e-journey` job seeds it on every
  run, so it never accumulates state. If you need a fresh E2E DB, delete and
  recreate the Neon branch.
- **API routes have a 30s max duration** on Vercel (`vercel.json` functions
  config). Long-running queries may time out in production.
- **Repo deliberately has no logger/Sentry** for privacy. Errors are logged via
  `console.error` (no PII).
