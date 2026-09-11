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
vi.mock('@/db/drizzle', () => ({
  db: {
    select: vi.fn(),
    update: vi.fn(),
  },
}));

import { POST as editPerson } from '@/app/api/customers/[id]/edit/route';
import { requireAdmin } from '@/lib/auth/guards';
import { getCSRFTokenFromRequest, verifyCSRFToken } from '@/lib/csrf';
import { apiSuccess, apiError } from '@/lib/api-response';
import { db } from '@/db/drizzle';

const mockRequireAdmin = vi.mocked(requireAdmin);
const mockGetCSRFToken = vi.mocked(getCSRFTokenFromRequest);
const mockVerifyCSRFToken = vi.mocked(verifyCSRFToken);
const mockApiSuccess = vi.mocked(apiSuccess);
const mockApiError = vi.mocked(apiError);
const mockDbSelect = vi.mocked(db.select);
const mockDbUpdate = vi.mocked(db.update);

function selectOnce(rows: unknown[]) {
  mockDbSelect.mockReturnValueOnce({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue(rows),
      }),
    }),
  } as never);
}

function postRequest(id: string, body: unknown) {
  return new NextRequest(`http://localhost:3000/api/customers/${id}/edit`, {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

const PERSON_ID = '550e8400-e29b-41d4-a716-446655440001';

describe('POST /api/customers/[id]/edit', () => {
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

    const response = await editPerson(postRequest(PERSON_ID, { name: 'Ana' }), {
      params: Promise.resolve({ id: PERSON_ID }),
    });

    expect(response.status).toBe(401);
    expect(mockDbSelect).not.toHaveBeenCalled();
  });

  it('returns 403 for non-admin roles', async () => {
    mockRequireAdmin.mockResolvedValue({ ok: false, reason: 'forbidden' });

    const response = await editPerson(postRequest(PERSON_ID, { name: 'Ana' }), {
      params: Promise.resolve({ id: PERSON_ID }),
    });

    expect(response.status).toBe(403);
  });

  it('returns 403 for an invalid CSRF token', async () => {
    mockVerifyCSRFToken.mockResolvedValue(false);

    const response = await editPerson(postRequest(PERSON_ID, { name: 'Ana' }), {
      params: Promise.resolve({ id: PERSON_ID }),
    });

    expect(response.status).toBe(403);
    expect(mockDbSelect).not.toHaveBeenCalled();
  });

  it('returns 404 for an unknown or deleted person', async () => {
    selectOnce([]);

    const response = await editPerson(postRequest(PERSON_ID, { name: 'Ana' }), {
      params: Promise.resolve({ id: PERSON_ID }),
    });

    expect(response.status).toBe(404);
    expect((await response.json()).error.code).toBe('NOT_FOUND');
  });

  it('returns 400 when no fields are provided', async () => {
    selectOnce([{ id: PERSON_ID }]);

    const response = await editPerson(postRequest(PERSON_ID, {}), {
      params: Promise.resolve({ id: PERSON_ID }),
    });

    expect(response.status).toBe(400);
    expect(mockDbUpdate).not.toHaveBeenCalled();
  });

  it('returns 400 when the email belongs to someone else', async () => {
    selectOnce([{ id: PERSON_ID }]);
    selectOnce([{ id: 'other-id' }]);

    const response = await editPerson(postRequest(PERSON_ID, { email: 'taken@example.com' }), {
      params: Promise.resolve({ id: PERSON_ID }),
    });

    expect(response.status).toBe(400);
    expect(mockDbUpdate).not.toHaveBeenCalled();
  });

  it('returns 400 when only a case-variant of the email exists', async () => {
    selectOnce([{ id: PERSON_ID }]);
    selectOnce([{ id: 'other-id' }]);

    const response = await editPerson(postRequest(PERSON_ID, { email: 'Taken@Example.COM' }), {
      params: Promise.resolve({ id: PERSON_ID }),
    });
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error.code).toBe('VALIDATION_ERROR');
    expect(mockDbUpdate).not.toHaveBeenCalled();
  });

  it('clears contact fields sent as blank strings', async () => {
    selectOnce([{ id: PERSON_ID }]);
    const setMock = vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi
          .fn()
          .mockResolvedValue([{ id: PERSON_ID, name: 'Ana', email: null, phoneNumber: null }]),
      }),
    });
    mockDbUpdate.mockReturnValueOnce({ set: setMock } as never);

    const response = await editPerson(
      postRequest(PERSON_ID, { name: 'Ana', phoneNumber: '', email: '' }),
      {
        params: Promise.resolve({ id: PERSON_ID }),
      }
    );

    expect(response.status).toBe(200);
    expect(setMock).toHaveBeenCalledWith(
      expect.objectContaining({ phoneNumber: null, email: null })
    );
  });

  it('returns 400 for a malformed person id', async () => {
    const response = await editPerson(postRequest('not-a-uuid', { name: 'Ana' }), {
      params: Promise.resolve({ id: 'not-a-uuid' }),
    });
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error.code).toBe('VALIDATION_ERROR');
    expect(mockDbSelect).not.toHaveBeenCalled();
  });

  it('returns 404 when the person is deleted before the write lands', async () => {
    selectOnce([{ id: PERSON_ID }]);
    mockDbUpdate.mockReturnValueOnce({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([]),
        }),
      }),
    } as never);

    const response = await editPerson(postRequest(PERSON_ID, { name: 'Ana' }), {
      params: Promise.resolve({ id: PERSON_ID }),
    });
    const result = await response.json();

    expect(response.status).toBe(404);
    expect(result.error.code).toBe('NOT_FOUND');
  });

  it('updates only the provided fields', async () => {
    selectOnce([{ id: PERSON_ID }]);
    const updated = { id: PERSON_ID, name: 'Ana Updated', email: null, phoneNumber: null };
    mockDbUpdate.mockReturnValueOnce({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([updated]),
        }),
      }),
    } as never);

    const response = await editPerson(postRequest(PERSON_ID, { name: 'Ana Updated' }), {
      params: Promise.resolve({ id: PERSON_ID }),
    });
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.data).toEqual({ person: updated });
    expect(mockDbUpdate).toHaveBeenCalledTimes(1);
  });

  it('maps unique-race violations to 400', async () => {
    selectOnce([{ id: PERSON_ID }]);
    mockDbUpdate.mockReturnValueOnce({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockRejectedValue(Object.assign(new Error('dup'), { code: '23505' })),
        }),
      }),
    } as never);

    const response = await editPerson(postRequest(PERSON_ID, { name: 'Ana' }), {
      params: Promise.resolve({ id: PERSON_ID }),
    });

    expect(response.status).toBe(400);
  });
});
