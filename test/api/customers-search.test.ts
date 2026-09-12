import { NextRequest } from 'next/server';

import { describe, beforeEach, it, expect, vi } from 'vitest';

vi.mock('@/lib/auth/session', () => ({
  getSession: vi.fn(),
}));

vi.mock('@/db/drizzle', () => ({
  db: {
    select: vi.fn(),
  },
}));

import { getSession } from '@/lib/auth/session';
import { db } from '@/db/drizzle';
import { GET } from '@/app/api/customers/search/route';

import type { UserWithRoles } from '@/types/auth';

const getSessionMock = vi.mocked(getSession);
const dbMock = vi.mocked(db);

function sessionWith(...roleNames: string[]): UserWithRoles {
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

function mockSearchResult(rows: Record<string, unknown>[]) {
  const limit = vi.fn().mockResolvedValue(rows);
  dbMock.select.mockImplementation(
    () =>
      ({
        from: () => ({ where: () => ({ orderBy: () => ({ limit }) }) }),
      }) as never
  );
}

function requestFor(query: string) {
  return new NextRequest(
    `http://localhost:3000/api/customers/search?q=${encodeURIComponent(query)}`
  );
}

describe('GET /api/customers/search', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('requires authentication', async () => {
    getSessionMock.mockResolvedValue(null);

    const response = await GET(requestFor('ana'));

    expect(response.status).toBe(401);
    expect((await response.json()).error.code).toBe('UNAUTHORIZED');
  });

  it('rejects civilians without operational roles', async () => {
    getSessionMock.mockResolvedValue(sessionWith('customer'));

    const response = await GET(requestFor('ana'));

    expect(response.status).toBe(403);
    expect((await response.json()).error.code).toBe('FORBIDDEN');
  });

  it('validates the minimum query length', async () => {
    getSessionMock.mockResolvedValue(sessionWith('staff'));

    const response = await GET(requestFor('a'));

    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe('VALIDATION_ERROR');
    expect(dbMock.select).not.toHaveBeenCalled();
  });

  it('returns client-safe people for operational roles', async () => {
    getSessionMock.mockResolvedValue(sessionWith('staff'));
    mockSearchResult([
      { id: 'p1', name: 'Ana', email: null, phoneNumber: '5491123456789', passwordHash: null },
      {
        id: 'p2',
        name: 'Ana Belén',
        email: 'belen@example.com',
        phoneNumber: null,
        passwordHash: 'hash',
      },
    ]);

    const response = await GET(requestFor('ana'));
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.data.people).toEqual([
      {
        id: 'p1',
        name: 'Ana',
        email: null,
        phoneNumber: '5491123456789',
        hasCredentials: false,
      },
      {
        id: 'p2',
        name: 'Ana Belén',
        email: 'belen@example.com',
        phoneNumber: null,
        hasCredentials: true,
      },
    ]);
  });

  it('maps database failures to an internal error envelope', async () => {
    getSessionMock.mockResolvedValue(sessionWith('admin'));
    dbMock.select.mockImplementation(() => {
      throw new Error('connection refused');
    });

    const response = await GET(requestFor('ana'));

    expect(response.status).toBe(500);
    expect((await response.json()).error.code).toBe('INTERNAL_ERROR');
  });
});
