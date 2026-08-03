import type { NextRequest } from 'next/server';

import { getTranslations } from 'next-intl/server';
import { eq } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { products } from '@/db/schema';
import { requireAdmin } from '@/lib/auth/guards';
import { verifyCSRFToken, getCSRFTokenFromRequest } from '@/lib/csrf';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const t = await getTranslations('Dashboard.products');

  try {
    // Admin-only mutation + CSRF
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

    // Soft delete by setting unavailable
    await db
      .update(products)
      .set({ available: false })
      .where(eq(products.id, parseInt(id)));

    return apiSuccess({});
  } catch (error) {
    console.error('Delete product error:', error);
    return apiError(ERROR_CODES.INTERNAL_ERROR, t('deleteFailed'), { status: 500 });
  }
}
