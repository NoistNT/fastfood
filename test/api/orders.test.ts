import type { UserWithRoles } from '@/types/auth';

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock dependencies before imports
vi.mock('@/lib/auth/session');
vi.mock('@/modules/orders/create-order');
vi.mock('@/lib/inventory-management');
vi.mock('@/lib/api-response');
vi.mock('@/db/drizzle', () => ({
  db: {
    query: {
      users: {
        findFirst: vi.fn(),
      },
    },
  },
}));

import { POST } from '@/app/api/orders/route';
import { getSession } from '@/lib/auth/session';
import { createOrder } from '@/modules/orders/create-order';
import { deductInventoryForOrder } from '@/lib/inventory-management';
import { apiSuccess, apiError } from '@/lib/api-response';
import { db } from '@/db/drizzle';

const mockGetSession = vi.mocked(getSession);
const mockCreateOrder = vi.mocked(createOrder);
const mockDeductInventory = vi.mocked(deductInventoryForOrder);
const mockApiSuccess = vi.mocked(apiSuccess);
const mockApiError = vi.mocked(apiError);
const mockDbFindFirst = vi.mocked(db.query.users.findFirst);

describe('/api/orders', () => {
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
  });

  describe('POST', () => {
    // Use a valid UUID format for testing
    const validUserId = '550e8400-e29b-41d4-a716-446655440000';

    const mockUser: UserWithRoles = {
      id: validUserId,
      email: 'test@example.com',
      name: 'Test User',
      passwordHash: 'hashed-password',
      phoneNumber: null,
      lastLoginAt: null,
      deletedAt: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      roles: [{ id: 1, name: 'customer', description: 'Customer role' }],
    };

    it('should return 401 when user is not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ productId: 1, quantity: 2 }],
          total: '15.99',
        }),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('UNAUTHORIZED');
      expect(result.error.message).toBe('Authentication required');
    });

    it('should validate order schema - empty items array', async () => {
      mockGetSession.mockResolvedValue(mockUser);
      // Mock the database user lookup
      mockDbFindFirst.mockResolvedValue(mockUser);

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: [],
          total: '15.99',
        }),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });

    it('should accept and ignore malformed legacy totals', async () => {
      mockGetSession.mockResolvedValue(mockUser);
      // Mock the database user lookup
      mockDbFindFirst.mockResolvedValue(mockUser);
      mockCreateOrder.mockResolvedValue({
        id: 'order-125',
        userId: validUserId,
        total: '21.00',
        status: 'PENDING' as const,
      });
      mockDeductInventory.mockResolvedValue({ shortfalls: [] });

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ productId: 1, quantity: 2 }],
          total: 'invalid-total',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockCreateOrder).toHaveBeenCalledWith({
        items: [{ productId: 1, quantity: 2 }],
        userId: validUserId,
      });
    });

    it('should create order successfully with valid data', async () => {
      const mockOrderResult = {
        id: 'order-123',
        userId: validUserId,
        total: '15.99',
        status: 'PENDING' as const,
      };

      mockGetSession.mockResolvedValue(mockUser);
      mockDbFindFirst.mockResolvedValue(mockUser);
      mockCreateOrder.mockResolvedValue(mockOrderResult);
      mockDeductInventory.mockResolvedValue({ shortfalls: [] });

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ productId: 1, quantity: 2 }],
          total: '15.99',
        }),
      });

      const response = await POST(request);
      const result = await response.json();

      expect(mockCreateOrder).toHaveBeenCalledWith({
        items: [{ productId: 1, quantity: 2 }],
        userId: validUserId,
      });
      expect(mockDeductInventory).toHaveBeenCalledWith('order-123');
      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockOrderResult);
    });

    it('should ignore tampered client totals', async () => {
      mockGetSession.mockResolvedValue(mockUser);
      mockDbFindFirst.mockResolvedValue(mockUser);
      mockCreateOrder.mockResolvedValue({
        id: 'order-124',
        userId: validUserId,
        total: '31.98',
        status: 'PENDING' as const,
      });
      mockDeductInventory.mockResolvedValue({ shortfalls: [] });

      const request = new NextRequest('http://localhost:3000/api/orders', {
        method: 'POST',
        body: JSON.stringify({
          items: [{ productId: 1, quantity: 2 }],
          total: '0.01',
        }),
      });

      const response = await POST(request);

      expect(response.status).toBe(201);
      expect(mockCreateOrder).toHaveBeenCalledTimes(1);
      expect(mockCreateOrder).not.toHaveBeenCalledWith(
        expect.objectContaining({ total: expect.anything() })
      );
    });
  });
});
