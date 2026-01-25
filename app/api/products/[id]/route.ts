import type { NextRequest } from 'next/server';

import { z } from 'zod';
import { getTranslations } from 'next-intl/server';
import { eq } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { products, productIngredients, ingredients } from '@/db/schema';
import { getSession } from '@/lib/auth/session';
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
  ingredientIds: z.array(z.number()).optional(),
});

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get product by ID with ingredients
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data:
 *                 id: 1
 *                 name: "Margherita Pizza"
 *                 description: "Classic pizza with tomato sauce and cheese"
 *                 price: 12.99
 *                 ingredients:
 *                   - id: 1
 *                     name: "Tomato Sauce"
 *                   - id: 2
 *                     name: "Mozzarella Cheese"
 *               meta:
 *                 timestamp: "2024-01-01T00:00:00.000Z"
 *       404:
 *         description: Product not found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *   patch:
 *     summary: Update product details and ingredients
 *     tags: [Products]
 *     security:
 *       - BearerAuth: []
 *       - CSRFToken: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *               description:
 *                 type: string
 *                 description: Product description
 *               price:
 *                 type: number
 *                 description: Product price
 *               imgSrc:
 *                 type: string
 *                 description: Product image URL
 *               imgAlt:
 *                 type: string
 *                 description: Product image alt text
 *               isAvailable:
 *                 type: boolean
 *                 description: Whether product is available
 *               ingredientIds:
 *                 type: array
 *                 items:
 *                   type: integer
 *                 description: Array of ingredient IDs
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 *             example:
 *               success: true
 *               data: {}
 *               meta:
 *                 timestamp: "2024-01-01T00:00:00.000Z"
 *       500:
 *         description: Internal server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ApiResponse'
 */

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
    // Check authentication
    const user = await getSession();
    if (!user) {
      return apiError(ERROR_CODES.UNAUTHORIZED, 'Authentication required', { status: 401 });
    }

    const body = await request.json();
    const updateData = updateProductSchema.parse(body);

    await db
      .update(products)
      .set(updateData)
      .where(eq(products.id, parseInt(id)));

    if (updateData.ingredientIds !== undefined) {
      // Remove existing
      await db.delete(productIngredients).where(eq(productIngredients.productId, parseInt(id)));
      // Add new
      if (updateData.ingredientIds.length > 0) {
        await db.insert(productIngredients).values(
          updateData.ingredientIds.map((ingredientId: number) => ({
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
