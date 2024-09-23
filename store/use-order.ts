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
    set((state) => {
      const existingItemIndex = state.items.findIndex(
        (orderItem) => orderItem.id === item.id
      )

      if (existingItemIndex > -1) {
        const updatedOrder = [...state.items]

        updatedOrder[existingItemIndex].quantity += item.quantity

        return { items: updatedOrder }
      }

      return { items: [...state.items, item] }
    }),
  incrementQuantity: (id) =>
    set((state) => {
      const updatedOrder = state.items.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )

      return { items: updatedOrder }
    }),
  decrementQuantity: (id) =>
    set((state) => {
      const updatedOrder = state.items.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )

      return { items: updatedOrder }
    }),
  removeItem: (id) =>
    set((state) => ({
      items: state.items.filter((item) => item.id !== id)
    })),
  clearOrder: () => set({ items: [] })
}))
