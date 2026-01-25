'use server';

import type { ProductWithIngredients } from '@/modules/products/types';

import { revalidateTag, unstable_cache as cache } from 'next/cache';
import { eq } from 'drizzle-orm';

import { db } from '@/db/drizzle';
import { products } from '@/db/schema';

const fetchAllProducts = async () => {
  return await db.query.products.findMany();
};

const fetchOneProduct = async (id: number): Promise<ProductWithIngredients | null> => {
  const productWithIngredients = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: { ingredients: { with: { ingredient: { columns: { name: true } } } } },
  });

  if (!productWithIngredients) return null;
  const { ingredients, ...product } = productWithIngredients;

  return { ...product, ingredients: ingredients.map(({ ingredient }) => ingredient.name) };
};

export const findAll = cache(fetchAllProducts, ['products-findAll'], { tags: ['products'] });
export const findOne = cache(fetchOneProduct, ['products-findOne'], { tags: ['products'] });

export const revalidateProducts = async () => revalidateTag('products', 'max');
