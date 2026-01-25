// Mock dependencies before imports
vi.mock('@/lib/auth/session');
vi.mock('@/lib/api-response');
vi.mock('@/db/drizzle');

import type { UserWithRoles } from '@/types/auth';

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { GET as getSummary } from '@/app/api/dashboard/summary/route';
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

describe('/api/dashboard/summary', () => {
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
        where: vi.fn().mockReturnValue({
          orderBy: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    } as any);
  });

  describe('GET /api/dashboard/summary', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      const response = await getSummary();
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('UNAUTHORIZED');
    });

    it('should return dashboard summary successfully', async () => {
      const mockOrderStats = [{ totalOrders: 45, totalRevenue: '1250.50' }];
      const mockCustomerStats = [{ totalCustomers: 23 }];
      const mockProductStats = [{ totalProducts: 12 }];
      const mockRecentOrders = [
        { id: 'order-1', total: '25.99', status: 'completed', createdAt: new Date() },
        { id: 'order-2', total: '15.50', status: 'pending', createdAt: new Date() },
      ];

      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue(mockOrderStats),
        } as any)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue(mockCustomerStats),
          }),
        } as any)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue(mockProductStats),
        } as any)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue(mockRecentOrders),
            }),
          }),
        } as any);

      const response = await getSummary();
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        totalRevenue: 1250.5,
        totalOrders: 45,
        totalCustomers: 23,
        totalProducts: 12,
        recentOrders: [
          {
            id: 'order-1',
            total: 25.99,
            status: 'completed',
            createdAt: mockRecentOrders[0].createdAt,
          },
          {
            id: 'order-2',
            total: 15.5,
            status: 'pending',
            createdAt: mockRecentOrders[1].createdAt,
          },
        ],
      });
    });

    it('should handle empty results gracefully', async () => {
      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue([]),
        } as any)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue([]),
          }),
        } as any)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue([]),
        } as any)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as any);

      const response = await getSummary();
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
        recentOrders: [],
      });
    });
  });
});
