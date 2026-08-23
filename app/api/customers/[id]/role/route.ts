import type { NextRequest } from 'next/server';

import { getTranslations } from 'next-intl/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import { userRoles, roles } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { USER_ROLES } from '@/types/auth';
import { verifyCSRFToken, getCSRFTokenFromRequest } from '@/lib/csrf';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';

// Absent roleName = revoke all roles (person becomes a civilian).
const roleUpdateSchema = z.object({ roleName: z.string().min(1).optional() });

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations('Dashboard.customers');

  try {
    // Authorization first: only administrators mutate roles
    const session = await getSession();
    if (!session) {
      return apiError(ERROR_CODES.UNAUTHORIZED, 'Authentication required', { status: 401 });
    }
    const isAdmin = session.roles.some((role) => role.name === USER_ROLES.ADMIN);
    if (!isAdmin) {
      return apiError(ERROR_CODES.FORBIDDEN, 'Administrator access required', { status: 403 });
    }

    // Verify CSRF token for role update operations
    const csrfToken = await getCSRFTokenFromRequest(request);
    if (!csrfToken || !(await verifyCSRFToken(csrfToken))) {
      return apiError(ERROR_CODES.CSRF_INVALID, 'Invalid CSRF token', { status: 403 });
    }

    const body = await request.json();
    const parsed = roleUpdateSchema.safeParse(body ?? {});
    if (!parsed.success) {
      return apiError(ERROR_CODES.INVALID_INPUT, t('updateFailed'), { status: 400 });
    }
    const roleName = parsed.data.roleName;

    if (!roleName) {
      await db.delete(userRoles).where(eq(userRoles.userId, id));
      return apiSuccess({});
    }

    // Find role
    const roleResult = await db.select().from(roles).where(eq(roles.name, roleName)).limit(1);
    if (roleResult.length === 0) {
      return apiError(ERROR_CODES.INVALID_INPUT, t('roleNotFound'), { status: 400 });
    }
    const role = roleResult[0];

    // Remove existing roles
    await db.delete(userRoles).where(eq(userRoles.userId, id));

    // Add new role
    await db.insert(userRoles).values({ userId: id, roleId: role.id });

    return apiSuccess({});
  } catch (error) {
    console.error('Update role error:', error);
    return apiError(ERROR_CODES.INTERNAL_ERROR, t('updateFailed'), { status: 500 });
  }
}
