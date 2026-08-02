import type { NextRequest } from 'next/server';

import { z } from 'zod';
import { eq } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { users } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { create } from '@/modules/orders/actions/actions';
import { validateOrderInventory, deductInventoryForOrder } from '@/lib/inventory-management';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';

const orderItemSchema = z.object({
  productId: z.number(),
  quantity: z.number().min(1),
});

const submitOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
  total: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Total must be a valid positive number',
  }),
});

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
    const { items, total } = submitOrderSchema.parse(body);

    // Create the order
    const order = await create({ items, total, userId: user.id });

    if (!order) {
      return apiError(ERROR_CODES.INTERNAL_ERROR, 'Failed to create order', { status: 500 });
    }

    // Validate inventory availability
    const hasInventory = await validateOrderInventory(order.id);
    if (!hasInventory) {
      // Order is created but inventory is insufficient
      // In a real app, you might want to cancel the order or notify the user
      console.warn(`Order ${order.id} placed with insufficient inventory`);
    }

    // Deduct inventory (this will handle the case where inventory becomes insufficient)
    try {
      await deductInventoryForOrder(order.id);
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
