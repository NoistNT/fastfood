import type { NextRequest } from 'next/server';

import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import { eq } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { products, productIngredients, ingredients } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
import { apiSuccess, apiError, ERROR_CODES } from '@/lib/api-response';

const createProductSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  price: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) > 0, {
    message: 'Price must be a valid positive number',
  }),
  imageUrl: z.string().optional(),
  available: z.boolean().optional().default(true),
  ingredientIds: z.array(z.number()).optional(),
});

export async function GET() {
  try {
    const productsData = await db
      .select({
        id: products.id,
        name: products.name,
        description: products.description,
        price: products.price,
        imageUrl: products.imageUrl,
        available: products.available,
        ingredients: ingredients.name,
        ingredientId: ingredients.id,
      })
      .from(products)
      .leftJoin(productIngredients, eq(products.id, productIngredients.productId))
      .leftJoin(ingredients, eq(productIngredients.ingredientId, ingredients.id))
      .orderBy(products.name);

    // Group by product
    const productMap = new Map();
    productsData.forEach((item) => {
      if (!productMap.has(item.id)) {
        productMap.set(item.id, {
          id: item.id,
          name: item.name,
          description: item.description,
          price: item.price,
          imageUrl: item.imageUrl,
          available: item.available,
          ingredients: item.ingredients ? [item.ingredients] : [],
          ingredientIds: item.ingredientId ? [item.ingredientId] : [],
        });
      } else {
        const existing = productMap.get(item.id);
        if (item.ingredients) {
          existing.ingredients.push(item.ingredients);
        }
        if (item.ingredientId) {
          existing.ingredientIds.push(item.ingredientId);
        }
      }
    });

    const productsWithIngredients = Array.from(productMap.values());
    return apiSuccess(productsWithIngredients);
  } catch (error) {
    console.error('Failed to fetch products:', error);
    return apiError(ERROR_CODES.INTERNAL_ERROR, 'Failed to fetch products', { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const t = await getTranslations('Dashboard.products');

  try {
    // Check authentication
    const user = await getSession();
    if (!user) {
      return apiError(ERROR_CODES.UNAUTHORIZED, 'Authentication required', { status: 401 });
    }

    const body = await request.json();
    const { name, description, price, imageUrl, available, ingredientIds } =
      createProductSchema.parse(body);

    const [product] = await db
      .insert(products)
      .values({
        name,
        description,
        price,
        imageUrl,
        available,
      })
      .returning({ id: products.id });

    if (ingredientIds && ingredientIds.length > 0) {
      await db.insert(productIngredients).values(
        ingredientIds.map((ingredientId: number) => ({
          productId: product.id,
          ingredientId,
        }))
      );
    }

    return apiSuccess({ product }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.issues[0];
      return apiError(ERROR_CODES.VALIDATION_ERROR, firstError.message, { status: 400 });
    }

    console.error('Create product error:', error);
    return apiError(ERROR_CODES.INTERNAL_ERROR, t('createFailed'), { status: 500 });
  }
}
