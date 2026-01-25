// Mock dependencies before imports
vi.mock('@/lib/auth/password');
vi.mock('@/lib/rate-limit', () => ({
  authRateLimit: {
    limit: vi.fn(),
  },
}));
vi.mock('@/lib/sanitize');
vi.mock('@/lib/api-response');
vi.mock('@/db/drizzle');

import type { UserWithRoles } from '@/types/auth';

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

import { POST as register } from '@/app/api/auth/register/route';
import { hashPassword } from '@/lib/auth/password';
import { authRateLimit } from '@/lib/rate-limit';
import { sanitizeInput } from '@/lib/sanitize';
import { apiSuccess, apiError } from '@/lib/api-response';
import { db } from '@/db/drizzle';

const mockHashPassword = vi.mocked(hashPassword);
const mockAuthRateLimit = vi.mocked(authRateLimit);
const mockSanitizeInput = vi.mocked(sanitizeInput);
const mockApiSuccess = vi.mocked(apiSuccess);
const mockApiError = vi.mocked(apiError);
const mockDb = vi.mocked(db);

const mockUser: UserWithRoles = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  email: 'user@example.com',
  name: 'John Doe',
  passwordHash: 'hashed-password',
  phoneNumber: null,
  lastLoginAt: null,
  deletedAt: null,
  createdAt: new Date(),
  updatedAt: new Date(),
  roles: [{ id: 2, name: 'customer', description: 'Customer' }],
};

describe('/api/auth/register', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Set up default mock responses
    mockApiSuccess.mockImplementation(
      (data, options) =>
        ({
          json: () =>
            Promise.resolve({
              success: true,
              data,
              meta: { timestamp: new Date().toISOString() },
            }),
          status: options?.status ?? 200,
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

    // Mock password hashing
    mockHashPassword.mockResolvedValue('hashed-password');

    // Mock database operations
    mockDb.select.mockReturnValue({
      from: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          limit: vi.fn().mockResolvedValue([]), // No existing user by default
        }),
        innerJoin: vi.fn().mockReturnValue({
          where: vi.fn().mockResolvedValue([{ roles: mockUser.roles[0] }]),
        }),
      }),
    } as any);

    mockDb.insert.mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([mockUser]),
      }),
    } as any);
  });

  describe('POST /api/auth/register', () => {
    it('should register user successfully', async () => {
      // Mock database calls in order
      mockDb.select
        .mockReturnValueOnce({
          // Check existing user
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([]), // No existing user
            }),
          }),
        } as any)
        .mockReturnValueOnce({
          // Get customer role
          from: vi.fn().mockReturnValue({
            where: vi.fn().mockReturnValue({
              limit: vi.fn().mockResolvedValue([{ id: 2, name: 'customer' }]),
            }),
          }),
        } as any)
        .mockReturnValueOnce({
          // Get user roles for response
          from: vi.fn().mockReturnValue({
            innerJoin: vi.fn().mockReturnValue({
              where: vi.fn().mockResolvedValue([{ roles: mockUser.roles[0] }]),
            }),
          }),
        } as any);

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'user@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
        }),
      });

      const response = await register(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.data.user).toEqual(mockUser);
    });

    it('should return 400 for email already registered', async () => {
      // Mock existing user check
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([mockUser]), // Existing user
          }),
        }),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Jane Doe',
          email: 'user@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
        }),
      });

      const response = await register(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
      expect(result.error.message).toBe('Email already registered');
    });

    it('should validate required fields', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          // Missing name
          email: 'user@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
        }),
      });

      const response = await register(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
      expect(result.error.code).toBe('VALIDATION_ERROR');
    });
  });
});
