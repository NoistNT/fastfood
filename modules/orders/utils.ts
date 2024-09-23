import type { NewItem, NewOrder } from '@/modules/orders/types'

import { toast } from 'sonner'

import { create } from '@/modules/orders/actions/actions'

export const fixedPrice = (price: number) => {
  return Number(price.toFixed(2))
}

export const calculateTotal = (items: NewItem[]) => {
  return items.reduce((acc, { price, quantity }) => acc + price * quantity, 0)
}

export const submitOrder = async (
  items: NewItem[],
  total: number,
  clearOrder: () => void
) => {
  const order: NewOrder = {
    items: items.map(({ id, quantity }) => ({ id, quantity })),
    total: fixedPrice(total)
  }

  try {
    await create(order)
    clearOrder()
    toast.success('El pedido ha sido registrado')
  } catch (error) {
    toast.error('No se pudo registrar el pedido. Intente nuevamente')
  }
}
