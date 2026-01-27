import { MercadoPagoConfig, Preference } from 'mercadopago';
import { NextResponse } from 'next/server';

import { verifyCSRFToken, getCSRFTokenFromRequest } from '@/lib/csrf';
import { sensitiveOperationRateLimit } from '@/lib/rate-limit';
import { paymentCircuitBreaker } from '@/lib/circuit-breaker';
import { apiError, ERROR_CODES } from '@/lib/api-response';

/**
 * @swagger
 * /api/payment:
 *   post:
 *     summary: Create payment preference for MercadoPago
 *     tags: [Payments]
 *     security:
 *       - BearerAuth: []
 *       - CSRFToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - price
 *               - quantity
 *             properties:
 *               title:
 *                 type: string
 *                 description: Payment title/description
 *               price:
 *                 type: number
 *                 description: Unit price
 *               quantity:
 *                 type: integer
 *                 description: Quantity of items
 *     responses:
 *       200:
 *         description: Payment preference created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   description: MercadoPago preference ID
 *                 init_point:
 *                   type: string
 *                   description: Payment URL to redirect user to
 *       403:
 *         description: Invalid CSRF token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       429:
 *         description: Too many payment requests
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

interface Body {
  title: string;
  price: number;
  quantity: number;
}

const mercadopago = new MercadoPagoConfig({ accessToken: process.env.MP_ACCESS_TOKEN! });

export async function POST(req: Request) {
  try {
    // Rate limit payment operations
    const ip = req.headers.get('x-forwarded-for') ?? '127.0.0.1';
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

    const body: Body = await req.json();

    const preference = {
      items: [
        {
          id: Date.now().toString(),
          title: body.title ?? 'Order Payment',
          unit_price: body.price,
          quantity: body.quantity,
        },
      ],
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
  } catch (_error) {
    return apiError(ERROR_CODES.EXTERNAL_SERVICE_ERROR, 'Failed to create payment', {
      status: 500,
    });
  }
}
