export interface Item {
  id: number
  name: string
  price: number
  quantity: number
}

export const ORDER_STATUS = {
  PENDING: 'PENDING',
  PROCESSING: 'PROCESSING',
  SHIPPED: 'SHIPPED',
  DELIVERED: 'DELIVERED'
} as const

export type OrderStatus = keyof typeof ORDER_STATUS

export type NewOrderItem = Pick<Item, 'id' | 'quantity'>

export interface NewOrder {
  items: NewOrderItem[]
  total: number
}

export interface Order {
  id: string
  total: number
  status: string
  createdAt: Date
}

export interface OrderItem {
  name: string
  quantity: number
  subtotal: number
}

export interface OrderWithItems {
  id: string
  total: number
  status: OrderStatus
  createdAt: Date
  items: OrderItem[]
}
