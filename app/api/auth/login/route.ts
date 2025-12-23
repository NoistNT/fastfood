import type { NextRequest } from 'next/server';
import type { UserWithRoles } from '@/types/auth';

import { z } from 'zod';
import { eq } from 'drizzle-orm';

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Authenticate user and create session
 *     tags: [Authentication]
 *     security:
 *       - CSRFToken: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 minLength: 1
 *                 description: User's password
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data:
 *                 user:
 *                   id: "user-123"
 *                   email: "user@example.com"
 *                   name: "John Doe"
 *                   roles: [{ id: "role-1", name: "customer" }]
 *               meta:
 *                 timestamp: "2024-01-01T00:00:00.000Z"
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       429:
 *         description: Too many login attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

import { authRateLimit, createUserRateLimiter } from '@/lib/rate-limit';
import { login } from '@/lib/auth/session';
import { verifyPassword } from '@/lib/auth/password';
import { db } from '@/db/drizzle';
import { users, userRoles, roles } from '@/db/schema';
import { sanitizeInput } from '@/lib/sanitize';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';

const loginSchema = z.object({
  email: z.email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Sanitize inputs before validation
    const sanitizedBody = {
      email: sanitizeInput(body.email, 'email'),
      password: sanitizeInput(body.password, 'text'),
    };

    const { email, password } = loginSchema.parse(sanitizedBody);

    // Rate limit by email (IP-based)
    const { success: ipSuccess } = await authRateLimit.limit(email);

    if (!ipSuccess) {
      return apiError(
        ERROR_CODES.RATE_LIMIT_EXCEEDED,
        'Too many login attempts. Try again later.',
        { status: 429 }
      );
    }

    // Find user by email
    const userResult = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (userResult.length === 0) {
      return apiError(ERROR_CODES.UNAUTHORIZED, 'Invalid email or password', { status: 401 });
    }

    const user = userResult[0];

    // Additional user-based rate limiting for failed attempts
    const userLimiter = createUserRateLimiter(user.id, 5, '15 m');
    const { success: userSuccess } = await userLimiter.limit(user.id);

    if (!userSuccess) {
      return apiError(
        ERROR_CODES.RATE_LIMIT_EXCEEDED,
        'Account temporarily locked due to too many failed attempts.',
        { status: 429 }
      );
    }
    const passwordValid = await verifyPassword(password, user.passwordHash);

    if (!passwordValid) {
      return apiError(ERROR_CODES.UNAUTHORIZED, 'Invalid email or password', { status: 401 });
    }

    // Get user roles
    const userRoleResults = await db
      .select()
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, user.id));

    const rolesData = userRoleResults.map((r) => r.roles);

    // Update lastLoginAt
    await db.update(users).set({ lastLoginAt: new Date() }).where(eq(users.id, user.id));

    // Prepare user data for session
    const userWithRoles: UserWithRoles = { ...user, roles: rolesData };

    await login(userWithRoles);

    return apiSuccess({ user: userWithRoles });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(ERROR_CODES.VALIDATION_ERROR, 'Invalid input', { status: 400 });
    }
    console.error('Login error:', error);
    return apiError(ERROR_CODES.INTERNAL_ERROR, 'Internal server error', { status: 500 });
  }
}
