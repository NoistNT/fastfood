import type { NextRequest } from 'next/server';

import { z } from 'zod';
import { and, eq, isNull, ne, sql } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { users } from '@/db/schema';
import { apiError, apiSuccess, ERROR_CODES } from '@/lib/api-response';
import { requireAdmin } from '@/lib/auth/guards';
import { getCSRFTokenFromRequest, verifyCSRFToken } from '@/lib/csrf';
import { isUniqueViolation } from '@/lib/db-errors';
import { errorMessage, logError } from '@/lib/log-error';
import { normalizePhoneNumber } from '@/lib/phone';

const editPersonSchema = z
  .object({
    name: z.string().trim().min(1).max(120).optional(),
    // Explicit blanks clear the field (null); absent keys skip it.
    // Collapsing '' to undefined here would make clearing impossible.
    phoneNumber: z.preprocess(
      (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
      z.string().trim().max(40).optional().nullable()
    ),
    email: z.preprocess(
      (value) => (typeof value === 'string' && value.trim() === '' ? null : value),
      z.string().trim().email().max(120).optional().nullable()
    ),
  })
  .refine(
    (value) =>
      value.name !== undefined || value.phoneNumber !== undefined || value.email !== undefined,
    {
      message: 'At least one field is required',
    }
  );

/**
 * POST /api/customers/[id]/edit — updates a directory person's contact
 * fields. Contact data only: credentials, roles, and deletion keep their
 * own flows. Unique violations (email / phone) answer 400, unknown or
 * deleted persons 404. ADMIN only.
 */
export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params;
    const personId = z.uuid('Invalid person ID').parse(id);
    const body = await request.json();
    const input = editPersonSchema.parse(body);

    const [person] = await db
      .select({ id: users.id })
      .from(users)
      .where(and(eq(users.id, personId), isNull(users.deletedAt)))
      .limit(1);
    if (!person) {
      return apiError(ERROR_CODES.NOT_FOUND, 'Person not found', { status: 404 });
    }

    const normalizedPhone =
      input.phoneNumber === undefined ? undefined : normalizePhoneNumber(input.phoneNumber);
    const normalizedEmail =
      input.email === undefined ? undefined : (input.email?.trim().toLowerCase() ?? null);

    // Pre-check uniqueness excluding self so conflicts answer 400, not 500.
    // Email comparison is case-insensitive: legacy rows may carry mixed
    // case, and Postgres unique is case-sensitive — an exact match would
    // let case-variant duplicates slip through that no matcher converges.
    if (normalizedEmail) {
      const [taken] = await db
        .select({ id: users.id })
        .from(users)
        .where(
          and(
            sql`lower(${users.email}) = ${normalizedEmail}`,
            ne(users.id, personId),
            isNull(users.deletedAt)
          )
        )
        .limit(1);
      if (taken) {
        return apiError(ERROR_CODES.VALIDATION_ERROR, 'Email already in use', { status: 400 });
      }
    }
    if (normalizedPhone) {
      const [taken] = await db
        .select({ id: users.id })
        .from(users)
        .where(
          and(
            eq(users.phoneNumber, normalizedPhone),
            ne(users.id, personId),
            isNull(users.deletedAt)
          )
        )
        .limit(1);
      if (taken) {
        return apiError(ERROR_CODES.VALIDATION_ERROR, 'Phone number already in use', {
          status: 400,
        });
      }
    }

    try {
      const [updated] = await db
        .update(users)
        .set({
          ...(input.name !== undefined ? { name: input.name } : {}),
          ...(normalizedPhone !== undefined ? { phoneNumber: normalizedPhone || null } : {}),
          ...(normalizedEmail !== undefined ? { email: normalizedEmail } : {}),
          updatedAt: new Date(),
        })
        // Re-check liveness in the write itself: a concurrent soft-delete
        // between the lookup above and this statement must not revive output
        // for a deleted person. Empty returning means lost race → 404.
        .where(and(eq(users.id, personId), isNull(users.deletedAt)))
        .returning({
          id: users.id,
          name: users.name,
          email: users.email,
          phoneNumber: users.phoneNumber,
        });
      if (!updated) {
        return apiError(ERROR_CODES.NOT_FOUND, 'Person not found', { status: 404 });
      }
      return apiSuccess({ person: updated });
    } catch (error) {
      // Concurrent write raced the unique indexes after the pre-check.
      if (isUniqueViolation(error)) {
        return apiError(ERROR_CODES.VALIDATION_ERROR, 'Contact details already in use', {
          status: 400,
        });
      }
      throw error;
    }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(ERROR_CODES.VALIDATION_ERROR, error.issues[0].message, { status: 400 });
    }
    logError('customers', 'Person update failed', { cause: errorMessage(error) });
    return apiError(ERROR_CODES.INTERNAL_ERROR, 'Failed to update person', { status: 500 });
  }
}
