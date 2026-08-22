import type { NextRequest } from 'next/server';

import { getTranslations } from 'next-intl/server';
import { eq } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { userRoles, roles } from '@/db/schema';
import { verifyCSRFToken, getCSRFTokenFromRequest } from '@/lib/csrf';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations('Dashboard.customers');

  try {
    // Verify CSRF token for role update operations
    const csrfToken = await getCSRFTokenFromRequest(request);
    if (!csrfToken || !(await verifyCSRFToken(csrfToken))) {
      return apiError(ERROR_CODES.CSRF_INVALID, 'Invalid CSRF token', { status: 403 });
    }

    const body = await request.json();
    const { roleName } = body ?? {};

    // Absent roleName = revoke all roles (person becomes a civilian).
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
