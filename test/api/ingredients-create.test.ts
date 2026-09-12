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
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
    execute: vi.fn(),
  },
}));

import { GET as listIngredients, POST as createIngredient } from '@/app/api/ingredients/route';
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
const mockDbInsert = vi.mocked(db.insert);
const mockDbDelete = vi.mocked(db.delete);
const mockDbExecute = vi.mocked(db.execute);

function selectOnce(rows: unknown[]) {
  const terminator = { limit: vi.fn().mockResolvedValue(rows) } as never;
  mockDbSelect.mockReturnValueOnce({
    from: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue(terminator),
      orderBy: vi.fn().mockResolvedValue(rows),
    }),
  } as never);
}

function postRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/ingredients', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

const validBody = { name: 'Tomato', unit: 'kg', price: '2.50', minThreshold: 5 };

describe('POST /api/ingredients', () => {
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

    const response = await createIngredient(postRequest(validBody));

    expect(response.status).toBe(401);
    expect(mockDbInsert).not.toHaveBeenCalled();
  });

  it('returns 403 for non-admin roles', async () => {
    mockRequireAdmin.mockResolvedValue({ ok: false, reason: 'forbidden' });

    const response = await createIngredient(postRequest(validBody));

    expect(response.status).toBe(403);
  });

  it('returns 403 for an invalid CSRF token', async () => {
    mockVerifyCSRFToken.mockResolvedValue(false);

    const response = await createIngredient(postRequest(validBody));

    expect(response.status).toBe(403);
    expect(mockDbInsert).not.toHaveBeenCalled();
  });

  it('returns 400 for invalid payloads', async () => {
    const response = await createIngredient(postRequest({ name: '', unit: 'kg', price: 'nope' }));

    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe('VALIDATION_ERROR');
  });

  it('returns 400 for numeric-prefix prices', async () => {
    const response = await createIngredient(
      postRequest({ name: 'Tomato', unit: 'kg', price: '10abc' })
    );

    expect(response.status).toBe(400);
    expect(mockDbExecute).not.toHaveBeenCalled();
  });

  it('returns 400 for non-finite prices', async () => {
    const response = await createIngredient(
      postRequest({ name: 'Tomato', unit: 'kg', price: 'Infinity' })
    );

    expect(response.status).toBe(400);
    expect(mockDbInsert).not.toHaveBeenCalled();
  });

  it('returns 400 when the name already exists', async () => {
    selectOnce([{ id: 7 }]);

    const response = await createIngredient(postRequest(validBody));

    expect(response.status).toBe(400);
    expect(mockDbInsert).not.toHaveBeenCalled();
  });

  it('returns 400 for malformed JSON bodies', async () => {
    const response = await createIngredient(
      new NextRequest('http://localhost:3000/api/ingredients', {
        method: 'POST',
        body: 'not-json',
      })
    );

    expect(response.status).toBe(400);
    expect((await response.json()).error.code).toBe('VALIDATION_ERROR');
    expect(mockDbSelect).not.toHaveBeenCalled();
  });

  it('creates the ingredient with a zero-stock inventory row in one statement', async () => {
    selectOnce([]);
    mockDbExecute.mockResolvedValue({ rows: [{ id: 9, name: 'Tomato' }] } as never);

    const response = await createIngredient(postRequest(validBody));
    const result = await response.json();

    expect(response.status).toBe(201);
    expect(result.data).toEqual({ ingredient: { id: 9, name: 'Tomato' } });
    expect(mockDbExecute).toHaveBeenCalledTimes(1);
    expect(mockDbInsert).not.toHaveBeenCalled();
    expect(mockDbDelete).not.toHaveBeenCalled();
  });

  it('maps unique-race violations to 400', async () => {
    selectOnce([]);
    mockDbExecute.mockRejectedValue(Object.assign(new Error('dup'), { code: '23505' }));

    const response = await createIngredient(postRequest(validBody));
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.error.code).toBe('VALIDATION_ERROR');
  });

  it('keeps listing ingredients for admin', async () => {
    selectOnce([{ id: 1, name: 'Meat', unit: 'kg' }]);

    const response = await listIngredients(
      new NextRequest('http://localhost:3000/api/ingredients')
    );

    expect(response.status).toBe(200);
  });
});
