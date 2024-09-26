import type { Item } from '@/modules/orders/types'

import { create } from 'zustand'

interface OrderStore {
  items: Item[]
  addItem: (item: Item) => void
  incrementQuantity: (id: number) => void
  decrementQuantity: (id: number) => void
  removeItem: (id: number) => void
  clearOrder: () => void
}

export const useOrderStore = create<OrderStore>((set) => ({
  items: [],
  addItem: (item) =>
    set(({ items }) => {
      const existingItemIndex = items.findIndex(
        (orderItem) => orderItem.productId === item.productId
      )

      if (existingItemIndex > -1) {
        const updatedOrder = [...items]

        updatedOrder[existingItemIndex].quantity += item.quantity

        return { items: updatedOrder }
      }

      return { items: [...items, item] }
    }),
  incrementQuantity: (id) =>
    set(({ items }) => {
      const updatedOrder = items.map((item) =>
        item.productId === id ? { ...item, quantity: item.quantity + 1 } : item
      )

      return { items: updatedOrder }
    }),
  decrementQuantity: (id) =>
    set(({ items }) => {
      const updatedOrder = items.map((item) =>
        item.productId === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )

      return { items: updatedOrder }
    }),
  removeItem: (id) =>
    set(({ items }) => ({
      items: items.filter(({ productId }) => productId !== id)
    })),
  clearOrder: () => set({ items: [] })
}))
