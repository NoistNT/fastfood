import crypto from 'crypto';

import { z } from 'zod';
import { eq } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { users, passwordResetTokens } from '@/db/schema';
import { passwordResetRateLimit } from '@/lib/rate-limit';
import { sendPasswordResetEmail } from '@/lib/mail';
import { sanitizeInput } from '@/lib/sanitize';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';
import { getClientIp } from '@/lib/request-ip';

const requestPasswordResetSchema = z.object({
  email: z.email(),
});

export async function POST(req: Request) {
  const ip = getClientIp(req);
  const { success } = await passwordResetRateLimit.limit(ip);
  if (!success) {
    return apiError(
      ERROR_CODES.RATE_LIMIT_EXCEEDED,
      'Too many password reset requests. Try again later.',
      { status: 429 }
    );
  }

  try {
    const body = await req.json();

    // Sanitize email before validation
    const sanitizedBody = {
      email: sanitizeInput(body.email, 'email'),
    };

    const { email } = requestPasswordResetSchema.parse(sanitizedBody);

    const user = await db.query.users.findFirst({ where: eq(users.email, email) });

    if (user) {
      const token = crypto.randomBytes(32).toString('hex');
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expiresAt,
      });

      await sendPasswordResetEmail(email, token);
    }

    return apiSuccess({
      message: 'If your email is in our system, you will receive a password reset link.',
    });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(ERROR_CODES.VALIDATION_ERROR, 'Invalid email format', { status: 400 });
    }
    return apiError(ERROR_CODES.INTERNAL_ERROR, 'Internal server error', { status: 500 });
  }
}
