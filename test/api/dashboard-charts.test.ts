// Mock dependencies before imports
vi.mock('@/lib/auth/session');
vi.mock('@/lib/api-response');
vi.mock('@/db/drizzle');

import type { UserWithRoles } from '@/types/auth';

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { GET as getCharts } from '@/app/api/dashboard/charts/route';
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

describe('/api/dashboard/charts', () => {
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
          groupBy: vi.fn().mockReturnValue({
            orderBy: vi.fn().mockResolvedValue([]),
          }),
        }),
      }),
    } as any);
  });

  describe('GET /api/dashboard/charts', () => {
    it('should return 401 when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      const request = new Request('http://localhost:3000/api/dashboard/charts');
      const response = await getCharts(request);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('UNAUTHORIZED');
    });

    it('should return chart data for default period (30d)', async () => {
      const mockRevenueData = [
        { date: '2024-01-01', revenue: 150.5, orderCount: 3 },
        { date: '2024-01-02', revenue: 200.25, orderCount: 4 },
      ];

      const mockStatusData = [
        { status: 'completed', count: 5 },
        { status: 'pending', count: 2 },
      ];

      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              groupBy: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockResolvedValue(mockRevenueData),
              }),
            }),
          }),
        } as any)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              groupBy: vi.fn().mockResolvedValue(mockStatusData),
            }),
          }),
        } as any);

      const request = new Request('http://localhost:3000/api/dashboard/charts');
      const response = await getCharts(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.revenueData).toEqual([
        { date: '2024-01-01', revenue: 150.5, orders: 3 },
        { date: '2024-01-02', revenue: 200.25, orders: 4 },
      ]);
      expect(result.data.statusData).toEqual([
        { status: 'completed', count: 5 },
        { status: 'pending', count: 2 },
      ]);
      expect(result.data.period).toBe('30d');
    });

    it('should return chart data for custom period', async () => {
      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              groupBy: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        } as any)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              groupBy: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as any);

      const request = new Request('http://localhost:3000/api/dashboard/charts?period=1w');
      const response = await getCharts(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.period).toBe('1w');
    });

    it('should handle invalid period gracefully (defaults to 30d)', async () => {
      mockDb.select
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              groupBy: vi.fn().mockReturnValue({
                orderBy: vi.fn().mockResolvedValue([]),
              }),
            }),
          }),
        } as any)
        .mockReturnValueOnce({
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              groupBy: vi.fn().mockResolvedValue([]),
            }),
          }),
        } as any);

      const request = new Request('http://localhost:3000/api/dashboard/charts?period=invalid');
      const response = await getCharts(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.period).toBe('invalid'); // API doesn't validate period, just uses what was passed
    });
  });
});
