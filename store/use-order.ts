import { create } from 'zustand'

interface Item {
  id: number
  name: string
  price: number
  quantity: number
}

interface OrderStore {
  order: Item[]
  addItem: (item: Item) => void
  incrementQuantity: (id: number) => void
  decrementQuantity: (id: number) => void
  removeItem: (id: number) => void
  clearOrder: () => void
}

export const useOrderStore = create<OrderStore>((set) => ({
  order: [],
  addItem: (item) =>
    set((state) => {
      const existingItemIndex = state.order.findIndex(
        (orderItem) => orderItem.id === item.id
      )

      if (existingItemIndex > -1) {
        const updatedOrder = [...state.order]

        updatedOrder[existingItemIndex].quantity += item.quantity

        return { order: updatedOrder }
      }

      return { order: [...state.order, item] }
    }),
  incrementQuantity: (id) =>
    set((state) => {
      const updatedOrder = state.order.map((item) =>
        item.id === id ? { ...item, quantity: item.quantity + 1 } : item
      )

      return { order: updatedOrder }
    }),
  decrementQuantity: (id) =>
    set((state) => {
      const updatedOrder = state.order.map((item) =>
        item.id === id && item.quantity > 1
          ? { ...item, quantity: item.quantity - 1 }
          : item
      )

      return { order: updatedOrder }
    }),
  removeItem: (id) =>
    set((state) => ({ order: state.order.filter((item) => item.id !== id) })),
  clearOrder: () => set({ order: [] })
}))
