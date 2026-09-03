import type { UserWithRoles } from '@/types/auth';

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock dependencies before imports
vi.mock('next-intl/server', () => ({
  getTranslations: vi.fn(async () => (key: string) => key),
}));
vi.mock('@/lib/auth/session');
vi.mock('@/modules/orders/create-order');
vi.mock('@/lib/inventory-management');
vi.mock('@/modules/users/persons');
vi.mock('@/lib/rate-limit', () => ({
  sensitiveOperationRateLimit: { limit: vi.fn() },
}));
vi.mock('@/lib/api-response');

import { POST } from '@/app/api/orders/route';
import { getSession } from '@/lib/auth/session';
import { createOrder } from '@/modules/orders/create-order';
import { deductInventoryForOrder } from '@/lib/inventory-management';
import { findOrCreatePerson } from '@/modules/users/persons';
import { sensitiveOperationRateLimit } from '@/lib/rate-limit';
import { apiSuccess, apiError } from '@/lib/api-response';

const mockGetSession = vi.mocked(getSession);
const mockCreateOrder = vi.mocked(createOrder);
const mockDeductInventory = vi.mocked(deductInventoryForOrder);
const mockFindOrCreatePerson = vi.mocked(findOrCreatePerson);
const mockRateLimit = vi.mocked(sensitiveOperationRateLimit.limit);
const mockApiSuccess = vi.mocked(apiSuccess);
const mockApiError = vi.mocked(apiError);

const guestPerson = {
  fullName: 'Ana Guest',
  phoneNumber: '+54 9 11 2345-6789',
  email: 'ana@example.com',
};

function orderBody(overrides: Record<string, unknown> = {}) {
  return {
    items: [{ productId: 1, quantity: 2 }],
    person: guestPerson,
    ...overrides,
  };
}

function postRequest(body: unknown) {
  return new NextRequest('http://localhost:3000/api/orders', {
    method: 'POST',
    body: JSON.stringify(body),
  });
}

describe('/api/orders', () => {
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
    mockRateLimit.mockResolvedValue({
      success: true,
      limit: 10,
      remaining: 9,
      reset: Date.now() + 3_600_000,
    });
    mockDeductInventory.mockResolvedValue({ shortfalls: [] });
    mockGetSession.mockResolvedValue(null);
    mockFindOrCreatePerson.mockResolvedValue({
      id: '550e8400-e29b-41d4-a716-446655440001',
      name: guestPerson.fullName,
      email: guestPerson.email ?? null,
      phoneNumber: null,
      hasCredentials: false,
    });
    mockCreateOrder.mockResolvedValue({
      id: 'order-123',
      userId: '550e8400-e29b-41d4-a716-446655440001',
      total: '15.99',
      status: 'PENDING' as const,
      orderType: 'pickup' as const,
    });
  });

  describe('POST', () => {
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

    it('returns 401-shaped rate-limit rejection when the IP is throttled', async () => {
      mockRateLimit.mockResolvedValue({
        success: false,
        limit: 10,
        remaining: 0,
        reset: Date.now() + 3_600_000,
      });

      const response = await POST(postRequest(orderBody()));

      expect(response.status).toBe(429);
      expect(mockFindOrCreatePerson).not.toHaveBeenCalled();
    });

    it('validates the payload - empty items array', async () => {
      const response = await POST(postRequest(orderBody({ items: [] })));

      expect(response.status).toBe(400);
      expect((await response.json()).error.code).toBe('VALIDATION_ERROR');
    });

    it('validates the payload - missing contact details', async () => {
      const response = await POST(
        postRequest(orderBody({ person: { fullName: '', phoneNumber: '' } }))
      );

      expect(response.status).toBe(400);
      expect((await response.json()).error.code).toBe('VALIDATION_ERROR');
    });

    it('rejects delivery orders without an address', async () => {
      const response = await POST(
        postRequest(orderBody({ orderType: 'delivery', deliveryAddress: undefined }))
      );

      expect(response.status).toBe(400);
      expect((await response.json()).error.code).toBe('VALIDATION_ERROR');
    });

    it('creates a guest order through the shared dedupe service', async () => {
      mockCreateOrder.mockResolvedValue({
        id: 'order-123',
        userId: '550e8400-e29b-41d4-a716-446655440001',
        total: '15.99',
        status: 'PENDING' as const,
        orderType: 'pickup' as const,
      });

      const response = await POST(postRequest(orderBody()));
      const result = await response.json();

      expect(mockFindOrCreatePerson).toHaveBeenCalledWith({
        name: guestPerson.fullName,
        phoneNumber: guestPerson.phoneNumber,
        email: guestPerson.email,
      });
      expect(mockCreateOrder).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: '550e8400-e29b-41d4-a716-446655440001',
          contactName: guestPerson.fullName,
          contactPhone: guestPerson.phoneNumber,
        })
      );
      expect(mockDeductInventory).toHaveBeenCalledWith('order-123');
      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
    });

    it('keeps the session identity for signed-in buyers without dedupe', async () => {
      mockGetSession.mockResolvedValue(mockUser);

      const response = await POST(postRequest(orderBody()));

      expect(response.status).toBe(201);
      expect(mockFindOrCreatePerson).not.toHaveBeenCalled();
      expect(mockCreateOrder).toHaveBeenCalledWith(
        expect.objectContaining({ userId: validUserId })
      );
    });

    it('ignores tampered client totals', async () => {
      const response = await POST(postRequest(orderBody({ total: '0.01' })));

      expect(response.status).toBe(201);
      expect(mockCreateOrder).toHaveBeenCalledTimes(1);
      expect(mockCreateOrder).not.toHaveBeenCalledWith(
        expect.objectContaining({ total: expect.anything() })
      );
    });

    it('accepts and ignores malformed legacy totals', async () => {
      const response = await POST(postRequest(orderBody({ total: 'invalid-total' })));

      expect(response.status).toBe(201);
      expect(mockCreateOrder).toHaveBeenCalledTimes(1);
    });
  });
});
