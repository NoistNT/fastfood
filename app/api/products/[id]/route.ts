import type { NextRequest } from 'next/server';

import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import { eq } from 'drizzle-orm';

import { validateIngredientIds } from '@/app/api/products/_lib/validate';
import { db } from '@/db/drizzle';
import { products, productIngredients, ingredients } from '@/db/schema';
import { requireAdmin } from '@/lib/auth/guards';
import { verifyCSRFToken, getCSRFTokenFromRequest } from '@/lib/csrf';
import { sanitizeText, sanitizeUrl } from '@/lib/sanitize';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';

const updateProductSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  price: z
    .string()
    .refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
      message: 'Price must be a valid positive number',
    })
    .optional(),
  imageUrl: z.string().optional(),
  available: z.boolean().optional(),
  ingredientIds: z.array(z.number().int().positive()).optional(),
});

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  try {
    const productData = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        imageUrl: products.imageUrl,
        available: products.available,
      })
      .from(products)
      .where(eq(products.id, parseInt(id)))
      .limit(1);

    if (productData.length === 0) {
      return apiError(ERROR_CODES.NOT_FOUND, 'Product not found', { status: 404 });
    }

    const product = productData[0];

    // Get ingredients for this product
    const ingredientData = await db
      .select({
        id: ingredients.id,
        name: ingredients.name,
      })
      .from(productIngredients)
      .innerJoin(ingredients, eq(productIngredients.ingredientId, ingredients.id))
      .where(eq(productIngredients.productId, parseInt(id)));

    return apiSuccess({
      ...product,
      ingredients: ingredientData,
    });
  } catch (error) {
    console.error('Get product error:', error);
    return apiError(ERROR_CODES.INTERNAL_ERROR, 'Failed to retrieve product', { status: 500 });
  }
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const t = await getTranslations('Dashboard.products');

  try {
    // Admin-only mutation + CSRF
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
    const parsed = updateProductSchema.parse(body);

    let ingredientIds: number[] | undefined;
    if (parsed.ingredientIds !== undefined) {
      const validated =
        parsed.ingredientIds.length > 0
          ? await validateIngredientIds(db, parsed.ingredientIds)
          : [];
      if (validated === null) {
        return apiError(ERROR_CODES.VALIDATION_ERROR, t('invalidIngredients'), { status: 400 });
      }
      ingredientIds = validated;
    }

    const set: Record<string, unknown> = {};
    if (parsed.name !== undefined) set.name = sanitizeText(parsed.name);
    if (parsed.description !== undefined)
      set.description = parsed.description ? sanitizeText(parsed.description) : null;
    if (parsed.price !== undefined) set.price = parsed.price;
    if (parsed.imageUrl !== undefined)
      set.imageUrl = parsed.imageUrl ? sanitizeUrl(parsed.imageUrl) : null;
    if (parsed.available !== undefined) set.available = parsed.available;

    if (Object.keys(set).length > 0) {
      await db
        .update(products)
        .set(set)
        .where(eq(products.id, parseInt(id)));
    }

    if (ingredientIds !== undefined) {
      // Remove existing
      await db.delete(productIngredients).where(eq(productIngredients.productId, parseInt(id)));
      // Add new
      if (ingredientIds.length > 0) {
        await db.insert(productIngredients).values(
          ingredientIds.map((ingredientId: number) => ({
            productId: parseInt(id),
            ingredientId,
          }))
        );
      }
    }

    return apiSuccess({});
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return apiError(ERROR_CODES.VALIDATION_ERROR, firstError.message, { status: 400 });
    }

    console.error('Update product error:', error);
    return apiError(ERROR_CODES.INTERNAL_ERROR, t('updateFailed'), { status: 500 });
  }
}
