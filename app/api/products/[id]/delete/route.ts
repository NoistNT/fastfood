import type { NextRequest } from 'next/server';

import { getTranslations } from 'next-intl/server';
import { eq } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { products } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';

/**
 * @swagger
 * /api/products/{id}/delete:
 *   delete:
 *     summary: Soft delete a product (mark as unavailable)
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *       - CSRFToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID to delete
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data: {}
 *               meta:
 *                 timestamp: "2024-01-01T00:00:00.000Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

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
