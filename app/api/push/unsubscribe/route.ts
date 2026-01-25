import type { NextRequest } from 'next/server';

import { getSession } from '@/lib/auth/session';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';

/**
 * @swagger
 * /api/push/unsubscribe:
 *   post:
 *     summary: Unsubscribe from push notifications
 *     tags: [Push Notifications]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - endpoint
 *             properties:
 *               endpoint:
 *                 type: string
 *                 description: Push subscription endpoint to remove
 *     responses:
 *       200:
 *         description: Unsubscription successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       401:
 *         description: Not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getSession();
    if (!user) {
      return apiError(ERROR_CODES.UNAUTHORIZED, 'Authentication required', { status: 401 });
    }

    const body = await request.json();
    const { endpoint } = body;

    if (!endpoint) {
      return apiError(ERROR_CODES.VALIDATION_ERROR, 'Endpoint is required', { status: 400 });
    }

    // In a real implementation, you would:
    // Remove the subscription from your database
    // Example:
    // await db.delete(pushSubscriptions).where(
    //   and(
    //     eq(pushSubscriptions.userId, user.id),
    //     eq(pushSubscriptions.endpoint, endpoint)
    //   )
    // );

    // For demo purposes, we'll just log it
    console.log('Push unsubscription received for user:', user.id, { endpoint });

    return apiSuccess({ message: 'Unsubscription successful' });
  } catch (error) {
    console.error('Push unsubscription error:', error);
    return apiError(ERROR_CODES.INTERNAL_ERROR, 'Internal server error', { status: 500 });
  }
}
