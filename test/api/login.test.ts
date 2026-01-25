// Mock dependencies before imports
vi.mock('@/lib/auth/session');
vi.mock('@/lib/auth/password');
vi.mock('@/lib/rate-limit', () => ({
  authRateLimit: {
    limit: vi.fn(),
  },
  createUserRateLimiter: vi.fn(),
}));
vi.mock('@/lib/sanitize');
vi.mock('@/lib/api-response');
vi.mock('@/db/drizzle');

import type { UserWithRoles } from '@/types/auth';

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

import { POST as login } from '@/app/api/auth/login/route';
import { login as loginFn } from '@/lib/auth/session';
import { verifyPassword } from '@/lib/auth/password';
import { authRateLimit, createUserRateLimiter } from '@/lib/rate-limit';
import { sanitizeInput } from '@/lib/sanitize';
import { apiSuccess, apiError } from '@/lib/api-response';
import { db } from '@/db/drizzle';

const mockLogin = vi.mocked(loginFn);
const mockVerifyPassword = vi.mocked(verifyPassword);
const mockAuthRateLimit = vi.mocked(authRateLimit);
const mockCreateUserRateLimiter = vi.mocked(createUserRateLimiter);
const mockSanitizeInput = vi.mocked(sanitizeInput);
const mockApiSuccess = vi.mocked(apiSuccess);
const mockApiError = vi.mocked(apiError);
const mockDb = vi.mocked(db);

const mockUser: UserWithRoles = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'admin@example.com',
  name: 'Admin User',
  passwordHash: 'hashed-password',
  phoneNumber: null,
  lastLoginAt: null,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  roles: [{ id: 1, name: 'admin', description: 'Administrator' }],
};

describe('/api/auth/login', () => {
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
    mockAuthRateLimit.limit.mockResolvedValue({
      success: true,
      limit: 5,
      remaining: 4,
      reset: Date.now() + 600000,
      pending: Promise.resolve(),
    });
    mockCreateUserRateLimiter.mockReturnValue({
      limit: vi.fn().mockResolvedValue({
        success: true,
        limit: 5,
        remaining: 4,
        reset: Date.now() + 600000,
        pending: Promise.resolve(),
      }),
    } as any);

    // Mock database operations
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([mockUser]),
        }),
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ roles: mockUser.roles[0] }]),
        }),
      }),
    } as any);

    mockDb.update.mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue(undefined),
      }),
    } as any);
  });

  describe('POST /api/auth/login', () => {
    it('should return 401 for invalid email', async () => {
      mockDb.select.mockReturnValue({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]), // No user found
          }),
        }),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'invalid@example.com',
          password: 'password123',
        }),
      });

      const response = await login(request);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('UNAUTHORIZED');
    });

    it('should return 401 for invalid password', async () => {
      mockVerifyPassword.mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'wrongpassword',
        }),
      });

      const response = await login(request);
      const result = await response.json();

      expect(response.status).toBe(401);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('UNAUTHORIZED');
    });

    it('should login successfully', async () => {
      mockVerifyPassword.mockResolvedValue(true);
      mockLogin.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'password123',
        }),
      });

      const response = await login(request);
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.user).toEqual(mockUser);
      expect(mockLogin).toHaveBeenCalledWith(mockUser);
    });

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({
          // Missing password
          email: 'admin@example.com',
        }),
      });

      const response = await login(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
