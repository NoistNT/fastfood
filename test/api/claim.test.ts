import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextRequest, NextResponse } from 'next/server';

// Mock dependencies before imports
vi.mock('@/modules/users/claim-tokens', () => ({
  previewClaim: vi.fn(),
}));
vi.mock('@/lib/rate-limit', () => ({
  sensitiveOperationRateLimit: { limit: vi.fn() },
}));
vi.mock('@/lib/api-response');

import { GET as previewClaimRoute } from '@/app/api/auth/claim/route';
import { previewClaim } from '@/modules/users/claim-tokens';
import { sensitiveOperationRateLimit } from '@/lib/rate-limit';
import { apiSuccess, apiError } from '@/lib/api-response';

const mockPreviewClaim = vi.mocked(previewClaim);
const mockRateLimit = vi.mocked(sensitiveOperationRateLimit.limit);
const mockApiSuccess = vi.mocked(apiSuccess);
const mockApiError = vi.mocked(apiError);

function claimRequest(token: string) {
  return new NextRequest(`http://localhost:3000/api/auth/claim?token=${token}`);
}

describe('GET /api/auth/claim', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockApiSuccess.mockImplementation((data, options) =>
      NextResponse.json(
        {
          success: true,
          data,
          meta: { timestamp: new Date().toISOString() },
        },
        { status: options?.status ?? 200 }
      )
    );
    mockApiError.mockImplementation((code, message, options) =>
      NextResponse.json(
        {
          success: false,
          error: { code, message },
          meta: { timestamp: new Date().toISOString() },
        },
        { status: options?.status ?? 500 }
      )
    );
    mockRateLimit.mockResolvedValue({ success: true, limit: 10, remaining: 9, reset: 0 });
  });

  it('returns 429 when rate limited', async () => {
    mockRateLimit.mockResolvedValue({ success: false, limit: 10, remaining: 0, reset: 0 });

    const response = await previewClaimRoute(claimRequest('f'.repeat(64)));

    expect(response.status).toBe(429);
    expect(mockPreviewClaim).not.toHaveBeenCalled();
  });

  it('returns the person snapshot for a live token', async () => {
    const person = { personId: 'p1', name: 'Ana', email: null, phoneNumber: '54911' };
    mockPreviewClaim.mockResolvedValue(person);

    const response = await previewClaimRoute(claimRequest('f'.repeat(64)));
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.data).toEqual({ person });
    // No credential material may leak through the snapshot.
    expect(result.data.person).not.toHaveProperty('passwordHash');
  });

  it('returns 404 for unknown or expired tokens', async () => {
    mockPreviewClaim.mockResolvedValue(null);

    const response = await previewClaimRoute(claimRequest('f'.repeat(64)));
    const result = await response.json();

    expect(response.status).toBe(404);
    expect(result.error.code).toBe('NOT_FOUND');
  });

  it('returns 500 when the lookup explodes', async () => {
    mockPreviewClaim.mockRejectedValue(new Error('db down'));

    const response = await previewClaimRoute(claimRequest('f'.repeat(64)));
    const result = await response.json();

    expect(response.status).toBe(500);
    expect(result.error.code).toBe('INTERNAL_ERROR');
  });
});
