import type { db } from '@/db/drizzle';

import { inArray } from 'drizzle-orm';

import { ingredients } from '@/db/schema';

/**
 * Verifies that every id in `ingredientIds` corresponds to a real ingredient
 * row. Returns a deduplicated list of valid ingredient ids, or `null` when one
 * or more ids do not exist so the caller can reject the request.
 */
export async function validateIngredientIds(
  dbClient: typeof db,
  ingredientIds: number[]
): Promise<number[] | null> {
  const ids = Array.from(new Set(ingredientIds));
  if (ids.length === 0) return [];

  const found = await dbClient
    .select({ id: ingredients.id })
    .from(ingredients)
    .where(inArray(ingredients.id, ids));

  if (found.length !== ids.length) return null;

  return ids;
}
