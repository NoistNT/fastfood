import type { NextRequest } from 'next/server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { users } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { createOrder } from '@/modules/orders/create-order';
import { deductInventoryForOrder } from '@/lib/inventory-management';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';

const orderItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1),
});

// `total` is accepted (optional) for backward compatibility with existing
// clients but never trusted — the amount is recomputed server-side.
const submitOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
  total: z.string().optional(),
});

/**
 * Places an order for the authenticated session. Inventory is deducted
 * atomically after creation; shortfalls never fail the order and stock
 * never goes negative.
 */
export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getSession();
    if (!user) {
      return apiError(ERROR_CODES.UNAUTHORIZED, 'Authentication required', { status: 401 });
    }

    // Verify user exists in database
    const dbUser = await db.query.users.findFirst({ where: eq(users.id, user.id) });
    if (!dbUser) {
      return apiError(ERROR_CODES.UNAUTHORIZED, 'User not found', { status: 401 });
    }

    const body = await request.json();
    const { items } = submitOrderSchema.parse(body);

    // Create the order (total is computed server-side from catalog prices)
    const order = await createOrder({ items, userId: user.id });

    if (!order) {
      return apiError(ERROR_CODES.INTERNAL_ERROR, 'Failed to create order', { status: 500 });
    }

    // Deduct inventory atomically; shortfalls mean stock was already gone —
    // nothing is removed and stock never goes negative.
    try {
      const { shortfalls } = await deductInventoryForOrder(order.id);
      if (shortfalls.length > 0) {
        console.warn(`Order ${order.id} placed with insufficient inventory`);
      }
    } catch (error) {
      console.error('Failed to deduct inventory for order:', order.id, error);
      // Order is still created, but inventory wasn't updated
      // This should trigger manual intervention
    }

    return apiSuccess(order, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return apiError(ERROR_CODES.VALIDATION_ERROR, firstError.message, { status: 400 });
    }

    console.error('Order submission error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Internal server error';
    return apiError(ERROR_CODES.INTERNAL_ERROR, errorMessage, { status: 500 });
  }
}
