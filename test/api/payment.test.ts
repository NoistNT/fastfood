// Mock dependencies before imports
vi.mock('@/lib/csrf');
vi.mock('@/lib/circuit-breaker');
vi.mock('@/lib/api-response');
vi.mock('@/lib/rate-limit', () => ({
  sensitiveOperationRateLimit: { limit: vi.fn() },
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

const mockGetCSRFTokenFromRequest = vi.mocked(getCSRFTokenFromRequest);
const mockVerifyCSRFToken = vi.mocked(verifyCSRFToken);
const mockPaymentCircuitBreaker = vi.mocked(paymentCircuitBreaker);
const mockApiError = vi.mocked(apiError);

const limitMock = sensitiveOperationRateLimit.limit as unknown as Mock;
const preferenceCreateMock = new Preference({} as never).create as unknown as Mock;

function jsonError(code: string, message: string, status = 500) {
  return NextResponse.json(
    { success: false, error: { code, message }, meta: { timestamp: new Date().toISOString() } },
    { status }
  );
}

function paymentRequest(
  body: Record<string, unknown> = { title: 'Burger', price: 9.99, quantity: 2 }
) {
  return new Request('http://localhost:3000/api/payment', {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(body),
  });
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

    it('should create a payment preference successfully', async () => {
      const response = await createPayment(paymentRequest());

      expect(response.status).toBe(200);
      const result = await response.json();
      expect(result).toEqual({ id: 'mp-preference-123', init_point: 'https://mp' });
      expect(mockVerifyCSRFToken).toHaveBeenCalledWith('valid-csrf-token');
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
