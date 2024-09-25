'use server'

import type {
  FindManyResponse,
  NewOrder,
  OrderStatus,
  OrderWithItems
} from '@/modules/orders/types'

import { eq } from 'drizzle-orm'

import { db } from '@/db/drizzle'
import { orderItem, orders } from '@/db/schema'
import { canTransition, isValidStatus } from '@/modules/orders/utils'

const createItem = async (orderId: string, newOrder: NewOrder) => {
  try {
    await db.insert(orderItem).values(
      newOrder.items.map(({ id, quantity }) => ({
        orderId,
        productId: id,
        quantity
      }))
    )
  } catch (error) {
    const err = error as Error

    throw new Error(
      `No se pudo crear el item para la orden ${orderId}: ${err.message}`
    )
  }
}

export const create = async (newOrder: NewOrder) => {
  try {
    const orderId = await db
      .insert(orders)
      .values(newOrder)
      .returning({ id: orders.id })

    await createItem(orderId[0].id, newOrder)
  } catch (error) {
    throw new Error('No se pudo registrar el pedido. Intente nuevamente')
  }
}

export const ordersList = (orders: FindManyResponse[]): OrderWithItems[] => {
  return orders.map((order) => {
    if (!isValidStatus(order.status)) throw new Error('Invalid status')

    return {
      order,
      items: order.orderItems.map(({ product: { name, price }, quantity }) => ({
        name,
        quantity,
        subtotal: quantity * price
      }))
    }
  })
}

export const findAll = async () => {
  try {
    const orders: FindManyResponse[] = await db.query.orders.findMany({
      with: {
        orderItems: {
          columns: { quantity: true },
          with: { product: { columns: { name: true, price: true } } }
        }
      }
    })

    return ordersList(orders)
  } catch (error) {
    throw new Error(
      'No se pudo obtener la lista de pedidos. Intente nuevamente'
    )
  }
}

export const updateStatus = async (orderId: string, newStatus: OrderStatus) => {
  try {
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
  } catch (error) {
    const err = error as Error

    throw new Error(
      `No se pudo actualizar el estado de la orden ${orderId}: ${err.message}`
    )
  }
}
