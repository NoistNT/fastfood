import { eq } from 'drizzle-orm'

import { db } from '@/db/drizzle'
import { ingredients, orderItem } from '@/db/schema'

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

export const orderItemsApi = {
  findAll: async () => {
    return await db.query.orderItem.findMany({
      with: { product: true }
    })
  },

  findOne: async (id: string) => {
    return await db.query.orderItem.findFirst({
      where: eq(orderItem.id, id),
      with: { product: true }
    })
  }
}
