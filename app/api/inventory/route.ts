import type { NextRequest } from 'next/server';

import { eq, desc } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { inventory, inventoryMovements, ingredients } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';

/**
 * @swagger
 * /api/inventory:
 *   get:
 *     summary: Get all inventory items with ingredient details
 *     tags: [Inventory]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Inventory items retrieved successfully
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
 *     summary: Adjust inventory stock level
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
 *               - inventoryId
 *               - quantity
 *               - type
 *             properties:
 *               inventoryId:
 *                 type: string
 *                 description: Inventory item ID
 *               quantity:
 *                 type: integer
 *                 description: Quantity to add/subtract (positive for in, negative for out)
 *               type:
 *                 type: string
 *                 enum: [in, out, adjustment]
 *                 description: Movement type
 *               reason:
 *                 type: string
 *                 description: Reason for the adjustment
 *     responses:
 *       200:
 *         description: Inventory adjusted successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       400:
 *         description: Invalid input
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

    const inventoryItems = await db
      .select({
        id: inventory.id,
        ingredientId: inventory.ingredientId,
        ingredientName: ingredients.name,
        quantity: inventory.quantity,
        minThreshold: inventory.minThreshold,
        unit: inventory.unit,
        lastUpdated: inventory.lastUpdated,
      })
      .from(inventory)
      .innerJoin(ingredients, eq(inventory.ingredientId, ingredients.id))
      .orderBy(desc(inventory.lastUpdated));

    return apiSuccess(inventoryItems);
  } catch (error) {
    const { logError } = await import('@/lib/logger');
    logError(error as Error, { context: 'GET /api/inventory' });
    return apiError(ERROR_CODES.INTERNAL_ERROR, 'Failed to retrieve inventory', { status: 500 });
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
    const { inventoryId, quantity, type, reason } = body;

    if (!inventoryId || typeof quantity !== 'number' || !type) {
      return apiError(ERROR_CODES.VALIDATION_ERROR, 'Missing required fields', { status: 400 });
    }

    // Validate movement type
    if (!['in', 'out', 'adjustment'].includes(type)) {
      return apiError(ERROR_CODES.VALIDATION_ERROR, 'Invalid movement type', { status: 400 });
    }

    // Get current inventory
    const currentInventory = await db
      .select()
      .from(inventory)
      .where(eq(inventory.id, inventoryId))
      .limit(1);

    if (currentInventory.length === 0) {
      return apiError(ERROR_CODES.NOT_FOUND, 'Inventory item not found', { status: 404 });
    }

    const item = currentInventory[0];
    const newQuantity = Math.max(0, item.quantity + quantity);

    // Update inventory
    await db
      .update(inventory)
      .set({
        quantity: newQuantity,
        lastUpdated: new Date(),
      })
      .where(eq(inventory.id, inventoryId));

    // Record movement
    await db.insert(inventoryMovements).values({
      inventoryId,
      type,
      quantity,
      reason: reason ?? `Manual ${type}`,
    });

    return apiSuccess({
      inventoryId,
      previousQuantity: item.quantity,
      newQuantity,
      adjustment: quantity,
    });
  } catch (error) {
    const { logError } = await import('@/lib/logger');
    logError(error as Error, { context: 'POST /api/inventory', body: request.body });
    return apiError(ERROR_CODES.INTERNAL_ERROR, 'Failed to adjust inventory', { status: 500 });
  }
}
