// Mock dependencies before imports
vi.mock('@/lib/auth/session');
vi.mock('@/lib/api-response');

import type { UserWithRoles } from '@/types/auth';

import { describe, expect, it, vi, beforeEach } from 'vitest';

import { GET as getSession } from '@/app/api/auth/session/route';
import { getSession as getSessionFn } from '@/lib/auth/session';
import { apiSuccess } from '@/lib/api-response';

const mockGetSession = vi.mocked(getSessionFn);
const mockApiSuccess = vi.mocked(apiSuccess);

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

describe('/api/auth/session', () => {
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
  });

  describe('GET /api/auth/session', () => {
    it('should return user session when authenticated', async () => {
      mockGetSession.mockResolvedValue(mockUser);

      const response = await getSession();
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.user).toEqual(mockUser);
    });

    it('should return null user when not authenticated', async () => {
      mockGetSession.mockResolvedValue(null);

      const response = await getSession();
      const result = await response.json();

      expect(response.status).toBe(200);
      expect(result.success).toBe(true);
      expect(result.data.user).toBe(null);
    });
  });
});
