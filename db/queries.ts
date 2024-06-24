import { eq } from 'drizzle-orm'

import { db } from '@/db/drizzle'
import { burgers, ingredients, orderItem, orders } from '@/db/schema'

export const burgerApi = {
  findAll: async () => {
    return await db.query.burgers.findMany()
  },

  findOne: async (id: number) => {
    const ingredientsData = await db.query.ingredients.findMany()
    const burgerData = await db.query.burgers.findFirst({
      where: eq(burgers.id, id)
    })

    const [burger, ingredients] = await Promise.all([
      burgerData,
      ingredientsData
    ])

    return { ...burger, ingredients }
  }
}

export const ingredientApi = {
  findAll: async () => {
    return await db.query.ingredients.findMany()
  },

  findOne: async (id: number) => {
    return await db.query.ingredients.findFirst({
      where: eq(ingredients.id, id)
    })
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
      with: { burger: true }
    })
  },

  findOne: async (id: number) => {
    return await db.query.orderItem.findFirst({
      where: eq(orderItem.id, id),
      with: { burger: true }
    })
  }
}
