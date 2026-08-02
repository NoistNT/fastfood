# FastFood — Agent Instructions

## Stack

Next.js 16 App Router · TypeScript (strict) · pnpm 11 · Node 24  
PostgreSQL + Drizzle ORM (Neon serverless) · Tailwind CSS v4  
shadcn/ui (new-york, lucide icons) · next-intl · Zustand · TanStack React Query + Table  
Vitest + jsdom · Playwright (E2E + visual) · Upstash Redis · MercadoPago · Resend

## Commands

| Command | What it does |
|---|---|
| `pnpm dev` | Next.js dev server |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint **+ `tsc --noEmit`** (must pass both) |
| `pnpm test` | `dotenv -e .env.test -- vitest` (watcher) |
| `pnpm test:run` | `vitest run` |
| `pnpm test:e2e` | Playwright (needs `pnpm start` running) |
| `pnpm test:visual` | Update Playwright visual snapshots |
| `pnpm test:visual:ci` | Run visual tests without updating |
| `pnpm db:push` | Push Drizzle schema to DB |
| `pnpm db:seed` | `tsx ./scripts/seed.ts` |
| `pnpm db:studio` | Drizzle Kit Studio |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm format` | ESLint --fix + Prettier --write |

## CI pipeline order (must match)

`pnpm lint` → `pnpm test:run` → `pnpm build` → `pnpm start &` → `wait-on http://localhost:3000` → `playwright test --project=chromium`

Visual regression is **manual only** (`workflow_dispatch`); `pnpm audit` runs weekly.

## Architecture

- **`app/`** — Next.js App Router pages + API routes
- **`modules/`** — Domain logic split by feature: `auth/`, `core/`, `dashboard/`, `orders/`, `products/`, `users/`
- **`modules/core/ui/`** — shadcn/ui components (29 files). Re-export from barrel if adding new ones
- **`db/schema.ts`** — Drizzle schema (single file), **`db/drizzle.ts`** — client (Neon serverless)
- **`test/`** — Vitest tests mirrored by type (`api/`, `components/`, `hooks/`, `lib/`, `integration/`)
- **`e2e/`** — Playwright E2E specs + `e2e/visual/` for visual regression
- **`lib/`** — Utilities, auth (JWT session via `jose`, 1-day expiry, HS256), sanitize, etc.
- **`lib/auth/session.ts`** — `login()`, `logout()`, `getSession()`, `updateSession()`
- **`proxy.ts`** — Next.js middleware for auth + role-based route protection
- **`i18n/request.ts`** — Auto-detect locale from `Accept-Language` header (es → `es`, everything else → `en`)
- **`store/`** — Zustand stores
- **`types/`** — Shared TS types (`auth.ts`, `db.ts`)
- **`messages/`** — `en.json`, `es.json`

## Logging / error handling

- **No logger/Sentry** — this repo deliberately avoids structured logging and error tracking for privacy. Log errors with `console.error` (no PII); never log request bodies, user agents, or tokens.

## Testing quirks

- **Colocation:** Tests live in **`test/`**, not next to source. Organized by type, not by module
- **No DB mocking needed in unit tests** — many API route tests import handlers directly (mock DB in CI env vars)
- **Visual tests** run only on Chromium (`--project=visual`). Update baselines with `pnpm test:visual`
- **E2E tests** require `pnpm start` running on port 3000 first
- Vitest uses `jsdom` environment, globals enabled, setup = `@testing-library/jest-dom` only

## Lint/format expectations

- `no-console`: warn by default, **off** in `app/api/**/*.ts`, `lib/**/*.ts`, `modules/core/components/performance-monitor.tsx`
- `@typescript-eslint/consistent-type-imports`: error, prefer type imports
- `import/order`: groups `type → builtin → external → internal → parent → sibling → index`, newlines between groups, `@/*` is internal
- `noUnusedLocals` + `noUnusedParameters` in tsconfig (strict mode)
- Prettier: single quotes, trailing commas (es5), 100 print width, single attribute per line

## Env vars (required in production)

`DB_URL` · `NEXT_PUBLIC_BASE_URL` · `SESSION_SECRET` · `MP_ACCESS_TOKEN`  
Optional: `RESEND_API_KEY` · `UPSTASH_REDIS_REST_URL` · `UPSTASH_REDIS_REST_TOKEN`

## Vercel deployment

- Build: `pnpm build`, Install: `pnpm install --frozen-lockfile`
- API routes have 30s max duration
- Preview deploys on PR, production deploys on push to `main` (after quality gates: lint → test → build → E2E → visual → perf)
