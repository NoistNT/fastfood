import { create } from 'zustand'

interface Item {
  id: number
  name: string
  price: number
  quantity: number
  subtotal: number
}

interface OrderStore {
  order: Item[]
  addToOrder: (item: Item) => void
  incrementQuantity: (id: number) => void
  decrementQuantity: (id: number) => void
  removeItem: (id: number) => void
  clearOrder: () => void
}

export const useOrderStore = create<OrderStore>((set) => ({
  order: [],
  addToOrder: (item) => set((state) => ({ order: [...state.order, item] })),
  incrementQuantity: (id) =>
    set((state) => {
      const itemIndex = state.order.findIndex((item) => item.id === id)

      if (itemIndex === -1) return state

      const updatedOrder = [...state.order]

      updatedOrder[itemIndex].quantity++

      return { order: updatedOrder }
    }),
  decrementQuantity: (id) =>
    set((state) => {
      const itemIndex = state.order.findIndex((item) => item.id === id)

      if (itemIndex === -1) return state

      const updatedOrder = [...state.order]
      const currentQuantity = updatedOrder[itemIndex].quantity

      if (currentQuantity > 0) {
        updatedOrder[itemIndex].quantity--
      }

      return { order: updatedOrder }
    }),
  removeItem: (id) =>
    set((state) => ({ order: state.order.filter((item) => item.id !== id) })),
  clearOrder: () => set({ order: [] })
}))
