import { generateCSRFToken } from '@/lib/csrf';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';

/**
 * @swagger
 * /api/csrf:
 *   get:
 *     summary: Generate CSRF token for authenticated user
 *     tags: [Security]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: CSRF token generated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data:
 *                 csrf_token: "abc123def456"
 *               meta:
 *                 timestamp: "2024-01-01T00:00:00.000Z"
 *       401:
 *         description: User not authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

export async function GET() {
  try {
    const token = await generateCSRFToken();
    return apiSuccess({ csrf_token: token });
  } catch (_error) {
    return apiError(ERROR_CODES.UNAUTHORIZED, 'Authentication required', { status: 401 });
  }
}
