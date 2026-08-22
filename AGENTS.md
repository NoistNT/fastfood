# FastFood — Agent Instructions

## Stack

Next.js 16 App Router · TypeScript (strict) · pnpm 11 · Node 24
PostgreSQL + Drizzle ORM (Neon serverless) · Tailwind CSS v4 · shadcn/ui (new-york, lucide icons)
next-intl · Zustand · TanStack React Query + Table · Vitest + jsdom · Playwright (E2E + visual)
Upstash Redis · MercadoPago · Resend
Dev runs Turbopack by default (clear `.next` if it misbehaves); production builds use webpack.

## Commands

| Command                             | What it does                              |
| ----------------------------------- | ----------------------------------------- |
| `pnpm dev`                          | Next.js dev server (Turbopack)            |
| `pnpm build`                        | Production build                          |
| `pnpm lint`                         | ESLint **+ `tsc --noEmit`** (both matter) |
| `pnpm test:run`                     | Vitest suite (`pnpm test` = watcher)      |
| `pnpm test:e2e`                     | Playwright E2E (server auto-boots)        |
| `pnpm test:visual`                  | Update visual snapshots                   |
| `pnpm db:push` / `seed` / `studio` / `generate` | Drizzle schema operations     |
| `pnpm i18n:check`                   | Verify en/es locale keys are in sync      |
| `pnpm format`                       | ESLint --fix + Prettier --write           |

Use `pnpm exec <tool>` / `pnpm dlx <pkg>` — avoid bare `npm` / `npx`.

## Engineering principles

- **Best practice beats legacy**: never copy a pattern just because the codebase
  has it — default to the current official recommendation of each library
  (e.g., `asChild` slot composition instead of nested interactive elements);
  when you find an anti-pattern, propose the upgrade
- Finish every change with the quality gates before reporting done:
  `pnpm lint` → `pnpm test:run` → `pnpm build`
- Keep diffs minimal and scoped to what was agreed

## Git & PR workflow

- **Never open a PR without pre-approval**: show branch name, commit message,
  and full PR body first; wait for explicit approval
- Conventional Commits; squash-merge; delete branches after merge — only `dev`
  and `main` persist. `dev` integrates; pushing to `main` is a production release
- Scan diffs for credentials; never commit `.env*`, tokens, or real connection strings
- PRs changing user-facing behavior, commands, or conventions update `README.md`
  and `AGENTS.md` in the same PR

## Dependencies

- Security/transitive pins live in `pnpm-workspace.yaml` `overrides:` — never package.json
- Never hand-edit `pnpm-lock.yaml`; regenerate via `pnpm install`
- `@types/node` tracks the runtime major (Node 24 = current Vercel max)

## Architecture

- **`app/`** pages + API routes · **`proxy.ts`** middleware (auth, role-based route protection)
- **`modules/<feature>/`** domain logic (`auth`, `core`, `dashboard`, `orders`, `products`, `users`)
- **`modules/core/ui/`** shadcn/ui primitives — import via deep paths (`@/modules/core/ui/button`)
- **`db/schema.ts`** single-file Drizzle schema · **`db/drizzle.ts`** Neon client
- **`lib/`** utilities · **`lib/auth/session.ts`** JWT sessions via `jose` (HS256, 1-day expiry)
- **`i18n/request.ts`** auto-detects locale from `Accept-Language` (es → es, else en)
- **`test/`** Vitest suites by type · **`e2e/`** Playwright specs (+ `e2e/visual/`)
- **`store/`** Zustand · **`types/`** shared types · **`messages/`** en.json + es.json

## Design system & UX rules

### Color — tokens only

- Semantic tokens exclusively (`primary secondary muted accent destructive success warning info card popover border input ring`) — never raw palette utilities or hex. Values live in `app/globals.css` (`:root` + `.dark`, mapped in `@theme`); terracotta primary over paper neutrals — keep both modes in sync
- Status mapping green→success amber→warning blue→info red→destructive. Every badge is a neon chip (`border-<token>/40 bg-<token>/10 text-<token>`, `rounded-md`) via built-in variants — chips are tinted, buttons solid; never confusable, never inline classes

### Typography & icons

- JetBrains Mono is the sole typeface (`--font-sans`) — hierarchy via size/weight/color only, no second font or element-level font overrides
- lucide-react icons only; **never emoji in UI chrome**

### Visual language

- Border-first elevation: hairline borders/rings for surfaces; shadows only on floating overlays
- Accent restraint: `primary` for CTAs, active states, key highlights — never large fills or body text
- Spacing rhythm: sections `py-8`+, grids `gap-4`–`gap-8`, cards `p-3`–`p-6`; whitespace over dividers

### Navigation & chrome

- One entry point per destination. Profile lives only in the account menu (`UserMenu`, shared by both headers); Dashboard is the deliberate exception — admin-only toolbar icon on desktop, sheet row on mobile, never duplicated across surfaces
- Header: right-anchored toolbar on solid `bg-background`, hairline `border-b`, `h-16`. Authed = Menu icon (`UtensilsCrossed`, tooltip + `aria-current` accent tint) · Dashboard icon (admin) · cart (authed, → `/order`) · avatar. Guests = Login (ghost) + Sign Up (**the one filled-primary CTA**) only — every other destination is auth-gated and would be a login wall in disguise
- Below `md`: logo + hamburger only; every control lives in the right-sliding sheet whose icon rows highlight the current route. No dead ends anywhere
- Theme: submenu inside the account menu everywhere signed-in (including `/dashboard/*`, which has its own chrome); sheet footer toggle covers mobile guests
- Avatars: `<UserAvatar>` — a single initial via `getUserInitials` on a filled-primary chip, identical across headers
- Footer: labeled Explore / Visit Us / Legal columns; Explore is `/order`'s interim home until the cart drawer ships

### i18n — every visible string

- All user-facing text through next-intl — including `aria-label`, `title`, toast text, sr-only text; no string literals in JSX. Keys synced in both en.json and es.json — verify with `pnpm i18n:check`

### States & feedback

- Async routes get `loading.tsx` skeletons (`role="status"`, `aria-busy="true"`); empty states need a message + CTA button
- Errors: `ErrorBoundary` around client islands; `toast({ variant: 'destructive' })` for action failures

### Components

- Buttons: pick a `variant` + `size` — no geometry/font overrides via `className` (positioning inside inputs is the only exception). One filled-primary CTA per view; `destructive-soft` tints cancel/delete
- Dedicated badge components exist (`order-status-badge` etc.) — extend them, don't inline colors; render new primitives in `app/components-test/page.tsx` (visual fixture)
- Metadata via `app/layout.tsx` exports; assets: `app/icon.svg`, `public/logo.svg`

## Testing & tooling

- Tests live in `test/` organized by type (api/components/hooks/lib/integration), not beside source; Vitest runs jsdom with globals, setup = jest-dom only. Many API-route tests import handlers directly (DB mocked via CI env vars)
- Playwright boots its own server via `webServer` config (seeded DB if present, mock DB fallback); visual tests are Chromium-only, manual `workflow_dispatch`
- Lint/format: `pnpm lint` = ESLint + `tsc --noEmit` (strict; `consistent-type-imports`; `import/order`; scoped `no-console`); Prettier 100-width single quotes; `pnpm format` autofixes
- CI order mirrors gates then E2E: lint → test:run → build → start → wait-on → chromium; Dependabot, CodeQL, CodeRabbit, weekly audit run automatically (Dependabot PRs skip preview deploys — secrets are withheld from that actor)
- Logging: no logger/Sentry (privacy) — `console.error` without PII; never log bodies, tokens, or user agents
- Env: production requires `DB_URL` `NEXT_PUBLIC_BASE_URL` `SESSION_SECRET` `MP_ACCESS_TOKEN`; optional Redis/Resend keys. All locations & rotation: [`docs/ENVIRONMENTS.md`](docs/ENVIRONMENTS.md) — read before any env work
- Deploy: preview on PR, production on push to `main` (install: `pnpm install --frozen-lockfile`); API routes cap at 30s
