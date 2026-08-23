import type { UserWithRoles } from '@/types/auth';

import { describe, expect, it, vi, beforeEach } from 'vitest';

vi.mock('@/lib/auth/session', () => ({
  getSession: vi.fn(),
  updateSession: vi.fn(),
}));

import { getSession, updateSession } from '@/lib/auth/session';

import proxy from '@/proxy';

const getSessionMock = vi.mocked(getSession);
const updateSessionMock = vi.mocked(updateSession);

type Session = UserWithRoles | null;

function sessionWith(...roleNames: string[]): Session {
  return {
    id: 'u1',
    name: 'Sam',
    email: null,
    roles: roleNames.map((name) => ({ name })),
  } as Session;
}

function makeRequest(path: string) {
  const nextUrl = new URL(`http://localhost${path}`) as URL & { clone(): URL };
  nextUrl.clone = () => new URL(nextUrl.toString());
  return { nextUrl } as unknown as Parameters<typeof proxy>[0];
}

async function expectPassThrough(path: string, session: Session) {
  getSessionMock.mockResolvedValue(session);
  const marker = { sentinel: true };
  updateSessionMock.mockResolvedValue(marker as never);

  const request = makeRequest(path);
  await expect(proxy(request)).resolves.toBe(marker);
}

async function expectRedirect(path: string, session: Session, destination: string) {
  getSessionMock.mockResolvedValue(session);

  const response = await proxy(makeRequest(path));
  expect(response.status).toBe(307);
  expect(response.headers.get('location')).toBe(`http://localhost${destination}`);
}

describe('route protection matrix', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('sends unauthenticated visitors to login on protected routes', async () => {
    await expectRedirect('/dashboard', null, '/login');
  });

  it('lets anyone through public routes without a session', async () => {
    await expectPassThrough('/', null);
    await expectPassThrough('/login', null);
  });

  it('fences civilians out of the dashboard', async () => {
    const session = sessionWith('customer');
    await expectRedirect('/dashboard', session, '/forbidden');
    await expectRedirect('/dashboard/orders', session, '/forbidden');
  });

  it('admits admin and staff everywhere under /dashboard', async () => {
    await expectPassThrough('/dashboard', sessionWith('admin'));
    await expectPassThrough('/dashboard', sessionWith('staff'));
    await expectPassThrough('/dashboard/orders', sessionWith('staff'));
    await expectPassThrough('/dashboard/customers', sessionWith('admin', 'staff'));
  });
});
