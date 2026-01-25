// Mock dependencies before imports
vi.mock('@/lib/rate-limit', () => ({
  passwordResetRateLimit: {
    limit: vi.fn(),
  },
}));
vi.mock('@/lib/mail');
vi.mock('@/lib/sanitize');
vi.mock('@/lib/api-response');
vi.mock('@/db/drizzle');

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { POST as requestPasswordReset } from '@/app/api/auth/password-reset/request/route';
import { passwordResetRateLimit } from '@/lib/rate-limit';
import { sendPasswordResetEmail } from '@/lib/mail';
import { sanitizeInput } from '@/lib/sanitize';
import { apiSuccess, apiError } from '@/lib/api-response';
import { db } from '@/db/drizzle';

const mockPasswordResetRateLimit = vi.mocked(passwordResetRateLimit);
const mockSendPasswordResetEmail = vi.mocked(sendPasswordResetEmail);
const mockSanitizeInput = vi.mocked(sanitizeInput);
const mockApiSuccess = vi.mocked(apiSuccess);
const mockApiError = vi.mocked(apiError);
const mockDb = vi.mocked(db);

describe('/api/auth/password-reset/request', () => {
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

    // Mock sanitizeInput to return input as is
    mockSanitizeInput.mockImplementation((input) => input);

    // Mock rate limiters
    mockPasswordResetRateLimit.limit.mockResolvedValue({
      success: true,
      limit: 3,
      remaining: 2,
      reset: Date.now() + 3600000,
      pending: Promise.resolve(),
    });

    // Mock database
    mockDb.query = {
      users: {
        findFirst: vi.fn().mockResolvedValue(null), // No user by default
      },
    } as any;

    // Cast to allow mocking
    (mockDb.query.users.findFirst as any).mockResolvedValue(null);

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockResolvedValue(undefined),
    } as any);

    // Mock email sending
    mockSendPasswordResetEmail.mockResolvedValue(undefined);
  });

  describe('POST /api/auth/password-reset/request', () => {
    it('should send reset email for existing user', async () => {
      const mockUser = { id: 'user-1', email: 'user@example.com' };

      (mockDb.query as any).users.findFirst.mockResolvedValue(mockUser);

      const response = await requestPasswordReset(
        new Request('http://localhost:3000/api/auth/password-reset/request', {
          method: 'POST',
          body: JSON.stringify({ email: 'user@example.com' }),
          headers: { 'x-forwarded-for': '127.0.0.1' },
        })
      );
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.message).toBe(
        'If your email is in our system, you will receive a password reset link.'
      );
      expect(mockSendPasswordResetEmail).toHaveBeenCalledWith(
        'user@example.com',
        expect.any(String)
      );
    });

    it('should not send email for non-existent user but still return success', async () => {
      const response = await requestPasswordReset(
        new Request('http://localhost:3000/api/auth/password-reset/request', {
          method: 'POST',
          body: JSON.stringify({ email: 'nonexistent@example.com' }),
          headers: { 'x-forwarded-for': '127.0.0.1' },
        })
      );
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.message).toBe(
        'If your email is in our system, you will receive a password reset link.'
      );
      expect(mockSendPasswordResetEmail).not.toHaveBeenCalled();
    });

    it('should validate email format', async () => {
      const response = await requestPasswordReset(
        new Request('http://localhost:3000/api/auth/password-reset/request', {
          method: 'POST',
          body: JSON.stringify({ email: 'invalid-email' }),
          headers: { 'x-forwarded-for': '127.0.0.1' },
        })
      );
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
