import { getSession } from '@/lib/auth/session';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';

/**
 * @swagger
 * /api/auth/session:
 *   get:
 *     summary: Get current user session
 *     tags: [Authentication]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Session retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data:
 *                 user:
 *                   id: "user-123"
 *                   email: "user@example.com"
 *                   name: "John Doe"
 *                   roles: [{ id: "role-1", name: "customer" }]
 *               meta:
 *                 timestamp: "2024-01-01T00:00:00.000Z"
 *       401:
 *         description: No active session
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data:
 *                 user: null
 *               meta:
 *                 timestamp: "2024-01-01T00:00:00.000Z"
 */

export async function GET() {
  try {
    const user = await getSession();
    return apiSuccess({ user });
  } catch (error) {
    console.error('Session error:', error);
    return apiError(ERROR_CODES.INTERNAL_ERROR, 'Failed to retrieve session', { status: 500 });
  }
}
