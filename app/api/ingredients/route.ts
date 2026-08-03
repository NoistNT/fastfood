import type { NextRequest } from 'next/server';

import { asc } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { ingredients } from '@/db/schema';
import { requireAdmin } from '@/lib/auth/guards';
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
