import type { NextRequest } from 'next/server';
import type { UserWithRoles } from '@/types/auth';

import { z } from 'zod';
import { eq } from 'drizzle-orm';

import { authRateLimit } from '@/lib/rate-limit';
import { hashPassword } from '@/lib/auth/password';
import { db } from '@/db/drizzle';
import { users, userRoles, roles } from '@/db/schema';
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

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Register a new user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - email
 *               - password
 *               - confirmPassword
 *             properties:
 *               name:
 *                 type: string
 *                 minLength: 2
 *                 maxLength: 50
 *                 description: User's full name
 *               email:
 *                 type: string
 *                 format: email
 *                 description: User's email address
 *               password:
 *                 type: string
 *                 minLength: 8
 *                 maxLength: 100
 *                 description: User's password
 *               confirmPassword:
 *                 type: string
 *                 description: Password confirmation
 *     responses:
 *       201:
 *         description: Registration successful
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
 *                   roles: [{ id: "role-2", name: "customer" }]
 *               meta:
 *                 timestamp: "2024-01-01T00:00:00.000Z"
 *       400:
 *         description: Validation error or email already exists
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       429:
 *         description: Too many registration attempts
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Sanitize inputs before validation
    const sanitizedBody = {
      name: sanitizeInput(body.name, 'text'),
      email: sanitizeInput(body.email, 'email'),
      password: body.password, // Don't sanitize password as it needs special characters
      confirmPassword: body.confirmPassword,
    };

    const { name, email, password } = registerSchema.parse(sanitizedBody);

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

    // Assign default 'customer' role
    const customerRole = await db.select().from(roles).where(eq(roles.name, 'customer')).limit(1);
    if (customerRole.length > 0) {
      await db.insert(userRoles).values({
        userId: createdUser.id,
        roleId: customerRole[0].id,
      });
    }

    // Get user with roles for response
    const userRoleResults = await db
      .select()
      .from(userRoles)
      .innerJoin(roles, eq(userRoles.roleId, roles.id))
      .where(eq(userRoles.userId, createdUser.id));

    const rolesData = userRoleResults.map((r) => r.roles);

    const userWithRoles: UserWithRoles = { ...createdUser, roles: rolesData };

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
