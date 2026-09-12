import { beforeEach, describe, expect, it, vi } from 'vitest';

const { mockFindFirst } = vi.hoisted(() => ({ mockFindFirst: vi.fn() }));

vi.mock('@/db/drizzle', () => ({
  db: { query: { users: { findFirst: mockFindFirst } } },
}));

import { canViewProfile } from '@/lib/auth/roles';
import { findUserById } from '@/modules/users/actions';

describe('canViewProfile', () => {
  it('denies anonymous viewers', () => {
    expect(canViewProfile(null, 'user-1')).toBe(false);
  });

  it('lets civilians view only themselves', () => {
    const civilian = { id: 'user-1', roles: [{ name: 'customer' }] };
    expect(canViewProfile(civilian, 'user-1')).toBe(true);
    expect(canViewProfile(civilian, 'user-2')).toBe(false);
  });

  it('lets operational roles view anyone', () => {
    expect(canViewProfile({ id: 'admin-1', roles: [{ name: 'admin' }] }, 'user-2')).toBe(true);
    expect(canViewProfile({ id: 'staff-1', roles: [{ name: 'staff' }] }, 'user-2')).toBe(true);
  });

  it('denies roleless viewers anyone but themselves', () => {
    expect(canViewProfile({ id: 'user-1' }, 'user-1')).toBe(true);
    expect(canViewProfile({ id: 'user-1' }, 'user-2')).toBe(false);
  });
});

describe('findUserById projection', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('never selects the password hash', async () => {
    mockFindFirst.mockResolvedValue({
      id: 'user-1',
      name: 'Jane',
      email: 'jane@example.com',
      createdAt: new Date(),
      updatedAt: new Date(),
    });

    await findUserById('user-1');

    expect(mockFindFirst).toHaveBeenCalledOnce();
    const columns = mockFindFirst.mock.calls[0][0].columns as Record<string, boolean>;
    expect(columns.passwordHash).toBeUndefined();
    expect(columns).toMatchObject({ id: true, name: true, email: true });
  });
});
