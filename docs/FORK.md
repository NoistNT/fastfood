# Fork & Showcase Guide

## Showcase deployment (public demo)

The showcase is a deployment of `main` — not a separate repo. It exists so
recruiters and curious visitors can click through a working product.

### How it stays pristine

- **Database**: an isolated Neon branch containing only demo seed data.
  Nothing real ever lives there.
- **Daily reseed**: `.github/workflows/demo-reseed.yml` resets + reseeds at
  04:00 America/Argentina/Buenos_Aires, and can be triggered manually from
  the Actions tab when the showcase is defaced mid-day (`workflow_dispatch`).
- **Rate limits**: the app's standard per-IP limits slow bulk vandalism
  between reseeds.
- **Payments**: the showcase uses MercadoPago TEST tokens — no real money
  can move.

### Demo access

- `NEXT_PUBLIC_DEMO_MODE=true` on the showcase deployment shows a demo
  banner and staff/admin quick-fill buttons on `/login`. Absent on forks:
  nothing renders.
- Demo accounts (seeded, safe to publish):
  - Admin: `john.doe@example.com` / `AdminDemo2026`
  - Staff: `bob.brown@example.com` / `StaffDemo2026`
- Both roles are worth touring: staff shows the operational core, admin
  shows reports, the directory, and the merge tool.

### Secrets

- `SHOWCASE_DB_URL` (GitHub Actions secret): Neon connection string of the
  showcase branch **only**. Never dev/CI branches, never client branches.

## Client forks (per-shop deployments)

Each client gets a real fork (not a template-repo copy) so trunk updates
merge back in: `git remote add upstream <trunk-url>`, then merge release
tags as they land.

### 1. Create the fork
- Fork on GitHub (private recommended — client data lives here).
- Clone, `pnpm install`.

### 2. Vercel project
- New project from the fork. Set production env vars (dashboard, not files):
  `DB_URL` (client Neon branch), `NEXT_PUBLIC_BASE_URL` (client domain),
  `SESSION_SECRET` (fresh `openssl rand -base64 32` per client),
  `MP_ACCESS_TOKEN` (`APP_USR-…` live or `TEST-…` while trialing),
  `NEXT_PUBLIC_CURRENCY` (ISO code, e.g. `ARS`), Resend/Redis keys if used.
- Do **not** set `NEXT_PUBLIC_DEMO_MODE` — demo chrome stays off.

### 3. Neon branch + schema
- New Neon branch for the client. Apply the full schema once via SQL
  Editor: `drizzle/0000_next_betty_brant.sql` then `0001_sad_apocalypse.sql`
  (and any later migrations in numeric order). Never run
  `scripts/sql/dev-reset.sql` outside dev/CI — it drops everything.

### 4. Seed decision
- **Empty** (normal): apply schema only, then bootstrap the admin below.
  Owners enter menu + ingredients through the console UI.
- **Demo data**: only for throwaway trials — never alongside real data.

### 5. Bootstrap the first admin
Roles encode powers, so no account can promote itself. As the technician,
run once in the Neon SQL Editor (replace values, generate the hash with
`bcrypt.hash(password, 10)` — never reuse demo passwords):
```sql
INSERT INTO roles (name, description) VALUES
  ('admin', 'Administrator'),
  ('staff', 'Staff operations')
ON CONFLICT DO NOTHING;

WITH new_owner AS (
  INSERT INTO users (name, email, password_hash, phone_number)
  VALUES ('Owner Name', 'owner@shop.com', '<bcrypt-hash>', '+54 9 11 0000 0000')
  RETURNING id
)
INSERT INTO user_roles (user_id, role_id)
SELECT id, (SELECT id FROM roles WHERE name = 'admin') FROM new_owner;
```
(Roles must exist before the admin references them — fresh forks have
neither. The `ON CONFLICT` guard makes the step safely re-runnable.)

### 6. Rebrand checklist
- `messages/en.json` + `messages/es.json`: `Components.header.title`,
  footer `title`/`description`/`address`/`phone`
- `app/layout.tsx`: metadata `title`/`template`
- Assets: `public/logo.svg`, `app/icon.svg`, `public/manifest.json`
  (`name`, `short_name`)
- `NEXT_PUBLIC_CURRENCY` already set in step 2.
- Currency `$` literals in storefront tables follow up separately.

### 7. Smoke test before handover
Register → login → place an order (pickup + delivery) → pay flow →
dashboard as admin (reports, customers, merge tool) and as staff (orders,
intake, products, inventory; confirm `/forbidden` on admin surfaces).
