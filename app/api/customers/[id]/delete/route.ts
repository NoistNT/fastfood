import type { NextRequest } from 'next/server';

import { getTranslations } from 'next-intl/server';
import { eq } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { users } from '@/db/schema';
import { verifyCSRFToken, getCSRFTokenFromRequest } from '@/lib/csrf';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';

/**
 * @swagger
 * /api/customers/{id}/delete:
 *   post:
 *     summary: Soft delete a customer account
 *     tags: [Customers]
 *     security:
 *       - BearerAuth: []
 *       - CSRFToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Customer ID to delete
 *     responses:
 *       200:
 *         description: Customer deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data: {}
 *               meta:
 *                 timestamp: "2024-01-01T00:00:00.000Z"
 *       403:
 *         description: Invalid CSRF token or insufficient permissions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations('Dashboard.customers');

  try {
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
