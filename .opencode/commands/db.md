---
description: Run Drizzle database commands (generate | push | seed | studio).
agent: build
---

Run the requested database command for this project: `pnpm db:generate`, `pnpm db:push`, `pnpm db:seed`, or `pnpm db:studio`. Args: $ARGUMENTS

After `db:push` or `db:seed`, sanity-check by running a quick query or `pnpm test:run` if the change affects behavior. Note: this requires a real `DB_URL` (not available in CI).
