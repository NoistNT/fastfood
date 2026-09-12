import { describe, expect, it } from 'vitest';

import { drizzle } from 'drizzle-orm/neon-http';

import { users } from '@/db/schema';
import { recordOnlyNameReuseCondition } from '@/modules/users/person-filters';

const db = drizzle.mock();

describe('recordOnlyNameReuseCondition', () => {
  it('restricts name-only reuse to phone-less, unclaimed, non-deleted records', () => {
    const { sql: predicate } = db
      .select({ id: users.id })
      .from(users)
      .where(recordOnlyNameReuseCondition('Ana'))
      .limit(1)
      .toSQL();

    expect(predicate).toContain('lower');
    expect(predicate).toContain('"users"."phone_number" is null');
    expect(predicate).toContain('"users"."password_hash" is null');
    expect(predicate).toContain('"users"."deleted_at" is null');
  });
});
