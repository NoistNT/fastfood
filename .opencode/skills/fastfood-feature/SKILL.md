---
name: fastfood-feature
description: Use when adding or extending a feature in the FastFood app — new module, API route, server action, schema change, component, or feature flow. Covers the full module → schema → API → UI → tests → i18n pipeline.
---

# FastFood Feature Workflow

Follow this pipeline when adding or changing a feature. The ordering keeps each layer green before moving on.

## 1. Understand the layering

- `app/` — App Router pages + API routes (`app/api/**/route.ts`). Thin glue only.
- `modules/<feature>/` — domain logic split by feature: `auth/`, `core/`, `dashboard/`, `orders/`, `products/`, `users/`. Each feature has `actions/`, `components/`, `types.ts`, and helpers.
- `lib/` — cross-cutting utilities (auth, csrf, rate-limit, sanitize, api-response).
- `store/` — Zustand stores (`use-order`, `use-dashboard`).
- `db/schema.ts` — single-file Drizzle schema. `db/drizzle.ts` — Neon client.

New features either extend an existing module or add `modules/<name>/` with the same shape.

## 2. Database (if the feature needs persistence)

1. Add the table/columns to `db/schema.ts` (single file, matching `pgTable` style + a `*Relations` export).
2. `pnpm db:generate` → `pnpm db:push` to apply the migration.
3. Update `scripts/seed-data.ts` + `scripts/seed.ts` so `pnpm db:seed` stays idempotent.

## 3. Backend (API / server actions)

- Add route handlers in `app/api/<feature>/route.ts` (or extend `modules/<feature>/actions/`).
- Always return `@/lib/api-response` envelope (`apiSuccess`/`apiError` + `ERROR_CODES`).
- Authenticate with `getSession()`; role-check with `hasRole`. Sanitize input, verify CSRF on mutations, rate-limit sensitive routes.
- Errors: `console.error` (no PII) — no logger/Sentry in this repo.
- Keep `@swagger` annotations on handlers.

## 4. Frontend (UI)

- Components in `modules/<feature>/components/`; shared primitives in `modules/core/ui/` (re-export new ones from the barrel).
- Data fetching: server components for reads, `@/modules/core/hooks/use-api-cache.ts` (TanStack Query) for client-side.
- No hardcoded strings in JSX — next-intl keys must be added to BOTH `messages/en.json` and `messages/es.json`.
- Tailwind v4 classes, `cn()` for merging, match existing component patterns.

## 5. Tests

- Vitest: add `test/<type>/<feature>.test.ts` (by type: `api/`, `components/`, `hooks/`, `lib/`, `utils/`, `integration/`, `workflows/`). Never colocate next to source.
- Playwright: add to `e2e/` for full user journeys; visual snapshots only via `e2e/visual/` + `pnpm test:visual`.

## 6. Verify

Run in order until green:
`pnpm lint` → `pnpm test:run` → `pnpm build`

For E2E: `pnpm start &` then `pnpm test:e2e` (chromium in CI; visual is manual).

## When to delegate

- Complex UI polish → `@frontend`
- API/auth/security logic → `@backend`
- Schema/migrations → `@database`
- Test authoring → `@testing`
