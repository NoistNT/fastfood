import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';

import { verifyCSRFToken, getCSRFTokenFromRequest } from '@/lib/csrf';
import { sensitiveOperationRateLimit } from '@/lib/rate-limit';
import { getClientIp } from '@/lib/request-ip';
import { paymentCircuitBreaker } from '@/lib/circuit-breaker';
import { db } from '@/db/drizzle';
import { orders } from '@/db/schema';
import { ORDER_STATUS } from '@/modules/orders/types';
import { apiError, ERROR_CODES } from '@/lib/api-response';

const paymentRequestSchema = z.object({
  orderId: z.uuid('Invalid order ID'),
});

const mercadopago = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

/**
 * POST /api/payment — mints a MercadoPago preference for a placed order.
 * Amounts always come from the stored order total (computed server-side at
 * creation); the client supplies only the order ID, so there is no amount
 * to tamper with. Only PENDING orders can be paid.
 */
export async function POST(req: Request) {
  try {
    // Rate limit payment operations
    const ip = getClientIp(req);
    const { success } = await sensitiveOperationRateLimit.limit(ip);
    if (!success) {
      return apiError(
        ERROR_CODES.RATE_LIMIT_EXCEEDED,
        'Too many payment requests. Try again later.',
        { status: 429 }
      );
    }

    // Verify CSRF token for payment operations
    const csrfToken = await getCSRFTokenFromRequest(req);
    if (!csrfToken || !(await verifyCSRFToken(csrfToken))) {
      return apiError(ERROR_CODES.CSRF_INVALID, 'Invalid CSRF token', { status: 403 });
    }

    const { orderId } = paymentRequestSchema.parse(await req.json());

    const order = await db.query.orders.findFirst({ where: eq(orders.id, orderId) });
    if (!order) {
      return apiError(ERROR_CODES.NOT_FOUND, 'Order not found', { status: 404 });
    }
    if (order.status !== ORDER_STATUS.PENDING) {
      return apiError(ERROR_CODES.VALIDATION_ERROR, 'Only pending orders can be paid', {
        status: 409,
      });
    }

    const preference = {
      items: [
        {
          id: order.id,
          title: `Order ${order.trackingCode ?? order.id}`,
          unit_price: Number(order.total),
          quantity: 1,
        },
      ],
      external_reference: order.id,
      metadata: { orderId: order.id },
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_BASE_URL!}`,
        failure: `${process.env.NEXT_PUBLIC_BASE_URL!}`,
        pending: `${process.env.NEXT_PUBLIC_BASE_URL!}`,
      },
      auto_return: 'approved',
      payment_methods: {
        excluded_payment_methods: [],
        excluded_payment_types: [],
        installments: 12,
        default_installments: 3,
      },
    };

    // Use circuit breaker for external payment service
    const response = await paymentCircuitBreaker.execute(() =>
      new Preference(mercadopago).create({ body: preference })
    );

    return NextResponse.json(response);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(ERROR_CODES.VALIDATION_ERROR, 'Invalid order ID', { status: 400 });
    }
    console.error('Payment preference creation failed');
    return apiError(ERROR_CODES.EXTERNAL_SERVICE_ERROR, 'Failed to create payment', {
      status: 500,
    });
  }
}
