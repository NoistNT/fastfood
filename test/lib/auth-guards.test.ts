import type { UserWithRoles } from '@/types/auth';

import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth/session', () => ({
  getSession: vi.fn(),
}));

import { getSession } from '@/lib/auth/session';
import { requireAdmin, requireOperationalRole } from '@/lib/auth/guards';

const getSessionMock = vi.mocked(getSession);

function userWithRoles(...roleNames: string[]): UserWithRoles {
  return {
    id: 'u1',
    name: 'Sam',
    email: null,
    passwordHash: null,
    phoneNumber: null,
    lastLoginAt: null,
    deletedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    roles: roleNames.map((name) => ({ id: 1, name, description: null })),
  };
}

describe('requireOperationalRole', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('rejects anonymous callers as unauthorized', async () => {
    getSessionMock.mockResolvedValue(null);
    await expect(requireOperationalRole()).resolves.toEqual({ ok: false, reason: 'unauthorized' });
  });

  it('rejects civilians as forbidden', async () => {
    getSessionMock.mockResolvedValue(userWithRoles('customer'));
    await expect(requireOperationalRole()).resolves.toEqual({ ok: false, reason: 'forbidden' });
  });

  it('admits staff and admin', async () => {
    getSessionMock.mockResolvedValue(userWithRoles('staff'));
    expect((await requireOperationalRole()).ok).toBe(true);

    getSessionMock.mockResolvedValue(userWithRoles('admin'));
    expect((await requireOperationalRole()).ok).toBe(true);
  });

  it('keeps requireAdmin stricter than the operational guard', async () => {
    getSessionMock.mockResolvedValue(userWithRoles('staff'));
    expect((await requireAdmin()).ok).toBe(false);
    expect((await requireOperationalRole()).ok).toBe(true);
  });
});
