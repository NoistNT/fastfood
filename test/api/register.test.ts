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
vi.mock('@/modules/users/claim-tokens', () => ({
  consumeClaimToken: vi.fn(),
}));

import type { UserWithRoles } from '@/types/auth';

import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

import { POST as register } from '@/app/api/auth/register/route';
import { hashPassword } from '@/lib/auth/password';
import { authRateLimit } from '@/lib/rate-limit';
import { sanitizeInput } from '@/lib/sanitize';
import { apiSuccess, apiError } from '@/lib/api-response';
import { db } from '@/db/drizzle';
import { consumeClaimToken } from '@/modules/users/claim-tokens';

const mockHashPassword = vi.mocked(hashPassword);
const mockAuthRateLimit = vi.mocked(authRateLimit);
const mockSanitizeInput = vi.mocked(sanitizeInput);
const mockApiSuccess = vi.mocked(apiSuccess);
const mockApiError = vi.mocked(apiError);
const mockDb = vi.mocked(db);
const mockConsumeClaimToken = vi.mocked(consumeClaimToken);

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
  roles: [],
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
          where: vi.fn().mockResolvedValue([]),
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
      mockDb.select.mockReturnValueOnce({
        // Check existing user
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]), // No existing user
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
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should use legacy match-claim when the token is spent but phone matches', async () => {
      const claimed = {
        ...mockUser,
        email: 'legacy@example.com',
        passwordHash: 'hashed-password',
      };

      mockDb.select.mockReturnValueOnce({
        // Check existing user by email — none owns it
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      mockConsumeClaimToken.mockResolvedValue(null);

      mockDb.update.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([claimed]),
          }),
        }),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Legacy User',
          email: 'legacy@example.com',
          phoneNumber: '+54 9 11 7777 7777',
          password: 'Password123',
          confirmPassword: 'Password123',
          claimToken: 'f'.repeat(64),
        }),
      });

      const response = await register(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.data.user).toEqual(claimed);
      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('should claim a matching record-only person when phone is provided', async () => {
      const recordOnly = {
        ...mockUser,
        email: 'alice.johnson@example.com',
        passwordHash: 'hashed-password', // credentials now attached
      };

      mockDb.select.mockReturnValueOnce({
        // Check existing user by email — none owns it
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      mockDb.update.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([recordOnly]),
          }),
        }),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Alice Johnson',
          email: 'alice.johnson@example.com',
          phoneNumber: '+54 9 11 4444 4444',
          password: 'Password123',
          confirmPassword: 'Password123',
        }),
      });

      const response = await register(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.data.user).toEqual(recordOnly);
      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('should create a new user when no record-only match exists for the phone', async () => {
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      mockDb.update.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([]), // No record-only person matches phone+name
          }),
        }),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'user@example.com',
          phoneNumber: '+54 9 11 9999 9999',
          password: 'Password123',
          confirmPassword: 'Password123',
        }),
      });

      const response = await register(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should adopt the exact guest identity for a live claim token', async () => {
      const adopted = {
        ...mockUser,
        id: '550e8400-e29b-41d4-a716-446655440099',
        email: 'guest@example.com',
        passwordHash: 'hashed-password',
      };

      mockDb.select.mockReturnValueOnce({
        // Check existing user by email — none owns it
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      mockConsumeClaimToken.mockResolvedValue('550e8400-e29b-41d4-a716-446655440099');

      mockDb.select.mockReturnValueOnce({
        // Token person lookup — record-only row with a matching email
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi
              .fn()
              .mockResolvedValue([
                { email: 'guest@example.com', passwordHash: null, deletedAt: null },
              ]),
          }),
        }),
      } as any);

      mockDb.update.mockReturnValueOnce({
        set: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            returning: vi.fn().mockResolvedValue([adopted]),
          }),
        }),
      } as any);

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'Guest Buyer',
          email: 'guest@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
          claimToken: 'f'.repeat(64),
        }),
      });

      const response = await register(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(result.data.user).toEqual(adopted);
      expect(mockConsumeClaimToken).toHaveBeenCalledWith('f'.repeat(64));
      expect(mockDb.insert).not.toHaveBeenCalled();
    });

    it('should fall back to match-claim when the claim token is spent', async () => {
      mockDb.select.mockReturnValueOnce({
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      mockConsumeClaimToken.mockResolvedValue(null);

      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'user@example.com',
          password: 'Password123',
          confirmPassword: 'Password123',
          claimToken: 'f'.repeat(64),
        }),
      });

      const response = await register(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should fall back to match-claim when the token email differs', async () => {
      mockDb.select.mockReturnValueOnce({
        // Check existing user by email — none owns it
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi.fn().mockResolvedValue([]),
          }),
        }),
      } as any);

      mockConsumeClaimToken.mockResolvedValue('550e8400-e29b-41d4-a716-446655440099');

      mockDb.select.mockReturnValueOnce({
        // Token person carries a different email — must not adopt
        from: vi.fn().mockReturnValue({
          where: vi.fn().mockReturnValue({
            limit: vi
              .fn()
              .mockResolvedValue([
                { email: 'other@example.com', passwordHash: null, deletedAt: null },
              ]),
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
          claimToken: 'f'.repeat(64),
        }),
      });

      const response = await register(request);
      const result = await response.json();

      expect(response.status).toBe(201);
      expect(result.success).toBe(true);
      expect(mockDb.insert).toHaveBeenCalled();
    });

    it('should return 400 for an invalid phone number format', async () => {
      const request = new NextRequest('http://localhost:3000/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          name: 'John Doe',
          email: 'user@example.com',
          phoneNumber: 'not-a-phone!!',
          password: 'Password123',
          confirmPassword: 'Password123',
        }),
      });

      const response = await register(request);
      const result = await response.json();

      expect(response.status).toBe(400);
      expect(result.success).toBe(false);
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
