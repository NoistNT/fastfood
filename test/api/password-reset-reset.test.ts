// Mock dependencies before imports
vi.mock('@/lib/auth/password');
vi.mock('@/lib/api-response');
vi.mock('@/db/drizzle');

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

import { POST as resetPassword } from '@/app/api/auth/password-reset/reset/route';
import { hashPassword } from '@/lib/auth/password';
import { apiSuccess, apiError } from '@/lib/api-response';
import { db } from '@/db/drizzle';

const mockHashPassword = vi.mocked(hashPassword);
const mockApiSuccess = vi.mocked(apiSuccess);
const mockApiError = vi.mocked(apiError);
const mockDb = vi.mocked(db);

describe('/api/auth/password-reset/reset', () => {
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

    // Mock password hashing
    mockHashPassword.mockResolvedValue('hashed-password');

    // Mock database
    (mockDb.query as any) = {
      passwordResetTokens: {
        findFirst: vi.fn().mockResolvedValue(null), // No token by default
      },
    };

    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    } as any);

    mockDb.delete.mockReturnValue({
      where: vi.fn().mockResolvedValue(undefined),
    } as any);
  });

  describe('POST /api/auth/password-reset/reset', () => {
    it('should reset password successfully', async () => {
      const mockToken = {
        id: 'token-1',
        userId: 'user-1',
        token: 'valid-token',
        expiresAt: new Date(Date.now() + 3600000),
      };

      (mockDb.query.passwordResetTokens.findFirst as any).mockResolvedValue(mockToken);

      const request = new NextRequest('http://localhost:3000/api/auth/password-reset/reset', {
        method: 'POST',
        body: JSON.stringify({
          token: 'valid-token',
          password: 'NewPassword123',
          confirmPassword: 'NewPassword123',
        }),
      });

      const response = await resetPassword(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.message).toBe('Password has been reset successfully.');
      expect(mockHashPassword).toHaveBeenCalledWith('NewPassword123');
    });

    it('should return 400 for invalid token', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/password-reset/reset', {
        method: 'POST',
        body: JSON.stringify({
          token: 'invalid-token',
          password: 'NewPassword123',
          confirmPassword: 'NewPassword123',
        }),
      });

      const response = await resetPassword(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toBe('Invalid or expired token');
    });

    it('should validate password requirements', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/password-reset/reset', {
        method: 'POST',
        body: JSON.stringify({
          token: 'valid-token',
          password: 'weak',
          confirmPassword: 'weak',
        }),
      });

      const response = await resetPassword(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
