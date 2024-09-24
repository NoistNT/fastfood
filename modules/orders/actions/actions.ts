'use server'

import type { NewOrder, OrderStatus } from '@/modules/orders/types'

import { eq } from 'drizzle-orm'

import { db } from '@/db/drizzle'
import { orderItem, orders } from '@/db/schema'
import { canTransition, isValidStatus } from '@/modules/orders/utils'

export const create = async (newOrder: NewOrder) => {
  const orderId = await db
    .insert(orders)
    .values(newOrder)
    .returning({ id: orders.id })

  await db.insert(orderItem).values(
    newOrder.items.map((item) => ({
      orderId: orderId[0].id,
      productId: item.id,
      quantity: item.quantity
    }))
  )
}

export const findAll = async () => {
  const res = await db.query.orders.findMany({
    with: {
      orderItems: {
        columns: { quantity: true },
        with: { product: { columns: { name: true, price: true } } }
      }
    }
  })

  const orders = res.map(({ id, status, total, createdAt, orderItems }) => {
    if (!isValidStatus(status)) {
      throw new Error('Invalid status')
    }

    return {
      id,
      total,
      status,
      createdAt,
      items: orderItems.map(({ product: { name, price }, quantity }) => ({
        name,
        quantity,
        subtotal: quantity * price
      }))
    }
  })

  return orders
}

export const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
  if (!isValidStatus(newStatus)) throw new Error('Invalid status')

  const order = await db.query.orders.findFirst({
    where: eq(orders.id, orderId)
  })

  if (!order) throw new Error('Order not found')

  if (!canTransition(order.status as OrderStatus, newStatus)) {
    throw new Error('Invalid transition')
  }

  return await db
    .update(orders)
    .set({ status: newStatus })
    .where(eq(orders.id, orderId))
}
