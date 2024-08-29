import type { Item } from '@/modules/orders/types'

import { create } from 'zustand'

interface OrderItemStore {
  item: Item[]
  addItem: (item: Item) => void
  incrementQuantity: (id: number) => void
  decrementQuantity: (id: number) => void
  removeItem: (id: number) => void
  clearOrder: () => void
}

export const useOrderItemStore = create<OrderItemStore>((set) => ({
  item: [],
  addItem: (item) =>
    set((state) => {
      const existingItemIndex = state.item.findIndex(
        (orderItem) => orderItem.id === item.id
      )

      if (existingItemIndex > -1) {
        const updatedOrder = [...state.item]

        updatedOrder[existingItemIndex].quantity += item.quantity

        return { item: updatedOrder }
      }

      return { item: [...state.item, item] }
    }),
  incrementQuantity: (id) =>
    set((state) => {
      const updatedOrder = state.item.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )

      return { item: updatedOrder }
    }),
  decrementQuantity: (id) =>
    set((state) => {
      const updatedOrder = state.item.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )

      return { item: updatedOrder }
    }),
  removeItem: (id) =>
    set((state) => ({ item: state.item.filter((item) => item.id !== id) })),
  clearOrder: () => set({ item: [] })
}))
