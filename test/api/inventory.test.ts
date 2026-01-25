// Mock dependencies before imports
vi.mock('@/lib/auth/session');
vi.mock('@/lib/api-response');
vi.mock('@/db/drizzle');

import type { UserWithRoles } from '@/types/auth';

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

import { GET as getInventory, POST as adjustInventory } from '@/app/api/inventory/route';
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

describe('/api/inventory', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set up default mock responses
    mockApiSuccess.mockImplementation(
      (data) =>
        ({
          json: () =>
            Promise.resolve({
              success: true,
              data,
              meta: { timestamp: new Date().toISOString() },
            }),
          status: 200,
        }) as any
    );

    mockApiError.mockImplementation(
      (code, message, options) =>
        ({
          json: () =>
            Promise.resolve({
              success: false,
              error: { code, message },
              meta: { timestamp: new Date().toISOString() },
            }),
          status: options?.status ?? 500,
        }) as any
    );

    // Mock authentication
    mockGetSession.mockResolvedValue(mockUser);

    // Mock database operations
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        innerJoin: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockResolvedValue([]),
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    } as any);

    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({ rowCount: 1 }),
      }),
    } as any);

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    } as any);
  });

  describe('GET /api/inventory', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      const response = await getInventory();
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('UNAUTHORIZED');
    });

    it('should return inventory items successfully', async () => {
      const mockInventory = [
        {
          id: 'inv-1',
          ingredientId: 1,
          ingredientName: 'Tomato Sauce',
          quantity: 50,
          minThreshold: 10,
          unit: 'kg',
          lastUpdated: new Date(),
        },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue(mockInventory),
          }),
        }),
      } as any);

      const response = await getInventory();
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockInventory);
    });
  });

  describe('POST /api/inventory', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/inventory', {
        method: 'POST',
        body: JSON.stringify({
          inventoryId: 'inv-1',
          quantity: 10,
          type: 'in',
        }),
      });

      const response = await adjustInventory(request);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('UNAUTHORIZED');
    });

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/inventory', {
        method: 'POST',
        body: JSON.stringify({
          // Missing required fields
          quantity: 10,
        }),
      });

      const response = await adjustInventory(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

    it('should validate movement type', async () => {
      const request = new NextRequest('http://localhost:3000/api/inventory', {
        method: 'POST',
        body: JSON.stringify({
          inventoryId: 'inv-1',
          quantity: 10,
          type: 'invalid',
        }),
      });

      const response = await adjustInventory(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toBe('Invalid movement type');
    });

    it('should return 404 for non-existent inventory item', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]), // No inventory item found
          }),
        }),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/inventory', {
        method: 'POST',
        body: JSON.stringify({
          inventoryId: 'inv-999',
          quantity: 10,
          type: 'in',
        }),
      });

      const response = await adjustInventory(request);
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('NOT_FOUND');
    });

    it('should adjust inventory successfully', async () => {
      const currentItem = {
        id: 'inv-1',
        ingredientId: 1,
        quantity: 50,
        minThreshold: 10,
        unit: 'kg',
        lastUpdated: new Date(),
      };

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([currentItem]),
          }),
        }),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/inventory', {
        method: 'POST',
        body: JSON.stringify({
          inventoryId: 'inv-1',
          quantity: 10,
          type: 'in',
          reason: 'Restock',
        }),
      });

      const response = await adjustInventory(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        inventoryId: 'inv-1',
        previousQuantity: 50,
        newQuantity: 60,
        adjustment: 10,
      });
    });
  });
});
