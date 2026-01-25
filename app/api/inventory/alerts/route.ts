import type { NextRequest } from 'next/server';

import { eq, desc } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { inventoryAlerts, inventory, ingredients } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';

/**
 * @swagger
 * /api/inventory/alerts:
 *   get:
 *     summary: Get active inventory alerts
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Alerts retrieved successfully
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
 *   post:
 *     summary: Resolve an inventory alert
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - alertId
 *             properties:
 *               alertId:
 *                 type: string
 *                 description: Alert ID to resolve
 *     responses:
 *       200:
 *         description: Alert resolved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       404:
 *         description: Alert not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

export async function GET() {
  try {
    // Check authentication
    const user = await getSession();
    if (!user) {
      return apiError(ERROR_CODES.UNAUTHORIZED, 'Authentication required', { status: 401 });
    }

    const alerts = await db
      .select({
        id: inventoryAlerts.id,
        inventoryId: inventoryAlerts.inventoryId,
        ingredientName: ingredients.name,
        type: inventoryAlerts.type,
        message: inventoryAlerts.message,
        createdAt: inventoryAlerts.createdAt,
        currentStock: inventory.quantity,
        minThreshold: inventory.minThreshold,
        unit: inventory.unit,
      })
      .from(inventoryAlerts)
      .innerJoin(inventory, eq(inventoryAlerts.inventoryId, inventory.id))
      .innerJoin(ingredients, eq(inventory.ingredientId, ingredients.id))
      .where(eq(inventoryAlerts.isResolved, false))
      .orderBy(desc(inventoryAlerts.createdAt));

    return apiSuccess(alerts);
  } catch (error) {
    const { logError } = await import('@/lib/logger');
    logError(error as Error, { context: 'GET /api/inventory/alerts' });
    return apiError(ERROR_CODES.INTERNAL_ERROR, 'Failed to retrieve alerts', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getSession();
    if (!user) {
      return apiError(ERROR_CODES.UNAUTHORIZED, 'Authentication required', { status: 401 });
    }

    const body = await request.json();
    const { alertId } = body;

    if (!alertId) {
      return apiError(ERROR_CODES.VALIDATION_ERROR, 'Alert ID is required', { status: 400 });
    }

    const result = await db
      .update(inventoryAlerts)
      .set({
        isResolved: true,
        resolvedAt: new Date(),
      })
      .where(eq(inventoryAlerts.id, alertId));

    if (result.rowCount === 0) {
      return apiError(ERROR_CODES.NOT_FOUND, 'Alert not found', { status: 404 });
    }

    return apiSuccess({ alertId, resolved: true });
  } catch (error) {
    const { logError } = await import('@/lib/logger');
    logError(error as Error, { context: 'POST /api/inventory/alerts', body: request.body });
    return apiError(ERROR_CODES.INTERNAL_ERROR, 'Failed to resolve alert', { status: 500 });
  }
}
