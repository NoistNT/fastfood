---
description: Run ESLint + TypeScript type-check (both must pass).
agent: build
---

Run `pnpm lint` (this runs ESLint **and** `tsc --noEmit`; both must pass). If it fails, fix the reported ESLint errors and TypeScript type errors, then re-run `pnpm lint` until it passes clean. Report the final result.
