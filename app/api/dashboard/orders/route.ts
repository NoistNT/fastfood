import type { NextRequest } from 'next/server';

import { z } from 'zod';
import { ZodError } from 'zod';

import { apiError, apiSuccess, ERROR_CODES } from '@/lib/api-response';
import { requireOperationalRole } from '@/lib/auth/guards';
import { getCSRFTokenFromRequest, verifyCSRFToken } from '@/lib/csrf';
import { validateOrderInventory, deductInventoryForOrder } from '@/lib/inventory-management';
import { createIntakeOrder } from '@/modules/orders/actions/intake';
import { ORDER_TYPE, PAYMENT_METHOD } from '@/modules/orders/types';

export const intakeOrderSchema = z
  .object({
    person: z.object({
      name: z.string().trim().min(1).max(120),
      phoneNumber: z.string().trim().max(40).optional().nullable(),
    }),
    items: z
      .array(
        z.object({
          productId: z.number().int().positive(),
          quantity: z.number().int().min(1).max(99),
        })
      )
      .min(1)
      .max(50),
    orderType: z.enum([ORDER_TYPE.PICKUP, ORDER_TYPE.DELIVERY]).default(ORDER_TYPE.PICKUP),
    paymentMethod: z
      .enum([PAYMENT_METHOD.CASH, PAYMENT_METHOD.CARD, PAYMENT_METHOD.ONLINE])
      .default(PAYMENT_METHOD.CASH),
    deliveryAddress: z.string().trim().max(500).optional().nullable(),
    deliveryNotes: z.string().trim().max(500).optional().nullable(),
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
 * POST /api/dashboard/orders — staff-transcribed order intake (WhatsApp and
 * phone orders). Operational roles only; totals are computed server-side.
 */
export async function POST(request: NextRequest) {
  try {
    const guard = await requireOperationalRole();
    if (!guard.ok) {
      return apiError(
        guard.reason === 'forbidden' ? ERROR_CODES.FORBIDDEN : ERROR_CODES.UNAUTHORIZED,
        guard.reason === 'forbidden' ? 'Forbidden' : 'Authentication required',
        { status: guard.reason === 'forbidden' ? 403 : 401 }
      );
    }

    const csrfToken = await getCSRFTokenFromRequest(request);
    if (!csrfToken || !(await verifyCSRFToken(csrfToken))) {
      return apiError(ERROR_CODES.CSRF_INVALID, 'Invalid CSRF token', { status: 403 });
    }

    const input = intakeOrderSchema.parse(await request.json());
    const order = await createIntakeOrder(input);

    try {
      if (!(await validateOrderInventory(order.id))) {
        console.warn(`Order ${order.id} transcribed with insufficient inventory`);
      }
      await deductInventoryForOrder(order.id);
    } catch (error) {
      console.error('Failed to deduct inventory for order:', order.id, error);
    }

    return apiSuccess(order, { status: 201 });
  } catch (error) {
    if (error instanceof ZodError) {
      return apiError(ERROR_CODES.VALIDATION_ERROR, error.issues[0].message, { status: 400 });
    }
    console.error('Order intake failed with a validation or database error');
    return apiError(ERROR_CODES.INTERNAL_ERROR, 'Failed to create order', { status: 500 });
  }
}
