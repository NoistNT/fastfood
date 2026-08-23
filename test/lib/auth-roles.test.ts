import { describe, expect, it } from 'vitest';

import { hasOperationalRole, OPERATIONAL_ROLES } from '@/lib/auth/roles';
import { USER_ROLES } from '@/types/auth';

const role = (name: string) => ({ name });

describe('hasOperationalRole', () => {
  it('grants access to owners and staff', () => {
    expect(hasOperationalRole([role(USER_ROLES.ADMIN)])).toBe(true);
    expect(hasOperationalRole([role(USER_ROLES.STAFF)])).toBe(true);
  });

  it('denies civilians carrying no operational role', () => {
    expect(hasOperationalRole([{ name: 'customer' }])).toBe(false);
    expect(hasOperationalRole([])).toBe(false);
    expect(hasOperationalRole(undefined)).toBe(false);
  });

  it('keeps OPERATIONAL_ROLES exhaustive over USER_ROLES', () => {
    expect([...OPERATIONAL_ROLES].sort()).toEqual(Object.values(USER_ROLES).sort());
  });
});
