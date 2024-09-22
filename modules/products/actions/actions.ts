'use server'

import type {
  ProductGeneralView,
  ProductWithIngredients
} from '@/modules/products/types'

import { eq } from 'drizzle-orm'

import { db } from '@/db/drizzle'
import { products } from '@/db/schema'

export const findAll = async (): Promise<ProductGeneralView[]> => {
  return await db.query.products.findMany({
    columns: {
      id: true,
      name: true,
      description: true,
      imgAlt: true,
      imgSrc: true,
      price: true,
      isAvailable: true
    }
  })
}

export const findOne = async (
  id: number
): Promise<ProductWithIngredients | null> => {
  const productWithIngredients = await db.query.products.findFirst({
    where: eq(products.id, id),
    with: {
      ingredients: {
        with: { ingredient: { columns: { name: true } } }
      }
    }
  })

  if (!productWithIngredients) return null

  const { ingredients, ...product } = productWithIngredients

  return {
    ...product,
    ingredients: ingredients.map(({ ingredient }) => ingredient.name)
  }
}
