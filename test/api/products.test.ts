// Mock dependencies before imports
vi.mock('@/lib/auth/session');
vi.mock('@/lib/api-response');
vi.mock('@/db/drizzle');
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(() => Promise.resolve(vi.fn((key: string) => key))),
}));

import type { UserWithRoles } from '@/types/auth';

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Import the API functions
import { GET as getProducts, POST as createProduct } from '@/app/api/products/route';
import { GET as getProduct } from '@/app/api/products/[id]/route';
import { DELETE as deleteProduct } from '@/app/api/products/[id]/delete/route';
import { getSession } from '@/lib/auth/session';
import { apiSuccess, apiError } from '@/lib/api-response';
import { db } from '@/db/drizzle';

const mockGetSession = vi.mocked(getSession);
const mockApiSuccess = vi.mocked(apiSuccess);
const mockApiError = vi.mocked(apiError);
const mockDb = vi.mocked(db);

const mockUser: UserWithRoles = {
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

describe('/api/products', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set up default mock responses
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

    // Mock database operations
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        leftJoin: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([]),
          }),
        }),
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]),
        }),
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([]),
        }),
      }),
    } as any);

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([{ id: 1 }]),
      }),
    } as any);

    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    } as any);

    mockDb.delete.mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    } as any);
  });

  describe('GET /api/products', () => {
    it('should return products list successfully', async () => {
      const mockProductsData = [
        {
          id: 1,
          name: 'Test Product',
          description: 'Test description',
          price: '10.99',
          imageUrl: 'test.jpg',
          available: true,
          ingredients: 'Ingredient 1',
          ingredientId: 1,
        },
        {
          id: 1,
          name: 'Test Product',
          description: 'Test description',
          price: '10.99',
          imageUrl: 'test.jpg',
          available: true,
          ingredients: 'Ingredient 2',
          ingredientId: 2,
        },
      ];

      // Mock the database query to return the products data
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          leftJoin: vi.fn().mockReturnValue({
            leftJoin: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue(mockProductsData),
            }),
          }),
        }),
      } as any);

      const response = await getProducts();
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toEqual([
        {
          id: 1,
          name: 'Test Product',
          description: 'Test description',
          price: '10.99',
          imageUrl: 'test.jpg',
          available: true,
          ingredients: ['Ingredient 1', 'Ingredient 2'],
          ingredientIds: [1, 2],
        },
      ]);
    });
  });

  describe('POST /api/products', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

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

      expect(response.status).toBe(401);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('UNAUTHORIZED');
      expect(result.error.message).toBe('Authentication required');
    });

    it('should validate required fields', async () => {
      mockGetSession.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/products', {
        method: 'POST',
        body: JSON.stringify({
          // Missing required name
          description: 'Product description',
          price: '15.99',
        }),
      });

      const response = await createProduct(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

    it('should create product successfully', async () => {
      mockGetSession.mockResolvedValue(mockUser);

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

      // Mock database to return empty array for product query
      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as any)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as any);

      const response = await getProduct({} as NextRequest, { params });
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('NOT_FOUND');
    });
  });

  describe('DELETE /api/products/[id]', () => {
    it('should return 401 when user is not authenticated', async () => {
      const params = Promise.resolve({ id: '1' });
      mockGetSession.mockResolvedValue(null);

      const response = await deleteProduct({} as NextRequest, { params });
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('UNAUTHORIZED');
    });

    it('should soft delete product successfully', async () => {
      const params = Promise.resolve({ id: '1' });
      mockGetSession.mockResolvedValue(mockUser);

      const response = await deleteProduct({} as NextRequest, { params });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
    });
  });
});
