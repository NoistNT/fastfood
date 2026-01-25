// Mock dependencies
vi.mock('@/lib/csrf', () => ({
  generateCSRFToken: vi.fn(),
}));

vi.mock('@/lib/api-response', () => ({
  apiSuccess: vi.fn(),
  apiError: vi.fn(),
  ERROR_CODES: {
    UNAUTHORIZED: 'UNAUTHORIZED',
  },
}));

// Import after mocks
import { describe, expect, it, vi, beforeEach } from 'vitest';
import { NextResponse } from 'next/server';

import { generateCSRFToken } from '@/lib/csrf';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';
import { GET as csrfHandler } from '@/app/api/csrf/route';

describe('/api/csrf', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns CSRF token on successful generation', async () => {
    const mockToken = 'csrf-token-123';
    vi.mocked(generateCSRFToken).mockResolvedValue(mockToken);
    vi.mocked(apiSuccess).mockReturnValue(
      NextResponse.json({ success: true, data: { csrf_token: mockToken } })
    );

    await csrfHandler();

    expect(generateCSRFToken).toHaveBeenCalledTimes(1);
    expect(apiSuccess).toHaveBeenCalledWith({ csrf_token: mockToken });
    expect(apiSuccess).toHaveBeenCalledTimes(1);
  });

  it('returns 401 error when CSRF token generation fails', async () => {
    const error = new Error('User not authenticated');
    (generateCSRFToken as any).mockRejectedValue(error);
    (apiError as any).mockReturnValue({
      success: false,
      error: { code: ERROR_CODES.UNAUTHORIZED, message: 'Authentication required' },
      status: 401,
    });

    await csrfHandler();

    expect(generateCSRFToken).toHaveBeenCalledTimes(1);
    expect(apiError).toHaveBeenCalledWith(ERROR_CODES.UNAUTHORIZED, 'Authentication required', {
      status: 401,
    });
    expect(apiError).toHaveBeenCalledTimes(1);
  });

  it('handles unexpected errors gracefully', async () => {
    const error = new Error('Unexpected error');
    (generateCSRFToken as any).mockRejectedValue(error);
    (apiError as any).mockReturnValue({
      success: false,
      error: { code: ERROR_CODES.UNAUTHORIZED, message: 'Authentication required' },
      status: 401,
    });

    await csrfHandler();

    expect(generateCSRFToken).toHaveBeenCalledTimes(1);
    expect(apiError).toHaveBeenCalledWith(ERROR_CODES.UNAUTHORIZED, 'Authentication required', {
      status: 401,
    });
  });

  it('returns 401 error when CSRF token generation fails', async () => {
    const error = new Error('User not authenticated');
    (generateCSRFToken as any).mockRejectedValue(error);
    (apiError as any).mockReturnValue({
      success: false,
      error: { code: ERROR_CODES.UNAUTHORIZED, message: 'Authentication required' },
      status: 401,
    });

    const response = await csrfHandler();

    expect(generateCSRFToken).toHaveBeenCalledTimes(1);
    expect(apiError).toHaveBeenCalledWith(ERROR_CODES.UNAUTHORIZED, 'Authentication required', {
      status: 401,
    });
    expect(apiError).toHaveBeenCalledTimes(1);
    expect(response).toBeDefined();
  });

  it('handles unexpected errors gracefully', async () => {
    const error = new Error('Unexpected error');
    (generateCSRFToken as any).mockRejectedValue(error);
    (apiError as any).mockReturnValue({
      success: false,
      error: { code: ERROR_CODES.UNAUTHORIZED, message: 'Authentication required' },
      status: 401,
    });

    const response = await csrfHandler();

    expect(generateCSRFToken).toHaveBeenCalledTimes(1);
    expect(apiError).toHaveBeenCalledWith(ERROR_CODES.UNAUTHORIZED, 'Authentication required', {
      status: 401,
    });
    expect(response).toBeDefined();
  });

  it('returns 401 error when CSRF token generation fails', async () => {
    const error = new Error('User not authenticated');
    (generateCSRFToken as any).mockRejectedValue(error);
    (apiError as any).mockReturnValue({
      success: false,
      error: { code: ERROR_CODES.UNAUTHORIZED, message: 'Authentication required' },
      status: 401,
    });

    await csrfHandler();

    expect(generateCSRFToken).toHaveBeenCalledTimes(1);
    expect(apiError).toHaveBeenCalledWith(ERROR_CODES.UNAUTHORIZED, 'Authentication required', {
      status: 401,
    });
    expect(apiError).toHaveBeenCalledTimes(1);
  });

  it('handles unexpected errors gracefully', async () => {
    const error = new Error('Unexpected error');
    (generateCSRFToken as any).mockRejectedValue(error);
    (apiError as any).mockReturnValue({
      success: false,
      error: { code: ERROR_CODES.UNAUTHORIZED, message: 'Authentication required' },
      status: 401,
    });

    await csrfHandler();

    expect(generateCSRFToken).toHaveBeenCalledTimes(1);
    expect(apiError).toHaveBeenCalledWith(ERROR_CODES.UNAUTHORIZED, 'Authentication required', {
      status: 401,
    });
  });
});
