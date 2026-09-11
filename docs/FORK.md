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

## Client forks (coming with the template program)

End-to-end fork procedure (repo → Vercel → Neon → env → schema → bootstrap
admin → seed decision → rebrand checklist) will be documented here once the
template hardening lands.
