import type { Item, NewOrder } from '@/modules/orders/types'

import { create } from '@/modules/orders/actions/actions'

export const fixedPrice = (price: number) => {
  return Number(price.toFixed(2))
}

export const calculateTotal = (items: Item[]) => {
  return items.reduce((acc, { price, quantity }) => acc + price * quantity, 0)
}

export const submitOrder = async (
  { items, total, statusHistory }: NewOrder,
  clearOrder: () => void
) => {
  await create({ items, total: fixedPrice(total), statusHistory })
  clearOrder()
}
