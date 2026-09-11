# Code review checklist

Run this against every diff before presenting a PR. Each item traces to a
real shipped-or-caught bug; check the file, not the intent.

## Security
- Every route: authentication level correct for its consumers? (checkout is
  public-by-design; dashboard mutations need roles — #35/#56)
- Every input validated, including path params and query strings?
  (`params.id` UUID → 400 not 500 — #76; `period` enum coercion — #69)
- Rate-limit key from a trusted source (`getClientIp()`, never raw
  `x-forwarded-for` — #60)?
- No PII in URLs, storage, logs, or error responses? (register-URL params →
  sessionStorage → removed entirely — #60)

## Correctness
- Empty vs. absent distinguished? (`''` must clear, missing must skip — #76)
- Confirm screens: invalidate displayed preview on input change; disable
  confirm while reloading? (#75)
- Dialog Cancel must route through the busy guard like every other
  dismissal path? (#75)
- Submit gates cover all invalid states, not just the obvious ones?
  (delivery-without-address had no `<form>`, so `required` was inert — #60)
- Async races closed? (stale request closing a reopened dialog; submit
  before session resolves — #60)
- Error paths preserve UX invariants? (invalid payloads never queued
  offline, never clear the cart — #60)
- Guest vs. authed derived from server response, not client race state?
  (`placed.claimUrl` authority — #72)

## Data integrity
- Every check-then-write atomic or re-guarded at write time? (conditional
  `UPDATE … RETURNING`; liveness predicate in the UPDATE — #40, #76)
- Destructive endpoints: a repeated execution must be a harmless no-op —
  unique constraints as idempotency arbiters, not just validation (#75)
- Unique constraints: pre-check → 400 path AND race catch?
  (email/phone edit — #76)
- Case handling consistent between matchers and writers? (lowercase
  everywhere — #76)
- Deletes: soft or hard, and what cascades (or doesn't) as a consequence?
  (`claim_tokens` cascade vs. soft-delete non-cascade — #64)
- Migrations: `schema.ts` ↔ `dev-reset.sql` ↔ `drizzle/` all three move
  together? (#64)

## Privacy
- New stored/transmitted fields: personal data minimized? Snapshots exclude
  credential material? (claim preview projection — #64)
- Bearer tokens: random, hashed at rest, single-use, short TTL, no
  failure-mode oracle? (claim tokens — #64)
- Registration/claim adoption can't bind credentials to an unreachable
  identity? (email-match guard — #64)

## Maintenance
- Every future finding that slips through gets distilled into one line here,
  with its issue/PR reference. A checklist that doesn't grow is decoration.
- Procedure (AGENTS.md enforcement gate): verdict table organized by the
  four lenses above; fix valid-only; one-line skip reasons.
