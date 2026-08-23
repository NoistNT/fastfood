import type { NextRequest } from 'next/server';

import { ZodError } from 'zod';
import { z } from 'zod';

import { apiError, apiSuccess, ERROR_CODES } from '@/lib/api-response';
import { requireOperationalRole } from '@/lib/auth/guards';
import { searchPersons } from '@/modules/users/persons';

export const searchQuerySchema = z.object({
  q: z.string().trim().min(2).max(120),
});

/**
 * GET /api/customers/search?q= — operational-role lookup for the intake
 * customer picker. Returns client-safe person records (no credential
 * material), newest matches capped to keep the picker snappy.
 */
export async function GET(request: NextRequest) {
  try {
    const guard = await requireOperationalRole();
    if (!guard.ok) {
      return apiError(
        guard.reason === 'forbidden' ? ERROR_CODES.FORBIDDEN : ERROR_CODES.UNAUTHORIZED,
        guard.reason === 'forbidden' ? 'Forbidden' : 'Authentication required',
        { status: guard.reason === 'forbidden' ? 403 : 401 }
      );
    }

    const { q } = searchQuerySchema.parse(Object.fromEntries(request.nextUrl.searchParams));
    const people = await searchPersons(q);

    return apiSuccess({ people });
  } catch (error) {
    if (error instanceof ZodError) {
      return apiError(ERROR_CODES.VALIDATION_ERROR, error.issues[0].message, { status: 400 });
    }
    console.error('Customer search failed:', error);
    return apiError(ERROR_CODES.INTERNAL_ERROR, 'Failed to search customers', { status: 500 });
  }
}
