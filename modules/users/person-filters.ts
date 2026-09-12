import { and, isNull, sql } from 'drizzle-orm';

import { users } from '@/db/schema';

/**
 * Predicate for name-only reuse in `findOrCreatePerson`: an exact-name match
 * may be reused only when it is truly phone-less, unclaimed, and alive —
 * otherwise two different people could collapse into one identity.
 */
export function recordOnlyNameReuseCondition(name: string) {
  return and(
    sql`lower(${users.name}) = ${name.toLowerCase()}`,
    isNull(users.phoneNumber),
    isNull(users.passwordHash),
    isNull(users.deletedAt)
  );
}
