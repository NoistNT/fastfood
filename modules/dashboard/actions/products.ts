'use server';

import { revalidateTag } from 'next/cache';
import { getTranslations } from 'next-intl/server';
import { eq } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { products, productIngredients } from '@/db/schema';

export async function createProduct(data: {
  name: string;
  description: string;
  price: string;
  imageUrl: string;
  available: boolean;
  ingredientIds: number[];
}) {
  const t = await getTranslations('Dashboard.products');

  try {
    const [product] = await db
      .insert(products)
      .values({
        name: data.name,
        description: data.description,
        price: data.price,
        imageUrl: data.imageUrl,
        available: data.available ?? true,
      })
      .returning({ id: products.id });

    if (data.ingredientIds.length > 0) {
      await db.insert(productIngredients).values(
        data.ingredientIds.map((ingredientId) => ({
          productId: product.id,
          ingredientId,
        }))
      );
    }

    revalidateTag('products', 'max');
  } catch (_error) {
    throw new Error(t('createFailed'));
  }
}

export async function updateProduct(
  id: number,
  data: {
    name?: string;
    description?: string;
    price?: string;
    imgSrc?: string;
    imgAlt?: string;
    isAvailable?: boolean;
    ingredientIds?: number[];
  }
) {
  const t = await getTranslations('Dashboard.products');

  try {
    await db.update(products).set(data).where(eq(products.id, id));

    if (data.ingredientIds !== undefined) {
      // Remove existing
      await db.delete(productIngredients).where(eq(productIngredients.productId, id));
      // Add new
      if (data.ingredientIds.length > 0) {
        await db.insert(productIngredients).values(
          data.ingredientIds.map((ingredientId) => ({
            productId: id,
            ingredientId,
          }))
        );
      }
    }

    revalidateTag('products', 'max');
  } catch (_error) {
    throw new Error(t('updateFailed'));
  }
}

export async function deleteProduct(id: number) {
  const t = await getTranslations('Dashboard.products');

  try {
    // Soft delete by setting unavailable
    await db.update(products).set({ available: false }).where(eq(products.id, id));
    revalidateTag('products', 'max');
  } catch (_error) {
    throw new Error(t('deleteFailed'));
  }
}
