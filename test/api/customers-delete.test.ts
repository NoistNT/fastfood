// Mock dependencies before imports
vi.mock('@/lib/csrf');
vi.mock('@/lib/api-response');
vi.mock('@/db/drizzle');
vi.mock('next-intl/server');

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getTranslations } from 'next-intl/server';

import { POST as deleteCustomer } from '@/app/api/customers/[id]/delete/route';
import { getCSRFTokenFromRequest, verifyCSRFToken } from '@/lib/csrf';
import { apiSuccess, apiError } from '@/lib/api-response';
import { db } from '@/db/drizzle';

const mockGetCSRFTokenFromRequest = vi.mocked(getCSRFTokenFromRequest);
const mockVerifyCSRFToken = vi.mocked(verifyCSRFToken);
const mockApiSuccess = vi.mocked(apiSuccess);
const mockApiError = vi.mocked(apiError);
const mockDb = vi.mocked(db);
const mockGetTranslations = vi.mocked(getTranslations);

describe('/api/customers/[id]/delete', () => {
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

    // Mock CSRF
    mockGetCSRFTokenFromRequest.mockResolvedValue('valid-csrf-token');
    mockVerifyCSRFToken.mockResolvedValue(true);

    // Mock translations
    mockGetTranslations.mockResolvedValue(vi.fn((key: string) => key) as any);

    // Mock database
    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue({ rowCount: 1 }),
      }),
    } as any);
  });

  describe('POST /api/customers/[id]/delete', () => {
    it('should soft delete customer successfully', async () => {
      const params = Promise.resolve({ id: 'user-123' });
      const request = new NextRequest('http://localhost:3000/api/customers/user-123/delete', {
        method: 'POST',
      });

      const response = await deleteCustomer(request, { params });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(mockGetCSRFTokenFromRequest).toHaveBeenCalledWith(request);
      expect(mockVerifyCSRFToken).toHaveBeenCalledWith('valid-csrf-token');
    });

    it('should return 403 for invalid CSRF token', async () => {
      mockVerifyCSRFToken.mockResolvedValue(false);

      const params = Promise.resolve({ id: 'user-123' });
      const request = new NextRequest('http://localhost:3000/api/customers/user-123/delete', {
        method: 'POST',
      });

      const response = await deleteCustomer(request, { params });
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('CSRF_INVALID');
    });

    it('should return 403 when CSRF token is missing', async () => {
      mockGetCSRFTokenFromRequest.mockResolvedValue(null);

      const params = Promise.resolve({ id: 'user-123' });
      const request = new NextRequest('http://localhost:3000/api/customers/user-123/delete', {
        method: 'POST',
      });

      const response = await deleteCustomer(request, { params });
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('CSRF_INVALID');
    });
  });
});
