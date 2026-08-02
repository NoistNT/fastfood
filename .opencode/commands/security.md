---
description: Run a security audit of the codebase.
agent: security
---

Perform a security audit of FastFood, focusing on: $ARGUMENTS

Default coverage: JWT session auth, role-based authorization/IDOR, CSRF, XSS/SQL injection, rate limiting, secrets/env handling, MercadoPago payment flow, and PII leakage in error paths. Report findings ordered by severity with file:line references and concrete fixes. Do not edit code.
