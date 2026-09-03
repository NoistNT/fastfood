import type { NextRequest } from 'next/server';

import { z } from 'zod';
import { getTranslations } from 'next-intl/server';

import { getSession } from '@/lib/auth/session';
import { createOrder } from '@/modules/orders/create-order';
import { deductInventoryForOrder } from '@/lib/inventory-management';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';
import { findOrCreatePerson } from '@/modules/users/persons';
import { sensitiveOperationRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/request-ip';
import { ORDER_TYPE, PAYMENT_METHOD } from '@/modules/orders/types';

const orderItemSchema = z.object({
  productId: z.number().int().positive(),
  quantity: z.number().int().min(1),
});

// `total` is accepted (optional) for backward compatibility with existing
// clients but never trusted — the amount is recomputed server-side.
const submitOrderSchema = z
  .object({
    items: z.array(orderItemSchema).min(1, 'Order must contain at least one item'),
    total: z.string().optional(),
    person: z.object({
      fullName: z.string().trim().min(1).max(120),
      phoneNumber: z.string().trim().min(5).max(40),
      email: z.string().trim().email().max(120).optional(),
    }),
    orderType: z.enum([ORDER_TYPE.PICKUP, ORDER_TYPE.DELIVERY]).default(ORDER_TYPE.PICKUP),
    paymentMethod: z
      .enum([PAYMENT_METHOD.CASH, PAYMENT_METHOD.CARD, PAYMENT_METHOD.ONLINE])
      .default(PAYMENT_METHOD.ONLINE),
    deliveryAddress: z.string().trim().max(500).optional(),
    deliveryNotes: z.string().trim().max(500).optional(),
  })
  .superRefine((value, ctx) => {
    if (value.orderType === ORDER_TYPE.DELIVERY && !value.deliveryAddress) {
      ctx.addIssue({
        code: 'custom',
        message: 'Delivery address is required for delivery orders',
        path: ['deliveryAddress'],
      });
    }
  });

/**
 * Places an order for anyone — no account required (guest checkout).
 * Identity resolves to the signed-in session when one exists, otherwise to
 * a deduped passwordless person via the shared find-or-create service.
 * Inventory is deducted atomically after creation; shortfalls never fail
 * the order and stock never goes negative.
 */
export async function POST(request: NextRequest) {
  try {
    const ip = getClientIp(request);
    const { success } = await sensitiveOperationRateLimit.limit(ip);
    if (!success) {
      const t = await getTranslations('Orders');
      return apiError(ERROR_CODES.RATE_LIMIT_EXCEEDED, t('errors.rateLimited'), {
        status: 429,
      });
    }

    const body = await request.json();
    const { items, person, orderType, paymentMethod, deliveryAddress, deliveryNotes } =
      submitOrderSchema.parse(body);

    // A signed-in buyer keeps their account identity; anyone else becomes a
    // deduped guest person (null passwordHash) through the shared service.
    const session = await getSession();
    const userId = session
      ? session.id
      : (
          await findOrCreatePerson({
            name: person.fullName,
            phoneNumber: person.phoneNumber,
            email: person.email,
          })
        ).id;

    // Create the order (total is computed server-side from catalog prices)
    const order = await createOrder({
      items,
      userId,
      orderType,
      paymentMethod,
      contactName: person.fullName,
      contactPhone: person.phoneNumber,
      deliveryAddress,
      deliveryNotes,
    });

    if (!order) {
      const t = await getTranslations('Orders');
      return apiError(ERROR_CODES.INTERNAL_ERROR, t('errors.createOrderError'), { status: 500 });
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

    console.error('Order submission failed');
    const t = await getTranslations('Orders');
    return apiError(ERROR_CODES.INTERNAL_ERROR, t('errors.createOrderError'), { status: 500 });
  }
}
