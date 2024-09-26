import { z } from 'zod'

import { ORDER_STATUS, type OrderStatus } from '@/modules/orders/types'

const statusTransitions: Record<OrderStatus, OrderStatus[]> = {
  [ORDER_STATUS.PENDING]: [ORDER_STATUS.PROCESSING],
  [ORDER_STATUS.PROCESSING]: [ORDER_STATUS.SHIPPED],
  [ORDER_STATUS.SHIPPED]: [ORDER_STATUS.DELIVERED],
  [ORDER_STATUS.DELIVERED]: []
}

export const canTransition = (
  currentStatus: OrderStatus,
  newStatus: OrderStatus
) => {
  return statusTransitions[currentStatus].includes(newStatus)
}

export const isValidStatus = (status: string): status is OrderStatus => {
  return Object.values(ORDER_STATUS).includes(status as OrderStatus)
}

export const CreateItem = z.object({
  orderId: z.string(),
  productId: z.number(),
  quantity: z.number().min(1, 'Quantity must be at least 1')
})

export const CreateOrderId = z.object({ id: z.string() })

export const CreateNewOrder = z.object({
  items: z
    .array(
      z.object({
        productId: z.number(),
        quantity: z.number().min(1, 'Quantity must be at least 1')
      })
    )
    .nonempty(),
  total: z.number().positive('Order total must be a positive value')
})
