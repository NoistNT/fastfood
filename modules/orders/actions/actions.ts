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
import {
  canTransition,
  CreateItem,
  CreateNewOrder,
  CreateOrderId,
  isValidStatus
} from '@/modules/orders/validate'

const createItem = async (orderId: string, newOrder: NewOrder) => {
  try {
    const [newOrderItems] = await db
      .insert(orderItem)
      .values(
        newOrder.items.map(({ productId, quantity }) => ({
          orderId,
          productId,
          quantity
        }))
      )
      .returning({
        orderId: orderItem.orderId,
        productId: orderItem.productId,
        quantity: orderItem.quantity
      })

    const { data, error, success } =
      await CreateItem.safeParseAsync(newOrderItems)

    if (!success) throw new Error(error.issues[0].message, { cause: error })

    return data
  } catch (error) {
    const { message } = error as Error

    throw new Error(`Error creating items for order ${orderId}.`, {
      cause: message
    })
  }
}

export const create = async (newOrder: NewOrder) => {
  try {
    const parseNewOrder = await CreateNewOrder.safeParseAsync(newOrder)

    if (!parseNewOrder.success) {
      throw new Error(parseNewOrder.error.issues[0].message)
    }

    const [orderId] = await db
      .insert(orders)
      .values(newOrder)
      .returning({ id: orders.id })

    const { data, error, success } = CreateOrderId.safeParse(orderId)

    if (!success) throw new Error(error.issues[0].message, { cause: error })

    return await createItem(data.id, newOrder)
  } catch (error) {
    const { message } = error as Error

    throw new Error('Order could not be created.', { cause: message })
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
    const { message } = error as Error

    throw new Error(
      'No orders found. Please try again later or contact support.',
      { cause: message }
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
    const { message } = error as Error

    throw new Error(`Error updating status for order ${orderId}: ${message}`)
  }
}
