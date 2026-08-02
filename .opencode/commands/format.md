---
description: Auto-fix lint and format the codebase.
agent: build
---

Run `pnpm format` (ESLint --fix + Prettier --write). Then review the diff to ensure only formatting/auto-fix changes were made, and run `pnpm lint` to confirm everything still passes. Report what changed.
