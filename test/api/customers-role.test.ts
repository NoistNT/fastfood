// Mock dependencies before imports
vi.mock('@/lib/csrf');
vi.mock('@/lib/api-response');
vi.mock('@/db/drizzle');
vi.mock('next-intl/server');
vi.mock('@/lib/auth/session');

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { getTranslations } from 'next-intl/server';

import { POST as updateCustomerRole } from '@/app/api/customers/[id]/role/route';
import { getCSRFTokenFromRequest, verifyCSRFToken } from '@/lib/csrf';
import { apiSuccess, apiError } from '@/lib/api-response';
import { getSession } from '@/lib/auth/session';
import { db } from '@/db/drizzle';

const mockGetCSRFTokenFromRequest = vi.mocked(getCSRFTokenFromRequest);
const mockVerifyCSRFToken = vi.mocked(verifyCSRFToken);
const mockApiSuccess = vi.mocked(apiSuccess);
const mockApiError = vi.mocked(apiError);
const mockDb = vi.mocked(db);
const mockGetTranslations = vi.mocked(getTranslations);
const mockGetSession = vi.mocked(getSession);

const adminSession = {
  id: 'admin-1',
  name: 'Admin',
  email: 'admin@example.com',
  roles: [{ id: 1, name: 'admin', description: 'Administrator' }],
} as any;

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

    // Mock admin session
    mockGetSession.mockResolvedValue(adminSession);

    // Mock translations
    mockGetTranslations.mockResolvedValue(vi.fn((key: string) => key) as any);

    // Mock database
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([{ id: 2, name: 'admin' }]),
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
    it('should update role successfully', async () => {
      const params = Promise.resolve({ id: 'user-123' });
      const request = new NextRequest('http://localhost:3000/api/customers/user-123/role', {
        method: 'POST',
        body: JSON.stringify({ roleName: 'admin' }),
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
        body: JSON.stringify({ roleName: 'admin' }),
      });

      const response = await updateCustomerRole(request, { params });
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('CSRF_INVALID');
    });

    it('should return 401 without a session', async () => {
      mockGetSession.mockResolvedValueOnce(null);

      const params = Promise.resolve({ id: 'user-123' });
      const request = new NextRequest('http://localhost:3000/api/customers/user-123/role', {
        method: 'POST',
        body: JSON.stringify({ roleName: 'admin' }),
      });

      const response = await updateCustomerRole(request, { params });

      expect(response.status).toBe(401);
    });

    it('should return 403 for non-admin sessions', async () => {
      mockGetSession.mockResolvedValueOnce({
        id: 'user-456',
        roles: [],
      } as any);

      const params = Promise.resolve({ id: 'user-123' });
      const request = new NextRequest('http://localhost:3000/api/customers/user-123/role', {
        method: 'POST',
        body: JSON.stringify({ roleName: 'admin' }),
      });

      const response = await updateCustomerRole(request, { params });
      const result = await response.json();

      expect(response.status).toBe(403);
      expect(result.error.code).toBe('FORBIDDEN');
    });

    it('should return 400 for invalid payload shape', async () => {
      const params = Promise.resolve({ id: 'user-123' });
      const request = new NextRequest('http://localhost:3000/api/customers/user-123/role', {
        method: 'POST',
        body: JSON.stringify({ roleName: 0 }),
      });

      const response = await updateCustomerRole(request, { params });
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('INVALID_INPUT');
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

    it('should clear all roles when roleName is absent', async () => {
      const params = Promise.resolve({ id: 'user-123' });
      const request = new NextRequest('http://localhost:3000/api/customers/user-123/role', {
        method: 'POST',
        body: JSON.stringify({}), // No roleName — revoke to civilian
      });

      const response = await updateCustomerRole(request, { params });
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(mockDb.delete).toHaveBeenCalled();
    });
  });
});
