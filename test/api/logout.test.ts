// Mock dependencies before imports
vi.mock('@/lib/auth/session');
vi.mock('@/lib/api-response');

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { POST as logout } from '@/app/api/auth/logout/route';
import { logout as logoutFn } from '@/lib/auth/session';
import { apiSuccess, apiError } from '@/lib/api-response';

const mockLogout = vi.mocked(logoutFn);
const mockApiSuccess = vi.mocked(apiSuccess);
const mockApiError = vi.mocked(apiError);

describe('/api/auth/logout', () => {
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
  });

  describe('POST /api/auth/logout', () => {
    it('should logout successfully', async () => {
      mockLogout.mockResolvedValue(undefined);

      const response = await logout();
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data).toEqual({});
      expect(mockLogout).toHaveBeenCalled();
    });
  });
});
