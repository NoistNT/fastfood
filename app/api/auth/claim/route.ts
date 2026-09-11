import type { NextRequest } from 'next/server';

import { z, ZodError } from 'zod';

import { apiError, apiSuccess, ERROR_CODES } from '@/lib/api-response';
import { errorMessage, logError } from '@/lib/log-error';
import { sensitiveOperationRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/request-ip';
import { previewClaim } from '@/modules/users/claim-tokens';

const claimQuerySchema = z.object({
  token: z.string().regex(/^[0-9a-f]{64}$/, 'Invalid claim link'),
});

/**
 * GET /api/auth/claim?token= — resolves a guest claim token to a
 * client-safe person snapshot for register prefill. Public by design: the
 * opaque token itself is the credential (256-bit, single-use, 15-min TTL,
 * hash-only at rest). Unknown, expired, or consumed tokens all answer 404
 * so callers cannot distinguish failure modes.
 */
export async function GET(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { success } = await sensitiveOperationRateLimit.limit(ip);
    if (!success) {
      return apiError(ERROR_CODES.RATE_LIMIT_EXCEEDED, 'Too many attempts. Try again later.', {
        status: 429,
      });
    }

    const { token } = claimQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const preview = await previewClaim(token);
    if (!preview) {
      return apiError(ERROR_CODES.NOT_FOUND, 'Claim link is invalid or expired', { status: 404 });
    }

    return apiSuccess({ person: preview });
  } catch (error) {
    if (error instanceof ZodError) {
      return apiError(ERROR_CODES.VALIDATION_ERROR, error.issues[0].message, { status: 400 });
    }
    logError('auth', 'Claim preview failed', { cause: errorMessage(error) });
    return apiError(ERROR_CODES.INTERNAL_ERROR, 'Failed to resolve claim link', { status: 500 });
  }
}
