// Mock dependencies before imports
vi.mock('@/lib/csrf');
vi.mock('@/lib/api-response');
vi.mock('@/db/drizzle');
vi.mock('next-intl/server');

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getTranslations } from 'next-intl/server';

import { POST as updateCustomerRole } from '@/app/api/customers/[id]/role/route';
import { getCSRFTokenFromRequest, verifyCSRFToken } from '@/lib/csrf';
import { apiSuccess, apiError } from '@/lib/api-response';
import { db } from '@/db/drizzle';

const mockGetCSRFTokenFromRequest = vi.mocked(getCSRFTokenFromRequest);
const mockVerifyCSRFToken = vi.mocked(verifyCSRFToken);
const mockApiSuccess = vi.mocked(apiSuccess);
const mockApiError = vi.mocked(apiError);
const mockDb = vi.mocked(db);
const mockGetTranslations = vi.mocked(getTranslations);

describe('/api/customers/[id]/role', () => {
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
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: 2, name: 'customer' }]),
        }),
      }),
    } as any);

    mockDb.delete.mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    } as any);

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    } as any);
  });

  describe('POST /api/customers/[id]/role', () => {
    it('should update customer role successfully', async () => {
      const params = Promise.resolve({ id: 'user-123' });
      const request = new NextRequest('http://localhost:3000/api/customers/user-123/role', {
        method: 'POST',
        body: JSON.stringify({ roleName: 'customer' }),
      });

      const response = await updateCustomerRole(request, { params });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(mockGetCSRFTokenFromRequest).toHaveBeenCalledWith(request);
      expect(mockVerifyCSRFToken).toHaveBeenCalledWith('valid-csrf-token');
    });

    it('should return 403 for invalid CSRF token', async () => {
      mockVerifyCSRFToken.mockResolvedValue(false);

      const params = Promise.resolve({ id: 'user-123' });
      const request = new NextRequest('http://localhost:3000/api/customers/user-123/role', {
        method: 'POST',
        body: JSON.stringify({ roleName: 'customer' }),
      });

      const response = await updateCustomerRole(request, { params });
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('CSRF_INVALID');
    });

    it('should return 400 for invalid role name', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]), // No role found
          }),
        }),
      } as any);

      const params = Promise.resolve({ id: 'user-123' });
      const request = new NextRequest('http://localhost:3000/api/customers/user-123/role', {
        method: 'POST',
        body: JSON.stringify({ roleName: 'invalid-role' }),
      });

      const response = await updateCustomerRole(request, { params });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('INVALID_INPUT');
    });

    it('should validate required fields', async () => {
      const params = Promise.resolve({ id: 'user-123' });
      const request = new NextRequest('http://localhost:3000/api/customers/user-123/role', {
        method: 'POST',
        body: JSON.stringify({}), // Missing roleName
      });

      const response = await updateCustomerRole(request, { params });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('INVALID_INPUT');
    });
  });
});
