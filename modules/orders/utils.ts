import { toast } from 'sonner'

import { create } from '@/modules/orders/actions/actions'
import {
  ORDER_STATUS,
  type Item,
  type NewOrder,
  type OrderStatus
} from '@/modules/orders/types'

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

export const fixedPrice = (price: number) => {
  return Number(price.toFixed(2))
}

export const calculateTotal = (items: Item[]) => {
  return items.reduce((acc, { price, quantity }) => acc + price * quantity, 0)
}

export const submitOrder = async (
  { items, total }: NewOrder,
  clearOrder: () => void
) => {
  const newOrder: NewOrder = {
    items: items.map(({ id, quantity }) => ({ id, quantity })),
    total: fixedPrice(total)
  }

  try {
    await create(newOrder)
    clearOrder()
    toast.success('El pedido ha sido registrado')
  } catch (error) {
    toast.error('No se pudo registrar el pedido. Intente nuevamente')
  }
}
