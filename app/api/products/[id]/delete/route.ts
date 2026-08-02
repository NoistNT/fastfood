import type { NextRequest } from 'next/server';

import { getTranslations } from 'next-intl/server';
import { eq } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { products } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const t = await getTranslations('Dashboard.products');

  try {
    // Check authentication
    const user = await getSession();
    if (!user) {
      return apiError(ERROR_CODES.UNAUTHORIZED, 'Authentication required', { status: 401 });
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
