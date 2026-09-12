// Mock dependencies before imports
vi.mock('@/lib/auth/session');
vi.mock('@/lib/auth/guards');
vi.mock('@/lib/csrf');
vi.mock('@/lib/api-response');
vi.mock('@/db/drizzle');
vi.mock('@/app/api/products/_lib/validate');
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(() => Promise.resolve(vi.fn((key: string) => key))),
}));

import type { UserWithRoles } from '@/types/auth';

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Import the API functions
import { GET as getProducts, POST as createProduct } from '@/app/api/products/route';
import { GET as getProduct, PATCH as updateProduct } from '@/app/api/products/[id]/route';
import { DELETE as deleteProduct } from '@/app/api/products/[id]/delete/route';
import { getSession } from '@/lib/auth/session';
import { requireAdmin } from '@/lib/auth/guards';
import { verifyCSRFToken, getCSRFTokenFromRequest } from '@/lib/csrf';
import { apiSuccess, apiError } from '@/lib/api-response';
import { validateIngredientIds } from '@/app/api/products/_lib/validate';
import { db } from '@/db/drizzle';

const mockGetSession = vi.mocked(getSession);
const mockRequireAdmin = vi.mocked(requireAdmin);
const mockVerifyCSRFToken = vi.mocked(verifyCSRFToken);
const mockGetCSRFTokenFromRequest = vi.mocked(getCSRFTokenFromRequest);
const mockApiSuccess = vi.mocked(apiSuccess);
const mockApiError = vi.mocked(apiError);
const mockValidateIngredientIds = vi.mocked(validateIngredientIds);
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

function baseProductRecord(id = 1) {
  return {
    id,
    name: 'Test Product',
    description: 'Test description',
    price: '10.99',
    imageUrl: 'test.jpg',
    available: true,
  };
}

function mockApiEnvelope() {
  mockApiSuccess.mockImplementation((data, options) => jsonResponse(data, options?.status ?? 200));
  mockApiError.mockImplementation((code, message, options) =>
    jsonError(code, message, options?.status ?? 500)
  );
}

function mockDbChain() {
  // GET list
  mockDb.select.mockReturnValue({
    from: vi.fn().mockReturnValue({
      leftJoin: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({ orderBy: vi.fn().mockResolvedValue([]) }),
      }),
      where: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([]) }),
      innerJoin: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }),
    }),
  } as any);

  mockDb.insert.mockReturnValue({
    values: vi.fn().mockReturnValue({ returning: vi.fn().mockResolvedValue([{ id: 1 }]) }),
  } as any);

  mockDb.update.mockReturnValue({
    set: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) }),
  } as any);

  mockDb.delete.mockReturnValue({ where: vi.fn().mockResolvedValue(undefined) } as any);
}

describe('/api/products', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockApiEnvelope();
    mockDbChain();

    // Default: authenticated admin with a valid CSRF token
    mockGetSession.mockResolvedValue(adminUser);
    mockRequireAdmin.mockResolvedValue({ ok: true, user: adminUser });
    mockVerifyCSRFToken.mockResolvedValue(true);
    mockGetCSRFTokenFromRequest.mockResolvedValue('test-token');
    mockValidateIngredientIds.mockResolvedValue([1, 2]);
  });

  describe('GET /api/products', () => {
    it('should return products list successfully', async () => {
      const mockProductsData = [
        { ...baseProductRecord(), ingredients: 'Ingredient 1', ingredientId: 1 },
        { ...baseProductRecord(), ingredients: 'Ingredient 2', ingredientId: 2 },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi
              .fn()
              .mockReturnValue({ orderBy: vi.fn().mockResolvedValue(mockProductsData) }),
          }),
        }),
      } as any);

      const response = await getProducts();
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([
        {
          ...baseProductRecord(),
          ingredients: ['Ingredient 1', 'Ingredient 2'],
          ingredientIds: [1, 2],
        },
      ]);
    });
  });

  describe('POST /api/products', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockRequireAdmin.mockResolvedValue({ ok: false, reason: 'unauthorized' });

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Product', price: '15.99' }),
      });

      const response = await createProduct(request);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 403 when a non-admin user attempts to create', async () => {
      mockRequireAdmin.mockResolvedValue({ ok: false, reason: 'forbidden' });

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Product', price: '15.99', ingredientIds: [1, 2] }),
      });

      const response = await createProduct(request);
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('FORBIDDEN');
    });

    it('should return 403 when the CSRF token is invalid', async () => {
      mockVerifyCSRFToken.mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Product', price: '10' }),
      });

      const response = await createProduct(request);
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('CSRF_INVALID');
    });

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({ description: 'missing name and price' }),
      });

      const response = await createProduct(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

    it('should reject ingredient ids that do not exist', async () => {
      mockValidateIngredientIds.mockResolvedValue(null);
      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({ name: 'New Product', price: '15.99', ingredientIds: [999] }),
      });

      const response = await createProduct(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

    it('should create product successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({
          name: 'New Product',
          description: 'Product description',
          price: '15.99',
          imageUrl: 'product.jpg',
          available: true,
          ingredientIds: [1, 2],
        }),
      });

      const response = await createProduct(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.data.product.id).toBe(1);
    });
  });

  describe('GET /api/products/[id]', () => {
    it('should return 404 for non-existent product', async () => {
      const params = Promise.resolve({ id: '999' });

      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({ limit: vi.fn().mockResolvedValue([]) }),
          }),
        } as any)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({ where: vi.fn().mockResolvedValue([]) }),
          }),
        } as any);

      const response = await getProduct({} as NextRequest, { params });
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('NOT_FOUND');
    });
  });

  describe('PATCH /api/products/[id]', () => {
    it('should return 403 when a non-admin user calls update', async () => {
      mockRequireAdmin.mockResolvedValue({ ok: false, reason: 'forbidden' });
      const params = Promise.resolve({ id: '1' });

      const request = new NextRequest('http://localhost:3000/api/products/1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated' }),
      });

      const response = await updateProduct(request, { params });
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.error.code).toBe('FORBIDDEN');
    });

    it('should return 403 when the CSRF token is missing', async () => {
      mockGetCSRFTokenFromRequest.mockResolvedValue(null);
      const params = Promise.resolve({ id: '1' });

      const request = new NextRequest('http://localhost:3000/api/products/1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated' }),
      });

      const response = await updateProduct(request, { params });
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.error.code).toBe('CSRF_INVALID');
    });

    it('should update product successfully', async () => {
      const params = Promise.resolve({ id: '1' });

      const request = new NextRequest('http://localhost:3000/api/products/1', {
        method: 'PATCH',
        body: JSON.stringify({ name: 'Updated', ingredientIds: [3] }),
      });

      const response = await updateProduct(request, { params });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
    });
  });

  describe('DELETE /api/products/[id]', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockRequireAdmin.mockResolvedValue({ ok: false, reason: 'unauthorized' });
      const params = Promise.resolve({ id: '1' });

      const response = await deleteProduct({} as NextRequest, { params });
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 403 when CSRF is invalid', async () => {
      mockVerifyCSRFToken.mockResolvedValue(false);
      const params = Promise.resolve({ id: '1' });

      const response = await deleteProduct({} as NextRequest, { params });
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.error.code).toBe('CSRF_INVALID');
    });

    it('should soft delete product successfully', async () => {
      const params = Promise.resolve({ id: '1' });

      const response = await deleteProduct({} as NextRequest, { params });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
    });
  });
});
