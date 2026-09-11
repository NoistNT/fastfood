import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock dependencies before imports
vi.mock('@/lib/auth/guards', () => ({
  requireAdmin: vi.fn(),
}));
vi.mock('@/lib/csrf', () => ({
  getCSRFTokenFromRequest: vi.fn(),
  verifyCSRFToken: vi.fn(),
}));
vi.mock('@/lib/api-response');
vi.mock('@/modules/users/persons');

import { POST as createPerson } from '@/app/api/customers/route';
import { requireAdmin } from '@/lib/auth/guards';
import { getCSRFTokenFromRequest, verifyCSRFToken } from '@/lib/csrf';
import { findOrCreatePerson } from '@/modules/users/persons';
import { apiSuccess, apiError } from '@/lib/api-response';

const mockRequireAdmin = vi.mocked(requireAdmin);
const mockGetCSRFToken = vi.mocked(getCSRFTokenFromRequest);
const mockVerifyCSRFToken = vi.mocked(verifyCSRFToken);
const mockFindOrCreatePerson = vi.mocked(findOrCreatePerson);
const mockApiSuccess = vi.mocked(apiSuccess);
const mockApiError = vi.mocked(apiError);

function postRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/customers', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('POST /api/customers', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockApiSuccess.mockImplementation((data, options) =>
      NextResponse.json(
        {
          success: true,
          data,
          meta: { timestamp: new Date().toISOString() },
        },
        { status: options?.status ?? 200 }
      )
    );
    mockApiError.mockImplementation((code, message, options) =>
      NextResponse.json(
        {
          success: false,
          error: { code, message },
          meta: { timestamp: new Date().toISOString() },
        },
        { status: options?.status ?? 500 }
      )
    );
    mockRequireAdmin.mockResolvedValue({ ok: true, user: { id: 'admin-1' } } as never);
    mockGetCSRFToken.mockResolvedValue('token');
    mockVerifyCSRFToken.mockResolvedValue(true);
  });

  it('returns 401 without a session', async () => {
    mockRequireAdmin.mockResolvedValue({ ok: false, reason: 'unauthorized' });

    const response = await createPerson(
      postRequest({ name: 'Ana', phoneNumber: '+54 9 11 1111 1111' })
    );

    expect(response.status).toBe(401);
    expect(mockFindOrCreatePerson).not.toHaveBeenCalled();
  });

  it('returns 403 for non-admin roles', async () => {
    mockRequireAdmin.mockResolvedValue({ ok: false, reason: 'forbidden' });

    const response = await createPerson(
      postRequest({ name: 'Ana', phoneNumber: '+54 9 11 1111 1111' })
    );

    expect(response.status).toBe(403);
    expect((await response.json()).error.code).toBe('FORBIDDEN');
  });

  it('returns 403 for an invalid CSRF token', async () => {
    mockVerifyCSRFToken.mockResolvedValue(false);

    const response = await createPerson(
      postRequest({ name: 'Ana', phoneNumber: '+54 9 11 1111 1111' })
    );

    expect(response.status).toBe(403);
    expect(mockFindOrCreatePerson).not.toHaveBeenCalled();
  });

  it('returns 400 for a blank name', async () => {
    const response = await createPerson(postRequest({ name: '  ' }));

    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe('VALIDATION_ERROR');
  });

  it('creates a record-only person through the shared dedupe service', async () => {
    const person = {
      id: 'p1',
      name: 'Ana',
      email: null,
      phoneNumber: '+5491111111111',
      hasCredentials: false,
    };
    mockFindOrCreatePerson.mockResolvedValue(person);

    const response = await createPerson(
      postRequest({ name: 'Ana', phoneNumber: '+54 9 11 1111 1111' })
    );
    const result = await response.json();

    expect(response.status).toBe(201);
    expect(mockFindOrCreatePerson).toHaveBeenCalledWith({
      name: 'Ana',
      phoneNumber: '+54 9 11 1111 1111',
      email: null,
    });
    expect(result.data).toEqual({ person });
  });

  it('accepts an optional email', async () => {
    mockFindOrCreatePerson.mockResolvedValue({
      id: 'p2',
      name: 'Ana',
      email: 'ana@example.com',
      phoneNumber: null,
      hasCredentials: false,
    });

    const response = await createPerson(postRequest({ name: 'Ana', email: 'ana@example.com' }));

    expect(response.status).toBe(201);
    expect(mockFindOrCreatePerson).toHaveBeenCalledWith({
      name: 'Ana',
      phoneNumber: null,
      email: 'ana@example.com',
    });
  });
});
