import type { NewOrder } from '@/modules/orders/types'

import { create } from 'zustand'

interface OrdersStore {
  order: NewOrder
  orders: NewOrder[]
  addOrder: (order: NewOrder) => void
}

export const useOrdersStore = create<OrdersStore>((set) => ({
  order: {
    id: crypto.randomUUID(),
    createdAt: new Date(),
    total: 0,
    items: [],
    status: 'PENDING'
  },
  orders: [],
  addOrder: (order) => set({ order })
}))
