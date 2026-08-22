import { describe, expect, it } from 'vitest';

import { getUserInitials } from '@/modules/core/components/user-avatar';

describe('getUserInitials', () => {
  it('joins word initials, uppercased, capped at two characters', () => {
    expect(getUserInitials('Jane Smith')).toBe('JS');
    expect(getUserInitials('jean pierre dupont')).toBe('JP');
  });

  it('uses a single initial for single-word names', () => {
    expect(getUserInitials('Jane')).toBe('J');
  });

  it('trims extra whitespace', () => {
    expect(getUserInitials('  Jane   Smith  ')).toBe('JS');
  });

  it('falls back to the first email character, uppercased, without a name', () => {
    expect(getUserInitials(null, 'jane@example.com')).toBe('J');
    expect(getUserInitials('', 'bob@test.io')).toBe('B');
  });

  it("returns 'U' when neither name nor email is usable", () => {
    expect(getUserInitials()).toBe('U');
    expect(getUserInitials('', '')).toBe('U');
    expect(getUserInitials(null, null)).toBe('U');
    expect(getUserInitials('   ', '   ')).toBe('U');
  });
});
