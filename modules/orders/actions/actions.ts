'use server'

import { db } from '@/db/drizzle'
import { orders } from '@/db/schema'

export const create = async (formData: FormData) => {
  const order = {
    total: Number(formData.get('total')),
    createdAt: new Date()
  }

  await db.insert(orders).values(order)
}
