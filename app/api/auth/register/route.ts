import type { NextRequest } from 'next/server';
import type { UserWithRoles } from '@/types/auth';

import { z } from 'zod';
import { and, eq, isNull, sql } from 'drizzle-orm';

import { authRateLimit } from '@/lib/rate-limit';
import { hashPassword } from '@/lib/auth/password';
import { normalizePhoneNumber } from '@/lib/phone';
import { db } from '@/db/drizzle';
import { users } from '@/db/schema';
import { sanitizeInput } from '@/lib/sanitize';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';

const registerSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be less than 50 characters')
      .regex(/^[a-zA-Z\s]+$/, 'Name can only contain letters and spaces'),
    email: z.string().email('Please enter a valid email address').toLowerCase(),
    phoneNumber: z.preprocess(
      (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value),
      z
        .string()
        .trim()
        .regex(/^\+?[0-9()\s-]{6,20}$/, 'Please enter a valid phone number')
        .optional()
    ),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .max(100, 'Password must be less than 100 characters')
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
        'Password must contain at least one lowercase letter, one uppercase letter, and one number'
      ),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Sanitize inputs before validation
    const sanitizedBody = {
      name: sanitizeInput(body.name, 'text'),
      email: sanitizeInput(body.email, 'email'),
      phoneNumber: typeof body.phoneNumber === 'string' ? body.phoneNumber.trim() : undefined,
      password: body.password, // Don't sanitize password as it needs special characters
      confirmPassword: body.confirmPassword,
    };

    const { name, email, phoneNumber, password } = registerSchema.parse(sanitizedBody);
    const normalizedPhone = phoneNumber ? normalizePhoneNumber(phoneNumber) : '';

    // Rate limit by email (IP-based)
    const { success: ipSuccess } = await authRateLimit.limit(email);

    if (!ipSuccess) {
      return apiError(
        ERROR_CODES.RATE_LIMIT_EXCEEDED,
        'Too many registration attempts. Try again later.',
        { status: 429 }
      );
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return apiError(ERROR_CODES.VALIDATION_ERROR, 'Email already registered', { status: 400 });
    }

    // Hash password
    const passwordHash = await hashPassword(password);

    // Claim path: attach credentials to a matching record-only person
    // (same normalized phone + name, never registered, not deleted).
    if (normalizedPhone) {
      const claimed = await db
        .update(users)
        .set({
          passwordHash,
          email: sql`COALESCE(${users.email}, ${email})`,
          updatedAt: new Date(),
        })
        .where(
          and(
            eq(users.phoneNumber, normalizedPhone),
            sql`lower(${users.name}) = ${name.toLowerCase()}`,
            isNull(users.passwordHash),
            isNull(users.deletedAt)
          )
        )
        .returning();

      if (claimed.length > 0) {
        const claimedUser = claimed[0];
        const userWithRoles: UserWithRoles = { ...claimedUser, roles: [] };
        return apiSuccess({ user: userWithRoles }, { status: 201 });
      }
    }

    // Create user
    const newUser = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        createdAt: new Date(),
        updatedAt: new Date(),
      })
      .returning();

    if (!newUser || newUser.length === 0) {
      return apiError(ERROR_CODES.INTERNAL_ERROR, 'Failed to create user', { status: 500 });
    }

    const createdUser = newUser[0];

    // Registration grants zero roles — roles encode powers only.
    const userWithRoles: UserWithRoles = { ...createdUser, roles: [] };

    return apiSuccess({ user: userWithRoles }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return apiError(ERROR_CODES.VALIDATION_ERROR, firstError.message, { status: 400 });
    }

    console.error('Registration error:', error);
    return apiError(ERROR_CODES.INTERNAL_ERROR, 'Internal server error', { status: 500 });
  }
}
