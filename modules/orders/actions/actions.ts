'use server'

import { eq } from 'drizzle-orm'

import { db } from '@/db/drizzle'
import { orderItem, orders, orderStatusHistory } from '@/db/schema'
import {
  canTransition,
  CreateNewOrder,
  isValidStatus,
  OrderId,
  validateData,
} from '@/modules/orders/helpers'
import {
  ORDER_STATUS,
  type DashboardOrderWithItems,
  type FindManyResponse,
  type NewOrder,
  type NewOrderItem,
  type OrderStatus,
} from '@/modules/orders/types'

const createItem = async (orderId: string, newOrder: NewOrder) => {
  try {
    const [newOrderItem]: NewOrderItem[] = await db
      .insert(orderItem)
      .values(
        newOrder.items.map(({ productId, quantity }) => ({
          orderId,
          productId,
          quantity,
        }))
      )
      .returning({
        orderId: orderItem.orderId,
        productId: orderItem.productId,
        quantity: orderItem.quantity,
      })

    return newOrderItem
  } catch (error) {
    const { message } = error as Error

    throw new Error(`Error creating item for order ${orderId}.`, {
      cause: message,
    })
  }
}

const insertAndGetOrderId = async (newOrder: NewOrder) => {
  return await db.insert(orders).values(newOrder).returning({ id: orders.id })
}

const addStatus = async (orderId: string) => {
  return await db.insert(orderStatusHistory).values({
    orderId,
    status: ORDER_STATUS.PENDING,
    createdAt: new Date(),
  })
}

export const create = async (newOrder: NewOrder) => {
  try {
    const validatedNewOrder = validateData(CreateNewOrder, newOrder)
    const [orderId] = await insertAndGetOrderId(validatedNewOrder)
    const validatedOrderId = validateData(OrderId, orderId.id)

    await addStatus(validatedOrderId)

    return await createItem(validatedOrderId, validatedNewOrder)
  } catch (error) {
    const { message } = error as Error

    throw new Error('Order could not be created.', { cause: message })
  }
}

export const ordersList = async (
  orders: FindManyResponse[]
): Promise<DashboardOrderWithItems[]> => {
  return orders.map((order) => {
    if (!isValidStatus(order.status)) throw new Error('Invalid status')

    return {
      order: {
        ...order,
        statusHistory: [],
        status: order.status,
        createdAt: order.createdAt,
      },
      items: order.orderItems.map(({ product: { name, price }, quantity }) => ({
        name,
        quantity,
        subtotal: quantity * price,
      })),
    }
  })
}

export const findAll = async () => {
  try {
    const allOrders = await db.query.orders.findMany({
      with: {
        orderItems: {
          columns: { quantity: true },
          with: { product: { columns: { name: true, price: true } } },
        },
        statusHistory: { columns: { status: true, createdAt: true } },
      },
    })

    return allOrders.map((order) => ({
      order: {
        ...order,
        orderItems: order.orderItems,
        statusHistory: order.statusHistory,
      },
      items: order.orderItems.map(({ product: { name, price }, quantity }) => ({
        name,
        quantity,
        subtotal: quantity * price,
      })),
      statusHistory: order.statusHistory,
    })) as DashboardOrderWithItems[]
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
      where: eq(orders.id, orderId),
    })

    if (!order) throw new Error('Order not found')

    if (!canTransition(order.status as OrderStatus, newStatus)) {
      throw new Error('Invalid transition')
    }

    await db.insert(orderStatusHistory).values({ orderId, status: newStatus })
    await db
      .update(orders)
      .set({ status: newStatus, updatedAt: new Date() })
      .where(eq(orders.id, orderId))

    return { success: true }
  } catch (error) {
    const { message } = error as Error

    throw new Error(`Error updating status for order ${orderId}: ${message}`)
  }
}
