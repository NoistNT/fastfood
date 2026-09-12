import { describe, expect, it } from 'vitest';

import { getUserInitials } from '@/modules/core/components/user-avatar';

describe('getUserInitials', () => {
  it('uses the first letter of the name, uppercased', () => {
    expect(getUserInitials('Jane Smith')).toBe('J');
    expect(getUserInitials('jane')).toBe('J');
  });

  it('trims extra whitespace', () => {
    expect(getUserInitials('  Jane   Smith  ')).toBe('J');
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
