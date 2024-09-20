import { eq } from 'drizzle-orm'

import { db } from '@/db/drizzle'
import {
  ingredients,
  orderItem,
  orders,
  products,
  type ProductWithIngredients
} from '@/db/schema'

export const productsApi = {
  findAll: async () => {
    return await db.query.products.findMany()
  },

  findOne: async (id: number): Promise<ProductWithIngredients | null> => {
    const productWithIngredients = await db.query.products.findFirst({
      where: eq(products.id, id),
      columns: {
        id: true,
        name: true,
        description: true,
        price: true,
        imgSrc: true,
        imgAlt: true,
        isVegetarian: true,
        isVegan: true,
        isAvailable: true
      },
      with: {
        ingredients: {
          columns: {},
          with: {
            ingredient: {
              columns: { name: true }
            }
          }
        }
      }
    })

    if (!productWithIngredients) return null

    const { ingredients, ...product } = productWithIngredients

    return {
      ...product,
      ingredients: ingredients.map(({ ingredient }) => ingredient?.name ?? '')
    }
  }
}

export const ingredientApi = {
  findAll: async () => {
    return await db.query.ingredients.findMany()
  },

  findOne: async (id: number) => {
    const ingredientData = await db.query.ingredients.findFirst({
      where: eq(ingredients.id, id)
    })

    if (!ingredientData) return null

    return ingredientData
  }
}

export const ordersApi = {
  findAll: async () => {
    return await db.query.orders.findMany({
      with: { orderItems: true }
    })
  },

  findOne: async (id: number) => {
    return await db.query.orders.findFirst({
      where: eq(orders.id, id),
      with: { orderItems: true }
    })
  }
}

export const orderItemsApi = {
  findAll: async () => {
    return await db.query.orderItem.findMany({
      with: { product: true }
    })
  },

  findOne: async (id: number) => {
    return await db.query.orderItem.findFirst({
      where: eq(orderItem.id, id),
      with: { product: true }
    })
  }
}
