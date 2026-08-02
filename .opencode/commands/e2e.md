---
description: Run Playwright E2E tests (requires a built app running on port 3000).
agent: build
---

Run the E2E suite. First ensure a production server is available: build with `pnpm build`, then start it in the background with `pnpm start &` and wait for `http://localhost:3000` (e.g. `npx wait-on http://localhost:3000`). Then run `pnpm test:e2e`. Fix any failures and re-run until green, then stop the background server. Report results.

Note: full CI runs E2E on the chromium project only; visual regression is manual (`pnpm test:visual`).
