import type { NextRequest } from 'next/server';

import { getTranslations } from 'next-intl/server';
import { eq } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { userRoles, roles } from '@/db/schema';
import { verifyCSRFToken, getCSRFTokenFromRequest } from '@/lib/csrf';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';

/**
 * @swagger
 * /api/customers/{id}/role:
 *   post:
 *     summary: Update customer role
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
 *         description: Customer ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roleName
 *             properties:
 *               roleName:
 *                 type: string
 *                 enum: [admin, customer]
 *                 description: New role for the customer
 *     responses:
 *       200:
 *         description: Customer role updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data: {}
 *               meta:
 *                 timestamp: "2024-01-01T00:00:00.000Z"
 *       400:
 *         description: Invalid role name
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
    // Verify CSRF token for role update operations
    const csrfToken = await getCSRFTokenFromRequest(request);
    if (!csrfToken || !(await verifyCSRFToken(csrfToken))) {
      return apiError(ERROR_CODES.CSRF_INVALID, 'Invalid CSRF token', { status: 403 });
    }

    const body = await request.json();
    const { roleName } = body;

    if (!roleName) {
      return apiError(ERROR_CODES.INVALID_INPUT, 'Role name is required', { status: 400 });
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
