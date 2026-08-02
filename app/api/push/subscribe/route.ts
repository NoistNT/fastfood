import type { NextRequest } from 'next/server';

import { getSession } from '@/lib/auth/session';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const user = await getSession();
    if (!user) {
      return apiError(ERROR_CODES.UNAUTHORIZED, 'Authentication required', { status: 401 });
    }

    const body = await request.json();
    const { subscription } = body;

    if (!subscription?.endpoint) {
      return apiError(ERROR_CODES.VALIDATION_ERROR, 'Invalid subscription data', { status: 400 });
    }

    // In a real implementation, you would:
    // 1. Store the subscription in your database
    // 2. Associate it with the user
    // 3. Handle subscription management (update, remove duplicates, etc.)

    // For demo purposes, we'll just log it
    console.log('Push subscription received for user:', user.id, {
      endpoint: subscription.endpoint,
      keys: subscription.keys,
    });

    // TODO: Store subscription in database
    // Example:
    // await db.insert(pushSubscriptions).values({
    //   userId: user.id,
    //   endpoint: subscription.endpoint,
    //   p256dh: subscription.keys.p256dh,
    //   auth: subscription.keys.auth,
    //   createdAt: new Date(),
    // });

    return apiSuccess({ message: 'Subscription successful' });
  } catch (error) {
    console.error('Push subscription error:', error);
    return apiError(ERROR_CODES.INTERNAL_ERROR, 'Internal server error', { status: 500 });
  }
}
