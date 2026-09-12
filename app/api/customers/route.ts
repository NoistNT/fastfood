import { z } from 'zod';

import { apiError, apiSuccess, ERROR_CODES } from '@/lib/api-response';
import { requireAdmin } from '@/lib/auth/guards';
import { getCSRFTokenFromRequest, verifyCSRFToken } from '@/lib/csrf';
import { errorMessage, logError } from '@/lib/log-error';
import { findOrCreatePerson } from '@/modules/users/persons';

const createPersonSchema = z.object({
  name: z.string().trim().min(1).max(120),
  phoneNumber: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().max(40).optional()
  ),
  email: z.preprocess(
    (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
    z.string().trim().email().max(120).optional()
  ),
});

/**
 * POST /api/customers — manually adds a person to the directory.
 * Reuses the shared dedupe service so console-created people converge with
 * intake/checkout identities instead of duplicating them. ADMIN only.
 */
export async function POST(request: Request) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) {
      return apiError(
        guard.reason === 'forbidden' ? ERROR_CODES.FORBIDDEN : ERROR_CODES.UNAUTHORIZED,
        guard.reason === 'forbidden' ? 'Forbidden' : 'Authentication required',
        { status: guard.reason === 'forbidden' ? 403 : 401 }
      );
    }

    const csrfToken = await getCSRFTokenFromRequest(request);
    if (!csrfToken || !(await verifyCSRFToken(csrfToken))) {
      return apiError(ERROR_CODES.CSRF_INVALID, 'Invalid CSRF token', { status: 403 });
    }

    const body = await request.json();
    const input = createPersonSchema.parse(body);
    const person = await findOrCreatePerson({
      name: input.name,
      phoneNumber: input.phoneNumber ?? null,
      email: input.email ?? null,
    });

    return apiSuccess({ person }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(ERROR_CODES.VALIDATION_ERROR, error.issues[0].message, { status: 400 });
    }
    logError('customers', 'Person creation failed', { cause: errorMessage(error) });
    return apiError(ERROR_CODES.INTERNAL_ERROR, 'Failed to create person', { status: 500 });
  }
}
