// Mock dependencies before imports
vi.mock('@/lib/auth/session');
vi.mock('@/lib/auth/guards');
vi.mock('@/lib/api-response');
vi.mock('@/db/drizzle');

import type { UserWithRoles } from '@/types/auth';
import type { NextRequest } from 'next/server';

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

import { GET as getIngredients } from '@/app/api/ingredients/route';
import { requireAdmin } from '@/lib/auth/guards';
import { apiSuccess, apiError } from '@/lib/api-response';
import { db } from '@/db/drizzle';

const mockRequireAdmin = vi.mocked(requireAdmin);
const mockApiSuccess = vi.mocked(apiSuccess);
const mockApiError = vi.mocked(apiError);
const mockDb = vi.mocked(db);

const adminUser: UserWithRoles = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'admin@example.com',
  name: 'Admin User',
  passwordHash: 'hashed-password',
  phoneNumber: null,
  lastLoginAt: null,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  roles: [{ id: 1, name: 'admin', description: 'Administrator' }],
};

function jsonResponse<T>(data: T, status = 200) {
  return NextResponse.json(
    { success: true, data, meta: { timestamp: new Date().toISOString() } },
    { status }
  );
}

function jsonError(code: string, message: string, status = 500) {
  return NextResponse.json(
    { success: false, error: { code, message }, meta: { timestamp: new Date().toISOString() } },
    { status }
  );
}

describe('/api/ingredients', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockApiSuccess.mockImplementation((data, options) =>
      jsonResponse(data, options?.status ?? 200)
    );
    mockApiError.mockImplementation((code, message, options) =>
      jsonError(code, message, options?.status ?? 500)
    );

    mockRequireAdmin.mockResolvedValue({ ok: true, user: adminUser });

    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({ orderBy: vi.fn().mockResolvedValue([]) }),
    } as any);
  });

  describe('GET /api/ingredients', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockRequireAdmin.mockResolvedValue({ ok: false, reason: 'unauthorized' });

      const response = await getIngredients({} as NextRequest);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 403 when a non-admin user calls the route', async () => {
      mockRequireAdmin.mockResolvedValue({ ok: false, reason: 'forbidden' });

      const response = await getIngredients({} as NextRequest);
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('FORBIDDEN');
    });

    it('should return the ingredient list for an admin', async () => {
      const ingredientsList = [
        { id: 1, name: 'Flour', unit: 'g' },
        { id: 2, name: 'Sugar', unit: 'g' },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({ orderBy: vi.fn().mockResolvedValue(ingredientsList) }),
      } as any);

      const response = await getIngredients({} as NextRequest);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(ingredientsList);
    });

    it('should return 500 when the database query fails', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({ orderBy: vi.fn().mockRejectedValue(new Error('db down')) }),
      } as any);

      const response = await getIngredients({} as NextRequest);
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('INTERNAL_ERROR');
    });
  });
});
