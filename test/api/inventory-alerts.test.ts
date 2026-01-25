// Mock dependencies before imports
vi.mock('@/lib/auth/session');
vi.mock('@/lib/api-response');
vi.mock('@/db/drizzle');

import type { UserWithRoles } from '@/types/auth';

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

import { GET as getAlerts, POST as resolveAlert } from '@/app/api/inventory/alerts/route';
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

describe('/api/inventory/alerts', () => {
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
          innerJoin: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              orderBy: vi.fn().mockResolvedValue([]),
            }),
          }),
        }),
      }),
    } as any);

    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({ rowCount: 1 }),
      }),
    } as any);
  });

  describe('GET /api/inventory/alerts', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      const response = await getAlerts();
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('UNAUTHORIZED');
    });

    it('should return active alerts successfully', async () => {
      const mockAlerts = [
        {
          id: 'alert-1',
          inventoryId: 'inv-1',
          ingredientName: 'Tomato Sauce',
          type: 'low_stock',
          message: 'Stock below minimum threshold',
          createdAt: new Date(),
          currentStock: 5,
          minThreshold: 10,
          unit: 'kg',
        },
      ];

      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          innerJoin: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockResolvedValue(mockAlerts),
              }),
            }),
          }),
        }),
      } as any);

      const response = await getAlerts();
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAlerts);
    });
  });

  describe('POST /api/inventory/alerts', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/inventory/alerts', {
        method: 'POST',
        body: JSON.stringify({ alertId: 'alert-1' }),
      });

      const response = await resolveAlert(request);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('UNAUTHORIZED');
    });

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/inventory/alerts', {
        method: 'POST',
        body: JSON.stringify({}),
      });

      const response = await resolveAlert(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

    it('should return 404 for non-existent alert', async () => {
      mockDb.update.mockReturnValue({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue({ rowCount: 0 }), // No rows updated
        }),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/inventory/alerts', {
        method: 'POST',
        body: JSON.stringify({ alertId: 'alert-999' }),
      });

      const response = await resolveAlert(request);
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('NOT_FOUND');
    });

    it('should resolve alert successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/inventory/alerts', {
        method: 'POST',
        body: JSON.stringify({ alertId: 'alert-1' }),
      });

      const response = await resolveAlert(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        alertId: 'alert-1',
        resolved: true,
      });
    });
  });
});
