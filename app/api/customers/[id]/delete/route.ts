import type { NextRequest } from 'next/server';

import { getTranslations } from 'next-intl/server';
import { eq } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { users } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { USER_ROLES } from '@/types/auth';
import { verifyCSRFToken, getCSRFTokenFromRequest } from '@/lib/csrf';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations('Dashboard.customers');

  try {
    // Authorization first: only administrators delete people
    const session = await getSession();
    if (!session) {
      return apiError(ERROR_CODES.UNAUTHORIZED, 'Authentication required', { status: 401 });
    }
    const isAdmin = session.roles.some((role) => role.name === USER_ROLES.ADMIN);
    if (!isAdmin) {
      return apiError(ERROR_CODES.FORBIDDEN, 'Administrator access required', { status: 403 });
    }

    // Verify CSRF token for delete operations
    const csrfToken = await getCSRFTokenFromRequest(request);
    if (!csrfToken || !(await verifyCSRFToken(csrfToken))) {
      return apiError(ERROR_CODES.CSRF_INVALID, 'Invalid CSRF token', { status: 403 });
    }

    // Soft delete by setting deletedAt
    await db.update(users).set({ deletedAt: new Date() }).where(eq(users.id, id));

    return apiSuccess({});
  } catch (error) {
    console.error('Delete user error:', error);
    return apiError(ERROR_CODES.INTERNAL_ERROR, t('deleteFailed'), { status: 500 });
  }
}
