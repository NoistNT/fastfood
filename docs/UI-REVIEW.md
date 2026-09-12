# UI review workline

How user-facing changes ship correctly and stay coherent across the template
and its forks. Companion to `CODE-REVIEW.md` (which owns code); this file
owns what the user sees. Run it against every UI diff before presenting a PR.

## Lenses

### 1. Fidelity — proof the surface exists as designed
- New/changed surfaces render in the `app/components-test/page.tsx`
  fixture (primitives) or carry their own route coverage (flows).
- Route baselines exist at 1440 / 768 / 390 in `e2e/visual/` (en locale),
  including loading, empty, and error states — not just the happy path.
- Baselines update in the *same PR* that changes the pixels (mirrors the
  distill-in-resolving-PR rule). Unrelated baseline churn is reverted, never
  committed.

### 2. Responsive — no breakpoint left behind
- Base styles target small screens, `sm:`+ enhances upward (mobile-first).
- No horizontal overflow at any target width; touch targets stay tappable;
  verify below `md` as well as desktop (emulation is enough, devices optional).

### 3. Accessibility — usable by everyone
- Keyboard path reaches and operates every control; focus visible
  (`skip-to-content`, visible rings).
- Dynamic changes announce (`screen-reader-announcement` or `aria-live` on
  visible feedback — never a visible ghost div).
- WCAG AA contrast; new flows covered in `test/accessibility/`.

### 4. i18n-visual — both locales render
- Baselines run en only; es gets an eyeball pass on preview (es strings run
  longer — watch truncation, wrapping, and overflow in buttons, chips, tables).
- No string literals in JSX (keys in both `en.json` and `es.json`,
  `pnpm i18n:check`).

### 5. Fork-safety — trunk stays neutral
- Semantic tokens only (no raw palette or hex); no fork-specific copy,
  branding, or business rules in trunk — forks override, trunk never assumes.
- Showcase changes keep the demo legible (seeded content, demo banner intact).

## Procedure

1. Build against the fixture first for primitives; route coverage for flows.
2. Run the affected visual specs locally; commit intended baseline updates,
   revert the rest.
3. Eyeball the preview deployment at mobile + desktop (both locales) and
   record the viewports checked in the PR body.
4. CodeRabbit cannot do visual review — never treat its silence on pixels
   as approval; the baselines + your eyes are the gate.
5. Visual CI stays manual dispatch (flakes and data-dependence don't belong
   in the merge gate); running it is required-by-process on UI PRs.

## Coverage map (living list — extend as routes land)

- Primitives fixture: buttons, badges, cards, forms, misc (`components.spec`)
- Auth pages: login, register (`components.spec`)
- Catalog: products list + responsive (`components.spec`)
- Dashboard: overview, charts + responsive (`dashboard.spec`)
- Missing (tracked follow-ups): product detail, order/checkout + empty
  states, dialogs/toasts, profile/customers, 404/loading/error pages

## Exit ramp

Full route coverage is the highest-maintenance option here: en copy changes
re-render baselines, and dynamic content (prices, dates, toasts) must be
masked or pinned or specs flake. If baseline churn ever exceeds its catch
rate, trim back to key flows + primitives — say so in the PR that does it,
don't let it rot silently.
