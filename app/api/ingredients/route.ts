import type { NextRequest } from 'next/server';

import { asc, eq, sql } from 'drizzle-orm';
import { z } from 'zod';

import { db } from '@/db/drizzle';
import { ingredients, inventory } from '@/db/schema';
import { requireAdmin } from '@/lib/auth/guards';
import { getCSRFTokenFromRequest, verifyCSRFToken } from '@/lib/csrf';
import { isUniqueViolation } from '@/lib/db-errors';
import { errorMessage, logError } from '@/lib/log-error';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';

export async function GET(_request: NextRequest) {
  try {
    const guard = await requireAdmin();
    if (!guard.ok) {
      return apiError(
        guard.reason === 'forbidden' ? ERROR_CODES.FORBIDDEN : ERROR_CODES.UNAUTHORIZED,
        guard.reason === 'forbidden' ? 'Forbidden' : 'Authentication required',
        { status: guard.reason === 'forbidden' ? 403 : 401 }
      );
    }

    const allIngredients = await db
      .select({
        id: ingredients.id,
        name: ingredients.name,
        unit: ingredients.unit,
      })
      .from(ingredients)
      .orderBy(asc(ingredients.name));

    return apiSuccess(allIngredients);
  } catch (error) {
    console.error('Failed to retrieve ingredients:', error);
    return apiError(ERROR_CODES.INTERNAL_ERROR, 'Failed to retrieve ingredients', { status: 500 });
  }
}

const createIngredientSchema = z.object({
  name: z.string().trim().min(1).max(120),
  unit: z.string().trim().min(1).max(20),
  price: z.string().refine(
    (value) => {
      if (value.trim() === '') return false;
      const parsed = parseFloat(value);
      return Number.isFinite(parsed) && parsed >= 0;
    },
    {
      message: 'Price must be a valid non-negative number',
    }
  ),
  minThreshold: z.number().int().min(0).default(10),
});

/**
 * POST /api/ingredients — adds an ingredient to the catalog along with its
 * inventory row (quantity 0). The ingredient id is a serial sequence the
 * client cannot pre-generate, so the two writes cannot share one batch:
 * if the inventory insert fails, the orphan ingredient is deleted again
 * and the request answers 500. ADMIN only.
 */
export async function POST(request: NextRequest) {
  try {
    const guard = await requireAdmin();
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

    const body = await request.json();
    const input = createIngredientSchema.parse(body);

    const [existing] = await db
      .select({ id: ingredients.id })
      .from(ingredients)
      .where(sql`lower(${ingredients.name}) = ${input.name.toLowerCase()}`)
      .limit(1);
    if (existing) {
      return apiError(ERROR_CODES.VALIDATION_ERROR, 'Ingredient already exists', { status: 400 });
    }

    const [created] = await db
      .insert(ingredients)
      .values({ name: input.name, unit: input.unit, price: input.price })
      .returning({ id: ingredients.id, name: ingredients.name });
    if (!created) {
      return apiError(ERROR_CODES.INTERNAL_ERROR, 'Failed to create ingredient', { status: 500 });
    }

    try {
      await db.insert(inventory).values({
        ingredientId: created.id,
        quantity: 0,
        minThreshold: input.minThreshold,
        unit: input.unit,
      });
    } catch (error) {
      // The inventory insert is atomic — nothing to clean there. Remove the
      // orphan ingredient so a nameless catalog row never lingers.
      await db.delete(ingredients).where(eq(ingredients.id, created.id));
      throw error;
    }

    return apiSuccess({ ingredient: created }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return apiError(ERROR_CODES.VALIDATION_ERROR, error.issues[0].message, { status: 400 });
    }
    if (isUniqueViolation(error)) {
      return apiError(ERROR_CODES.VALIDATION_ERROR, 'Ingredient already exists', { status: 400 });
    }
    logError('inventory', 'Ingredient creation failed', { cause: errorMessage(error) });
    return apiError(ERROR_CODES.INTERNAL_ERROR, 'Failed to create ingredient', { status: 500 });
  }
}
