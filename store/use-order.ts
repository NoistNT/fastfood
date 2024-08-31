import type { Order } from '@/modules/orders/types'

import { create } from 'zustand'

interface OrderStore {
  order: Order
  orders: Order[]
  addOrder: (order: Order) => void
}

export const useOrderStore = create<OrderStore>((set) => ({
  order: {
    id: 0,
    createdAt: new Date(),
    total: 0,
    items: [],
    status: 'PENDING'
  },
  orders: [],
  addOrder: (order) => set({ order })
}))
