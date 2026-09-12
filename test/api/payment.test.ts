// Mock dependencies before imports
vi.mock('@/lib/csrf');
vi.mock('@/lib/circuit-breaker');
vi.mock('@/lib/api-response');
vi.mock('@/lib/rate-limit', () => ({
  sensitiveOperationRateLimit: { limit: vi.fn() },
}));
vi.mock('@/db/drizzle', () => ({
  db: {
    query: {
      orders: {
        findFirst: vi.fn(),
      },
    },
  },
}));
vi.mock('mercadopago', () => {
  class MercadoPagoConfig {
    constructor(_options: unknown) {}
  }
  const create = vi.fn();
  class Preference {
    create = create;
  }
  return { MercadoPagoConfig, Preference };
});

import type { Mock } from 'vitest';

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';
import { Preference } from 'mercadopago';

import { POST as createPayment } from '@/app/api/payment/route';
import { getCSRFTokenFromRequest, verifyCSRFToken } from '@/lib/csrf';
import { sensitiveOperationRateLimit } from '@/lib/rate-limit';
import { paymentCircuitBreaker } from '@/lib/circuit-breaker';
import { apiError, ERROR_CODES } from '@/lib/api-response';
import { db } from '@/db/drizzle';
import { ORDER_STATUS } from '@/modules/orders/types';

const mockGetCSRFTokenFromRequest = vi.mocked(getCSRFTokenFromRequest);
const mockVerifyCSRFToken = vi.mocked(verifyCSRFToken);
const mockPaymentCircuitBreaker = vi.mocked(paymentCircuitBreaker);
const mockApiError = vi.mocked(apiError);

const limitMock = sensitiveOperationRateLimit.limit as unknown as Mock;
const preferenceCreateMock = new Preference({} as never).create as unknown as Mock;
const mockFindOrder = vi.mocked(db.query.orders.findFirst);

const ORDER_ID = '550e8400-e29b-41d4-a716-446655440000';

function jsonError(code: string, message: string, status = 500) {
  return NextResponse.json(
    { success: false, error: { code, message }, meta: { timestamp: new Date().toISOString() } },
    { status }
  );
}

function paymentRequest(body: Record<string, unknown> = { orderId: ORDER_ID }) {
  return new Request('http://localhost:3000/api/payment', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
}

function pendingOrder(overrides: Record<string, unknown> = {}) {
  return {
    id: ORDER_ID,
    userId: '550e8400-e29b-41d4-a716-446655440001',
    total: '31.98',
    status: ORDER_STATUS.PENDING,
    orderType: 'pickup' as const,
    paymentMethod: 'online' as const,
    contactName: 'Ana Guest',
    contactPhone: '+54 9 11 2345-6789',
    deliveryAddress: '',
    deliveryNotes: '',
    trackingCode: 'FF-ABC23456',
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

describe('/api/payment', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockApiError.mockImplementation((code, message, options) =>
      jsonError(code, message, options?.status ?? 500)
    );

    limitMock.mockResolvedValue({
      success: true,
      limit: 10,
      remaining: 9,
      reset: 0,
      pending: false,
    });
    mockGetCSRFTokenFromRequest.mockResolvedValue('valid-csrf-token');
    mockVerifyCSRFToken.mockResolvedValue(true);

    mockPaymentCircuitBreaker.execute.mockImplementation(async (fn: () => Promise<unknown>) =>
      fn()
    );

    preferenceCreateMock.mockResolvedValue({
      id: 'mp-preference-123',
      init_point: 'https://mp',
    });

    mockFindOrder.mockResolvedValue(pendingOrder());
  });

  describe('POST /api/payment', () => {
    it('should return 429 when the rate limit is exceeded', async () => {
      limitMock.mockResolvedValue({
        success: false,
        limit: 10,
        remaining: 0,
        reset: 0,
        pending: false,
      });

      const response = await createPayment(paymentRequest());
      const result = await response.json();

      expect(response.status).toBe(429);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('RATE_LIMIT_EXCEEDED');
      expect(mockVerifyCSRFToken).not.toHaveBeenCalled();
    });

    it('should return 403 when the CSRF token is missing', async () => {
      mockGetCSRFTokenFromRequest.mockResolvedValue(null);

      const response = await createPayment(paymentRequest());
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('CSRF_INVALID');
    });

    it('should return 403 when the CSRF token is invalid', async () => {
      mockVerifyCSRFToken.mockResolvedValue(false);

      const response = await createPayment(paymentRequest());
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('CSRF_INVALID');
    });

    it('should return 400 for a malformed order ID', async () => {
      const response = await createPayment(paymentRequest({ orderId: 'not-a-uuid' }));
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(preferenceCreateMock).not.toHaveBeenCalled();
    });

    it('should return 404 for an unknown order', async () => {
      mockFindOrder.mockResolvedValue(undefined);

      const response = await createPayment(paymentRequest());
      const result = await response.json();

      expect(response.status).toBe(404);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('NOT_FOUND');
      expect(preferenceCreateMock).not.toHaveBeenCalled();
    });

    it('should return 409 for a non-pending order', async () => {
      mockFindOrder.mockResolvedValue(pendingOrder({ status: ORDER_STATUS.PROCESSING }));

      const response = await createPayment(paymentRequest());
      const result = await response.json();

      expect(response.status).toBe(409);
      expect(result.success).toBe(false);
      expect(preferenceCreateMock).not.toHaveBeenCalled();
    });

    it('should mint the preference from the stored order total', async () => {
      const response = await createPayment(
        paymentRequest({ orderId: ORDER_ID, price: 0.01, quantity: 99, title: 'Free food' })
      );

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result).toEqual({ id: 'mp-preference-123', init_point: 'https://mp' });
      expect(mockVerifyCSRFToken).toHaveBeenCalledWith('valid-csrf-token');
      expect(preferenceCreateMock).toHaveBeenCalledTimes(1);
      const preference = preferenceCreateMock.mock.calls[0][0].body;
      // Client-supplied amounts are ignored: the stored total rules.
      expect(preference.items).toEqual([
        { id: ORDER_ID, title: 'Order FF-ABC23456', unit_price: 31.98, quantity: 1 },
      ]);
      expect(preference.external_reference).toBe(ORDER_ID);
      expect(preference.metadata).toEqual({ orderId: ORDER_ID });
      expect(mockPaymentCircuitBreaker.execute).toHaveBeenCalled();
    });

    it('should return 500 when the external service fails', async () => {
      preferenceCreateMock.mockRejectedValue(new Error('MP timeout'));

      const response = await createPayment(paymentRequest());
      const result = await response.json();

      expect(response.status).toBe(500);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe(ERROR_CODES.EXTERNAL_SERVICE_ERROR);
    });
  });
});
